import crypto from 'crypto';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { AIProvider, IMessage } from './ai-provider.interface';
import { redisClient } from '../../config/redis';
import { AILog } from '../../models/ai-log.model';

class AIService {
  private primaryProvider: AIProvider;
  private secondaryProvider: AIProvider;

  constructor() {
    // Choose active provider based on environment variables
    const active = process.env.AI_PROVIDER || 'gemini';

    if (active === 'openai') {
      this.primaryProvider = new OpenAIProvider();
      this.secondaryProvider = new GeminiProvider();
    } else {
      this.primaryProvider = new GeminiProvider();
      this.secondaryProvider = new OpenAIProvider();
    }
  }

  /**
   * Conversational Chat processing with fallback and caching.
   */
  async chat(
    messages: IMessage[],
  ): Promise<{ content: string; provider: string; tokens: number; latency: number }> {
    const promptString = JSON.stringify(messages);
    const hash = crypto.createHash('md5').update(promptString).digest('hex');
    const cacheKey = `prompt:cache:${hash}`;

    const startTime = Date.now();

    // 1. Try Prompt Caching in Redis
    if (redisClient.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const latency = Date.now() - startTime;
          const data = JSON.parse(cached);
          console.log(`[Prompt Cache Hit] Served chat for hash: ${hash}`);
          return {
            content: data.content,
            provider: 'Redis Cache',
            tokens: 0,
            latency,
          };
        }
      } catch (err) {
        console.warn('Prompt cache read failed:', err);
      }
    }

    let providerUsed = this.primaryProvider;
    let content = '';
    let status: 'success' | 'failed' | 'fallback' = 'success';
    let errorMsg: string | undefined;

    // 2. Call Primary Provider
    try {
      content = await this.primaryProvider.chat(messages);
    } catch (primaryErr: any) {
      console.warn(
        `[Primary Provider: ${this.primaryProvider.getName()}] failed, executing fallback:`,
        primaryErr.message,
      );
      status = 'fallback';
      providerUsed = this.secondaryProvider;
      // Trigger Fallback to Secondary Provider
      try {
        content = await this.secondaryProvider.chat(messages);
      } catch (secondaryErr: any) {
        errorMsg = secondaryErr.message;
        status = 'failed';
        console.error('All AI providers failed. Returning mock rescue data.');
        // Soft rescue response if all APIs are down
        content =
          'Our AI Shopping systems are currently performing maintenance. Please try your request again shortly.';
      }
    }

    const latency = Date.now() - startTime;
    const promptTokens = Math.round(promptString.length / 4);
    const completionTokens = Math.round(content.length / 4);
    const totalTokens = promptTokens + completionTokens;

    // 3. Cache Result in Redis (expiry: 12 hours)
    if (redisClient.isOpen && status !== 'failed') {
      try {
        await redisClient.setEx(cacheKey, 43200, JSON.stringify({ content }));
      } catch (err) {
        console.warn('Prompt cache write failed:', err);
      }
    }

    // 4. Log Observability Metrics in MongoDB
    try {
      await AILog.create({
        provider: providerUsed.getName(),
        promptHash: hash,
        promptText: promptString.substring(0, 1000), // Cap size
        responseText: content,
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs: latency,
        status,
        error: errorMsg,
      });
    } catch (logErr) {
      console.warn('Failed to save AI metrics log to MongoDB:', logErr);
    }

    return {
      content,
      provider: providerUsed.getName(),
      tokens: totalTokens,
      latency,
    };
  }

  /**
   * Static Structured Prompt Analysis.
   */
  async analyze(prompt: string, jsonFormat = true): Promise<string> {
    const hash = crypto.createHash('md5').update(prompt).digest('hex');
    const cacheKey = `prompt:cache:${hash}`;
    const startTime = Date.now();

    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached).content;
      }
    }

    let content = '';
    let providerUsed = this.primaryProvider;
    let status: 'success' | 'failed' | 'fallback' = 'success';

    try {
      content = await this.primaryProvider.analyze(prompt, jsonFormat);
    } catch (err) {
      status = 'fallback';
      providerUsed = this.secondaryProvider;
      try {
        content = await this.secondaryProvider.analyze(prompt, jsonFormat);
      } catch (fallbackErr: any) {
        status = 'failed';
        content = jsonFormat
          ? JSON.stringify({ error: true, message: 'Analysis failed' })
          : 'Analysis failed';
      }
    }

    const latency = Date.now() - startTime;
    const tokens = Math.round((prompt.length + content.length) / 4);

    if (redisClient.isOpen && status !== 'failed') {
      await redisClient.setEx(cacheKey, 43200, JSON.stringify({ content }));
    }

    // Save metrics
    try {
      await AILog.create({
        provider: providerUsed.getName(),
        promptHash: hash,
        promptText: prompt.substring(0, 1000),
        responseText: content,
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(content.length / 4),
        totalTokens: tokens,
        latencyMs: latency,
        status,
      });
    } catch (logErr) {
      console.warn('Failed to save AI analysis log:', logErr);
    }

    return content;
  }
}

export const aiService = new AIService();
export default aiService;

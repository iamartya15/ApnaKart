import { AIProvider, IMessage } from './ai-provider.interface';

export class OpenAIProvider implements AIProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  getName(): string {
    return 'OpenAI GPT';
  }

  /**
   * Performs chat completion with retries, timeouts, and fallbacks.
   */
  async chat(messages: IMessage[]): Promise<string> {
    const lastMsg = messages[messages.length - 1]?.content || '';

    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.log(
        `[OpenAI Provider] Key missing. Serving mock chat response for query: "${lastMsg}"`,
      );
      return this.generateMockChatResponse(lastMsg);
    }

    try {
      const responseText = await this.executeRequestWithRetry(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            temperature: 0.7,
          }),
        },
      );

      const data = JSON.parse(responseText);
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from OpenAI completions API.');
      }
      return content;
    } catch (error: any) {
      console.error(`[OpenAI Provider Error]: ${error.message}. Triggering fallback response.`);
      return this.generateMockChatResponse(lastMsg);
    }
  }

  /**
   * Performs structured analysis with retries, timeouts, and fallbacks.
   */
  async analyze(prompt: string, jsonFormat = false): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.log('[OpenAI Provider] Key missing. Serving mock analyze results.');
      return this.generateMockAnalysis(prompt, jsonFormat);
    }

    try {
      const responseText = await this.executeRequestWithRetry(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: jsonFormat ? { type: 'json_object' } : undefined,
            temperature: 0.2,
          }),
        },
      );

      const data = JSON.parse(responseText);
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from OpenAI analyze API.');
      }
      return content;
    } catch (error: any) {
      console.error(`[OpenAI Analyze Error]: ${error.message}. Triggering fallback mock analysis.`);
      return this.generateMockAnalysis(prompt, jsonFormat);
    }
  }

  /**
   * Helper to perform request with Timeout and Backoff Retries.
   */
  private async executeRequestWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000,
  ): Promise<string> {
    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout limit

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429 || response.status >= 500) {
          // Rate-limit or Server Error - retry
          if (i < retries - 1) {
            console.warn(`[OpenAI Request] Status ${response.status}. Retrying in ${delay}ms...`);
            await new Promise((res) => setTimeout(res, delay));
            delay *= 2; // exponential backoff
            continue;
          }
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errText}`);
        }

        return await response.text();
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (i === retries - 1) {
          throw err;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
    throw new Error('OpenAI fetch execution reached end of retries loop without returning.');
  }

  private generateMockChatResponse(msg: string): string {
    const query = msg.toLowerCase();
    if (query.includes('iphone') || query.includes('phone')) {
      return 'Based on your search for phones, I highly recommend comparing the **Apple iPhone 15** and **Samsung Galaxy S24**. If you prefer a longer battery and iOS ecosystem, pick the iPhone 15. If you prefer high-zoom cameras and Android customizability, the Galaxy S24 is an excellent choice. Flipkart currently offers the fastest delivery (1 day) while Amazon offers a slightly cheaper price.';
    }
    if (query.includes('shoes') || query.includes('nike')) {
      return 'For running and athletics, the **Nike Air Zoom Running Shoes** are highly rated. They feature responsive cushioning and breathable mesh. Meesho offers the lowest price (₹7,916) but has a 5-day delivery window, whereas Amazon delivers in 2 days at ₹8,725.';
    }
    return `Hello! I am your ApnaKart AI Shopping Assistant. I can help you search, track price histories, detect fake reviews, and identify scam sellers across all Indian marketplaces. How can I assist you with your shopping today?`;
  }

  private generateMockAnalysis(prompt: string, jsonFormat: boolean): string {
    const p = prompt.toLowerCase();

    // 1. NLP Search Parser
    if (p.includes('gaming laptop under') || p.includes('laptop')) {
      return JSON.stringify({
        searchTerm: 'gaming laptop',
        maxPrice: 70000,
        filters: { category: 'Electronics', brand: 'ASUS' },
      });
    }
    if (p.includes('shoes under') || p.includes('shoes')) {
      return JSON.stringify({
        searchTerm: 'running shoes',
        maxPrice: 3000,
        filters: { category: 'Fashion', brand: 'Nike' },
      });
    }

    // 2. Fake Review Analysis
    if (p.includes('review') || p.includes('trust score')) {
      return JSON.stringify({
        trustScore: 82,
        fakePercentage: 18,
        sentiment: { positive: 75, neutral: 15, negative: 10 },
        mostMentionedPositives: [
          'Excellent screen brightness',
          'Smooth frame rates',
          'Premium back finish',
        ],
        mostMentionedNegatives: [
          'Battery discharges quickly under heavy load',
          'No charger in-box',
        ],
      });
    }

    // 3. Scam Seller Analysis
    if (p.includes('seller') || p.includes('ratings')) {
      return JSON.stringify({
        sellerTrustScore: 94,
        deliverySuccessRate: 98.5,
        returnRatePercentage: 2.1,
        complaintHistoryCount: 4,
      });
    }

    // 4. Gift Finder
    if (p.includes('father') || p.includes('cricket')) {
      return JSON.stringify({
        suggestions: [
          { item: 'English Willow Cricket Bat', reason: 'High quality bat for amateur players.' },
          {
            item: 'Smart Fitness Tracker',
            reason: 'Tracks steps, heart-rate and sleep statistics.',
          },
          {
            item: 'Autobiography of Sachin Tendulkar',
            reason: 'Inspiring biography for cricket fans.',
          },
        ],
      });
    }

    // 5. Budget Shopping Combination
    if (p.includes('10000') || p.includes('budget')) {
      return JSON.stringify({
        items: [
          {
            name: 'Redmi Smart Band 2',
            price: 2499,
            reason: 'Affordable fitness tracking accessory.',
          },
          {
            name: 'boAt Rockerz 450 Headphones',
            price: 1499,
            reason: 'Highly rated wireless audio.',
          },
          { name: 'Nike Running shoes (Meesho)', price: 5499, reason: 'Essential athletic wear.' },
        ],
        totalPrice: 9497,
        remainingBalance: 503,
      });
    }

    // 6. Outfit Recommendations
    if (p.includes('outfit') || p.includes('occasion')) {
      return JSON.stringify({
        combinationName: 'Summer Casual Outfit',
        items: [
          { item: 'Cotton Linen Breathable Shirt', color: 'Beige', marketplace: 'Myntra' },
          { item: 'Slim Fit Denim Jeans', color: 'Light Blue', marketplace: 'Flipkart' },
          { item: 'Minimalist Sneaker Shoes', color: 'White', marketplace: 'Amazon' },
        ],
        estimatedCost: 4500,
      });
    }

    return jsonFormat
      ? JSON.stringify({ status: 'success', data: 'mock analysis' })
      : 'Mock analysis result';
  }
}
export default OpenAIProvider;

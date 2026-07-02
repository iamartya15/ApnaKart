import { Server, Socket } from 'socket.io';
import { ChatHistory, IMessage } from '../../models/chat-history.model';
import { aiService } from './ai.service';
import { UserPreference } from '../../models/ai-preference.model';

export const configureAISocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[AI Socket] Client connected for streaming: ${socket.id}`);

    // Listen for incoming streaming chat request
    socket.on(
      'chat_stream_send',
      async (payload: { userId?: string; conversationId: string; message: string }) => {
        const { userId, conversationId, message } = payload;

        try {
          // 1. Resolve AI Memory: Fetch previous messages from MongoDB
          let chatRecord = await ChatHistory.findOne({ conversationId });
          const historyMessages: IMessage[] = [];

          if (chatRecord) {
            historyMessages.push(...chatRecord.messages);
          }

          // Add the current user query to the history array
          const userMsg: IMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
          };
          historyMessages.push(userMsg);

          // Fetch User Shopping Preferences (Memory context)
          let preferenceContext = '';
          if (userId) {
            const pref = await UserPreference.findOne({ user: userId });
            if (pref) {
              preferenceContext = ` [Preferences: Brands=${pref.favoriteBrands.join(',')}, PriceSens=${pref.priceSensitivity}]`;

              // Auto update user preferences with new searches/categories
              if (
                message.toLowerCase().includes('brand') ||
                message.toLowerCase().includes('like')
              ) {
                pref.favoriteBrands.push(message.split(' ').pop() || '');
                pref.lastUpdated = new Date();
                await pref.save();
              }
            }
          }

          // Combine prompt with history and preferences
          const inputPrompt = messagesToPrompt(historyMessages, preferenceContext);

          // 2. Call AI Service to get response
          const aiResponse = await aiService.chat(inputPrompt);
          const replyText = aiResponse.content;

          // 3. Simulate chunk streaming using SSE/Socket.io emits
          const words = replyText.split(' ');
          let currentChunk = '';

          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + ' ';
            currentChunk += chunk;

            // Stream chunk to client with a small delay (35ms per word)
            socket.emit('chat_stream_chunk', {
              conversationId,
              chunk,
            });

            await new Promise((resolve) => setTimeout(resolve, 35));
          }

          // 4. Save updated history to MongoDB (persist memory)
          const assistantMsg: IMessage = {
            role: 'assistant',
            content: replyText,
            timestamp: new Date(),
          };

          if (chatRecord) {
            chatRecord.messages.push(userMsg, assistantMsg);
            chatRecord.totalTokens += aiResponse.tokens;
            chatRecord.latencyMs = aiResponse.latency;
            await chatRecord.save();
          } else {
            chatRecord = new ChatHistory({
              user: userId || undefined,
              conversationId,
              messages: [userMsg, assistantMsg],
              totalTokens: aiResponse.tokens,
              latencyMs: aiResponse.latency,
            });
            await chatRecord.save();
          }

          // Signal stream finished
          socket.emit('chat_stream_done', {
            conversationId,
            fullReply: replyText,
          });
        } catch (error: any) {
          console.error('[AI Socket] Streaming failed:', error);
          socket.emit('chat_stream_error', {
            conversationId,
            message: 'Failed to process AI chat stream.',
          });
        }
      },
    );

    socket.on('disconnect', () => {
      console.log(`[AI Socket] Client disconnected: ${socket.id}`);
    });
  });
};

const messagesToPrompt = (messages: IMessage[], prefContext: string): any[] => {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.role === 'user' ? `${msg.content}${prefContext}` : msg.content,
  }));
};

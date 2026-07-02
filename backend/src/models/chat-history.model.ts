import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedProducts?: string[]; // IDs of products suggested in this turn
}

export interface IChatHistory extends Document {
  user?: Schema.Types.ObjectId;
  conversationId: string;
  messages: IMessage[];
  totalTokens: number;
  latencyMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  suggestedProducts: [{ type: String }],
});

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    conversationId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    totalTokens: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ChatHistorySchema.index({ user: 1 });

export const ChatHistory = model<IChatHistory>('ChatHistory', ChatHistorySchema);
export default ChatHistory;

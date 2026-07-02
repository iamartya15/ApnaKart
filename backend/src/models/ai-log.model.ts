import { Schema, model, Document } from 'mongoose';

export interface IAILog extends Document {
  provider: string;
  promptHash: string;
  promptText: string;
  responseText?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'success' | 'failed' | 'fallback';
  error?: string;
  createdAt: Date;
}

const AILogSchema = new Schema<IAILog>(
  {
    provider: { type: String, required: true },
    promptHash: { type: String, required: true },
    promptText: { type: String, required: true },
    responseText: { type: String },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    latencyMs: { type: Number, required: true },
    status: { type: String, enum: ['success', 'failed', 'fallback'], required: true },
    error: { type: String },
  },
  { timestamps: true },
);

AILogSchema.index({ promptHash: 1 });
AILogSchema.index({ createdAt: 1 });

export const AILog = model<IAILog>('AILog', AILogSchema);
export default AILog;

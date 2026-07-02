import { Schema, model, Document } from 'mongoose';

export interface INotificationCampaign extends Document {
  title: string;
  templateName: string;
  channels: Array<'email' | 'sms' | 'whatsapp' | 'push'>;
  status: 'pending' | 'sent' | 'scheduled';
  scheduledAt: Date;
  variables: Record<string, string>;
  createdAt: Date;
}

const NotificationCampaignSchema = new Schema<INotificationCampaign>(
  {
    title: { type: String, required: true },
    templateName: { type: String, required: true },
    channels: [{ type: String, enum: ['email', 'sms', 'whatsapp', 'push'] }],
    status: { type: String, enum: ['pending', 'sent', 'scheduled'], default: 'pending' },
    scheduledAt: { type: Date, required: true },
    variables: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const NotificationCampaign = model<INotificationCampaign>(
  'NotificationCampaign',
  NotificationCampaignSchema,
);
export default NotificationCampaign;

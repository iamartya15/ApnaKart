import { MailService } from '../mail.service';

export interface NotificationPayload {
  recipient: string;
  templateName: string;
  variables: Record<string, string>;
}

export class NotificationService {
  /**
   * Dispatches an Email notification using standard MailService and custom templates.
   */
  static async sendEmail(payload: NotificationPayload): Promise<boolean> {
    const { recipient, templateName, variables } = payload;
    console.log(
      `[Notification Service] Dispatching SMTP Email to ${recipient} (Template: ${templateName})`,
    );

    let body = `Hello! This is a dynamic update regarding template: ${templateName}.\n\n`;
    Object.entries(variables).forEach(([key, val]) => {
      body += `* ${key}: ${val}\n`;
    });

    try {
      // Trigger SMTP/logger email
      await MailService.sendOTPEmail(recipient, body);
      return true;
    } catch (err: any) {
      console.error('[Notification Service SMTP Error]:', err.message);
      return false;
    }
  }

  /**
   * Dispatches an SMS notification using official Twilio SMS REST APIs.
   */
  static async sendSMS(payload: NotificationPayload): Promise<boolean> {
    const { recipient, templateName, variables } = payload;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber || accountSid === 'your_twilio_sid_here') {
      console.log(
        `[Notification Service SMS Sandbox]: Sending SMS alert to ${recipient}: Template: ${templateName}`,
      );
      return true;
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyText =
        `ApnaKart: ${templateName} alert. Details: ` +
        Object.entries(variables)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: recipient,
            Body: bodyText,
          }).toString(),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Twilio Request failed: ${errText}`);
      }

      console.log(`[Notification Service SMS Real]: Dispatched message to ${recipient}`);
      return true;
    } catch (err: any) {
      console.error('[Notification Service SMS Error]:', err.message);
      return false;
    }
  }

  /**
   * Dispatches a WhatsApp message using official WhatsApp Business API endpoints.
   */
  static async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    const { recipient, templateName, variables } = payload;
    const waToken = process.env.WHATSAPP_API_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!waToken || !waPhoneId || waToken === 'your_whatsapp_token_here') {
      console.log(
        `[Notification Service WhatsApp Sandbox]: Message to ${recipient} (Template: ${templateName})`,
      );
      return true;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${waToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: Object.values(variables).map((v) => ({
                  type: 'text',
                  text: v,
                })),
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`WhatsApp API failed: ${errText}`);
      }

      console.log(`[Notification Service WA Real]: Dispatched template to ${recipient}`);
      return true;
    } catch (err: any) {
      console.error('[Notification Service WA Error]:', err.message);
      return false;
    }
  }

  /**
   * Dispatches a Mobile Push notification using Firebase Cloud Messaging (FCM) v1.
   */
  static async sendPush(payload: NotificationPayload): Promise<boolean> {
    const { recipient, templateName, variables } = payload;
    const fcmKey = process.env.FCM_SERVER_KEY; // Legacy Server Key fallback or OAuth2 token

    if (!fcmKey || fcmKey === 'your_fcm_key_here') {
      console.log(
        `[Notification Service Push Sandbox]: FCM push token: ${recipient} (Template: ${templateName})`,
      );
      return true;
    }

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${fcmKey}`,
        },
        body: JSON.stringify({
          to: recipient,
          notification: {
            title: `ApnaKart: ${templateName}`,
            body: Object.entries(variables)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n'),
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FCM API failed: ${errText}`);
      }

      console.log(`[Notification Service Push Real]: Dispatched notification token ${recipient}`);
      return true;
    } catch (err: any) {
      console.error('[Notification Service FCM Error]:', err.message);
      return false;
    }
  }
}
export default NotificationService;

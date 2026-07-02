export class MailService {
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    console.log('\n=================== EMAIL SENT ===================');
    console.log(`To: ${email}`);
    console.log('Subject: Verify your ApnaKart Account');
    console.log(`Link: ${url}`);
    console.log('==================================================\n');
  }

  static async sendOTPEmail(email: string, otp: string): Promise<void> {
    console.log('\n=================== OTP EMAIL SENT ===================');
    console.log(`To: ${email}`);
    console.log('Subject: Your ApnaKart One-Time Password');
    console.log(`OTP Code: ${otp}`);
    console.log('======================================================\n');
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    console.log('\n=================== RESET EMAIL SENT ===================');
    console.log(`To: ${email}`);
    console.log('Subject: Reset your ApnaKart Password');
    console.log(`Link: ${url}`);
    console.log('========================================================\n');
  }
}
export default MailService;

export interface IEmailService {
  sendEmail(to: string, subject: string, htmlBody: string): Promise<void>;
  sendVerificationEmail(to: string, name: string, otp: string): Promise<void>;
  sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void>;
}

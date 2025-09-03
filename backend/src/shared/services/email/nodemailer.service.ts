import nodemailer from 'nodemailer';
import config from '@config/index';
import { IEmailService } from './email.types';
import AppError from '@shared/utils/appError';
import fs from 'fs';
import path from 'path';

class NodemailerService implements IEmailService {
  private transporter!: nodemailer.Transporter;
  private isTestAccount: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (config.NODE_ENV === 'development') {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.isTestAccount = true;
        console.log('Ethereal Email Service Ready. Generated test account:');
        console.log(`User: ${testAccount.user}`);
        console.log(`Pass: ${testAccount.pass}`);
        console.log(`Nodemailer URL for dev: https://ethereal.email/message/${testAccount.user.split('@')[0]}`);
      } catch (err) {
        console.error('Failed to create Ethereal test account:', err);
        throw new AppError('Failed to initialize email service in development.', 500);
      }
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: config.EMAIL_SECURE,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });
    }
  }

  public async sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
    const mailOptions = {
      from: `Micro Freelance Platform <${config.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      if (this.isTestAccount) {
        console.log(`Email sent: ${info.messageId}`);
        console.log(`Ethereal URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        console.log(`Email sent to ${to}: ${info.messageId}`);
      }
    } catch (error: any) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
  }

  private loadTemplate(templateName: string, data: { [key: string]: string }): string {
    const templatePath = path.join(__dirname, 'templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf8');

    for (const key in data) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    return html;
  }

  public async sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    const htmlBody = this.loadTemplate('verificationEmail.html', {
      name,
      otp,
      frontendUrl: config.FRONTEND_URL,
    });
    await this.sendEmail(to, 'Verify Your Email for Micro Freelance Platform', htmlBody);
  }

  public async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void> {
    const htmlBody = this.loadTemplate('passwordResetEmail.html', {
      name,
      otp,
      frontendUrl: config.FRONTEND_URL,
    });
    await this.sendEmail(to, 'Password Reset Request for Micro Freelance Platform', htmlBody);
  }
}

export default new NodemailerService();

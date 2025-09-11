import nodemailer from 'nodemailer';
import config from '@config/index';
import { IEmailService } from './email.types';
import AppError from '@shared/utils/appError';
import fs from 'fs';
import path from 'path';
import logger from '@shared/utils/logger';

class NodemailerService implements IEmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_SECURE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });

    this.transporter.verify((error, _success) => {
      if (error) {
        logger.error('SMTP server connection failed:', { error: error.message });
      } else {
        logger.info('SMTP server connection established successfully.');
      }
    });
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
      logger.info(`Email sent to ${to}: ${info.messageId}`, {
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}: ${error.message}`, {
        subject,
        to,
        errorDetails: error,
      });
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
  }

  private loadTemplate(templateName: string, data: { [key: string]: string }): string {
    const templatePath = path.join(__dirname, 'templates', templateName);
    if (!fs.existsSync(templatePath)) {
      logger.error(`Email template not found: ${templatePath}`);
      throw new AppError(`Email template ${templateName} not found.`, 500);
    }
    let html = fs.readFileSync(templatePath, 'utf8');

    data.currentYear = new Date().getFullYear().toString();

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
      OTP_EXPIRY_MINUTES: config.OTP_EXPIRY_MINUTES.toString(),
    });
    await this.sendEmail(to, 'Verify Your Email for Micro Freelance Platform', htmlBody);
  }

  public async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void> {
    const htmlBody = this.loadTemplate('passwordResetEmail.html', {
      name,
      otp,
      frontendUrl: config.FRONTEND_URL,
      OTP_EXPIRY_MINUTES: config.OTP_EXPIRY_MINUTES.toString(),
    });
    await this.sendEmail(to, 'Password Reset Request for Micro Freelance Platform', htmlBody);
  }
}

export default new NodemailerService();

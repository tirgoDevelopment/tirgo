// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tirgolog@gmail.com',
        pass: 'ditd taih qxkh tnma',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
    const mailOptions = {
      from: 'tirgolog@gmail.com',
      to,
      subject,
      text,
    };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

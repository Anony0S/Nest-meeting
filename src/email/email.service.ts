import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('nodemailer_host'),
      port: this.configService.get('nodemailer_port'),
      secure: true,
      auth: {
        user: this.configService.get('nodemailer_auth_user'),
        pass: this.configService.get('nodemailer_auth_pass'),
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: this.configService.get('nodemailer_auth_user'),
      },
      to,
      subject,
      html,
    });
  }
}

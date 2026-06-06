import nodemailer, { Transporter } from 'nodemailer';
import { RESET_TOKEN_EXPIRES_MINUTES } from '../../shared/constants/auth';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

    async sendPasswordReset(email: string, resetLink: string): Promise<void> {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #007bff; 
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Recuperación de Contraseña</h2>
              <p>Has solicitado restablecer tu contraseña.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <a href="${resetLink}" class="button">Restablecer Contraseña</a>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p>${resetLink}</p>
              <div class="footer">
                <p>Este enlace expirará en ${RESET_TOKEN_EXPIRES_MINUTES} minutos.</p>
                <p>Si no solicitaste este cambio, ignora este correo.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.send({
        to: email,
        subject: 'Recuperación de contraseña - NeuroFile',
        html,
      });
    }

    async send(options: EmailOptions): Promise<void> {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"NeuroFile" <noreply@neurofile.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    }

    async verifyConnection(): Promise<boolean> {
      try {
        await this.transporter.verify();
        return true;
      } catch (error) {
        console.error('Error al conectar con el servidor SMTP:', error);
        return false;
      }
    }
  }
// 🚀 VERSION OPTIMISÉE DU SERVICE EMAIL POUR 512MB RAM
// Évite le chargement de nodemailer au démarrage

import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailServiceOptimized {
  private transporter: any = null;

  // Lazy initialization - ne charge nodemailer qu'à la première utilisation
  private async getTransporter() {
    if (!this.transporter) {
      // Import dynamique pour éviter le chargement au démarrage
      const nodemailer = await import('nodemailer');

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined, // Pas d'auth si variables non définies
      });
    }
    return this.transporter;
  }

  // Version optimisée qui ne fait rien si pas configuré
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      // Si pas de config SMTP, simuler l'envoi (pour développement)
      if (!process.env.SMTP_HOST) {
        console.log(`📧 [MOCK] Email would be sent to ${email}`);
        return true;
      }

      const transporter = await this.getTransporter();

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@hackathon.com',
        to: email,
        subject: 'Bienvenue au Hackathon!',
        html: `
          <h1>Bonjour ${name}!</h1>
          <p>Votre inscription est confirmée.</p>
          <p>Cordialement,<br>L'équipe Hackathon</p>
        `,
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      return false;
    }
  }

  // Méthode pour tester la configuration
  async testConnection(): Promise<boolean> {
    try {
      if (!process.env.SMTP_HOST) return false;
      const transporter = await this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
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

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw error;
    }
  }

  async sendAccusReception(email: string, nom: string, prenom: string, hackathonId: string) {
    // Récupérer les informations détaillées du hackathon
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        nom: true,
        description: true,
        dateDebut: true,
        dateFin: true,
        dateLimiteInscription: true,
        status: true,
      },
    });

    if (!hackathon) {
      throw new Error(`Hackathon avec l'ID ${hackathonId} non trouvé`);
    }

    // Formater les dates
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date));
    };

    const formatDateShort = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    };

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'inscription - ${hackathon.nom}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .highlight { background: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .important { color: #e74c3c; font-weight: bold; }
          .date-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Confirmation d'inscription</h1>
            <h2>${hackathon.nom}</h2>
          </div>

          <div class="content">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>

            <div class="highlight">
              <h3>✅ Votre inscription a été confirmée avec succès !</h3>
              <p>Nous vous remercions de votre intérêt pour notre hackathon et sommes ravis de vous compter parmi les participants.</p>
            </div>

            <div class="info-box">
              <h3>📋 Détails de l'événement</h3>
              <p><strong>Nom du hackathon :</strong> ${hackathon.nom}</p>
              ${hackathon.description ? `<p><strong>Description :</strong> ${hackathon.description}</p>` : ''}

              <div class="date-info">
                <h4>📅 Dates importantes</h4>
                <p><strong>📝 Date limite d'inscription :</strong> ${hackathon.dateLimiteInscription ? formatDate(hackathon.dateLimiteInscription) : 'Non spécifiée'}</p>
                <p><strong>🚀 Début du hackathon :</strong> ${formatDate(hackathon.dateDebut)}</p>
                <p><strong>🏁 Fin du hackathon :</strong> ${formatDate(hackathon.dateFin)}</p>
              </div>

              <p><strong>📊 Statut :</strong> ${hackathon.status === 'UPCOMING' ? 'À venir' : hackathon.status === 'ONGOING' ? 'En cours' : 'Terminé'}</p>
            </div>

            <div class="info-box">
              <h3>📧 Informations importantes</h3>
              <ul>
                <li><strong>Confirmation reçue le :</strong> ${formatDate(new Date())}</li>
                <li><strong>Email de confirmation :</strong> ${email}</li>
                <li><strong>Statut de votre inscription :</strong> <span class="important">VALIDÉE</span></li>
              </ul>
            </div>

            <div class="highlight">
              <h4>🎯 Prochaines étapes</h4>
              <ul>
                <li>Surveillez vos emails pour les annonces importantes</li>
                <li>Préparez votre équipe et vos idées de projet</li>
                <li>Consultez régulièrement le site pour les mises à jour</li>
                <li>Contactez-nous si vous avez des questions</li>
              </ul>
            </div>

            <p>Nous sommes impatients de vous accueillir lors de cet événement innovant !</p>

            <div class="footer">
              <p>
                Cordialement,<br>
                <strong>L'équipe organisatrice</strong><br>
                ${hackathon.nom}
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #888;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.<br>
                Pour toute question, contactez-nous via le site web.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, `✅ Confirmation d'inscription - ${hackathon.nom}`, html);
  }

  async sendAnnonceInscrits(
    email: string,
    nom: string,
    prenom: string,
    titre: string,
    contenu: string,
  ) {
    const html = `
      <h2>${titre}</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <div>${contenu}</div>
      <p>Cordialement,<br>L'équipe Hackathon</p>
    `;
    return this.sendEmail(email, titre, html);
  }
}

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfGenerationService {
  private readonly logger = new Logger(PdfGenerationService.name);

  async generateInscriptionsListPdf(
    inscriptions: Array<{
      id: string;
      nom: string;
      prenom: string;
      email: string;
      promo?: string | null;
      classe?: string | null;
      statut?: string | null;
    }>,
    hackathonName: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: any) => {
          this.logger.error('Erreur génération PDF', err);
          reject(err);
        });

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(`Liste des inscrits - ${hackathonName}`, { align: 'center' });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Total: ${inscriptions.length}`, { align: 'center' });
        doc.moveDown(1);

        const margin = 50;
        const rowHeight = 22;
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        const drawHeader = () => {
          const y = doc.y;
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('N°', margin, y, { width: 30 });
          doc.text('Nom', margin + 35, y, { width: 80 });
          doc.text('Prénom', margin + 120, y, { width: 80 });
          doc.text('Email', margin + 205, y, { width: 170 });
          doc.text('Classe', margin + 380, y, { width: 70 });
          doc.text('Statut', margin + 455, y, { width: 70 });
          doc
            .moveTo(margin, y + 14)
            .lineTo(pageWidth - margin, y + 14)
            .stroke();
          doc.moveDown(1);
        };

        drawHeader();
        doc.fontSize(9).font('Helvetica');

        inscriptions.forEach((inscription, index) => {
          if (doc.y > pageHeight - 80) {
            doc.addPage();
            drawHeader();
          }

          const y = doc.y;
          if (index % 2 === 0) {
            doc
              .rect(margin, y - 4, pageWidth - 2 * margin, rowHeight)
              .fill('#F5F5F5')
              .fillColor('#000000');
          }

          const classe = inscription.classe || inscription.promo || '-';
          const statut = inscription.statut || '-';

          doc.text(String(index + 1), margin, y, { width: 30 });
          doc.text((inscription.nom || '-').slice(0, 30), margin + 35, y, {
            width: 80,
          });
          doc.text((inscription.prenom || '-').slice(0, 30), margin + 120, y, {
            width: 80,
          });
          doc.text((inscription.email || '-').slice(0, 45), margin + 205, y, {
            width: 170,
          });
          doc.text(classe.slice(0, 15), margin + 380, y, { width: 70 });
          doc.text(statut.slice(0, 15), margin + 455, y, { width: 70 });

          doc.moveDown(1);
        });

        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i += 1) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#666666')
            .text(`Page ${i + 1} sur ${totalPages}`, margin, pageHeight - 30, {
              align: 'center',
            });
        }

        doc.end();
      } catch (error) {
        this.logger.error('Erreur génération PDF', error);
        reject(error);
      }
    });
  }
}

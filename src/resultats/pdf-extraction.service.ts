import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

export interface ExtractedParticipant {
  email: string;
  nom?: string;
  prenom?: string;
  fullName?: string;
  promo?: string; // L1, L2...
  classe?: string; // LIC1 A...
  telephone?: string;
}

@Injectable()
export class PdfExtractionService {
  private readonly logger = new Logger(PdfExtractionService.name);

  async extractParticipantsFromPdf(
    pdfBuffer: Buffer,
  ): Promise<ExtractedParticipant[]> {
    // console.log(`🚀 DÉBUT extraction PDF - Taille buffer: ${pdfBuffer.length} bytes`);

    try {
      if (typeof pdfParse !== 'function') {
        console.error('pdf-parse n\'est pas une fonction valide');
        return [];
      }

      // console.log(`📄 Tentative d'extraction avec pdf-parse...`);
      const data = await pdfParse(pdfBuffer);
      // console.log(`✅ Extraction PDF réussie - Pages: ${data?.numpages || 'N/A'}`);
      return this.processExtractedText(data.text);
    } catch (error: any) {
      console.error(
        '❌ ERREUR extraction PDF:',
        error?.message || error?.toString() || error,
      );

      // Fallback: extraction brute du buffer
      try {
        const extractedText = this.extractTextFromBuffer(pdfBuffer);
        if (extractedText && extractedText.length > 10) {
          return this.processExtractedText(extractedText);
        } else {
          console.error('❌ Extraction brute : texte insuffisant');
          return [];
        }
      } catch (fallbackError) {
        console.error('❌ Toutes les méthodes ont échoué');
        return [];
      }
    }
  }

  matchParticipantsWithUsers(
    extractedParticipants: ExtractedParticipant[],
    users: Array<{ id: string; email: string; nom: string; prenom: string }>,
  ): string[] {
    // Matching des participants PDF avec les utilisateurs BD

    const matched: string[] = [];

    for (const participant of extractedParticipants) {
      const emailPDF = participant.email?.trim().toLowerCase();

      // Match par email exact (priorité)
      const byEmail = users.find(
        (u) => u.email.toLowerCase().trim() === emailPDF,
      );
      if (byEmail) {
        matched.push(byEmail.email);
        continue;
      }
    }

    const uniqueMatched = Array.from(new Set(matched));
    return uniqueMatched;
  }

  private processExtractedText(text: string): ExtractedParticipant[] {
    // Regex plus simple et précise pour les emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = text.match(emailRegex) || [];

    // Nettoyer et normaliser les emails
    const cleanedEmails = foundEmails.map(email => {
      let cleaned = email.trim().toLowerCase();

      // S'assurer que les emails Gmail/Outlook/Hotmail/Yahoo ont .com
      const parts = cleaned.split('@');
      if (parts.length === 2) {
        const domain = parts[1];
        if (!domain.includes('.')) {
          // Ajouter .com pour les domaines populaires
          if (domain.includes('gmail')) {
            cleaned = `${parts[0]}@gmail.com`;
          } else if (domain.includes('outlook') || domain.includes('hotmail')) {
            cleaned = `${parts[0]}@outlook.com`;
          } else if (domain.includes('yahoo')) {
            cleaned = `${parts[0]}@yahoo.com`;
          }
        }
      }

      return cleaned;
    }).filter((email, index, arr) => arr.indexOf(email) === index); // Supprimer les doublons


    const emails = cleanedEmails;

    // Créer un participant pour chaque email trouvé
    const participants: ExtractedParticipant[] = [];

    for (const email of emails) {
      const participant: ExtractedParticipant = { email };

      // Chercher des noms dans le contexte autour de cet email
      const emailIndex = text.indexOf(email);
      if (emailIndex >= 0) {
        // Extraire le contexte autour de l'email (100 caractères avant et après)
        const start = Math.max(0, emailIndex - 100);
        const end = Math.min(text.length, emailIndex + email.length + 100);
        const context = text.substring(start, end);

        // Chercher des noms dans le contexte (mots qui ressemblent à des noms/prénoms)
        const nameWords = context.match(/\b[A-Z][a-z]+\b/g) || [];
        const validNames = nameWords.filter(word =>
          word.length > 2 &&
          word.length < 20 &&
          !word.includes('@') &&
          !word.match(/^(Email|Nom|Prénom|Classe|Statut|Total|VALIDE|LIC|LRT|L1|L2|Hackathon|Développement|Web|Liste|Inscrits)$/i)
        );

        // Essayer d'extraire nom/prénom depuis la ligne elle-même
        const emailLine = context.split('\n').find(line => line.includes(email));
        if (emailLine) {
          // Extraire les mots avant l'email (généralement nom + prénom)
          const beforeEmail = emailLine.split(email)[0]?.trim() || '';
          const wordsBefore = beforeEmail.split(/\s+/).filter(w => w.length > 2);

          if (wordsBefore.length >= 2) {
            // Dernier mot = nom, avant-dernier = prénom
            participant.nom = wordsBefore[wordsBefore.length - 1];
            participant.prenom = wordsBefore[wordsBefore.length - 2];
          } else if (wordsBefore.length === 1) {
            participant.prenom = wordsBefore[0];
          }
        }

        // Fallback sur l'ancienne méthode si rien trouvé
        if (!participant.nom && validNames.length >= 2) {
          participant.prenom = validNames[validNames.length - 2];
          participant.nom = validNames[validNames.length - 1];
        } else if (!participant.prenom && validNames.length === 1) {
          participant.prenom = validNames[0];
        }

        // Chercher la classe/promotion dans le contexte
        const classePatterns = context.match(/\b(LIC1|LIC2|LRT|L1|L2)\s*[A-Z]*/gi) || [];
        if (classePatterns.length > 0 && classePatterns[0]) {
          participant.classe = classePatterns[0].toUpperCase();
          if (participant.classe.includes('LIC1') || participant.classe.includes('LRT')) {
            participant.promo = 'L1';
          } else if (participant.classe.includes('LIC2') || participant.classe.includes('L2')) {
            participant.promo = 'L2';
          }
        }
      }

      participants.push(participant);
    }

    // Fallback: utiliser l'ancienne méthode si la nouvelle n'a rien trouvé
    if (participants.length === 0) {
      const lines_old = text.split('\n');
      for (const email of emails) {
      const participant: ExtractedParticipant = { email };

      for (let i = 0; i < lines_old.length; i++) {
        const line = lines_old[i] ?? '';
        if (!line.includes(email)) continue;

        const current = line.trim();
        const contextLines = [
          i > 1 ? (lines_old[i - 2] || '').trim() : '',
          i > 0 ? (lines_old[i - 1] || '').trim() : '',
          current,
          i < lines_old.length - 1 ? (lines_old[i + 1] || '').trim() : '',
          i < lines_old.length - 2 ? (lines_old[i + 2] || '').trim() : '',
        ].filter((l) => l.length > 0);

        // Nom/prénom sur la même ligne (2 mots avant l'email)
        const parts = current.split(/\s+/);
        const emailIndex = parts.findIndex((p) => p === email);
        if (emailIndex > 0) {
          const nameParts = parts.slice(
            Math.max(0, emailIndex - 2),
            emailIndex,
          );
          if (nameParts.length >= 2) {
            participant.prenom = nameParts[0];
            participant.nom = nameParts.slice(1).join(' ');
            participant.fullName = `${participant.prenom} ${participant.nom}`;
          } else if (nameParts.length === 1) {
            participant.fullName = nameParts[0];
          }
        }

        // Chercher infos dans le contexte
        for (const ctx of contextLines) {
          if (!participant.classe && !participant.promo) {
            const classeMatch = ctx.match(/(LIC1|LIC2)\s+[A-Z]/g);
            if (classeMatch?.[0]) {
              participant.classe = classeMatch[0];
              participant.promo = classeMatch[0].includes('LIC1')
                ? 'L1'
                : 'L2';
            } else {
              const promoMatch = ctx.match(/\b(LIC1|LIC2|L1|L2|LRT|LRT\s*2)\s*[A-Z]?\b/gi);
              if (promoMatch?.[0]) {
                const promoText = promoMatch[0].toUpperCase();
                participant.promo =
                  promoText.includes('LIC1') ||
                  promoText.includes('LRT') ||
                  promoText.includes('L1')
                    ? 'L1'
                    : 'L2';
              }
            }
          }

          if (!participant.telephone) {
            const phoneMatch = ctx.match(
              /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
            );
            if (phoneMatch?.[0]) participant.telephone = phoneMatch[0].trim();
          }
        }

        break;
      }

      participants.push(participant);
    }
    }

    return participants;
  }

  private extractTextFromBuffer(pdfBuffer: Buffer): string {
    // Convertir le buffer en string UTF-8
    const rawText = pdfBuffer.toString('utf8');

    // Extraire le texte entre parenthèses (métadonnées PDF)
    const parenthesesMatches = rawText.match(/\(([^)]+)\)/g) || [];
    const parenText = parenthesesMatches.map(match => match.slice(1, -1)).join(' ');

    // Chercher dans les streams de contenu
    const streamMatch = rawText.match(/stream\s*(.*?)\s*endstream/s);
    let streamText = '';
    if (streamMatch) {
      try {
        // Essayer de décompresser si c'est du FlateDecode
        const zlib = require('zlib');
        const compressed = Buffer.from(streamMatch[1], 'binary');
        streamText = zlib.unzipSync(compressed).toString('utf8');
      } catch (e) {
        // Si ça échoue, prendre le texte brut
        streamText = streamMatch[1];
      }
    }

    // Combiner tout le texte trouvé
    const combinedText = parenText + ' ' + streamText + ' ' + rawText.replace(/\([^\)]*\)/g, '');

    // Nettoyer et retourner
    return combinedText.replace(/\s+/g, ' ').trim();
  }
}

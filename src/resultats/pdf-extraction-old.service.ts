import { Injectable, Logger } from '@nestjs/common';

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
    try {
      // Chargement robuste de pdf-parse (essaie plusieurs chemins et propriétés)
      const errors: string[] = [];
      const candidates: any[] = [];

      const addCandidates = (mod: any, label: string) => {
        if (!mod) return;
        candidates.push(
          { label, val: mod },
          { label: `${label}.default`, val: mod?.default },
          { label: `${label}.default.default`, val: mod?.default?.default },
          { label: `${label}.pdfParse`, val: mod?.pdfParse },
          { label: `${label}.default.pdfParse`, val: mod?.default?.pdfParse },
          { label: `${label}.default.default.pdfParse`, val: mod?.default?.default?.pdfParse },
          { label: `${label}.pdf`, val: mod?.pdf },
        );
      };

      try {
        const mod = await import('pdf-parse');
        addCandidates(mod, 'import(pdf-parse)');
      } catch (e: any) {
        errors.push(`import(pdf-parse): ${e?.message || e}`);
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('pdf-parse');
        addCandidates(mod, 'require(pdf-parse)');
      } catch (e: any) {
        errors.push(`require(pdf-parse): ${e?.message || e}`);
      }

      const found = candidates.find((c) => typeof c.val === 'function');
      const pdfParse = found?.val;

      if (typeof pdfParse !== 'function') {
        console.error(
          `pdf-parse non disponible - tentatives: ${errors.join(' | ')}`,
        );
        return [];
      }

      const data = await pdfParse(pdfBuffer);
      const text: string = data?.text || '';

      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
      const emails = (text.match(emailRegex) ?? []) as string[];
      const uniqueEmails = Array.from(new Set(emails));

      // console.log(`PDF: ${uniqueEmails.length} email(s) trouvé(s)`);

      const phoneRegex =
        /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g;
      const promoRegex = /\b(LIC1|LIC2|L1|L2|LRT|LRT\s*2)\s*[A-Z]?\b/gi;
      const classeRegex = /\b(LIC1|LIC2)\s+[A-Z]\b/g;

      const lines = text.split('\n');
      const participants: ExtractedParticipant[] = [];

      for (const email of uniqueEmails) {
        const participant: ExtractedParticipant = { email };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i] ?? '';
          if (!line.includes(email)) continue;

          const current = line.trim();
          const contextLines = [
            i > 1 ? (lines[i - 2] || '').trim() : '',
            i > 0 ? (lines[i - 1] || '').trim() : '',
            current,
            i < lines.length - 1 ? (lines[i + 1] || '').trim() : '',
            i < lines.length - 2 ? (lines[i + 2] || '').trim() : '',
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
              const classeMatch = ctx.match(classeRegex);
              if (classeMatch?.[0]) {
                participant.classe = classeMatch[0];
                participant.promo = classeMatch[0].includes('LIC1')
                  ? 'L1'
                  : 'L2';
              } else {
                const promoMatch = ctx.match(promoRegex);
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
              const phoneMatch = ctx.match(phoneRegex);
              if (phoneMatch?.[0]) participant.telephone = phoneMatch[0].trim();
            }
          }

          break;
        }

        participants.push(participant);
      }

      return participants;
    } catch (error: any) {
      console.error(
        'Erreur extraction PDF',
        error?.message || error?.toString() || error,
      );
      // En cas d'erreur, ne pas bloquer l'upload : retourner une liste vide
      return [];
    }
  }

  matchParticipantsWithUsers(
    extractedParticipants: ExtractedParticipant[],
    users: Array<{ id: string; email: string; nom: string; prenom: string }>,
  ): string[] {
    const matched: string[] = [];

    for (const participant of extractedParticipants) {
      const byEmail = users.find(
        (u) => u.email.toLowerCase() === participant.email.toLowerCase(),
      );
      if (byEmail) {
        matched.push(byEmail.email);
        continue;
      }

      if (participant.nom && participant.prenom) {
        const nom = participant.nom.toLowerCase().trim();
        const prenom = participant.prenom.toLowerCase().trim();
        const byName = users.find(
          (u) =>
            u.nom.toLowerCase().trim() === nom &&
            u.prenom.toLowerCase().trim() === prenom,
        );
        if (byName) {
          matched.push(byName.email);
          continue;
        }
      }

      if (participant.fullName) {
        const parts = participant.fullName.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          const prenom = parts[0].toLowerCase().trim();
          const nom = parts.slice(1).join(' ').toLowerCase().trim();
          const byName = users.find(
            (u) =>
              u.nom.toLowerCase().trim() === nom &&
              u.prenom.toLowerCase().trim() === prenom,
          );
          if (byName) matched.push(byName.email);
        }
      }
    }

    return Array.from(new Set(matched));
  }
}

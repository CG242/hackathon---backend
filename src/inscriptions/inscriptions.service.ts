import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HackathonStatus } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class InscriptionsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async getMyInscriptions(userId: string) {
    return this.prisma.inscription.findMany({
      where: { userId },
      include: {
        hackathon: {
          select: {
            id: true,
            nom: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInscriptionById(id: string, userId: string, userRole: string) {
    const inscription = await this.prisma.inscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        hackathon: true,
      },
    });

    if (!inscription) {
      throw new NotFoundException(`Inscription avec l'ID ${id} non trouvée`);
    }

    // Vérifier les permissions : l'utilisateur peut voir sa propre inscription ou l'admin peut voir toutes
    if (userRole !== 'ADMIN' && inscription.userId !== userId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette inscription");
    }

    return inscription;
  }

  async createInscription(userId: string, hackathonId: string) {
    // Vérifier que le hackathon existe
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(
        `Hackathon avec l'ID ${hackathonId} non trouvé`,
      );
    }

    // Vérifier la deadline d'inscription
    const maintenant = new Date();
    if (new Date(hackathon.dateLimiteInscription) < maintenant) {
      throw new BadRequestException(
        "La date limite d'inscription est dépassée",
      );
    }

    // Vérifier que le hackathon est encore ouvert aux inscriptions
    if (hackathon.status === HackathonStatus.PAST) {
      throw new BadRequestException('Ce hackathon est déjà terminé');
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingInscription = await this.prisma.inscription.findUnique({
      where: {
        userId_hackathonId: {
          userId,
          hackathonId,
        },
      },
    });

    if (existingInscription) {
      throw new BadRequestException('Vous êtes déjà inscrit à ce hackathon');
    }

    // Créer l'inscription
    const inscription = await this.prisma.inscription.create({
      data: {
        userId,
        hackathonId,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            nom: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    // Émettre l'événement temps réel
    this.eventsGateway.emitNewInscription({
      userId: inscription.userId,
      hackathonId: inscription.hackathonId,
      inscriptionId: inscription.id,
      userEmail: inscription.user.email,
      userName: `${inscription.user.prenom} ${inscription.user.nom}`,
    });

    return inscription;
  }

  async deleteInscription(id: string, userId: string, userRole: string) {
    const inscription = await this.prisma.inscription.findUnique({
      where: { id },
    });

    if (!inscription) {
      throw new NotFoundException(`Inscription avec l'ID ${id} non trouvée`);
    }

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && inscription.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas le droit de supprimer cette inscription",
      );
    }

    await this.prisma.inscription.delete({
      where: { id },
    });

    return { message: 'Inscription supprimée avec succès' };
  }

  async deleteUserInscription(userId: string, hackathonId: string) {
    // Vérifier que l'inscription existe
    const inscription = await this.prisma.inscription.findUnique({
      where: {
        userId_hackathonId: {
          userId,
          hackathonId,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            nom: true,
            prenom: true,
          },
        },
        hackathon: {
          select: {
            nom: true,
          },
        },
      },
    });

    if (!inscription) {
      throw new NotFoundException(
        `Inscription de l'utilisateur ${userId} au hackathon ${hackathonId} non trouvée`,
      );
    }

    // NOTE: Plus de retrait automatique des présélections
    // La présélection est gérée uniquement via l'upload PDF

    // Supprimer l'inscription
    await this.prisma.inscription.delete({
      where: {
        userId_hackathonId: {
          userId,
          hackathonId,
        },
      },
    });


    // Récupérer les informations détaillées du hackathon
    const hackathonDetails = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        nom: true,
        description: true,
        dateDebut: true,
        dateFin: true,
        status: true,
        _count: {
          select: {
            inscriptions: true,
          },
        },
      },
    });

    // Récupérer les informations de présélection si elles existent
    const preselectionInfo = await this.prisma.resultats.findUnique({
      where: { hackathonId },
      select: {
        preselectionnes: true,
        preselectionsPubliees: true,
        documentPreselectionsName: true,
      },
    });

    const isPreselected = false; // Plus de tracking automatique des présélections

    return {
      message: `Utilisateur supprimé avec succès du hackathon "${hackathonDetails?.nom}"`,
      details: {
        utilisateur: {
          id: userId, // Utiliser le paramètre au lieu de inscription.user.id
          email: inscription.user.email,
          nom: inscription.user.nom,
          prenom: inscription.user.prenom,
          nomComplet: `${inscription.user.prenom} ${inscription.user.nom}`,
        },
        hackathon: {
          id: hackathonDetails?.id,
          nom: hackathonDetails?.nom,
          description: hackathonDetails?.description,
          dateDebut: hackathonDetails?.dateDebut,
          dateFin: hackathonDetails?.dateFin,
          status: hackathonDetails?.status,
          totalInscrits: hackathonDetails?._count?.inscriptions || 0,
        },
        preselections: {
          etaitPreselectionne: false, // Plus de tracking automatique
          preselectionsPubliees: preselectionInfo?.preselectionsPubliees || false,
          documentPreselections: preselectionInfo?.documentPreselectionsName || null,
        },
      },
      action: {
        type: 'SUPPRESSION_INSCRIPTION',
        timestamp: new Date().toISOString(),
        utilisateurConcerne: inscription.user.email,
        hackathonConcerne: hackathonDetails?.nom,
        impactPreselections: 'ℹ️ Présélections gérées uniquement via upload PDF',
        detailsSupplementaires: {
          totalInscritsRestants: (hackathonDetails?._count?.inscriptions || 1) - 1,
          preselectionsRestantes: (preselectionInfo?.preselectionnes as string[] | null)?.length || 0,
        },
      },
    };
  }

  async getInscriptionsByHackathon(hackathonId: string) {
    // Vérifier que le hackathon existe
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(
        `Hackathon avec l'ID ${hackathonId} non trouvé`,
      );
    }

    return this.prisma.inscription.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            // promo et technologies sont maintenant dans Inscription, pas dans User
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

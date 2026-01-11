import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResultatsService } from './resultats.service';

@ApiTags('resultats')
@Controller('resultats')
export class ResultatsController {
  constructor(private readonly resultatsService: ResultatsService) {}

  @Get('public')
  @ApiOperation({
    summary: 'Récupérer les résultats publics du hackathon actuel',
  })
  @ApiResponse({ status: 200, description: 'Résultats publics' })
  async getPublicResultats() {
    return this.resultatsService.getPublicResultats();
  }

  @Get('hackathon/:hackathonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: "Récupérer les résultats d'un hackathon (Admin)" })
  async getResultats(@Param('hackathonId') hackathonId: string) {
    return this.resultatsService.getResultats(hackathonId);
  }

  @Post('hackathon/:hackathonId/podium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Publier le podium (Admin)' })
  async publishPodium(
    @Param('hackathonId') hackathonId: string,
    @Body()
    data: {
      premierPlace?: string;
      deuxiemePlace?: string;
      troisiemePlace?: string;
    },
  ) {
    return this.resultatsService.publishPodium(hackathonId, data);
  }

  @Delete('hackathon/:hackathonId/podium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Dépublier le podium (Admin)' })
  async unpublishPodium(@Param('hackathonId') hackathonId: string) {
    return this.resultatsService.unpublishPodium(hackathonId);
  }

  @Post('hackathon/:hackathonId/preselections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Publier les présélections (Admin)' })
  async publishPreselections(
    @Param('hackathonId') hackathonId: string,
    @Body() data: { preselectionnes: string[] },
  ) {
    return this.resultatsService.publishPreselections(
      hackathonId,
      data.preselectionnes,
    );
  }

  @Delete('hackathon/:hackathonId/preselections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Dépublier les présélections (Admin)' })
  async unpublishPreselections(@Param('hackathonId') hackathonId: string) {
    return this.resultatsService.unpublishPreselections(hackathonId);
  }

  @Post('hackathon/:hackathonId/preselections/document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
      },
    }),
  )
  @ApiOperation({
    summary: 'Uploader un PDF des présélections + extraction auto (Admin)',
  })
  async uploadPreselectionsDocument(
    @Param('hackathonId') hackathonId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    return this.resultatsService.uploadPreselectionsDocument(hackathonId, file);
  }

  @Get('hackathon/:hackathonId/preselections/document')
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Télécharger le PDF des présélections (Public)' })
  @ApiResponse({
    status: 200,
    description: 'PDF',
    content: { 'application/pdf': {} },
  })
  async downloadPreselectionsDocument(
    @Param('hackathonId') hackathonId: string,
    @Res() res: Response,
  ) {
    const doc =
      await this.resultatsService.getPreselectionsDocument(hackathonId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name}"`);
    res.send(doc.buffer);
  }

  @Delete('hackathon/:hackathonId/preselections/document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Supprimer le PDF des présélections (Admin)' })
  async deletePreselectionsDocument(@Param('hackathonId') hackathonId: string) {
    return this.resultatsService.deletePreselectionsDocument(hackathonId);
  }

  @Get('hackathon/:hackathonId/inscriptions/liste-pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'hackathonId', description: 'ID du hackathon' })
  @ApiOperation({ summary: 'Générer un PDF de tous les inscrits (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'PDF',
    content: { 'application/pdf': {} },
  })
  async generateInscriptionsListPdf(
    @Param('hackathonId') hackathonId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.resultatsService.generateInscriptionsListPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="liste-inscrits.pdf"`,
    );
    res.send(pdfBuffer);
  }
}

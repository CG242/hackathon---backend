import { Module } from '@nestjs/common';
import { ResultatsController } from './resultats.controller';
import { ResultatsService } from './resultats.service';
import { PdfExtractionService } from './pdf-extraction.service';
import { PdfGenerationService } from './pdf-generation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ResultatsController],
  providers: [ResultatsService, PdfExtractionService, PdfGenerationService],
  exports: [ResultatsService, PdfExtractionService, PdfGenerationService],
})
export class ResultatsModule {}

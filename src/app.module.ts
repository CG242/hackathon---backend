import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { HackathonModule } from './hackathon/hackathon.module';
import { AnnonceModule } from './annonce/annonce.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { InscriptionsModule } from './inscriptions/inscriptions.module';
import { ResultatsModule } from './resultats/resultats.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    // ✅ TOUS LES MODULES ORIGINAUX RESTAURÉS
    PrismaModule,
    AuthModule,
    EmailModule,
    QueueModule,
    HackathonModule,
    AnnonceModule,
    AdminModule,
    AiModule,
    EventsModule,
    InscriptionsModule,
    ResultatsModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

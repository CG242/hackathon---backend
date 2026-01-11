// 🚀 MODULE EMAIL OPTIMISÉ POUR FAIBLE CONSOMMATION RAM

import { Module } from '@nestjs/common';
import { EmailServiceOptimized } from './email.service.optimized';

@Module({
  providers: [EmailServiceOptimized],
  exports: [EmailServiceOptimized],
  // Pas de contrôleur pour éviter les routes inutiles
})
export class EmailModuleOptimized {}

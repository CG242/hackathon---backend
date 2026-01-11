import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🚨 ENDPOINT DE SANTÉ MINIMAL pour Render
  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      phase: 'PHASE_2', // Indicateur de phase actuelle
      modules: ['Prisma', 'Auth', 'Hackathon', 'Inscriptions', 'Annonce', 'Teams', 'Resultats']
    };
  }

  // 📊 ENDPOINT MONITORING AVANCÉ
  @Get('memory')
  getMemoryStats(): object {
    const mem = process.memoryUsage();
    return {
      timestamp: Date.now(),
      uptime: `${Math.floor(process.uptime())}s`,
      phase: 'PHASE_2_ACTIVATED',
      memory: {
        rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
        heapUsedPercent: `${((mem.heapUsed / mem.heapTotal) * 100).toFixed(1)}%`
      },
      limits: {
        maxHeap: '200MB',
        maxRSS: '350MB (recommandé)'
      },
      activeModules: 7,
      nodeVersion: process.version
    };
  }
}

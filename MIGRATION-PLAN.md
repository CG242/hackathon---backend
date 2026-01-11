# 🚀 PLAN DE MIGRATION PROGRESSIVE - RÉCUPÉRER TOUTES LES FONCTIONNALITÉS

## 🎯 OBJECTIF : API complète avec contrôle mémoire

**Situation actuelle :** Version minimal (50MB) fonctionnelle
**Objectif final :** API complète avec < 400MB RAM

---

## 📊 ÉTAPES DE MIGRATION

### **PHASE 1 : BASE SOLIDE** ✅ (Actuellement déployé)
- ✅ Prisma + Auth + Hackathon + Inscriptions
- ✅ Mémoire : ~150MB
- ✅ Stable sur Render Free

### **PHASE 2 : MODULES LÉGERS** (À activer maintenant)
```typescript
// Dans app.module.ts - Décommenter :
import { AnnonceModule } from './annonce/annonce.module';
import { TeamsModule } from './teams/teams.module';
import { ResultatsModule } from './resultats/resultats.module';

// Ajouter dans imports[] :
AnnonceModule,   // +~10MB
TeamsModule,     // +~10MB
ResultatsModule, // +~10MB
```
**Mémoire estimée :** ~180MB
**Risque :** Faible

### **PHASE 3 : MODULES MOYENS**
```typescript
// Décommenter dans app.module.ts :
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';

// Ajouter dans imports[] :
AdminModule,  // +~15MB
// EventsModule, // ⚠️ ATTENDRE - WebSocket lourd
```
**Mémoire estimée :** ~210MB
**Risque :** Moyen

### **PHASE 4 : OPTIMISATION AVANCÉE**
```typescript
// Modules à optimiser avant activation :
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';

// Stratégies d'optimisation :
1. Lazy loading des modules lourds
2. Cache intelligent
3. Optimisation des dépendances
```

---

## 🛠️ OUTILS DE MONITORING

### **1. Endpoint mémoire avancé**
```typescript
// Ajouter dans app.controller.ts
@Get('memory')
getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
    uptime: process.uptime(),
    modules: 'PHASE_2' // Indiquer la phase actuelle
  };
}
```

### **2. Script de test mémoire**
```bash
# Créer test-memory.sh
#!/bin/bash
echo "=== MEMORY TEST ==="
curl -s https://your-app.onrender.com/health | jq .
echo ""
curl -s https://your-app.onrender.com/memory | jq .
```

---

## 🎯 STRATÉGIE DE DÉPLOIEMENT

### **Méthode 1 : Déploiement incrémental**
```bash
# Étape 1 : Tester localement
npm run build
NODE_ENV=production npm run start:prod

# Étape 2 : Activer un module
# Modifier app.module.ts

# Étape 3 : Tester à nouveau
npm run build
NODE_ENV=production npm run start:prod

# Étape 4 : Déployer si OK
git add .
git commit -m "feat: activate AnnonceModule"
git push origin main
```

### **Méthode 2 : Branches de test**
```bash
# Créer une branche pour chaque phase
git checkout -b phase2-light-modules
# Activer AnnonceModule, TeamsModule, ResultatsModule
git commit -m "feat: phase 2 - light modules"
git push origin phase2-light-modules

# Tester sur Render avec cette branche
# Puis merge si succès
```

---

## 📈 PLANNING DÉTAILLÉ

### **Semaine 1 : Modules légers**
- **Jour 1-2 :** AnnonceModule + monitoring
- **Jour 3-4 :** TeamsModule + tests
- **Jour 5-7 :** ResultatsModule + validation

**Cible mémoire :** < 200MB

### **Semaine 2 : Modules moyens**
- **Jour 1-3 :** AdminModule + optimisation
- **Jour 4-7 :** EventsModule (si mémoire OK)

**Cible mémoire :** < 250MB

### **Semaine 3 : Modules lourds (optionnel)**
- **EmailModule :** Optimisation requise
- **QueueModule :** Lazy loading nécessaire
- **AiModule :** Probablement impossible sur 512MB

---

## 🔧 OPTIMISATIONS POUR MODULES LOURDS

### **EmailModule - Optimisation**
```typescript
// email.service.ts - Version optimisée
@Injectable()
export class EmailService {
  private transporter: any = null;

  // Lazy initialization
  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        // Config minimale
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        // Pas d'auth si possible
      });
    }
    return this.transporter;
  }
}
```

### **QueueModule - Optimisation**
```typescript
// queue.service.ts - Version légère
@Injectable()
export class QueueService {
  // Utiliser un simple array au lieu de Bull/Redis
  private queue: any[] = [];

  async addJob(job: any) {
    this.queue.push(job);
    // Traiter immédiatement ou de manière asynchrone légère
  }
}
```

### **AiModule - Alternative**
```typescript
// ai.service.ts - Version mock/offline
@Injectable()
export class AiService {
  async analyze(text: string) {
    // Version mock pour éviter les dépendances lourdes
    return {
      score: Math.random(),
      suggestions: ['Mock suggestion'],
      tags: ['mock']
    };
  }
}
```

---

## 🚨 PLAN B : CHANGER DE PLATEFORME

Si impossible de tout faire tenir dans 512MB :

### **Railway (RECOMMANDÉ)**
- ✅ 1GB RAM gratuit
- ✅ PostgreSQL intégré
- ✅ Déploiement simple
- ✅ Meilleure performance

### **Heroku**
- ✅ 1GB RAM gratuit
- ✅ PostgreSQL add-on
- ✅ Mature et stable

### **Migration vers Railway :**
```bash
# 1. Créer compte Railway
# 2. Connecter GitHub
# 3. Déployer directement
# 4. Profiter de 1GB RAM
```

---

## 📋 CHECKLIST DE VALIDATION

### **Après chaque activation de module :**
- ✅ Build réussi (`npm run build`)
- ✅ Démarrage local (`npm run start:prod`)
- ✅ Health check (`/health`)
- ✅ Memory check (`/memory`)
- ✅ Tests API principaux
- ✅ Déploiement Render
- ✅ Monitoring 24h

### **Seuils d'alerte :**
- 🚨 **RSS > 350MB :** Revenir en arrière
- 🚨 **Heap > 250MB :** Optimiser le module
- 🚨 **GC fréquent :** Problème de mémoire

---

## 🎯 OBJECTIFS PAR PHASE

| Phase | Modules | Mémoire cible | Fonctionnalités |
|-------|---------|---------------|-----------------|
| **Phase 1** | Core | < 150MB | Auth, Hackathon, Inscriptions |
| **Phase 2** | + Légers | < 200MB | + Annonces, Équipes, Résultats |
| **Phase 3** | + Admin | < 250MB | + Administration, Events |
| **Phase 4** | + Lourds | < 350MB | + Email, Queue (optimisés) |

---

## 🚀 PROCHAINE ÉTAPE RECOMMANDÉE

**Activez immédiatement les modules légers :**

```typescript
// Dans app.module.ts - Décommenter :
import { AnnonceModule } from './annonce/annonce.module';
import { TeamsModule } from './teams/teams.module';
import { ResultatsModule } from './resultats/resultats.module';

// Dans imports[] :
AnnonceModule,
TeamsModule,
ResultatsModule,
```

**Puis testez et déployez !** 🎉

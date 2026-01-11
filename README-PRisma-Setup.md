# Configuration Prisma pour NestJS - Guide de déploiement

## 🚀 Problèmes résolus

Ce guide explique les corrections apportées pour résoudre les erreurs Prisma dans votre projet NestJS.

### Erreurs corrigées :
- `Property 'user' / 'hackathon' / 'inscription' does not exist on type 'PrismaService'`
- `Module '@prisma/client' has no exported member 'PrismaClient'`
- `Cannot find module '@prisma/client'`
- `$connect / $disconnect does not exist on PrismaService`

## 📋 Modifications apportées

### 1. package.json
```json
{
  "scripts": {
    "prebuild": "prisma generate",
    "build": "nest build"
  },
  "dependencies": {
    "@prisma/client": "^7.2.0"
  }
}
```
- ✅ `@prisma/client` déplacé dans `dependencies` (requis pour la production)
- ✅ Script `prebuild` ajouté pour générer automatiquement le client Prisma

### 2. PrismaService simplifié
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ log: ['warn', 'error'] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```
- ✅ Suppression des adapters complexes (PrismaPg)
- ✅ Configuration simple et compatible partout
- ✅ Méthodes `$connect` et `$disconnect` correctement implémentées

### 3. Schéma Prisma validé
- ✅ Tous les modèles présents : `User`, `Hackathon`, `Inscription`, `Resultats`
- ✅ Enums `Role` et `HackathonStatus` correctement définis
- ✅ Relations bien configurées

## 🛠️ Commandes de déploiement

### Développement local
```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Alimenter la base de données
npx prisma seed

# Compiler et démarrer
npm run build
npm run start:prod
```

### Production (Render / Heroku)
```bash
# Build automatique (le prebuild génère Prisma)
npm run build

# Démarrage en production
npm run start:prod
```

## 🔧 Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT pour l'authentification
JWT_SECRET="your-super-secret-jwt-key"

# Email (optionnel)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 📊 Vérifications

Après les corrections, vérifiez :

1. **Compilation** : `npm run build` ✅
2. **Client Prisma généré** : Vérifiez `node_modules/@prisma/client` ✅
3. **Types disponibles** : `PrismaClient`, `Role`, `HackathonStatus` ✅
4. **Services fonctionnels** : `this.prisma.user.findUnique()` ✅

## 🚀 Déploiement sur Render

### Variables d'environnement sur Render :
- `DATABASE_URL` : URL de votre base PostgreSQL
- `JWT_SECRET` : Clé secrète pour JWT
- `NODE_ENV` : `production`

### Commandes de build sur Render :
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm run start:prod`

## ✅ État final

- ✅ Aucune erreur TypeScript
- ✅ Compatible Render / Heroku
- ✅ Client Prisma correctement généré
- ✅ Tous les modèles et enums accessibles
- ✅ Configuration de production prête

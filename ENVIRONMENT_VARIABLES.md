# Variables d'Environnement Requises

## Variables Obligatoires

### Base de Données
- `DATABASE_URL`: URL de connexion PostgreSQL
  - Format: `postgresql://user:password@host:port/database`
  - Supporte Railway/Render et connexions directes

### Authentification
- `JWT_SECRET`: Clé secrète pour les tokens JWT
  - Doit être sécurisée et unique en production
  - Minimum 32 caractères recommandés

## Variables Optionnelles

### Serveur
- `PORT`: Port d'écoute (défaut: 3000)
- `HOST`: Hôte d'écoute (défaut: 0.0.0.0)

### Email (pour notifications)
- `SMTP_HOST`: Serveur SMTP (défaut: smtp.gmail.com)
- `SMTP_PORT`: Port SMTP (défaut: 587)
- `SMTP_SECURE`: Connexion sécurisée (défaut: false)
- `SMTP_USER`: Utilisateur SMTP
- `SMTP_PASS`: Mot de passe SMTP
- `SMTP_FROM`: Adresse expéditeur

## Configuration Cloud

### Railway
- Fournit automatiquement `DATABASE_URL` et `PORT`
- Pas besoin de configurer `HOST`

### Render
- Fournit automatiquement `PORT`
- `DATABASE_URL` doit être configurée dans les variables d'environnement

## Sécurité
- ❌ Ne jamais commiter de vraies valeurs dans le code
- ❌ Ne pas utiliser de valeurs par défaut en production
- ✅ Utiliser des secrets forts et uniques
- ✅ Rotater régulièrement les clés JWT

## Vérification
Avant le déploiement, vérifier que :
- [ ] `DATABASE_URL` pointe vers une base valide
- [ ] `JWT_SECRET` est défini et sécurisé
- [ ] Les migrations Prisma sont appliquées (`npm run prisma:deploy`)
- [ ] La génération Prisma est faite (`npm run prisma:generate`)

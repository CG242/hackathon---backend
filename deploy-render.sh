#!/bin/bash

# Script de déploiement pour Render
# À utiliser comme commande de build sur Render

set -e

echo "🚀 Début du déploiement sur Render..."

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# Générer le client Prisma (nécessaire pour la production)
echo "🗃️ Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations de base de données
echo "🗄️ Application des migrations..."
npx prisma migrate deploy

# Alimenter la base de données si elle est vide
echo "🌱 Vérification et alimentation de la base de données..."
npx prisma db seed

echo "✅ Déploiement terminé avec succès!"
echo "🎯 Application prête à démarrer"

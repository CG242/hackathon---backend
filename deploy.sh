#!/bin/bash

# Script de déploiement pour Render
# Configure la base de données avant de démarrer l'application

echo "🚀 Configuration de la base de données..."

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
npm run prisma:generate

# Appliquer les migrations
echo "🗄️ Application des migrations..."
npm run prisma:deploy

# Alimenter la base de données
echo "🌱 Alimentation de la base de données..."
npm run prisma:seed

echo "✅ Base de données configurée avec succès!"
echo "🎯 Démarrage de l'application..."

# 🚀 GUIDE DE DÉPLOIEMENT SUR RENDER

## ✅ État du projet : PRÊT POUR LE DÉPLOIEMENT

Toutes les corrections Prisma ont été appliquées et poussées vers GitHub.

---

## 🔧 CONFIGURATION RENDER

### **1. Créer un nouveau service Web**
- Aller sur [Render Dashboard](https://dashboard.render.com)
- Cliquer sur "New +" > "Web Service"
- Sélectionner votre dépôt GitHub `hackathon-backend`

### **2. Paramètres du service**
```
Nom : hackathon-backend
Runtime : Node
Build Command : npm install && npm run build
Start Command : npm run start:prod
```

### **3. Variables d'environnement (obligatoires)**
```
DATABASE_URL = postgresql://[votre-db-render-url]
JWT_SECRET = [votre-cle-secrete-jwt]
NODE_ENV = production
```

---

## 📊 BASE DE DONNÉES POSTGRESQL SUR RENDER

### **1. Créer la base de données**
- Aller dans Render Dashboard > "New +" > "PostgreSQL"
- Nom : `hackathon-db`
- Version : Latest
- Région : Frankfurt (EU Central) ou Paris (EU West)

### **2. Récupérer l'URL de connexion**
- Dans l'onglet "Connection" de votre base PostgreSQL
- Copier l'URL externe complète
- L'utiliser comme `DATABASE_URL`

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE

Une fois configuré, Render va :

1. **Cloner le dépôt** depuis GitHub
2. **Installer les dépendances** avec `npm install`
3. **Générer Prisma** automatiquement (via `prebuild`)
4. **Compiler** l'application avec `npm run build`
5. **Appliquer les migrations** de base de données
6. **Démarrer** l'application avec `npm run start:prod`

---

## ✅ VÉRIFICATIONS POST-DÉPLOIEMENT

### **1. Logs de build**
Vérifier que le build se passe bien :
```
✔ Generated Prisma Client (v7.2.0)
✔ Compiled successfully
```

### **2. Health check**
Tester l'endpoint de santé :
```bash
curl https://votre-app.render.com/health
```

### **3. API endpoints**
Tester les endpoints principaux :
```bash
curl https://votre-app.render.com/auth/login
curl https://votre-app.render.com/hackathon
```

---

## 🔍 DÉPANNAGE

### **Erreur de build :**
- Vérifier que `DATABASE_URL` est définie
- Vérifier que `JWT_SECRET` est défini
- Vérifier les logs de build pour les erreurs Prisma

### **Erreur de base de données :**
- Vérifier que l'URL PostgreSQL est correcte
- Vérifier que la base de données est accessible depuis Render
- Vérifier que les migrations se sont appliquées

### **Erreur Prisma :**
- Vérifier que `prisma generate` s'exécute dans le build
- Vérifier que `@prisma/client` est dans `dependencies`

---

## 🎯 URLS IMPORTANTES

- **Backend Render** : `https://hackathon-backend.onrender.com`
- **Frontend Render** : `https://hackathon-frontend.onrender.com`
- **Swagger API** : `https://hackathon-backend.onrender.com/api`

---

## 📋 CHECKLIST FINALE

- ✅ Dépôt GitHub à jour
- ✅ Variables d'environnement configurées
- ✅ Base de données PostgreSQL créée
- ✅ Service Render déployé
- ✅ Application accessible
- ✅ API fonctionnelle

**🎉 Votre application est maintenant déployée avec succès sur Render !**

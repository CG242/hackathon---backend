# Script PowerShell pour créer un fichier .env avec PostgreSQL local
# Exécutez ce script : .\creer-env-local.ps1

$envPath = ".env"

Write-Host "==============================================="
Write-Host "  Configuration du fichier .env pour PostgreSQL local"
Write-Host "==============================================="
Write-Host ""

# Demander les informations à l'utilisateur
Write-Host "Veuillez entrer les informations PostgreSQL :"
Write-Host ""

$dbUser = Read-Host "Nom d'utilisateur PostgreSQL (par défaut: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbHost = Read-Host "Hôte PostgreSQL (par défaut: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Port PostgreSQL (par défaut: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbName = Read-Host "Nom de la base de données (par défaut: hackathon)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "hackathon" }

$jwtSecret = Read-Host "Secret JWT (ou appuyez sur Entrée pour un secret par défaut)"
if ([string]::IsNullOrWhiteSpace($jwtSecret)) { 
    $jwtSecret = "votre-secret-jwt-changez-moi-en-production-" + (New-Guid).ToString()
}

# Encoder le mot de passe pour l'URL si nécessaire
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($dbPasswordPlain)

# Construire le contenu du .env
$envContent = @"
# Configuration de la Base de Données PostgreSQL
DATABASE_URL="postgresql://$dbUser`:$encodedPassword@$dbHost`:$dbPort/$dbName?schema=public"

# Configuration JWT
JWT_SECRET="$jwtSecret"
JWT_EXPIRES_IN="7d"

# Configuration SMTP (optionnel - à configurer si nécessaire)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=email@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@hackathon.com

# Configuration Application
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
"@

# Sauvegarder l'ancien .env s'il existe
if (Test-Path $envPath) {
    $backupPath = ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $envPath $backupPath
    Write-Host ""
    Write-Host "✅ Ancien fichier .env sauvegardé dans: $backupPath"
}

# Écrire le nouveau .env
Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Host ""
Write-Host "✅ Fichier .env créé avec succès !"
Write-Host ""
Write-Host "URL de connexion PostgreSQL :"
Write-Host "  postgresql://$dbUser@$dbHost`:$dbPort/$dbName" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT :"
Write-Host "  1. Assurez-vous que PostgreSQL est démarré"
Write-Host "  2. Créez la base de données '$dbName' si elle n'existe pas"
Write-Host "  3. Redémarrez le serveur backend pour appliquer les changements"
Write-Host ""


# Script pour lister les bases de données PostgreSQL
# Utilisez ce script pour trouver votre base de données avec vos données

Write-Host "================================================"
Write-Host "  Liste des bases de donnees PostgreSQL"
Write-Host "================================================"
Write-Host ""

# Demander les informations de connexion
$user = Read-Host "Nom d'utilisateur PostgreSQL (par defaut: postgres)"
if ([string]::IsNullOrWhiteSpace($user)) { $user = "postgres" }

$password = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

$host = Read-Host "Adresse PostgreSQL (par defaut: localhost)"
if ([string]::IsNullOrWhiteSpace($host)) { $host = "localhost" }

$port = Read-Host "Port PostgreSQL (par defaut: 5432)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

# Encoder le mot de passe pour l'URL
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($passwordPlain)

# Tester la connexion et lister les bases de données
$env:PGPASSWORD = $passwordPlain

Write-Host ""
Write-Host "Connexion a PostgreSQL..."
Write-Host ""

try {
    # Lister toutes les bases de données
    $databases = psql -U $user -h $host -p $port -d postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Connexion reussie!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Bases de donnees disponibles:"
        Write-Host "================================"
        
        $databaseList = $databases | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim() }
        
        foreach ($db in $databaseList) {
            if ($db -ne '') {
                Write-Host "  - $db" -ForegroundColor Cyan
            }
        }
        
        Write-Host ""
        Write-Host "URL DATABASE_URL a utiliser:"
        Write-Host "================================"
        Write-Host 'DATABASE_URL="postgresql://' + $user + ':' + $encodedPassword + '@' + $host + ':' + $port + '/NOM_DE_LA_BASE?schema=public"' -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Remplacez NOM_DE_LA_BASE par le nom de votre base de donnees ci-dessus"
        
    } else {
        Write-Host "❌ Erreur de connexion!" -ForegroundColor Red
        Write-Host $databases
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
} finally {
    $env:PGPASSWORD = $null
}


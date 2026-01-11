-- Script SQL pour vérifier les tables dans la base de données postgres
-- Exécutez ce script avec: psql -U postgres -d postgres -f verifier-tables.sql

-- 1. Lister toutes les tables dans le schéma public
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Compter le nombre de tables
SELECT COUNT(*) as nombre_de_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- 3. Vérifier si les tables du schéma Prisma existent
SELECT 
    CASE 
        WHEN table_name IN ('User', 'Hackathon', 'Inscription', 'Annonce', 'IALog', 'EvenementSurveillance', 'Notification', 'AnalyseIA')
        THEN '✅ Table Prisma trouvée'
        ELSE '❌ Table non Prisma'
    END as statut,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY 
    CASE 
        WHEN table_name IN ('User', 'Hackathon', 'Inscription', 'Annonce', 'IALog', 'EvenementSurveillance', 'Notification', 'AnalyseIA')
        THEN 0
        ELSE 1
    END,
    table_name;

-- 4. Vérifier les colonnes de la table User (si elle existe)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'User'
ORDER BY ordinal_position;

-- 5. Compter les enregistrements dans chaque table Prisma (si elles existent)
SELECT 
    'User' as table_name,
    COUNT(*) as nombre_enregistrements
FROM "User"
UNION ALL
SELECT 'Hackathon', COUNT(*) FROM "Hackathon"
UNION ALL
SELECT 'Inscription', COUNT(*) FROM "Inscription"
UNION ALL
SELECT 'Annonce', COUNT(*) FROM "Annonce"
UNION ALL
SELECT 'IALog', COUNT(*) FROM "IALog"
UNION ALL
SELECT 'EvenementSurveillance', COUNT(*) FROM "EvenementSurveillance"
UNION ALL
SELECT 'Notification', COUNT(*) FROM "Notification"
UNION ALL
SELECT 'AnalyseIA', COUNT(*) FROM "AnalyseIA"
ORDER BY table_name;


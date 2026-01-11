#!/bin/bash

# 🚀 SCRIPT DE TEST MÉMOIRE POUR MONITORING POST-DÉPLOIEMENT

echo "=== 🚀 TEST MÉMOIRE HACKATHON BACKEND ==="
echo ""

# Configuration
APP_URL="https://hackathon-backend.onrender.com"

echo "📍 URL de test: $APP_URL"
echo "⏰ Timestamp: $(date)"
echo ""

# Test 1: Health check basique
echo "🏥 1. HEALTH CHECK:"
curl -s "$APP_URL/health" | jq . 2>/dev/null || echo "❌ Health check failed"
echo ""

# Test 2: Statistiques mémoire détaillées
echo "📊 2. STATISTIQUES MÉMOIRE:"
MEMORY_DATA=$(curl -s "$APP_URL/memory" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$MEMORY_DATA" | jq . 2>/dev/null || echo "$MEMORY_DATA"
else
    echo "❌ Memory stats failed"
fi
echo ""

# Test 3: Analyse des seuils
echo "⚠️  3. ANALYSE SEUILS:"
if command -v jq >/dev/null 2>&1; then
    RSS_MB=$(echo "$MEMORY_DATA" | jq -r '.memory.rss' | sed 's/ MB//')
    HEAP_MB=$(echo "$MEMORY_DATA" | jq -r '.memory.heapUsed' | sed 's/ MB//')

    RSS_NUM=$(echo "$RSS_MB" | awk '{print int($1)}')
    HEAP_NUM=$(echo "$HEAP_MB" | awk '{print int($1)}')

    echo "📈 RSS: ${RSS_NUM}MB (limite: 350MB)"
    echo "🗄️  Heap: ${HEAP_NUM}MB (limite: 200MB)"

    if [ "$RSS_NUM" -gt 350 ]; then
        echo "🚨 ALERT: RSS trop élevé! (>350MB)"
    elif [ "$RSS_NUM" -gt 300 ]; then
        echo "⚠️  WARNING: RSS élevé (>300MB)"
    else
        echo "✅ RSS OK (<300MB)"
    fi

    if [ "$HEAP_NUM" -gt 200 ]; then
        echo "🚨 ALERT: Heap trop élevé! (>200MB)"
    elif [ "$HEAP_NUM" -gt 150 ]; then
        echo "⚠️  WARNING: Heap élevé (>150MB)"
    else
        echo "✅ Heap OK (<150MB)"
    fi
else
    echo "⚠️  jq non installé - analyse manuelle requise"
fi

echo ""
echo "=== ✅ TEST TERMINÉ ==="

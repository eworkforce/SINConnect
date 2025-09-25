#!/bin/bash

# Deploy Firebase Storage Rules
# StrokeTraining Platform v2.0

set -e

echo "🔥 Déploiement des règles Firebase Storage..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé. Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Non connecté à Firebase. Connectez-vous avec: firebase login"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$SCRIPT_DIR/../.."

# Move to backend directory
cd "$BACKEND_DIR"

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ fichier firebase.json introuvable dans $BACKEND_DIR"
    exit 1
fi

# Check if storage rules file exists
RULES_FILE="storage/rules/storage.rules"
if [ ! -f "$RULES_FILE" ]; then
    echo "❌ Fichier de règles Storage introuvable: $RULES_FILE"
    exit 1
fi

# Display current Firebase project
echo "📋 Projet Firebase actuel: $(firebase use)"

# Ask for confirmation
echo "⚠️  Cette action va déployer les règles de sécurité Firebase Storage."
echo "📁 Fichier de règles: $RULES_FILE"
read -p "Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

# Validate rules syntax (dry run)
echo "🔍 Validation de la syntaxe des règles..."
if ! firebase deploy --only storage:rules --dry-run; then
    echo "❌ Erreur de syntaxe dans les règles. Veuillez corriger et réessayer."
    exit 1
fi

# Deploy storage rules
echo "🚀 Déploiement des règles Firebase Storage..."
if firebase deploy --only storage:rules; then
    echo "✅ Règles Firebase Storage déployées avec succès!"
    echo ""
    echo "🔧 Structure des règles déployées:"
    echo "   📁 /documents/{category}/{documentId}/{version}/{fileName}"
    echo "   🖼️  /documents/{category}/{documentId}/thumbnails/{fileName}"
    echo "   👁️  /documents/{category}/{documentId}/previews/{fileName}"
    echo "   👤 /users/{userId}/profile/{fileName}"
    echo "   ⏳ /temp/{userId}/{uploadId}/{fileName}"
    echo "   💾 /backups/{date}/{fileName}"
    echo ""
    echo "🔒 Permissions par rôle:"
    echo "   👥 Attendee: Lecture uniquement"
    echo "   🧑‍⚕️ Specialist: Lecture + Écriture (100MB max)"
    echo "   👑 Admin: Toutes permissions (500MB max)"
    echo "   🏢 Stakeholder: Lecture uniquement"
    echo ""
    echo "📏 Limites de taille:"
    echo "   📄 Documents: Jusqu'à 500MB (admin), 100MB (specialist)"
    echo "   🎥 Vidéos: Jusqu'à 500MB (admin), 200MB (specialist)"
    echo "   🖼️  Images de profil: Jusqu'à 5MB"
    echo "   🔍 Aperçus: Jusqu'à 20MB"
    echo ""
    echo "🎯 Types de fichiers supportés:"
    echo "   📄 PDF, Word, PowerPoint"
    echo "   🖼️  JPEG, PNG"
    echo "   🎥 MP4, WebM"
    echo ""
    echo "🌐 Accédez à la console Firebase: https://console.firebase.google.com"
else
    echo "❌ Échec du déploiement des règles Firebase Storage"
    exit 1
fi
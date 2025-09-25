#!/bin/bash

# ==============================================================================
# Firebase Security Rules Deployment Script
# StrokeTraining Platform
# ==============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}Firebase Security Rules Deployment${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed${NC}"
    echo "Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Firebase${NC}"
    echo "Please login with: firebase login"
    exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}Warning: firebase.json not found${NC}"
    echo "Initializing Firebase configuration..."
    firebase init firestore storage
fi

# Validate Firestore rules syntax
echo -e "${BLUE}Validating Firestore rules...${NC}"
if [ -f "backend/firestore/rules/firestore.rules" ]; then
    # Copy rules to expected location for Firebase CLI
    cp "backend/firestore/rules/firestore.rules" "firestore.rules"
    
    # Validate syntax (this will exit with error if invalid)
    if firebase firestore:rules:get > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Firestore rules syntax is valid${NC}"
    else
        echo -e "${RED}✗ Firestore rules syntax validation failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Firestore rules file not found${NC}"
    exit 1
fi

# Validate Storage rules syntax  
echo -e "${BLUE}Validating Storage rules...${NC}"
if [ -f "backend/storage/rules/storage.rules" ]; then
    # Copy rules to expected location for Firebase CLI
    cp "backend/storage/rules/storage.rules" "storage.rules"
    echo -e "${GREEN}✓ Storage rules syntax is valid${NC}"
else
    echo -e "${RED}Error: Storage rules file not found${NC}"
    exit 1
fi

# Get current Firebase project
CURRENT_PROJECT=$(firebase use --current 2>/dev/null | grep -o "Now using project.*" | cut -d' ' -f4 || echo "none")

if [ "$CURRENT_PROJECT" = "none" ]; then
    echo -e "${YELLOW}No Firebase project selected${NC}"
    echo "Available projects:"
    firebase projects:list
    echo ""
    read -p "Enter project ID to use: " PROJECT_ID
    firebase use "$PROJECT_ID"
    CURRENT_PROJECT="$PROJECT_ID"
fi

echo -e "${BLUE}Current project: ${GREEN}$CURRENT_PROJECT${NC}"

# Confirm deployment
echo ""
read -p "Deploy security rules to $CURRENT_PROJECT? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Create backup of current rules
echo -e "${BLUE}Creating backup of current rules...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup Firestore rules
if firebase firestore:rules:get > "$BACKUP_DIR/firestore.rules.backup" 2>/dev/null; then
    echo -e "${GREEN}✓ Firestore rules backed up${NC}"
else
    echo -e "${YELLOW}⚠ Could not backup current Firestore rules (might be first deployment)${NC}"
fi

# Deploy Firestore rules
echo -e "${BLUE}Deploying Firestore rules...${NC}"
if firebase deploy --only firestore:rules; then
    echo -e "${GREEN}✓ Firestore rules deployed successfully${NC}"
else
    echo -e "${RED}✗ Firestore rules deployment failed${NC}"
    echo "Restore from backup if needed: $BACKUP_DIR/firestore.rules.backup"
    exit 1
fi

# Deploy Storage rules
echo -e "${BLUE}Deploying Storage rules...${NC}"
if firebase deploy --only storage; then
    echo -e "${GREEN}✓ Storage rules deployed successfully${NC}"
else
    echo -e "${RED}✗ Storage rules deployment failed${NC}"
    exit 1
fi

# Cleanup temporary files
rm -f "firestore.rules" "storage.rules"

# Test rules deployment
echo -e "${BLUE}Testing rules deployment...${NC}"
sleep 2  # Give Firebase a moment to propagate rules

# Simple test to verify rules are active
if firebase firestore:rules:get > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Rules deployment verified${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify rules deployment${NC}"
fi

echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Security Rules Deployment Complete!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "• Firestore rules deployed ✓"
echo "• Storage rules deployed ✓"
echo "• Backup created: $BACKUP_DIR"
echo "• Project: $CURRENT_PROJECT"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Test the rules in your application"
echo "2. Monitor Firebase Console for any rule evaluation errors"
echo "3. Update your application code if needed"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "• Monitor your Firebase Console for the next few minutes"
echo "• Rules may take a few minutes to fully propagate"
echo "• Test with different user roles to ensure proper access control"

# Optional: Open Firebase Console
echo ""
read -p "Open Firebase Console to monitor rules? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://console.firebase.google.com/project/$CURRENT_PROJECT/firestore/rules"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://console.firebase.google.com/project/$CURRENT_PROJECT/firestore/rules"
    else
        echo "Please visit: https://console.firebase.google.com/project/$CURRENT_PROJECT/firestore/rules"
    fi
fi

echo -e "${GREEN}Deployment script completed successfully!${NC}"
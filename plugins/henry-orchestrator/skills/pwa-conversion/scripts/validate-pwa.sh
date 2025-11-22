#!/bin/bash

# PWA Validation Script
# Validates that a web app meets PWA requirements

set -e

echo "🔍 Validating PWA Requirements..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check for manifest.json
echo "📄 Checking for Web App Manifest..."
if [ -f "public/manifest.json" ] || [ -f "app/manifest.json" ] || [ -f "src/app/manifest.json" ]; then
    echo -e "${GREEN}✓${NC} manifest.json found"

    # Validate manifest structure
    MANIFEST_FILE=$(find . -name "manifest.json" -type f | head -n 1)
    if [ ! -z "$MANIFEST_FILE" ]; then
        # Check for required fields
        if grep -q '"name"' "$MANIFEST_FILE" && \
           grep -q '"short_name"' "$MANIFEST_FILE" && \
           grep -q '"start_url"' "$MANIFEST_FILE" && \
           grep -q '"display"' "$MANIFEST_FILE" && \
           grep -q '"icons"' "$MANIFEST_FILE"; then
            echo -e "${GREEN}✓${NC} Manifest has required fields"
        else
            echo -e "${RED}✗${NC} Manifest missing required fields (name, short_name, start_url, display, icons)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo -e "${RED}✗${NC} manifest.json not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check for service worker
echo "⚙️  Checking for Service Worker..."
if [ -f "public/sw.js" ] || [ -f "public/service-worker.js" ] || \
   [ -f "app/sw.js" ] || [ -f "worker/index.ts" ] || \
   [ -f "worker/index.js" ]; then
    echo -e "${GREEN}✓${NC} Service worker file found"
else
    echo -e "${RED}✗${NC} Service worker file not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check for PWA icons
echo "🖼️  Checking for PWA Icons..."
ICON_COUNT=$(find public -name "icon-*.png" 2>/dev/null | wc -l)
if [ $ICON_COUNT -ge 2 ]; then
    echo -e "${GREEN}✓${NC} PWA icons found ($ICON_COUNT icons)"
else
    echo -e "${YELLOW}⚠${NC} Insufficient PWA icons found (need at least 192x192 and 512x512)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check for next-pwa configuration (Next.js specific)
echo "⚛️  Checking Next.js PWA Configuration..."
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    if grep -q "next-pwa" next.config.* 2>/dev/null; then
        echo -e "${GREEN}✓${NC} next-pwa configured in Next.js config"
    else
        echo -e "${YELLOW}⚠${NC} next-pwa not found in Next.js config"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""

# Check for HTTPS (in production)
echo "🔒 HTTPS Check..."
echo -e "${YELLOW}⚠${NC} Remember: PWAs require HTTPS in production (localhost is exempt)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ PWA validation passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ PWA validation passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ PWA validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi

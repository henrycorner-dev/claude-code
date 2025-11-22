#!/bin/bash
# Bundle Analysis Script
#
# Analyzes webpack bundle size and composition
# Generates visual report using webpack-bundle-analyzer

set -e

echo "📦 Bundle Size Analysis"
echo "======================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Run 'npm install' first."
  exit 1
fi

# Check if webpack is installed
if ! command -v webpack &> /dev/null; then
  if [ ! -f "node_modules/.bin/webpack" ]; then
    echo "❌ webpack not found. Installing webpack-bundle-analyzer..."
    npm install --save-dev webpack-bundle-analyzer
  fi
fi

# Check for build directory
BUILD_DIR="build"
DIST_DIR="dist"

if [ -d "$BUILD_DIR" ]; then
  TARGET_DIR="$BUILD_DIR"
elif [ -d "$DIST_DIR" ]; then
  TARGET_DIR="$DIST_DIR"
else
  echo "⚠️  No build directory found. Running build..."
  npm run build

  if [ -d "$BUILD_DIR" ]; then
    TARGET_DIR="$BUILD_DIR"
  elif [ -d "$DIST_DIR" ]; then
    TARGET_DIR="$DIST_DIR"
  else
    echo "❌ Build directory not found after running build"
    exit 1
  fi
fi

echo "📂 Analyzing bundles in: $TARGET_DIR"
echo ""

# Find JavaScript bundles
JS_FILES=$(find "$TARGET_DIR" -name "*.js" -type f ! -name "*.map" 2>/dev/null)

if [ -z "$JS_FILES" ]; then
  echo "❌ No JavaScript bundles found in $TARGET_DIR"
  exit 1
fi

# Calculate total bundle size
echo "📊 Bundle Sizes:"
echo "----------------"

TOTAL_SIZE=0
while IFS= read -r file; do
  SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  SIZE_KB=$((SIZE / 1024))
  TOTAL_SIZE=$((TOTAL_SIZE + SIZE))

  # Color code based on size
  if [ $SIZE_KB -lt 100 ]; then
    COLOR="\033[0;32m" # Green
  elif [ $SIZE_KB -lt 250 ]; then
    COLOR="\033[0;33m" # Yellow
  else
    COLOR="\033[0;31m" # Red
  fi

  FILENAME=$(basename "$file")
  printf "${COLOR}%8d KB${RESET}  %s\n" "$SIZE_KB" "$FILENAME"
done <<< "$JS_FILES"

TOTAL_SIZE_KB=$((TOTAL_SIZE / 1024))
TOTAL_SIZE_MB=$((TOTAL_SIZE_KB / 1024))

echo "----------------"
printf "Total: %d KB (%.2f MB)\n" "$TOTAL_SIZE_KB" "$(echo "scale=2; $TOTAL_SIZE_KB / 1024" | bc)"
echo ""

# Recommendations based on total size
echo "💡 Recommendations:"
echo "-------------------"

if [ $TOTAL_SIZE_KB -gt 500 ]; then
  echo "⚠️  Bundle size exceeds 500 KB"
  echo "   - Consider code splitting"
  echo "   - Enable tree shaking"
  echo "   - Use dynamic imports for large components"
fi

if [ $TOTAL_SIZE_KB -gt 1000 ]; then
  echo "❌ Bundle size exceeds 1 MB - this is too large!"
  echo "   - URGENT: Implement route-based code splitting"
  echo "   - Separate vendor bundles"
  echo "   - Lazy load heavy dependencies"
fi

echo ""

# Check for source maps in production
SOURCE_MAPS=$(find "$TARGET_DIR" -name "*.map" -type f 2>/dev/null)
if [ -n "$SOURCE_MAPS" ]; then
  MAP_COUNT=$(echo "$SOURCE_MAPS" | wc -l | tr -d ' ')
  echo "⚠️  Found $MAP_COUNT source map files in build"
  echo "   Consider disabling source maps in production"
  echo ""
fi

# Run webpack-bundle-analyzer if available
if [ -f "node_modules/.bin/webpack-bundle-analyzer" ]; then
  echo "🔍 Generating detailed bundle analysis..."
  echo "   Opening interactive treemap in browser..."
  echo ""

  # Find stats.json or generate it
  if [ -f "stats.json" ]; then
    npx webpack-bundle-analyzer stats.json "$TARGET_DIR" -m static -r bundle-report.html -O
  else
    # Try to analyze bundles directly
    echo "   Note: For best results, generate stats.json with:"
    echo "   webpack --profile --json > stats.json"
    echo ""
  fi
else
  echo "💡 Install webpack-bundle-analyzer for detailed analysis:"
  echo "   npm install --save-dev webpack-bundle-analyzer"
  echo ""
fi

# Check for duplicate dependencies
echo "🔎 Checking for potential duplicate dependencies..."
echo "---------------------------------------------------"

# Simple check: look for common library names in bundle filenames
COMMON_LIBS=("react" "lodash" "moment" "jquery" "axios")
for lib in "${COMMON_LIBS[@]}"; do
  MATCHES=$(echo "$JS_FILES" | grep -i "$lib" || true)
  if [ -n "$MATCHES" ]; then
    COUNT=$(echo "$MATCHES" | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 1 ]; then
      echo "⚠️  Found $COUNT bundles containing '$lib' - possible duplication"
    fi
  fi
done

echo ""
echo "✅ Bundle analysis complete!"
echo ""
echo "Next steps:"
echo "1. Review bundle sizes above"
echo "2. Check bundle-report.html for detailed breakdown (if generated)"
echo "3. Focus on largest bundles for optimization"
echo "4. Implement code splitting for bundles > 250 KB"

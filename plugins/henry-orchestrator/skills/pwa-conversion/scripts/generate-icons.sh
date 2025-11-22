#!/bin/bash

# PWA Icon Generator
# Generates all required PWA icon sizes from a source image
# Requires ImageMagick (install with: brew install imagemagick)

set -e

# Check if source image is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <source-image> [output-dir]"
    echo "Example: $0 logo.svg public"
    exit 1
fi

SOURCE_IMAGE=$1
OUTPUT_DIR=${2:-public}

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed"
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🎨 Generating PWA icons from $SOURCE_IMAGE..."
echo ""

# PWA icon sizes
SIZES=(72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/icon-${SIZE}x${SIZE}.png"
    echo "Generating ${SIZE}x${SIZE}..."
    convert "$SOURCE_IMAGE" -resize ${SIZE}x${SIZE} "$OUTPUT_FILE"
done

# Generate Apple Touch Icon
echo "Generating apple-touch-icon.png (180x180)..."
convert "$SOURCE_IMAGE" -resize 180x180 "$OUTPUT_DIR/apple-touch-icon.png"

# Generate favicon
echo "Generating favicon.ico..."
convert "$SOURCE_IMAGE" -resize 32x32 "$OUTPUT_DIR/favicon.ico"

echo ""
echo "✓ Icon generation complete!"
echo "Generated icons in: $OUTPUT_DIR"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR"/icon-*.png "$OUTPUT_DIR"/apple-touch-icon.png "$OUTPUT_DIR"/favicon.ico 2>/dev/null

#!/bin/bash
set -euo pipefail

# Asset Optimizer Hook
# Optimizes PNG images and checks FBX poly counts after file writes

# Read input from stdin
input=$(cat)

# Extract file path from tool input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [ -z "$file_path" ]; then
  echo '{"continue": true, "suppressOutput": true}'
  exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
  echo '{"continue": true, "suppressOutput": true}'
  exit 0
fi

# Get file extension
file_ext="${file_path##*.}"
file_ext_lower=$(echo "$file_ext" | tr '[:upper:]' '[:lower:]')

# Initialize message
message=""

# Handle PNG optimization
if [ "$file_ext_lower" = "png" ]; then
  # Get original file size
  original_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
  original_kb=$((original_size / 1024))

  # Check for optimization tools
  if command -v optipng &> /dev/null; then
    # Use optipng for lossless compression
    optipng -quiet -o2 "$file_path" 2>&1 || true

    # Get new file size
    new_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "$original_size")
    new_kb=$((new_size / 1024))
    saved_kb=$((original_kb - new_kb))

    if [ $saved_kb -gt 0 ]; then
      message="PNG optimized: $file_path (saved ${saved_kb}KB, ${original_kb}KB → ${new_kb}KB)"
    else
      message="PNG already optimized: $file_path (${original_kb}KB)"
    fi

  elif command -v pngquant &> /dev/null; then
    # Use pngquant for lossy compression (better for large files)
    pngquant --force --quality=65-80 --output "$file_path" "$file_path" 2>&1 || true

    # Get new file size
    new_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "$original_size")
    new_kb=$((new_size / 1024))
    saved_kb=$((original_kb - new_kb))

    if [ $saved_kb -gt 0 ]; then
      message="PNG compressed: $file_path (saved ${saved_kb}KB, ${original_kb}KB → ${new_kb}KB)"
    else
      message="PNG already compressed: $file_path (${original_kb}KB)"
    fi

  else
    # No optimization tools available
    message="PNG written: $file_path (${original_kb}KB) - install optipng or pngquant for automatic optimization"
  fi

  # Check if image is very large and suggest resizing
  if [ $original_kb -gt 2048 ]; then
    message="${message}. Warning: Large PNG file (${original_kb}KB) - consider resizing for better performance"
  fi
fi

# Handle FBX poly count checking
if [ "$file_ext_lower" = "fbx" ]; then
  # Get file size
  file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
  file_mb=$((file_size / 1024 / 1024))

  message="FBX asset written: $file_path (${file_mb}MB)"

  # Try to estimate poly count from file size (very rough heuristic)
  # Average FBX file: ~100KB per 1000 polygons (varies widely)
  estimated_polys=$((file_size / 102))

  if [ $estimated_polys -gt 100000 ]; then
    message="${message}. Warning: Large FBX file suggests high poly count (~${estimated_polys} estimated polygons). Consider optimizing mesh."
  elif [ $estimated_polys -gt 50000 ]; then
    message="${message}. Note: Medium-complexity mesh (~${estimated_polys} estimated polygons)"
  else
    message="${message}. Poly count appears reasonable (~${estimated_polys} estimated polygons)"
  fi

  # Check for FBX analysis tools
  if command -v fbx-converter &> /dev/null || command -v FBX2glTF &> /dev/null; then
    message="${message}. Run FBX analysis tools for precise poly count."
  else
    message="${message}. Note: Install FBX SDK or FBX2glTF for precise poly count analysis."
  fi
fi

# Output result
if [ -n "$message" ]; then
  # Escape message for JSON
  escaped_message=$(echo "$message" | jq -Rs .)
  echo "{\"continue\": true, \"suppressOutput\": false, \"systemMessage\": $escaped_message}"
else
  # No optimization needed, suppress output
  echo '{"continue": true, "suppressOutput": true}'
fi

exit 0

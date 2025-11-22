#!/bin/bash
# Bundle Size Guard Hook
# Monitors build commands and checks bundle sizes against configured limits
# Supports: Web (Webpack), Mobile (Metro), Game (Unity)

set -euo pipefail

# Read hook input
input=$(cat)

# Extract command from input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Check if this is a build command
is_build_command() {
  local cmd="$1"

  # Web build patterns
  if echo "$cmd" | grep -qE "(npm|yarn|pnpm) (run )?build|webpack|vite build|next build|react-scripts build"; then
    echo "web"
    return 0
  fi

  # Mobile build patterns
  if echo "$cmd" | grep -qE "react-native bundle|metro|npx react-native run|expo build"; then
    echo "mobile"
    return 0
  fi

  # Game build patterns (Unity)
  if echo "$cmd" | grep -qE "Unity|unity-editor|UnityEngine|\.unity|build\.sh.*unity"; then
    echo "game"
    return 0
  fi

  # Not a build command
  return 1
}

# Get build type
build_type=$(is_build_command "$command" || echo "")

# If not a build command, allow it
if [ -z "$build_type" ]; then
  echo '{"continue": true}'
  exit 0
fi

# Load configuration
CONFIG_FILE="${CLAUDE_PLUGIN_ROOT}/hooks/bundle-size-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  # No config file, allow build (hook is effectively disabled)
  echo '{"continue": true}'
  exit 0
fi

# Read limits from config
enabled=$(jq -r ".enabled // true" "$CONFIG_FILE")
if [ "$enabled" != "true" ]; then
  # Hook disabled in config
  echo '{"continue": true}'
  exit 0
fi

# Get limit for this build type
limit_mb=$(jq -r ".limits.${build_type} // 1" "$CONFIG_FILE")

# Check if we should enforce (or just warn)
enforce=$(jq -r ".enforce // true" "$CONFIG_FILE")

# For PreToolUse, we can't check actual size yet (build hasn't run)
# Instead, we'll provide a warning and let PostToolUse handle actual checking
# OR we can check for existing build artifacts to estimate

check_existing_bundle_size() {
  local build_type="$1"
  local project_dir="${CLAUDE_PROJECT_DIR}"

  case "$build_type" in
    web)
      # Common web build output directories
      for dir in "build" "dist" ".next" "out"; do
        if [ -d "$project_dir/$dir" ]; then
          # Find main bundle files (JS)
          local bundles=$(find "$project_dir/$dir" -type f -name "*.js" 2>/dev/null || true)
          if [ -n "$bundles" ]; then
            # Calculate gzipped size
            local total_size=0
            while IFS= read -r file; do
              if [ -f "$file" ]; then
                # Gzip and get size
                local size=$(gzip -c "$file" | wc -c | awk '{print $1}')
                total_size=$((total_size + size))
              fi
            done <<< "$bundles"

            # Convert to MB
            local size_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
            echo "$size_mb"
            return 0
          fi
        fi
      done
      ;;

    mobile)
      # Metro bundle output
      if [ -d "$project_dir/android/app/build" ]; then
        local bundle_file=$(find "$project_dir/android/app/build" -name "index.android.bundle" 2>/dev/null | head -1)
        if [ -f "$bundle_file" ]; then
          local size=$(gzip -c "$bundle_file" | wc -c | awk '{print $1}')
          local size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc)
          echo "$size_mb"
          return 0
        fi
      fi

      if [ -d "$project_dir/ios/build" ]; then
        local bundle_file=$(find "$project_dir/ios/build" -name "main.jsbundle" 2>/dev/null | head -1)
        if [ -f "$bundle_file" ]; then
          local size=$(gzip -c "$bundle_file" | wc -c | awk '{print $1}')
          local size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc)
          echo "$size_mb"
          return 0
        fi
      fi
      ;;

    game)
      # Unity build output
      for dir in "Build" "Builds" "build"; do
        if [ -d "$project_dir/$dir" ]; then
          # Find build files
          local build_files=$(find "$project_dir/$dir" -type f \( -name "*.data" -o -name "*.wasm" -o -name "*.bundle" \) 2>/dev/null || true)
          if [ -n "$build_files" ]; then
            local total_size=0
            while IFS= read -r file; do
              if [ -f "$file" ]; then
                local size=$(gzip -c "$file" | wc -c | awk '{print $1}')
                total_size=$((total_size + size))
              fi
            done <<< "$build_files"

            local size_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
            echo "$size_mb"
            return 0
          fi
        fi
      done
      ;;
  esac

  # No existing bundle found
  echo "0"
  return 1
}

# Check existing bundle size
existing_size=$(check_existing_bundle_size "$build_type" || echo "0")

# Compare against limit
if [ "$existing_size" != "0" ]; then
  # Use bc for floating point comparison
  if [ "$(echo "$existing_size > $limit_mb" | bc)" -eq 1 ]; then
    # Bundle exceeds limit
    msg="Bundle size warning: Current ${build_type} bundle is ${existing_size}MB (gzipped), exceeds limit of ${limit_mb}MB"

    if [ "$enforce" == "true" ]; then
      # Block the build
      echo "{
        \"hookSpecificOutput\": {
          \"permissionDecision\": \"deny\"
        },
        \"systemMessage\": \"$msg. Build blocked by bundle-size-guard hook. Update bundle-size-config.json to adjust limits or disable enforcement.\"
      }" >&2
      exit 2
    else
      # Just warn, don't block
      echo "{
        \"continue\": true,
        \"systemMessage\": \"$msg. This is a warning only (enforcement disabled).\"
      }"
      exit 0
    fi
  fi
fi

# Bundle size is within limit or no existing bundle
# Provide helpful message
if [ "$existing_size" != "0" ]; then
  msg="Bundle size check: ${build_type} bundle is ${existing_size}MB (gzipped), within limit of ${limit_mb}MB"
else
  msg="Bundle size guard active for ${build_type} build (limit: ${limit_mb}MB gzipped)"
fi

echo "{
  \"continue\": true,
  \"systemMessage\": \"$msg\"
}"

exit 0

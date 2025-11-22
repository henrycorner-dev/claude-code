# Security and Quality Validation Hooks

## Overview

This repository contains three PreToolUse hooks that enforce security and quality standards:

1. **Security Scan Hook**: Validates dependencies for known vulnerabilities before npm/pip installations
2. **Test Coverage Check Hook**: Ensures 80% minimum test coverage before file modifications
3. **Bundle Size Guard Hook**: Monitors build commands and enforces bundle size limits for web, mobile, and game builds

---

## Security Scan Hook

### Overview

The security scan hook automatically validates dependencies for known vulnerabilities before installing them via npm or pip. It blocks installations that contain critical or high-severity vulnerabilities, helping prevent supply chain attacks and vulnerable library usage.

### Features

- **npm Support**: Uses `npm audit` to scan Node.js packages
- **Python Support**: Uses `safety` to scan Python packages
- **Multi-Package Manager**: Supports npm, yarn, pnpm, and pip
- **Severity-Based Blocking**: Blocks critical/high vulnerabilities, warns on moderate
- **Smart Detection**: Automatically detects install commands in bash executions
- **Detailed Feedback**: Shows vulnerability counts and affected packages

### How It Works

#### Trigger Conditions

The hook triggers on `Bash` tool calls that contain package installation commands:

**npm/Node.js:**
- `npm install <package>` or `npm i <package>`
- `yarn add <package>`
- `pnpm install <package>` or `pnpm add <package>`

**Python:**
- `pip install <package>`

#### Validation Logic

**For npm packages:**

1. Creates temporary test environment
2. Attempts to install packages with `--package-lock-only`
3. Runs `npm audit --json` to check for vulnerabilities
4. Analyzes severity levels:
   - **Critical or High**: Installation is **blocked**
   - **Moderate**: Installation **allowed** with warning
   - **None**: Installation allowed with confirmation

**For Python packages:**

1. Checks if `safety` CLI is installed
2. Creates temporary requirements file with package names
3. Runs `safety check --file` to scan vulnerabilities
4. If vulnerabilities found: Installation is **blocked**
5. Otherwise: Installation allowed

#### Output Examples

**Blocked (Critical/High Vulnerabilities):**
```
🔒 Security Alert: Blocked npm install due to vulnerabilities

Critical: 2 | High: 3 | Moderate: 1

Vulnerable packages: lodash: critical, axios: high, ...

Please review vulnerabilities with 'npm audit' or choose alternative packages.
```

**Warning (Moderate Vulnerabilities):**
```
⚠️  Security Warning: Found 2 moderate vulnerabilities in npm packages

Consider running 'npm audit' to review. Installation allowed.
```

**Passed:**
```
✅ npm packages passed security scan
```

### Installation & Setup

#### Prerequisites

**For npm scanning** (automatic):
- `npm` must be installed
- `jq` for JSON parsing (pre-installed on macOS/Linux)

**For Python scanning** (requires setup):
```bash
pip install safety
```

#### Enable the Hook

The hook is already configured in `.claude/hooks/hooks.json`. To activate:

1. Restart Claude Code session:
   ```bash
   # Exit current session
   # Run: claude
   ```

2. The hook will automatically scan all npm/pip install commands

### Configuration

#### Adjust Severity Threshold

To change which severity levels block installation, edit `.claude/hooks/scripts/security-scan.sh`:

**Currently (blocks critical + high):**
```bash
# Line 43-44
total_severe=$((critical + high))
```

**To block moderate too:**
```bash
total_severe=$((critical + high + moderate))
```

#### Disable Python Scanning

If you don't need Python support, remove the pip check section (lines 100-130) or make it always return:

```bash
check_pip() {
  echo '{"continue": true}'
  exit 0
}
```

#### Add Custom Package Blocklist

Add specific packages to always block:

```bash
# Add after line 90 (before check_npm)
BLOCKED_PACKAGES="left-pad some-sketchy-package"

for blocked in $BLOCKED_PACKAGES; do
  if echo "$packages" | grep -q "$blocked"; then
    cat >&2 <<EOF
{
  "hookSpecificOutput": {"permissionDecision": "deny"},
  "systemMessage": "🔒 Package '$blocked' is on blocklist"
}
EOF
    exit 2
  fi
done
```

### Security Best Practices

#### Vulnerability Databases

- **npm audit**: Uses the npm advisory database (updated regularly)
- **safety**: Uses PyUp.io vulnerability database for Python

Both databases are community-maintained and may have delays in reporting new CVEs.

#### What Gets Blocked

The hook blocks:
- ✅ Known vulnerable versions of packages
- ✅ Packages with critical/high severity CVEs
- ✅ Transitive dependencies with vulnerabilities

The hook does NOT block:
- ❌ Zero-day vulnerabilities (not yet in databases)
- ❌ Malicious packages without known CVEs
- ❌ Typosquatting attacks (different package name)

#### Additional Security Measures

Consider combining with:
- Manual code review of dependencies
- Dependency license scanning
- Regular `npm audit` / `safety check` in CI/CD
- Lock file review for unexpected changes

### Debugging

#### Test Hook Manually

**Test with npm install:**
```bash
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "npm install lodash@4.17.0"},
  "cwd": "'"$(pwd)"'"
}' | bash .claude/hooks/scripts/security-scan.sh

echo "Exit code: $?"
```

**Test with pip install:**
```bash
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "pip install django==1.11.0"},
  "cwd": "'"$(pwd)"'"
}' | bash .claude/hooks/scripts/security-scan.sh
```

#### Enable Debug Mode

```bash
claude --debug
```

This shows:
- Hook triggering on Bash commands
- Command parsing and package extraction
- Audit results and vulnerability counts
- Block/allow decisions

#### Common Issues

**"safety CLI not installed"**
- Install Python safety: `pip install safety`
- Or disable Python scanning (see Configuration)

**"Could not verify packages"**
- Network issues preventing npm/pip from connecting
- Hook allows installation by default (fail-open)
- Check internet connection or npm registry config

**Hook not triggering:**
- Verify hooks loaded: run `/hooks` in Claude Code
- Restart Claude Code after hook changes
- Check command format matches patterns (see Trigger Conditions)

### Limitations

- **Database Coverage**: Only detects vulnerabilities in public databases
- **Timing**: Adds 5-15 seconds to install commands
- **Network Required**: Needs internet to download package metadata
- **Fail-Open**: Allows installation if scanning tools fail
- **Command Parsing**: May miss complex install command formats

### Future Enhancements

Potential improvements:
- License compliance checking
- Package age/maintenance status validation
- Typosquatting detection
- Integration with private vulnerability databases
- Configurable severity thresholds via config file
- Caching of scan results for faster re-checks

---

## Test Coverage Check Hook

### Overview

This hook ensures that your project maintains a minimum of 80% test coverage before allowing file modifications. It runs automatically before any `Write` or `Edit` operations in Claude Code.

## Features

- **Automatic Coverage Validation**: Runs Jest coverage analysis before file modifications
- **Smart Filtering**: Skips coverage check for test files themselves
- **Comprehensive Metrics**: Validates Lines, Statements, Functions, and Branches coverage
- **Graceful Degradation**: Skips check if Jest or tests are not configured
- **Clear Feedback**: Provides detailed coverage breakdown when blocking operations

## How It Works

### Trigger Conditions

The hook triggers on:
- `Write` tool calls (creating or overwriting files)
- `Edit` tool calls (modifying existing files)

### Validation Logic

1. **Test File Detection**: Automatically allows modifications to test files without coverage check
   - Files in `/test/`, `/tests/`, or `/__tests__/` directories
   - Files with `.test.` or `.spec.` in the name

2. **Environment Check**: Validates that:
   - Jest is installed (either globally or in `node_modules`)
   - Test directory exists OR `package.json` has a test script
   - If not found, allows modification with a warning

3. **Coverage Analysis**:
   - Runs `jest --coverage --coverageReporters=json-summary`
   - Parses coverage metrics from `coverage/coverage-summary.json`
   - Calculates minimum coverage across all metrics

4. **Threshold Enforcement**:
   - Required: **80% minimum coverage**
   - Uses the **minimum** of all coverage types (strictest policy)
   - Blocks modification if below threshold
   - Allows modification if at or above threshold

### Output Examples

**✓ Coverage Passing**
```
✓ Test coverage check passed (85.4% >= 80%)
  Lines: 87.2% | Statements: 85.4% | Functions: 88.1% | Branches: 86.5%
```

**✗ Coverage Failing**
```
⚠️  Test coverage is below 80%!

Current coverage:
  Lines: 72.5%
  Statements: 70.3%
  Functions: 68.9%
  Branches: 65.2%

Minimum coverage: 65.2%
Required: 80%

Please add more tests before modifying files.
```

## Installation

### As Project-Level Hook

If you're using this in the current project:

1. The hook files are already in `.claude/hooks/`
2. Restart Claude Code to load the hooks:
   ```bash
   # Exit current session and run:
   claude
   ```

### As Plugin

To package this as a reusable plugin:

1. Create a plugin directory:
   ```bash
   mkdir -p plugins/test-coverage-check
   ```

2. Copy hook files:
   ```bash
   cp -r .claude/hooks/* plugins/test-coverage-check/
   ```

3. Create `plugin.json`:
   ```json
   {
     "name": "test-coverage-check",
     "version": "1.0.0",
     "description": "Enforces 80% test coverage before file modifications",
     "hooks": {
       "autoDiscover": true
     }
   }
   ```

4. Restart Claude Code to load the plugin

## Configuration

### Adjusting Coverage Threshold

To change the 80% threshold, edit `.claude/hooks/scripts/test-coverage-check.sh`:

```bash
# Line 78 - Change threshold value
threshold=80  # Change to desired percentage
```

### Changing Coverage Policy

The script uses **minimum coverage** (strictest). To use **average coverage** instead:

Replace line 74-75:
```bash
# Current (minimum):
min_coverage=$(echo "$lines_pct $statements_pct $functions_pct $branches_pct" | \
  awk '{min=$1; for(i=2;i<=NF;i++) if($i<min) min=$i; print min}')

# Alternative (average):
avg_coverage=$(echo "$lines_pct $statements_pct $functions_pct $branches_pct" | \
  awk '{sum=0; for(i=1;i<=NF;i++) sum+=$i; print sum/NF}')
```

And update variable references from `min_coverage` to `avg_coverage`.

### Disabling the Hook

**Temporary (current session):**
- The hook only loads at session start
- Simply don't restart Claude Code if you want to skip it

**Permanent:**
1. Rename or delete `hooks.json`:
   ```bash
   mv .claude/hooks/hooks.json .claude/hooks/hooks.json.disabled
   ```
2. Restart Claude Code

**Conditional (flag-based):**

Add this at the beginning of the script (after `set -euo pipefail`):

```bash
# Only run if flag file exists
FLAG_FILE="$cwd/.enable-coverage-check"
if [ ! -f "$FLAG_FILE" ]; then
  exit 0
fi
```

Then control via flag file:
```bash
# Enable
touch .enable-coverage-check

# Disable
rm .enable-coverage-check
```

## Debugging

### Enable Debug Mode

Run Claude Code with debug flag to see detailed hook execution:

```bash
claude --debug
```

This shows:
- Hook registration on startup
- Hook execution timing
- Input/output JSON
- Error messages

### Test Hook Manually

Test the script directly with sample input:

```bash
echo '{
  "tool_name": "Write",
  "tool_input": {"file_path": "/path/to/file.js"},
  "cwd": "'"$(pwd)"'"
}' | bash .claude/hooks/scripts/test-coverage-check.sh

echo "Exit code: $?"
```

### Validate JSON Output

Ensure the hook outputs valid JSON:

```bash
output=$(echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}, "cwd": "."}' | \
  bash .claude/hooks/scripts/test-coverage-check.sh 2>&1)
echo "$output" | jq .
```

## Requirements

- **Jest**: Must be installed in project (`npm install --save-dev jest`)
- **Test Suite**: At least one test directory or test script configured
- **jq**: JSON processor (usually pre-installed on macOS/Linux)
- **bc**: Basic calculator for floating point comparison (usually pre-installed)

## Limitations

- **Jest-only**: Currently only supports Jest test runner
- **Session Restart**: Hook changes require restarting Claude Code
- **Sync Execution**: Coverage runs synchronously (60s timeout)
- **JavaScript/TypeScript**: Designed for JS/TS projects with Jest

## Future Enhancements

Potential improvements:
- Support for other test runners (Vitest, Mocha, Pytest)
- Configurable thresholds via `.claude/hooks/config.json`
- Per-file coverage tracking
- Coverage trend tracking over time
- Integration with CI/CD systems

## Troubleshooting

### Hook Not Running

- **Check session**: Restart Claude Code after hook changes
- **Verify installation**: Run `/hooks` command in Claude Code to see loaded hooks
- **Check debug logs**: Use `claude --debug` to see hook execution

### False Positives

- **Test file blocked**: Check file path patterns in script (lines 26-30)
- **Coverage data missing**: Ensure Jest generates `coverage/coverage-summary.json`

### Coverage Not Updating

- **Clear coverage**: Delete `coverage/` directory and rerun
- **Jest config**: Check `jest.config.js` for coverage settings

## Support

For issues or questions:
- Check Claude Code docs: https://docs.claude.com/en/docs/claude-code/hooks
- Review script logs with `claude --debug`
- Validate hook JSON with `jq .claude/hooks/hooks.json`

## License

This hook configuration is part of your Claude Code project and follows your project's license.

---

## Bundle Size Guard Hook

### Overview

The Bundle Size Guard hook automatically monitors build commands and enforces bundle size limits before web, mobile, and game builds execute. It prevents builds from completing if bundle sizes exceed configured limits, helping maintain optimal performance and user experience.

### Features

- **Multi-Platform Support**: Works with Web (Webpack), Mobile (Metro), and Game (Unity) builds
- **Build Detection**: Automatically detects build commands for npm, webpack, vite, Next.js, React Native, Metro, Unity
- **Size Analysis**: Calculates gzipped bundle sizes for accurate performance metrics
- **Configurable Limits**: Set different size limits for each platform type
- **Enforcement Modes**: Choose between strict enforcement (block) or warning-only mode
- **PreToolUse Hook**: Checks existing bundles before build starts to provide early feedback

### How It Works

#### Trigger Conditions

The hook triggers on `Bash` tool calls containing build commands:

**Web builds:**
- `npm run build`, `yarn build`, `pnpm build`
- `webpack`, `webpack --mode production`
- `vite build`
- `next build`
- `react-scripts build`

**Mobile builds:**
- `react-native bundle`
- `metro` bundler commands
- `npx react-native run-android`, `npx react-native run-ios`
- `expo build`

**Game builds:**
- Unity build commands
- `Unity` or `unity-editor` commands
- Custom Unity build scripts

#### Validation Logic

1. **Build Type Detection**: Identifies the platform (web/mobile/game) from the build command
2. **Configuration Check**: Loads limits from `bundle-size-config.json`
3. **Existing Bundle Analysis**:
   - Finds recent build artifacts in common output directories
   - Calculates gzipped size of bundle files
   - Compares against configured limit for the platform
4. **Decision**:
   - If bundle exceeds limit AND `enforce: true`: **Block build**
   - If bundle exceeds limit AND `enforce: false`: **Warn only**
   - If bundle within limit: **Allow build** with confirmation

#### Bundle Detection Paths

**Web:**
- `build/`, `dist/`, `.next/`, `out/`
- Searches for `*.js` bundle files
- Calculates total gzipped size

**Mobile:**
- `android/app/build/` → `index.android.bundle`
- `ios/build/` → `main.jsbundle`
- Calculates gzipped size of bundle

**Game:**
- `Build/`, `Builds/`, `build/`
- Searches for `*.data`, `*.wasm`, `*.bundle` files
- Calculates total gzipped size

#### Output Examples

**Within Limit:**
```
Bundle size check: web bundle is 0.85MB (gzipped), within limit of 1MB
```

**Exceeds Limit (Enforcement Enabled):**
```
Bundle size warning: Current web bundle is 1.5MB (gzipped), exceeds limit of 1MB.
Build blocked by bundle-size-guard hook. Update bundle-size-config.json to adjust limits or disable enforcement.
```

**Exceeds Limit (Enforcement Disabled):**
```
Bundle size warning: Current web bundle is 1.5MB (gzipped), exceeds limit of 1MB.
This is a warning only (enforcement disabled).
```

### Installation & Setup

#### Prerequisites

**All platforms:**
- `jq` for JSON parsing (pre-installed on macOS/Linux)
- `bc` for floating-point calculations (pre-installed on macOS/Linux)
- `gzip` for size calculation (pre-installed on macOS/Linux)

**Platform-specific:**
- **Web**: Build tools (webpack, vite, etc.) installed
- **Mobile**: React Native or Expo environment
- **Game**: Unity installed for Unity builds

#### Enable the Hook

The hook is already configured in `.claude/hooks/hooks.json`. To activate:

1. Verify configuration exists:
   ```bash
   cat .claude/hooks/bundle-size-config.json
   ```

2. Restart Claude Code session:
   ```bash
   # Exit current session
   # Run: claude
   ```

3. The hook will automatically check bundle sizes before builds

### Configuration

The hook reads configuration from `.claude/hooks/bundle-size-config.json`:

```json
{
  "enabled": true,
  "enforce": true,
  "limits": {
    "web": 1,
    "mobile": 2,
    "game": 50
  }
}
```

#### Configuration Options

- **`enabled`** (boolean): Master switch for the hook
  - `true`: Hook is active
  - `false`: Hook is completely disabled

- **`enforce`** (boolean): Enforcement mode
  - `true`: Block builds that exceed limits
  - `false`: Warn only, allow builds to proceed

- **`limits`** (object): Size limits in MB (gzipped)
  - `web`: Limit for web builds (default: 1 MB)
  - `mobile`: Limit for mobile builds (default: 2 MB)
  - `game`: Limit for game builds (default: 50 MB)

#### Customizing Limits

Edit `.claude/hooks/bundle-size-config.json`:

**Example: Stricter web limit**
```json
{
  "enabled": true,
  "enforce": true,
  "limits": {
    "web": 0.5,
    "mobile": 2,
    "game": 50
  }
}
```

**Example: Warning-only mode**
```json
{
  "enabled": true,
  "enforce": false,
  "limits": {
    "web": 1,
    "mobile": 2,
    "game": 50
  }
}
```

**Example: Disable completely**
```json
{
  "enabled": false,
  "enforce": true,
  "limits": {
    "web": 1,
    "mobile": 2,
    "game": 50
  }
}
```

### Best Practices

#### Recommended Limits

**Web Applications:**
- **Landing pages**: 0.5 MB gzipped
- **Standard web apps**: 1 MB gzipped
- **Complex dashboards**: 1.5-2 MB gzipped
- **Enterprise apps**: 2-3 MB gzipped (consider code splitting)

**Mobile Applications:**
- **React Native**: 1.5-2 MB gzipped
- **Expo apps**: 2-3 MB gzipped (includes Expo SDK)
- **Production apps**: < 2 MB for optimal performance

**Game Applications:**
- **HTML5 web games**: 10-50 MB
- **Unity WebGL**: 50-100 MB (can be larger)
- **Mobile games**: 20-50 MB initial download

#### Bundle Size Optimization

If your bundle exceeds limits:

**Web:**
- Enable code splitting (dynamic imports)
- Use tree shaking and dead code elimination
- Lazy load routes and components
- Optimize dependencies (use lighter alternatives)
- Remove unused libraries
- Use webpack-bundle-analyzer to identify large modules

**Mobile:**
- Enable Hermes engine (React Native)
- Remove unused native modules
- Optimize image and asset sizes
- Use ProGuard/R8 for code shrinking (Android)

**Game:**
- Use asset bundles for Unity
- Compress textures and models
- Enable Unity build compression
- Split content into downloadable content (DLC)

### Debugging

#### Test Hook Manually

Test the hook with a sample build command:

```bash
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "npm run build"},
  "cwd": "'"$(pwd)"'"
}' | bash .claude/hooks/scripts/bundle-size-guard.sh

echo "Exit code: $?"
```

#### Enable Debug Mode

```bash
claude --debug
```

This shows:
- Hook triggering on build commands
- Build type detection
- Bundle size calculations
- Limit comparisons
- Block/allow decisions

#### Check Current Bundle Size

Manually check your current bundle size:

**Web (webpack/vite):**
```bash
# Find bundle files and calculate gzipped size
find dist -name "*.js" -exec gzip -c {} \; | wc -c | awk '{print $1/1024/1024 " MB"}'
```

**Mobile (React Native):**
```bash
# Android bundle
gzip -c android/app/build/generated/assets/react/release/index.android.bundle | wc -c | awk '{print $1/1024/1024 " MB"}'

# iOS bundle
gzip -c ios/build/main.jsbundle | wc -c | awk '{print $1/1024/1024 " MB"}'
```

#### Common Issues

**"Hook not triggering"**
- Verify hooks loaded: run `/hooks` in Claude Code
- Restart Claude Code after hook changes
- Check if build command matches detection patterns

**"No existing bundle found"**
- The hook checks existing bundles before the build
- Run a build first to create bundle artifacts
- Or adjust the hook to run PostToolUse instead

**"Configuration file not found"**
- Create `.claude/hooks/bundle-size-config.json`
- Copy from template in this documentation
- Hook will allow builds if config missing (fail-open)

**"Size calculation incorrect"**
- Verify gzip is installed: `which gzip`
- Check bundle paths in the script
- Add custom paths for your build output

### Advanced Usage

#### Add Custom Build Patterns

Edit `.claude/hooks/scripts/bundle-size-guard.sh` to add custom build commands:

```bash
# Add to is_build_command function (around line 20)
if echo "$cmd" | grep -qE "your-custom-build-command"; then
  echo "web"  # or "mobile" or "game"
  return 0
fi
```

#### Add Custom Bundle Paths

Modify `check_existing_bundle_size` function to add custom paths:

```bash
# Add to web section (around line 80)
for dir in "build" "dist" ".next" "out" "your-custom-dir"; do
  # ... existing logic ...
done
```

#### PostToolUse Hook (Alternative)

For checking bundle size AFTER the build completes, create a PostToolUse hook:

```json
{
  "PostToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/bundle-size-check-post.sh",
          "timeout": 30
        }
      ]
    }
  ]
}
```

This would analyze the newly created bundle after build finishes.

#### Integration with CI/CD

Use bundle size checking in CI pipelines:

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: |
          SIZE=$(find dist -name "*.js" -exec gzip -c {} \; | wc -c)
          SIZE_MB=$(echo "scale=2; $SIZE / 1024 / 1024" | bc)
          if [ $(echo "$SIZE_MB > 1" | bc) -eq 1 ]; then
            echo "Bundle size $SIZE_MB MB exceeds limit of 1 MB"
            exit 1
          fi
```

### Limitations

- **PreToolUse Timing**: Checks existing bundles before build, not the new bundle
- **Platform Detection**: May miss custom build scripts (requires pattern updates)
- **Bundle Paths**: Only checks common output directories
- **No Incremental Checking**: Calculates full bundle size each time
- **Gzip Only**: Doesn't check Brotli or other compression formats

### Future Enhancements

Potential improvements:
- PostToolUse hook for checking newly built bundles
- Brotli compression support
- Bundle size trends and history tracking
- Per-route bundle size analysis (for web)
- Integration with webpack-bundle-analyzer
- Automatic suggestions for optimization
- Support for more build tools and frameworks

### Troubleshooting

**Build blocked unexpectedly:**
- Check current bundle size manually (see Debugging section)
- Verify limits in configuration are appropriate
- Consider switching to warning-only mode during development

**Bundle size not detected:**
- Check if build output directory matches script patterns
- Add custom paths to `check_existing_bundle_size`
- Ensure bundles exist from previous build

**Hook adds too much latency:**
- Reduce timeout in hooks.json (currently 90s)
- Cache bundle size calculations
- Disable during rapid development, enable in CI/CD

## Support

For issues or questions:
- Check Claude Code docs: https://docs.claude.com/en/docs/claude-code/hooks
- Review script logs with `claude --debug`
- Validate hook JSON with `jq .claude/hooks/hooks.json`

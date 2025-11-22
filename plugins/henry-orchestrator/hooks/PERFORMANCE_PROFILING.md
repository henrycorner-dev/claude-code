# Performance Profiling Hook

Automatically profile application performance after deploys and launches, and flag regressions against baseline metrics.

## Overview

This PostToolUse hook monitors Bash commands for deploy/launch operations and automatically runs performance profiling tools:

- **Web Projects**: Lighthouse profiling for performance, FCP, LCP, TTI, TBT, and CLS metrics
- **Unity Projects**: Unity Profiler for FPS, memory usage, and CPU time

## Features

- ✅ Automatic detection of deploy/launch commands
- ✅ Context-aware profiling (web vs Unity)
- ✅ Baseline comparison with regression detection
- ✅ Configurable thresholds (10% degradation or 5-point drop)
- ✅ Detailed performance reports
- ✅ Baseline management utilities

## Supported Commands

The hook automatically triggers on these command patterns:

### Web Projects
- `npm run build`
- `npm run start` / `npm run dev`
- `yarn build` / `yarn start` / `yarn dev`
- `vercel deploy` / `netlify deploy` / `firebase deploy`
- Docker deployments: `docker run`, `docker-compose up`

### Unity Projects
- `Unity -batchmode -executeMethod`
- Unity build commands

## Installation

### Prerequisites

#### For Web Projects (Lighthouse)
```bash
npm install -g lighthouse
```

#### For Unity Projects
- Unity Editor installed
- Unity Profiler available

### Setup

The hook is already configured in `.claude/hooks/hooks.json`. To activate it, restart Claude Code:

```bash
# Exit current session and restart
claude
```

## Usage

### First Run: Creating Baseline

The first time the hook runs after a deploy/launch, it creates a baseline:

```bash
npm run start
```

Output:
```
✅ Lighthouse baseline created:
  Performance Score: 92/100
  FCP: 1200ms
  LCP: 2400ms
  TTI: 3100ms
  TBT: 150ms
  CLS: 0.05
```

### Subsequent Runs: Regression Detection

After the baseline exists, the hook compares new metrics:

```bash
npm run deploy
```

**No Regressions:**
```
✅ No performance regressions detected:
  Performance Score: 93/100 (baseline: 92/100)
  All metrics within acceptable range
```

**With Regressions:**
```
⚠️ Performance Regressions Detected:
  • Performance Score: 85/100 (baseline: 92/100, -7 points)
  • Largest Contentful Paint: 2880ms (baseline: 2400ms, +20.0%)
  • Total Blocking Time: 195ms (baseline: 150ms, +30.0%)
```

## Regression Thresholds

The hook flags regressions when metrics exceed these thresholds:

| Metric | Threshold |
|--------|-----------|
| Performance Score | 5 points lower |
| FCP, LCP, TTI, TBT | 10% slower |
| CLS | 10% higher |

## Baseline Management

### View Current Baselines

```bash
bash .claude/hooks/scripts/view-baseline.sh
```

### Reset Baselines

Reset specific baseline:
```bash
# Reset Lighthouse baseline
bash .claude/hooks/scripts/reset-baseline.sh lighthouse

# Reset Unity baseline
bash .claude/hooks/scripts/reset-baseline.sh unity
```

Reset all baselines:
```bash
bash .claude/hooks/scripts/reset-baseline.sh all
```

The next deploy/launch will create a new baseline.

## Performance Data Location

All performance data is stored in `.claude/performance/`:

```
.claude/performance/
├── lighthouse_baseline.json      # Lighthouse baseline metrics
├── lighthouse_20250122_143022.json  # Timestamped reports
├── unity_baseline.json           # Unity baseline metrics
└── unity_profile_20250122_143500.json
```

## Unity Profiling

Unity profiling requires additional setup:

1. The hook creates a profiling script at `.claude/performance/UnityProfiler_[timestamp].cs`
2. Copy this script to your `Assets/Scripts` folder
3. Attach the `PerformanceProfiler` component to a GameObject in your scene
4. Enter Play mode to capture metrics

Metrics captured:
- FPS (averaged over 300 frames / 5 seconds)
- Memory usage (total and mono)
- CPU frame time
- Draw calls

## Customization

### Adjust Thresholds

Edit `.claude/hooks/scripts/lighthouse-profile.sh` to customize thresholds:

```bash
# Current: 10% regression threshold
fcp_threshold=$(echo "$baseline_fcp * 1.1" | bc)

# More strict: 5% threshold
fcp_threshold=$(echo "$baseline_fcp * 1.05" | bc)

# More lenient: 20% threshold
fcp_threshold=$(echo "$baseline_fcp * 1.2" | bc)
```

### Add Custom Commands

Edit `.claude/hooks/scripts/performance-profile.sh` to add command patterns:

```bash
deploy_patterns=(
  "npm.*run.*build"
  "yarn.*build"
  # Add your custom pattern:
  "pnpm.*deploy"
  "turbo.*run.*build"
)
```

### Custom Lighthouse Configuration

Modify the Lighthouse command in `lighthouse-profile.sh`:

```bash
lighthouse "$target_url" \
  --output=json \
  --output-path="$report_file" \
  --chrome-flags="--headless" \
  --throttling-method=simulate \  # Add throttling
  --only-categories=performance \  # Only performance category
  --quiet
```

## Troubleshooting

### Lighthouse Not Found

```
ℹ️ Performance profiling skipped: Lighthouse not installed
```

**Solution**: Install Lighthouse globally
```bash
npm install -g lighthouse
```

### Dev Server Not Detected

```
⚠️ Could not connect to dev server at http://localhost:3000
```

**Solution**: Ensure your dev server is running on the default port, or the hook will attempt to detect it from the command

### Unity Profiler Not Available

```
⚠️ Unity Profiler not available
```

**Solution**: Ensure Unity Editor is installed and accessible

### Hook Not Triggering

**Check hook loading**: Restart Claude Code
```bash
# Exit and restart
claude
```

**Verify configuration**: Check `.claude/hooks/hooks.json` is valid JSON

**Debug mode**: Run Claude Code with debugging
```bash
claude --debug
```

## Best Practices

1. **Establish Baseline Early**: Create baseline on a known-good deployment
2. **Reset After Major Changes**: Reset baseline after significant performance optimizations
3. **Monitor Trends**: Review historical reports in `.claude/performance/`
4. **Investigate Regressions**: When flagged, check recent code changes
5. **Consistent Environment**: Run profiling in similar conditions (same hardware, network)

## Technical Details

### Hook Configuration

Location: `.claude/hooks/hooks.json`

```json
{
  "PostToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/performance-profile.sh",
          "timeout": 120
        }
      ]
    }
  ]
}
```

### Hook Lifecycle

1. **Trigger**: Bash command executed
2. **Detection**: Check if command matches deploy/launch patterns
3. **Project Type**: Detect web (package.json) or Unity (ProjectSettings)
4. **Profiling**: Run appropriate profiler (Lighthouse or Unity)
5. **Baseline**: Compare against baseline or create if missing
6. **Reporting**: Output results to Claude and save report

### Exit Codes

- `0`: Success, output shown in transcript
- `2`: Regression detected, warning fed back to Claude
- Other: Non-blocking error

## Examples

### Web Project Workflow

```bash
# Initial setup
npm install -g lighthouse
npm run build

# Output: ✅ Lighthouse baseline created

# Deploy after changes
npm run deploy

# Output: ✅ No regressions or ⚠️ Regressions detected

# View baseline
bash .claude/hooks/scripts/view-baseline.sh

# Reset if needed
bash .claude/hooks/scripts/reset-baseline.sh lighthouse
```

### Unity Project Workflow

```bash
# Run Unity build
Unity -batchmode -executeMethod BuildScript.Build

# Output: Instructions for manual profiling

# Copy generated profiling script to Assets/Scripts/
cp .claude/performance/UnityProfiler_*.cs Assets/Scripts/

# Attach to GameObject and enter Play mode
# Metrics captured automatically

# View results
bash .claude/hooks/scripts/view-baseline.sh
```

## Related Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Unity Profiler](https://docs.unity3d.com/Manual/Profiler.html)
- [Claude Code Hooks Guide](.claude/skills/hook-development/README.md)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review hook logs with `claude --debug`
3. Verify baselines with `view-baseline.sh`
4. Reset baselines if corrupted

---

**Note**: This hook requires Claude Code session restart to load. Changes to hook configuration or scripts require restarting Claude Code.

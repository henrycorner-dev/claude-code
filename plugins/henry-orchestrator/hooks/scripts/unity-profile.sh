#!/bin/bash
set -euo pipefail

# Unity performance profiling script
# Captures Unity profiler data and compares against baseline

bash_command="$1"
perf_dir="$2"

# Determine Unity executable path
unity_path=""
if [ -f "/Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity" ]; then
  unity_path=$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | head -1)
elif [ -f "/Applications/Unity/Unity.app/Contents/MacOS/Unity" ]; then
  unity_path="/Applications/Unity/Unity.app/Contents/MacOS/Unity"
elif command -v unity &> /dev/null; then
  unity_path=$(command -v unity)
fi

if [ -z "$unity_path" ]; then
  echo '{"systemMessage": "⚠️ Unity not found. Skipping Unity profiling."}' >&2
  exit 0
fi

# Create Unity profiler script
timestamp=$(date +%Y%m%d_%H%M%S)
profiler_script="$perf_dir/UnityProfiler_$timestamp.cs"
report_file="$perf_dir/unity_profile_$timestamp.json"

cat > "$profiler_script" << 'EOF'
using UnityEngine;
using UnityEngine.Profiling;
using System.IO;
using System.Collections.Generic;

public class PerformanceProfiler : MonoBehaviour
{
    private int frameCount = 0;
    private float totalFPS = 0;
    private long totalMemory = 0;
    private float totalCPU = 0;
    private const int SAMPLE_FRAMES = 300; // 5 seconds at 60fps

    void Update()
    {
        if (frameCount < SAMPLE_FRAMES)
        {
            // Capture FPS
            totalFPS += 1.0f / Time.unscaledDeltaTime;

            // Capture memory
            totalMemory += Profiler.GetTotalAllocatedMemoryLong();

            // Capture CPU (simplified - using frame time as proxy)
            totalCPU += Time.unscaledDeltaTime * 1000; // Convert to ms

            frameCount++;
        }
        else if (frameCount == SAMPLE_FRAMES)
        {
            // Calculate averages
            float avgFPS = totalFPS / SAMPLE_FRAMES;
            long avgMemory = totalMemory / SAMPLE_FRAMES;
            float avgCPU = totalCPU / SAMPLE_FRAMES;

            // Get additional metrics
            long monoMemory = Profiler.GetMonoUsedSizeLong();
            int drawCalls = UnityEngine.Rendering.FrameTimingManager.GetLatestTimings(1, null);

            // Create JSON output
            string json = string.Format(
                "{{\"fps\": {0:F2}, \"memory_mb\": {1:F2}, \"cpu_ms\": {2:F2}, \"mono_memory_mb\": {3:F2}, \"draw_calls\": {4}}}",
                avgFPS,
                avgMemory / (1024.0 * 1024.0),
                avgCPU,
                monoMemory / (1024.0 * 1024.0),
                drawCalls
            );

            // Write to file
            string reportPath = System.Environment.GetEnvironmentVariable("UNITY_PROFILE_REPORT");
            File.WriteAllText(reportPath, json);

            Debug.Log("Performance profiling complete: " + json);

            // Exit play mode
            #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
            #else
            Application.Quit();
            #endif

            frameCount++;
        }
    }
}
EOF

# Run Unity in batch mode with profiling
export UNITY_PROFILE_REPORT="$report_file"

# Check if Unity is already running the project
if pgrep -f "Unity.*$(basename "$CLAUDE_PROJECT_DIR")" > /dev/null; then
  echo '{"systemMessage": "⚠️ Unity project is already running. Please ensure profiling script is attached to a GameObject and run manually."}' >&2
  exit 0
fi

# For batch mode profiling (if project supports it)
if echo "$bash_command" | grep -qE "Unity.*-batchmode"; then
  # Unity is running in batch mode, we can capture profiler data
  # This is a simplified version - actual implementation would need Unity Profiler API integration
  echo '{"systemMessage": "ℹ️ Unity batch mode detected. For full profiling, use Unity Profiler window or attach the profiling script to your scene.\\n\\nProfiling script created at: '"$profiler_script"'\\n\\nTo use:\\n1. Attach PerformanceProfiler.cs to a GameObject in your scene\\n2. Run the scene\\n3. Metrics will be captured automatically"}' >&2
  exit 0
fi

# If we have a previous report, compare it
latest_report=$(ls -t "$perf_dir"/unity_profile_*.json 2>/dev/null | head -2 | tail -1)
baseline_file="$perf_dir/unity_baseline.json"

if [ ! -f "$baseline_file" ] && [ -f "$latest_report" ]; then
  # Create baseline from latest report
  cp "$latest_report" "$baseline_file"
  fps=$(jq -r '.fps' "$baseline_file")
  memory=$(jq -r '.memory_mb' "$baseline_file")
  cpu=$(jq -r '.cpu_ms' "$baseline_file")

  echo "{\"systemMessage\": \"✅ Unity baseline created:\\n  FPS: $fps\\n  Memory: ${memory}MB\\n  CPU Time: ${cpu}ms\\n\\nProfiling script: $profiler_script\"}"
  exit 0
fi

# Instructions for manual profiling
echo "{\"systemMessage\": \"ℹ️ Unity Performance Profiling Setup\\n\\n📊 Profiling script created: $profiler_script\\n\\nTo profile your Unity project:\\n1. Copy the script to your Assets/Scripts folder\\n2. Attach PerformanceProfiler component to a GameObject in your main scene\\n3. Enter Play mode\\n4. Metrics will be captured automatically after 5 seconds\\n5. Results saved to: $report_file\\n\\nFor automated profiling, ensure your project supports batch mode execution.\"}"
exit 0

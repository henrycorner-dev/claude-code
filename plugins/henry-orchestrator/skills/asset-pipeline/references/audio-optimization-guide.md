# Audio Optimization Guide

## Overview

Audio optimization is critical for game performance, load times, and memory usage. This guide covers audio compression techniques, codec selection, streaming strategies, and platform-specific audio requirements for game development.

## Audio Fundamentals

### Audio Properties

**Sample Rate:**
- Frequency of audio samples per second (Hz)
- Common rates: 44100 Hz (CD quality), 48000 Hz (professional), 22050 Hz (low quality)
- Higher sample rate = better quality, larger file size
- Nyquist theorem: Sample rate must be 2x highest frequency to reproduce accurately

**Bit Depth:**
- Precision of each audio sample
- Common depths: 16-bit (standard), 24-bit (high quality), 8-bit (retro/low quality)
- Higher bit depth = better dynamic range, larger file size
- 16-bit provides 96 dB dynamic range (sufficient for games)

**Channels:**
- Mono: 1 channel (single audio stream)
- Stereo: 2 channels (left + right)
- Multichannel: 5.1, 7.1 (surround sound)

**Bitrate:**
- Amount of data per second in compressed audio (kbps)
- Higher bitrate = better quality, larger file size
- Typical range: 64-320 kbps

### File Size Calculation

**Uncompressed (WAV, AIFF):**
```
File Size = Sample Rate × Bit Depth × Channels × Duration / 8

Example: 10 seconds of stereo 16-bit 44.1kHz audio
= 44100 × 16 × 2 × 10 / 8
= 1,764,000 bytes
≈ 1.68 MB
```

**Compressed (OGG, MP3):**
```
File Size = Bitrate × Duration / 8

Example: 10 seconds at 128 kbps
= 128000 × 10 / 8
= 160,000 bytes
≈ 156 KB (90% reduction)
```

## Audio Categories and Optimization

### Music

**Characteristics:**
- Long duration (2-5 minutes typical)
- Stereo (occasionally multichannel)
- Requires good quality (music is focal)
- Often looping

**Optimization Strategy:**
```
Format: OGG Vorbis or platform-native compressed
Bitrate: 128-192 kbps (96 kbps acceptable for ambient music)
Sample Rate: 44100 Hz
Channels: Stereo
Streaming: Yes (always stream, don't load into memory)
```

**Example:**
```
Source: 3-minute music track, stereo, 16-bit, 44.1kHz WAV
Uncompressed: 30 MB
Optimized: OGG Vorbis 160 kbps = 3.6 MB (88% reduction)
```

**Best Practices:**
- Always stream music (never load fully into memory)
- Use looping metadata to avoid gap at loop point
- Consider adaptive music systems (layers, stems)
- Lower bitrate for ambient/background music (96-128 kbps)
- Higher bitrate for prominent music (160-192 kbps)

### Sound Effects (SFX)

**Characteristics:**
- Short duration (0.1-5 seconds typical)
- Often mono (for 3D positioning)
- Many instances playing simultaneously
- Loaded into memory

**Optimization Strategy:**
```
Format: OGG Vorbis or platform-native compressed
Bitrate: 64-96 kbps
Sample Rate: 44100 Hz (or 22050 Hz for simple sounds)
Channels: Mono (for 3D positioned sounds), Stereo (for 2D UI/ambience)
Streaming: No (load into memory for instant playback)
```

**Example:**
```
Source: 1-second footstep sound, mono, 16-bit, 44.1kHz WAV
Uncompressed: 88 KB
Optimized: OGG Vorbis 64 kbps = 8 KB (91% reduction)
```

**Best Practices:**
- Convert 3D positioned sounds to mono (50% size reduction)
- Group SFX into audio banks (load/unload by scene)
- Use lower sample rate for simple sounds (explosions, impacts)
- Higher quality for detailed sounds (UI, voice)
- Trim silence from beginning/end of files
- Normalize volume levels across SFX

### Voice / Dialogue

**Characteristics:**
- Variable duration (2-30 seconds typical)
- Mono or stereo
- Speech content (benefits from speech codecs)
- May be localized (multiple language versions)

**Optimization Strategy:**
```
Format: OGG Vorbis or speech-optimized codec
Bitrate: 64-128 kbps (speech-optimized codecs can go lower)
Sample Rate: 22050 Hz or 44100 Hz
Channels: Mono
Streaming: Optional (stream long dialogue, load short barks)
```

**Example:**
```
Source: 10-second voice line, mono, 16-bit, 44.1kHz WAV
Uncompressed: 882 KB
Optimized: OGG Vorbis 64 kbps = 80 KB (91% reduction)
```

**Best Practices:**
- Use mono for all dialogue (positional audio)
- Lower sample rate acceptable for speech (22050 Hz)
- Stream long dialogue and cutscenes
- Load short voice barks into memory
- Organize by language for localization
- Use speech-optimized codecs if available (platform-specific)

### Ambient / Loops

**Characteristics:**
- Medium to long duration (5-60 seconds)
- Often stereo or positioned in 3D
- Looping continuously
- Background element

**Optimization Strategy:**
```
Format: OGG Vorbis
Bitrate: 64-96 kbps
Sample Rate: 44100 Hz
Channels: Stereo or Mono (depending on use)
Streaming: Yes (for long loops), No (for short loops)
```

**Example:**
```
Source: 20-second ambient wind loop, stereo, 16-bit, 44.1kHz WAV
Uncompressed: 3.5 MB
Optimized: OGG Vorbis 80 kbps = 200 KB (94% reduction)
```

**Best Practices:**
- Create seamless loops (no click/pop at loop point)
- Use lower bitrate (ambient is background element)
- Stream long ambient tracks (>30 seconds)
- Load short loops into memory (<10 seconds)
- Consider layered ambient system (multiple loops mixed)

## Audio Codecs

### Uncompressed Formats

**WAV (Waveform Audio File Format)**
- Platform: PC, all platforms
- Compression: None
- Quality: Perfect (lossless)
- File Size: Very large (baseline)
- Use Case: Source audio, editing, platform with unlimited storage

**AIFF (Audio Interchange File Format)**
- Platform: Mac, iOS, all platforms
- Compression: None
- Quality: Perfect (lossless)
- File Size: Very large (baseline)
- Use Case: Same as WAV, preferred on Mac

**When to Use Uncompressed:**
- Source audio files (pre-optimization)
- Audio editing and processing
- Platform with no storage constraints
- Ultra-low latency required (rare)
- No CPU budget for decompression (very rare)

### Lossy Compressed Formats

**OGG Vorbis**
- Platform: PC, Android, Web, Nintendo Switch
- Compression: Lossy
- Quality: Excellent (transparent at 128+ kbps)
- File Size: 5-10% of uncompressed
- CPU Cost: Low
- Best Use: Default choice for PC/Android/web

**Pros:**
- Open source, no licensing fees
- Excellent quality-to-size ratio
- Good CPU performance
- Wide platform support

**Cons:**
- Not supported natively on iOS/Mac (requires decoding library)
- Slightly larger than AAC at same quality

**Recommended Settings:**
```
Music: 128-192 kbps, stereo, 44.1kHz
SFX: 64-96 kbps, mono, 44.1kHz
Voice: 64-96 kbps, mono, 22.05kHz or 44.1kHz
```

**MP3 (MPEG-1 Audio Layer 3)**
- Platform: Universal (all platforms)
- Compression: Lossy
- Quality: Good (but dated algorithm)
- File Size: 8-10% of uncompressed
- CPU Cost: Low
- Best Use: Wide compatibility, legacy systems

**Pros:**
- Universal support
- Hardware acceleration on many platforms
- Predictable quality and size

**Cons:**
- Lower quality than OGG/AAC at same bitrate
- Licensing fees (expired in some regions)
- Less efficient than modern codecs

**Recommended Settings:**
```
Music: 160-192 kbps, stereo, 44.1kHz
SFX: 96-128 kbps, mono, 44.1kHz
Voice: 96-128 kbps, mono, 44.1kHz
```

**AAC (Advanced Audio Coding)**
- Platform: iOS, Mac, Android, Web
- Compression: Lossy
- Quality: Excellent (better than MP3)
- File Size: 5-8% of uncompressed
- CPU Cost: Low to Medium
- Best Use: Mobile platforms, especially iOS

**Pros:**
- Better quality than MP3 at same bitrate
- Native support on Apple platforms
- Hardware acceleration on iOS
- Widely supported

**Cons:**
- Not supported on all platforms without library
- Licensing fees (though widely licensed)

**Recommended Settings:**
```
Music: 128-160 kbps, stereo, 44.1kHz
SFX: 64-96 kbps, mono, 44.1kHz
Voice: 48-64 kbps, mono, 22.05kHz or 44.1kHz
```

**Platform-Native Formats**

**ADPCM (Adaptive Differential Pulse Code Modulation)**
- Platform: Console, PC (Unity, Unreal), some mobile
- Compression: Lossy (mild)
- Quality: Good
- File Size: 25% of uncompressed (4:1 compression)
- CPU Cost: Very low (hardware support)
- Best Use: Consoles, many short SFX

**Pros:**
- Very fast decompression (hardware accelerated)
- Reasonable quality for SFX
- Deterministic performance

**Cons:**
- Poor compression compared to OGG/AAC
- Not ideal for music (quality degradation)
- Platform-specific variants

**Recommended Settings:**
```
SFX: ADPCM, mono or stereo, 44.1kHz
```

**Opus**
- Platform: Web, modern platforms (with library)
- Compression: Lossy
- Quality: Excellent (best-in-class)
- File Size: 5-8% of uncompressed
- CPU Cost: Medium
- Best Use: Web, low-bitrate applications, VoIP

**Pros:**
- Best quality-to-bitrate ratio
- Excellent at low bitrates (good for voice)
- Open source, royalty-free
- Low latency

**Cons:**
- Less widespread support (requires library)
- Higher CPU cost than OGG/MP3

**Recommended Settings:**
```
Music: 96-128 kbps, stereo, 48kHz
SFX: 48-64 kbps, mono, 48kHz
Voice: 24-48 kbps, mono, 24kHz or 48kHz
```

### Lossless Compressed Formats

**FLAC (Free Lossless Audio Codec)**
- Platform: PC, Android, Web (with library)
- Compression: Lossless
- Quality: Perfect (bit-identical to source)
- File Size: 40-60% of uncompressed
- CPU Cost: Low to Medium
- Best Use: High-quality music, archival

**Pros:**
- Lossless quality
- Reasonable compression (better than uncompressed)
- Open source, royalty-free

**Cons:**
- Still much larger than lossy formats
- Not supported natively on all platforms

**When to Use:**
- High-quality music for premium audio experiences
- Archival of source audio
- Projects where file size is less critical than quality

## Codec Selection by Platform

### PC

**Recommended:**
- **Music:** OGG Vorbis 128-192 kbps
- **SFX:** OGG Vorbis 64-96 kbps or ADPCM
- **Voice:** OGG Vorbis 64-96 kbps

**Alternative:**
- MP3 for broader compatibility (older systems)
- FLAC for audiophile/high-quality music mode

### iOS

**Recommended:**
- **Music:** AAC 128-160 kbps (hardware accelerated)
- **SFX:** AAC 64-96 kbps or ADPCM
- **Voice:** AAC 48-64 kbps

**Alternative:**
- MP3 (universally supported but less efficient)

### Android

**Recommended:**
- **Music:** OGG Vorbis 128-160 kbps or AAC 128-160 kbps
- **SFX:** OGG Vorbis 64-96 kbps
- **Voice:** OGG Vorbis 64-96 kbps

**Alternative:**
- MP3 (broader compatibility on older devices)

### Web

**Recommended:**
- **Music:** OGG Vorbis 128-160 kbps or AAC 128-160 kbps
- **SFX:** OGG Vorbis 64-96 kbps
- **Voice:** OGG Vorbis 64-96 kbps or Opus 48-64 kbps

**Best Practice:**
- Provide multiple formats (OGG + AAC/MP3) for browser compatibility
- Use HTML5 Audio with fallback

### Consoles (PlayStation, Xbox, Switch)

**Recommended:**
- Use platform-native formats (engine handles conversion)
- **Unity:** ADPCM for SFX, Vorbis/MP3 for music (platform converts)
- **Unreal:** Platform-specific compression (ADPCM on console)
- **Switch:** OGG Vorbis or ADPCM

**Best Practice:**
- Check platform-specific guidelines
- Use engine's audio import pipeline

## Streaming vs. Loading into Memory

### When to Stream

**Use Streaming For:**
- Music tracks (always)
- Long ambient loops (>30 seconds)
- Long dialogue/narration (>30 seconds)
- Cutscene audio

**Benefits:**
- Minimal memory usage (only buffer in memory)
- Supports very long audio files
- Fast load times (no need to load entire file)

**Drawbacks:**
- Requires file I/O during playback
- Potential stutter if I/O slow (mitigate with buffering)
- Can't play multiple instances simultaneously (usually)

**Implementation:**
```csharp
// Unity example
AudioSource musicSource;
musicSource.clip = null;  // Don't load into memory
musicSource.outputAudioMixerGroup = musicMixer;

// Stream from URL or local file
StartCoroutine(StreamAudio("music/theme.ogg"));
```

### When to Load into Memory

**Load into Memory For:**
- Sound effects (always)
- Short voice barks (<5 seconds)
- UI sounds
- Any audio requiring instant playback or multiple simultaneous instances

**Benefits:**
- Instant playback (no latency)
- Can play multiple instances simultaneously
- No file I/O during playback (no stutter risk)

**Drawbacks:**
- Requires memory for entire audio file
- Longer initial load times
- Memory constraints for large audio collections

**Implementation:**
```csharp
// Unity example
AudioClip footstepSFX = Resources.Load<AudioClip>("sfx/footstep");
AudioSource.PlayClipAtPoint(footstepSFX, position);
```

### Hybrid Approach

**Strategy:**
- Load essential SFX into memory at game start
- Load level-specific SFX during level load
- Stream all music
- Load/unload audio banks as needed

**Audio Bank System:**
- Group related audio into banks (UI sounds, weapon sounds, character voices)
- Load banks on demand (entering new area, equipping weapon)
- Unload banks when no longer needed (leaving area)

**Example Bank Organization:**
```
Banks:
- UI_Bank (10 MB): Button clicks, menu sounds
- Weapons_Bank (15 MB): Gunshots, reloads, impacts
- Environment_Bank (20 MB): Footsteps, doors, ambient loops
- Character_Voice_Bank (25 MB): Character dialogue barks
- Music_Stream: Background music (streamed, not in bank)
```

## Audio Normalization and Mastering

### Loudness Normalization

Ensure consistent volume across all audio files.

**Targets:**
- **Music:** -14 to -16 LUFS (Loudness Units Full Scale)
- **SFX:** -12 to -18 LUFS (depending on importance)
- **Voice:** -16 to -20 LUFS
- **Ambient:** -18 to -24 LUFS

**Process:**
1. Measure LUFS of audio file (use tool like ffmpeg-normalize)
2. Adjust gain to match target LUFS
3. Apply limiter to prevent clipping (peak at -0.5 dB)

**Tools:**
- ffmpeg-normalize (command-line)
- Adobe Audition (Loudness Normalization effect)
- Audacity (Normalize effect)

**Example (ffmpeg-normalize):**
```bash
ffmpeg-normalize input.wav -o output.wav -t -16 -c:a libvorbis -b:a 128k
```

### Dynamic Range Compression

Reduce dynamic range for better playback on various devices.

**When to Apply:**
- Mobile games (devices with weak speakers)
- Background music (prevent quiet passages from being inaudible)
- Voice (ensure dialogue is intelligible)

**Settings:**
- **Ratio:** 2:1 to 4:1 (mild to moderate compression)
- **Threshold:** -20 to -12 dB
- **Attack:** 5-20 ms (music), 1-5 ms (voice)
- **Release:** 50-200 ms

**Avoid Over-Compression:**
- Preserve some dynamic range (2-3:1 ratio max for music)
- Over-compression makes audio fatiguing
- Test on target devices

### Limiting and Clipping Prevention

Prevent audio from exceeding 0 dBFS (digital clipping).

**Process:**
1. Apply limiter as final step
2. Set ceiling to -0.5 dB to -1.0 dB (safety margin)
3. Visually inspect waveform for clipping

**Limiter Settings:**
- **Ceiling:** -0.5 dB
- **Release:** 50-100 ms

## Advanced Optimization Techniques

### Silence Trimming

Remove silence from beginning and end of audio files.

**Benefits:**
- Reduce file size (especially for dialogue)
- Faster loading
- Tighter audio playback timing

**Process:**
```bash
# ffmpeg: Trim silence below -50dB for >0.5 seconds
ffmpeg -i input.wav -af silenceremove=1:0:-50dB:1:0.5:-50dB output.wav
```

**Considerations:**
- Leave small amount of silence (0.01-0.05s) for natural decay
- Be careful with ambient loops (may need leading/trailing silence for crossfade)

### Mono Conversion for 3D Audio

Convert stereo to mono for 3D positioned sounds.

**Why:**
- 3D audio spatializes sound based on position (stereo pre-baked panning conflicts)
- 50% file size reduction
- Better performance (half the data)

**Process:**
```bash
# ffmpeg: Convert stereo to mono
ffmpeg -i input_stereo.wav -ac 1 output_mono.wav
```

**When to Keep Stereo:**
- 2D UI sounds (not spatialized)
- Music (non-diegetic)
- Ambient loops (non-point-source sounds)

### Sample Rate Reduction

Lower sample rate for appropriate audio types.

**Targets:**
- **Music:** 44100 Hz (maintain quality)
- **Voice:** 22050 Hz (speech doesn't need high frequencies)
- **Simple SFX:** 22050 Hz (explosions, impacts)
- **Detailed SFX:** 44100 Hz (glass breaking, foliage rustling)

**Process:**
```bash
# ffmpeg: Resample to 22050 Hz
ffmpeg -i input.wav -ar 22050 output.wav
```

**Benefits:**
- 50% file size reduction (44.1kHz → 22.05kHz)
- Faster playback (less data to process)

**Caution:**
- Don't reduce below 22050 Hz (Nyquist theorem: can't reproduce >11kHz frequencies)
- Test to ensure quality is acceptable

### Variable Bitrate (VBR) Encoding

Use variable bitrate instead of constant bitrate for better quality-to-size ratio.

**How VBR Works:**
- Allocates more bits to complex audio sections
- Uses fewer bits for simple sections
- Same average bitrate, better perceived quality

**Example (OGG Vorbis):**
```bash
# Use quality mode (VBR) instead of bitrate mode
ffmpeg -i input.wav -c:a libvorbis -q:a 5 output.ogg  # Quality 5 ≈ 160 kbps average
```

**Quality Settings (OGG Vorbis):**
- q 0-1: ~64 kbps (low quality)
- q 2-3: ~96 kbps (medium quality)
- q 4-5: ~128-160 kbps (high quality)
- q 6-8: ~192-256 kbps (very high quality)
- q 9-10: ~320+ kbps (extreme quality)

**Recommendation:** Use VBR for better quality at same average file size.

### Perceptual Encoding Optimization

Leverage psychoacoustic models for better compression.

**Techniques:**
- **High-Frequency Cutoff:** Reduce frequencies above 16-18 kHz (often inaudible)
- **Joint Stereo:** Encode stereo efficiently by storing mid/side instead of left/right
- **Temporal Masking:** Reduce precision during loud transients (masked by louder sounds)

**Most codecs apply these automatically, but can configure:**
```bash
# ffmpeg: Enable joint stereo for MP3
ffmpeg -i input.wav -c:a libmp3lame -b:a 128k -joint_stereo 1 output.mp3
```

### Loop Point Metadata

Store seamless loop information in audio file metadata.

**Benefits:**
- Perfect loops without clicks or gaps
- No need for code-based looping logic
- Works across platforms (if engine supports)

**Implementation:**
- Use loop points in audio editor (Audacity, Adobe Audition)
- Export with loop metadata
- Engine reads loop points and loops seamlessly

**Unity Example:**
```csharp
// Unity doesn't support loop metadata natively
// Implement via script:
AudioSource source;
source.loop = true;  // Standard looping
// For custom loop points, use AudioSource.time
```

**Godot Example:**
```gdscript
# Godot supports loop metadata in OGG files
# Set loop points in audio editor
# AudioStreamOGGVorbis.loop = true
```

## Platform-Specific Considerations

### Mobile

**Constraints:**
- Limited memory (512MB-2GB total, ~50-100MB for audio)
- Weak speakers (poor bass response)
- Battery consumption (minimize CPU usage)

**Optimizations:**
- Use AAC (iOS) or OGG (Android) with modest bitrates (64-96 kbps)
- Reduce sample rate to 22050 Hz where acceptable
- Minimize audio memory footprint (<50 MB loaded audio)
- Stream music aggressively
- Use audio banks, load/unload by scene
- Apply high-pass filter (remove sub-bass below 100 Hz)

### Web

**Constraints:**
- Download size critical (user bandwidth)
- Browser codec support varies
- Streaming over network (latency)

**Optimizations:**
- Use aggressive compression (OGG Vorbis 64-96 kbps)
- Provide multiple formats (OGG + MP3/AAC) for compatibility
- Use Web Audio API for mixing and effects (offload to browser)
- Implement audio sprite sheets (multiple SFX in one file)
- Load essential audio first, defer non-critical audio

**Audio Sprite Sheets:**
- Combine multiple short SFX into one file
- Store timing metadata (offset, duration per sound)
- Load one file instead of many (reduces HTTP requests)

```json
{
  "footstep": {"offset": 0.0, "duration": 0.5},
  "jump": {"offset": 0.5, "duration": 0.3},
  "land": {"offset": 0.8, "duration": 0.4}
}
```

### VR

**Constraints:**
- High frame rate requirement (90-120 FPS, audio latency critical)
- Spatialized 3D audio is essential
- Immersion requires high-quality audio

**Optimizations:**
- Use low-latency audio formats (uncompressed or ADPCM)
- Prioritize 3D spatialization over stereo music quality
- Use HRTF (Head-Related Transfer Function) for realistic 3D audio
- Minimize audio processing latency (use hardware acceleration)
- Test audio latency (should be <20ms)

## Batch Processing and Automation

### FFmpeg Batch Conversion

Automate audio optimization with FFmpeg.

**Example Script (Bash):**
```bash
#!/bin/bash
# Convert all WAV files to OGG Vorbis at 128 kbps

for file in source_audio/*.wav; do
  filename=$(basename "$file" .wav)
  ffmpeg -i "$file" -c:a libvorbis -b:a 128k "processed_audio/${filename}.ogg"
done
```

**Advanced Script with Categories:**
```bash
#!/bin/bash

# Music: 160 kbps, stereo
for file in source_audio/music/*.wav; do
  filename=$(basename "$file" .wav)
  ffmpeg -i "$file" -c:a libvorbis -b:a 160k -ac 2 "processed_audio/music/${filename}.ogg"
done

# SFX: 64 kbps, mono
for file in source_audio/sfx/*.wav; do
  filename=$(basename "$file" .wav)
  ffmpeg -i "$file" -c:a libvorbis -b:a 64k -ac 1 "processed_audio/sfx/${filename}.ogg"
done

# Voice: 96 kbps, mono, 22050 Hz
for file in source_audio/voice/*.wav; do
  filename=$(basename "$file" .wav)
  ffmpeg -i "$file" -c:a libvorbis -b:a 96k -ac 1 -ar 22050 "processed_audio/voice/${filename}.ogg"
done
```

### Python Automation Script

More flexible processing with Python.

**Example:**
```python
import subprocess
import os
from pathlib import Path

def process_audio_files(source_dir, output_dir, config):
    """
    Process audio files with specified configuration.

    config = {
        'codec': 'libvorbis',
        'bitrate': '128k',
        'channels': 2,
        'sample_rate': 44100
    }
    """
    source_path = Path(source_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    for audio_file in source_path.glob('*.wav'):
        output_file = output_path / f"{audio_file.stem}.ogg"

        cmd = [
            'ffmpeg', '-i', str(audio_file),
            '-c:a', config['codec'],
            '-b:a', config['bitrate'],
            '-ac', str(config['channels']),
            '-ar', str(config['sample_rate']),
            '-y',  # Overwrite output file
            str(output_file)
        ]

        print(f"Processing: {audio_file.name}")
        subprocess.run(cmd, capture_output=True)

# Process different audio categories
categories = {
    'music': {'codec': 'libvorbis', 'bitrate': '160k', 'channels': 2, 'sample_rate': 44100},
    'sfx': {'codec': 'libvorbis', 'bitrate': '64k', 'channels': 1, 'sample_rate': 44100},
    'voice': {'codec': 'libvorbis', 'bitrate': '96k', 'channels': 1, 'sample_rate': 22050},
}

for category, config in categories.items():
    process_audio_files(f'source_audio/{category}', f'processed_audio/{category}', config)
```

## Testing and Validation

### Quality Testing

**Listening Tests:**
- Compare optimized audio to source
- Test on target hardware (mobile speakers, headphones, TV speakers)
- Listen for compression artifacts (warbling, metallic sound)
- Verify loop points are seamless

**Automated Testing:**
- Measure Peak, RMS, LUFS with tools (ffmpeg, SoX)
- Validate file size reductions
- Check for clipping (peak > 0 dBFS)

**A/B Testing:**
```bash
# Play source and optimized side-by-side
ffplay source.wav &
ffplay optimized.ogg
```

### Performance Testing

**Metrics to Track:**
- Total audio memory usage (loaded clips)
- Streaming bandwidth (MB/s)
- CPU usage for audio processing
- Number of simultaneous sounds
- Audio latency (input to playback)

**Unity Profiler:**
- Check "Audio" section for voice count, memory usage
- Monitor "CPU Usage → Audio" for processing cost

**Custom Profiling:**
```csharp
// Unity example
void LogAudioMemoryUsage() {
    AudioClip[] clips = Resources.FindObjectsOfTypeAll<AudioClip>();
    long totalMemory = 0;
    foreach (AudioClip clip in clips) {
        totalMemory += clip.samples * clip.channels * 2; // 16-bit = 2 bytes
    }
    Debug.Log($"Total audio memory: {totalMemory / 1024 / 1024} MB");
}
```

## Troubleshooting

### Problem: Audible Compression Artifacts

**Symptoms:** Warbling, underwater sound, metallic tones

**Causes:**
- Bitrate too low for complexity of audio
- Low-quality encoder settings

**Solutions:**
- Increase bitrate (try +32 kbps)
- Use higher-quality encoder (OGG instead of MP3)
- Use VBR instead of CBR
- Check encoder quality settings

### Problem: Clicks/Pops at Loop Points

**Causes:**
- Loop point not at zero-crossing
- Discontinuity in waveform at loop point

**Solutions:**
- Adjust loop points to zero-crossings in audio editor
- Add crossfade at loop point (0.01-0.05s)
- Use loop metadata instead of code-based looping

### Problem: Audio Clipping/Distortion

**Causes:**
- Audio exceeds 0 dBFS (digital clipping)
- Over-normalization
- Too much compression/limiting

**Solutions:**
- Apply limiter with -0.5 dB ceiling
- Reduce gain before limiting
- Check for clipping in source audio
- Avoid excessive compression ratios

### Problem: Inconsistent Volume Levels

**Causes:**
- No normalization applied
- Different source audio levels
- Mixing without gain staging

**Solutions:**
- Apply LUFS normalization to all audio
- Create audio mixing categories (music, SFX, voice) with volume controls
- Test volume levels in-game

### Problem: High Memory Usage

**Causes:**
- Too many clips loaded into memory
- Not streaming music
- Uncompressed audio in build

**Solutions:**
- Stream long audio (music, ambient loops)
- Use audio banks, load/unload by scene
- Verify compressed audio in build (check import settings)
- Unload unused audio clips

## Best Practices Checklist

- [ ] Categorize audio (music, SFX, voice, ambient)
- [ ] Apply appropriate codec and bitrate per category
- [ ] Stream music and long audio, load short SFX into memory
- [ ] Convert 3D positioned sounds to mono
- [ ] Normalize audio to target LUFS
- [ ] Apply limiting to prevent clipping (-0.5 dB ceiling)
- [ ] Trim silence from beginning/end of files
- [ ] Reduce sample rate where appropriate (voice, simple SFX: 22050 Hz)
- [ ] Use VBR encoding for better quality-to-size ratio
- [ ] Organize audio into banks for efficient loading/unloading
- [ ] Test audio on target hardware (mobile speakers, headphones)
- [ ] Profile audio memory usage and CPU cost
- [ ] Implement seamless loop points for looping audio
- [ ] Automate audio processing in asset pipeline
- [ ] Validate audio quality with listening tests
- [ ] Document audio optimization settings and rationale
- [ ] Use platform-native codecs where appropriate
- [ ] Apply high-pass filter for mobile (remove sub-bass)
- [ ] Create audio sprite sheets for web (reduce HTTP requests)
- [ ] Monitor total audio memory budget (<50MB mobile, <200MB PC)

## Conclusion

Audio optimization significantly impacts game performance, memory usage, and user experience. Apply appropriate compression techniques based on audio category and target platform, implement streaming for long audio, and organize audio into banks for efficient memory management. Follow the guidelines in this document and adapt them to your specific project requirements and target platforms.

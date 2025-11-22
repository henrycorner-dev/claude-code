---
name: Asset Pipeline
description: This skill should be used when the user asks to "optimize sprites", "create texture atlas", "generate LOD", "optimize audio files", "process game assets", "compress textures", "create sprite sheet", "optimize animations", or mentions asset optimization, texture atlases, Level of Detail (LOD), sprite packing, or asset pipeline workflows for game development.
version: 0.1.0
---

# Asset Pipeline Skill

## Purpose

This skill provides comprehensive guidance for building and managing asset pipelines for game development. Asset pipelines automate the transformation of source assets (sprites, 3D models, audio, animations) into optimized, game-ready formats. This includes creating texture atlases, generating Level of Detail (LOD) variations, compressing audio, and optimizing sprite animations for target platforms like Unity, Godot, Unreal Engine, and custom engines.

The skill covers the complete asset lifecycle: importing source assets, processing and optimization, metadata generation, and integration with game engines.

## When to Use This Skill

Invoke this skill when:

- Creating or optimizing texture atlases from individual sprites
- Generating LOD (Level of Detail) chains for 3D models and textures
- Processing and compressing audio files for games
- Optimizing sprite animations and generating sprite sheets
- Setting up automated asset pipelines for game projects
- Reducing memory usage and improving load times through asset optimization
- Preparing assets for different target platforms (PC, mobile, web, console)

## Core Asset Pipeline Stages

### 1. Asset Import and Validation

**Import Process:**
- Validate source asset formats (PNG, PSD, FBX, OBJ, WAV, MP3, etc.)
- Check for naming conventions and directory structure
- Verify asset dimensions, bit depth, and technical specifications
- Detect and flag potential issues (incorrect color spaces, missing alpha channels)

**Validation Checklist:**
- Source resolution meets minimum quality thresholds
- File formats are supported by target engine
- Naming follows project conventions (e.g., `character_idle_01.png`)
- Assets organized in logical directory structures

### 2. Texture Atlas Generation

**Purpose:** Combine multiple small textures/sprites into larger atlas textures to reduce draw calls and improve rendering performance.

**Process:**
1. Collect all sprites requiring atlas packing (UI elements, character sprites, tile sets)
2. Analyze sprite dimensions and determine optimal packing strategy
3. Apply packing algorithm (MaxRects, Guillotine, Shelf)
4. Generate atlas texture with proper padding to prevent bleeding
5. Create metadata file with sprite coordinates, dimensions, and pivot points
6. Export in engine-specific format (Unity Sprite Atlas, Godot AtlasTexture, TexturePacker JSON)

**Optimization Techniques:**
- Power-of-two atlas sizes for better GPU compatibility (512, 1024, 2048, 4096)
- Add padding (1-2 pixels) between sprites to prevent texture bleeding
- Group sprites by usage frequency (frequently used sprites in same atlas)
- Separate alpha-heavy sprites from opaque sprites
- Consider mipmapping requirements when sizing atlases

**Tool Integration:**
- Use `scripts/generate_atlas.py` for automated atlas generation
- Configure packing parameters in `examples/atlas_config.json`
- Consult `references/texture-atlas-guide.md` for advanced techniques

### 3. Level of Detail (LOD) Generation

**Purpose:** Create multiple versions of 3D models and textures at different detail levels to optimize rendering performance based on camera distance.

**LOD Levels:**
- **LOD0:** Highest detail, used when close to camera
- **LOD1:** Medium detail, used at medium distances (typically 50% triangle count)
- **LOD2:** Low detail, used at far distances (typically 25% triangle count)
- **LOD3+:** Minimal detail or billboard, used at extreme distances

**Process:**
1. Load source high-poly model (LOD0)
2. Apply mesh simplification algorithms (edge collapse, vertex decimation)
3. Generate reduced-poly versions (LOD1, LOD2, LOD3)
4. Bake normal maps from high-poly to low-poly to preserve visual detail
5. Create corresponding texture resolutions (e.g., 2048→1024→512→256)
6. Define LOD transition distances based on object size and importance
7. Export LOD chain with metadata for engine import

**Best Practices:**
- Preserve silhouette quality in lower LOD levels
- Test LOD transitions to avoid popping artifacts
- Balance quality vs. performance (measure frame time impact)
- Use more aggressive LODs for small background objects
- Consider using impostors/billboards for distant objects

**Tool Integration:**
- Use `scripts/generate_lod.py` for automated LOD chain generation
- Configure LOD parameters in `examples/lod_config.json`
- Reference `references/lod-optimization-guide.md` for platform-specific settings

### 4. Audio Optimization

**Purpose:** Compress and convert audio files to appropriate formats and quality levels for different use cases (music, SFX, voice).

**Audio Categories:**
- **Music:** Long-form, streaming, requires higher quality (compressed formats: OGG, MP3)
- **Sound Effects:** Short, loaded into memory, can tolerate more compression
- **Voice/Dialogue:** Speech-optimized compression, varies by language
- **Ambient:** Looping sounds, medium priority

**Process:**
1. Categorize audio files by type (music/SFX/voice/ambient)
2. Apply appropriate compression settings per category:
   - Music: OGG Vorbis at 128-192 kbps, stereo
   - SFX: OGG Vorbis at 64-96 kbps, mono for point sources
   - Voice: OGG Vorbis at 64-128 kbps, optimized for speech
3. Normalize audio levels to prevent clipping
4. Convert to target engine formats (WAV for Unity, OGG for web)
5. Generate streaming vs. loaded-in-memory metadata
6. Create audio banks for efficient loading

**Optimization Techniques:**
- Convert stereo to mono for 3D positioned sounds (50% size reduction)
- Use lower sample rates for non-critical sounds (22kHz vs 44.1kHz)
- Implement audio streaming for long music tracks (>30 seconds)
- Apply appropriate compression formats per platform:
  - Web: OGG Vorbis (broad support, good compression)
  - Mobile: AAC or platform-native formats
  - PC: OGG Vorbis or uncompressed WAV for high-quality
- Trim silence from beginning/end of audio files

**Tool Integration:**
- Use `scripts/optimize_audio.py` for batch audio processing
- Configure audio settings in `examples/audio_config.json`
- Reference `references/audio-optimization-guide.md` for codec comparisons

### 5. Sprite Animation Processing

**Purpose:** Optimize sprite-based animations and generate efficient sprite sheets.

**Process:**
1. Extract animation frames from sprite strips or individual files
2. Remove duplicate frames (for file size reduction)
3. Apply frame optimization (crop to minimal bounding box per frame)
4. Pack animation frames into sprite sheets
5. Generate animation metadata (frame durations, loop points, events)
6. Export in engine-specific format (Unity Animation Clip, Godot SpriteFrames)

**Optimization Techniques:**
- Crop individual frames to minimum bounding box with consistent pivot point
- Share common frames across animations when possible
- Use frame skipping for less critical animations
- Consider delta compression for similar consecutive frames
- Separate animation layers that change at different rates

**Tool Integration:**
- Use `scripts/process_animation.py` for sprite animation optimization
- See `examples/animation_pipeline/` for complete animation workflow
- Reference `references/animation-optimization-guide.md` for frame optimization strategies

## Asset Pipeline Workflow

### Typical Pipeline Flow

1. **Source Asset Preparation**
   - Artists create assets in source formats (PSD, FBX, WAV)
   - Assets placed in designated source directories
   - Follow naming conventions and organization standards

2. **Automated Processing**
   - Pipeline scripts monitor source directories for changes
   - Detect new or modified assets
   - Apply appropriate processing based on asset type
   - Generate optimized output files

3. **Optimization and Export**
   - Apply compression and optimization techniques
   - Generate metadata and configuration files
   - Export to engine-specific formats
   - Place output files in project asset directories

4. **Integration and Testing**
   - Engine imports processed assets
   - Validate assets load correctly
   - Test performance impact (memory usage, load times, FPS)
   - Iterate on optimization settings if needed

### Directory Structure

Organize project with clear separation between source and processed assets:

```
project/
├── assets_source/          # Source assets (PSD, FBX, WAV)
│   ├── sprites/
│   ├── models/
│   ├── audio/
│   └── animations/
├── assets_processed/       # Processed, optimized assets
│   ├── atlases/
│   ├── lods/
│   ├── audio_compressed/
│   └── animations/
├── pipeline/               # Pipeline scripts and configs
│   ├── scripts/
│   ├── configs/
│   └── metadata/
└── game_project/           # Engine project consuming assets
    └── assets/
```

## Quick Reference

### Common Tasks

**Generate Texture Atlas:**
```bash
python scripts/generate_atlas.py \
  --input assets_source/sprites/ui/ \
  --output assets_processed/atlases/ui_atlas.png \
  --config examples/atlas_config.json
```

**Create LOD Chain:**
```bash
python scripts/generate_lod.py \
  --input assets_source/models/character.fbx \
  --output assets_processed/lods/character_lod \
  --levels 4 \
  --ratios 1.0,0.5,0.25,0.1
```

**Optimize Audio:**
```bash
python scripts/optimize_audio.py \
  --input assets_source/audio/ \
  --output assets_processed/audio_compressed/ \
  --config examples/audio_config.json
```

**Process Sprite Animation:**
```bash
python scripts/process_animation.py \
  --input assets_source/animations/character_walk/ \
  --output assets_processed/animations/character_walk.json \
  --atlas assets_processed/atlases/character_atlas.png
```

### Performance Targets

**Texture Memory:**
- Mobile: 512MB-1GB max texture memory
- PC: 2GB-4GB typical, 8GB+ high-end
- Console: Platform-specific (2GB-6GB)

**Draw Calls:**
- Mobile: <100 draw calls per frame
- PC: <500-1000 draw calls per frame
- Use atlases to batch sprites into single draw calls

**Audio Memory:**
- Keep loaded SFX under 50MB total
- Stream music tracks (don't load into memory)
- Mobile: Be conservative, limit to 20-30MB

**LOD Switching Distances:**
- Small props: LOD0 (0-10m), LOD1 (10-30m), LOD2 (30m+)
- Characters: LOD0 (0-15m), LOD1 (15-50m), LOD2 (50m+)
- Large environment: LOD0 (0-50m), LOD1 (50-150m), LOD2 (150m+)

## Integration with Game Engines

### Unity
- Import atlases using Unity Sprite Atlas system
- Configure LOD Groups on models
- Use Audio Import Settings for compression
- Leverage Unity Asset Import Pipeline for automation

### Godot
- Use AtlasTexture resources for sprite atlases
- Configure LOD on MeshInstance nodes
- Import audio with import presets
- Use Godot's resource import system

### Custom Engines
- Implement custom importers for processed assets
- Load metadata files to configure runtime behavior
- Integrate with build system for automated processing

## Additional Resources

### Reference Files

Consult these references for detailed techniques:

- **`references/texture-atlas-guide.md`** - Advanced atlas packing algorithms, bleeding prevention, and engine-specific formats
- **`references/lod-optimization-guide.md`** - LOD generation techniques, transition strategies, and platform-specific recommendations
- **`references/audio-optimization-guide.md`** - Codec comparisons, compression settings, and platform audio requirements
- **`references/animation-optimization-guide.md`** - Frame optimization, delta compression, and animation metadata formats

### Example Files

Working examples and configurations:

- **`examples/atlas_config.json`** - Texture atlas configuration template
- **`examples/lod_config.json`** - LOD generation parameters
- **`examples/audio_config.json`** - Audio processing settings per category
- **`examples/animation_pipeline/`** - Complete sprite animation pipeline example

### Utility Scripts

Automation tools for asset processing:

- **`scripts/generate_atlas.py`** - Automated texture atlas generation
- **`scripts/generate_lod.py`** - LOD chain generation for 3D models
- **`scripts/optimize_audio.py`** - Batch audio compression and optimization
- **`scripts/process_animation.py`** - Sprite animation processing and optimization
- **`scripts/validate_assets.py`** - Asset validation and quality checks

## Best Practices Summary

**Texture Atlases:**
- Use power-of-two dimensions for GPU compatibility
- Add 1-2 pixel padding to prevent bleeding
- Group sprites by usage frequency and material
- Separate opaque and transparent sprites when beneficial

**LOD Generation:**
- Preserve silhouettes in lower LOD levels
- Test transitions to avoid visible popping
- More aggressive LODs for small/distant objects
- Bake normal maps to retain visual detail on low-poly LODs

**Audio Optimization:**
- Convert 3D positional sounds to mono
- Stream long music tracks (>30 seconds)
- Use appropriate codecs per platform
- Normalize audio levels across all assets

**Animation Processing:**
- Crop frames to minimal bounding boxes
- Remove duplicate frames
- Share common frames across animations
- Separate animation layers with different update rates

**Pipeline Automation:**
- Monitor source directories for changes
- Apply consistent naming conventions
- Validate assets before processing
- Version control both source and processed assets
- Document optimization settings and rationale

## Troubleshooting

**Atlas Bleeding Issues:**
- Increase padding between sprites (try 2-4 pixels)
- Disable mipmapping if bleeding persists
- Use "clamp" texture wrapping mode

**LOD Popping:**
- Adjust LOD transition distances
- Use cross-fade transitions if engine supports
- Test LOD levels at target distances

**Audio Crackling/Distortion:**
- Check for clipping in source audio
- Reduce compression ratio
- Use higher bitrate for complex sounds

**Large File Sizes:**
- Review compression settings (may be too conservative)
- Check for unused assets in build
- Consider more aggressive LOD strategies
- Use streaming for large audio files

Start by validating source assets, then apply appropriate optimization techniques based on asset type and target platform. Iterate on settings based on performance profiling and visual/audio quality validation.

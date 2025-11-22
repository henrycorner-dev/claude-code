# Asset Pipeline Scripts

This directory contains utility scripts for automating asset processing in game development pipelines.

## Scripts Overview

### 1. generate_atlas.py

Generates optimized texture atlases from individual sprites.

**Features:**

- Multiple packing algorithms (MaxRects, Guillotine, Shelf)
- Frame trimming and duplicate removal
- Edge extrusion padding to prevent bleeding
- Power-of-two texture sizes
- JSON metadata generation

**Dependencies:**

```bash
pip install Pillow rectpack
```

**Usage:**

```bash
# Basic usage
python generate_atlas.py --input sprites/ --output atlas.png --size 2048 --padding 2

# With configuration file
python generate_atlas.py --input sprites/ --output atlas.png --config atlas_config.json
```

**Example:**

```bash
python generate_atlas.py \
  --input ../examples/animation_pipeline/source/character_walk \
  --output character_walk_atlas.png \
  --size 1024 \
  --padding 4
```

### 2. generate_lod.py

Generates Level of Detail (LOD) meshes using mesh simplification.

**Features:**

- Automatic mesh simplification
- Configurable LOD levels and ratios
- Distance recommendations based on object type
- Metadata generation

**Dependencies:**

```bash
pip install trimesh numpy
```

**Usage:**

```bash
# Basic usage
python generate_lod.py \
  --input model.obj \
  --output model_lod \
  --levels 4 \
  --ratios 1.0,0.5,0.25,0.1

# With object type
python generate_lod.py \
  --input character.fbx \
  --output character_lod \
  --levels 4 \
  --ratios 1.0,0.5,0.25,0.1 \
  --type characters
```

**Note:** For production use, consider professional tools like Simplygon, Meshoptimizer, or Blender's Decimate modifier for higher-quality LOD generation.

### 3. optimize_audio.py

Optimizes audio files for game development with compression and normalization.

**Features:**

- Multiple codec support (OGG Vorbis, MP3, AAC)
- Category-based processing (music, SFX, voice, ambient)
- LUFS normalization
- Silence trimming
- Dynamic range compression
- Batch processing

**Dependencies:**

```bash
# FFmpeg required (install via system package manager)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: Download from ffmpeg.org
```

**Usage:**

```bash
# Single file
python optimize_audio.py \
  --input music.wav \
  --output music.ogg \
  --category music

# Directory with config
python optimize_audio.py \
  --input audio_source/ \
  --output audio_processed/ \
  --config audio_config.json
```

**Example:**

```bash
python optimize_audio.py \
  --input source_audio/music/theme.wav \
  --output processed_audio/music/theme.ogg \
  --category music
```

### 4. process_animation.py

Processes sprite animation frames into optimized sprite sheets.

**Features:**

- Frame cropping to minimal bounding box
- Duplicate frame detection and removal
- Sprite sheet packing
- Animation metadata generation
- Consistent pivot points
- Multi-animation support

**Dependencies:**

```bash
pip install Pillow rectpack
```

**Usage:**

```bash
# Single animation
python process_animation.py \
  --input frames/walk/ \
  --output walk.png \
  --metadata walk.json \
  --duration 0.1 \
  --loop

# Multiple animations with config
python process_animation.py --config animation_pipeline/config.json
```

**Example:**

```bash
python process_animation.py \
  --input ../examples/animation_pipeline/source/character_walk \
  --output character_walk.png \
  --metadata character_walk.json \
  --duration 0.1 \
  --loop
```

### 5. validate_assets.py

Validates assets for common issues.

**Features:**

- Texture validation (power-of-two, size limits, bleeding)
- Audio validation (clipping, silence, file sizes)
- Animation metadata validation
- Batch validation

**Dependencies:**

```bash
pip install Pillow
# FFmpeg optional (for audio analysis)
```

**Usage:**

```bash
# Validate single file
python validate_assets.py --input atlas.png --type texture

# Validate directory
python validate_assets.py --input assets_processed/ --type all

# Validate specific type
python validate_assets.py --input audio/ --type audio
```

**Example:**

```bash
python validate_assets.py \
  --input ../examples/animation_pipeline/processed/ \
  --type animation
```

## Installation

Install all dependencies:

```bash
# Python packages
pip install Pillow rectpack trimesh numpy

# FFmpeg (for audio processing)
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Pipeline Integration

### Basic Workflow

```bash
#!/bin/bash
# Asset processing pipeline

# 1. Generate texture atlases
python scripts/generate_atlas.py \
  --input assets_source/sprites \
  --output assets_processed/atlases/sprites.png \
  --config examples/atlas_config.json

# 2. Generate LODs
python scripts/generate_lod.py \
  --input assets_source/models/character.fbx \
  --output assets_processed/lods/character_lod \
  --config examples/lod_config.json

# 3. Optimize audio
python scripts/optimize_audio.py \
  --input assets_source/audio \
  --output assets_processed/audio \
  --config examples/audio_config.json

# 4. Process animations
python scripts/process_animation.py \
  --config examples/animation_pipeline/config.json

# 5. Validate all assets
python scripts/validate_assets.py \
  --input assets_processed/ \
  --type all
```

### Automated Pipeline (Python)

```python
import subprocess
import sys

def run_command(cmd):
    """Run command and check for errors"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(result.stdout)
    return True

def main():
    steps = [
        ("Generate atlases", "python scripts/generate_atlas.py --config atlas_config.json"),
        ("Generate LODs", "python scripts/generate_lod.py --config lod_config.json"),
        ("Optimize audio", "python scripts/optimize_audio.py --config audio_config.json"),
        ("Process animations", "python scripts/process_animation.py --config animation_config.json"),
        ("Validate assets", "python scripts/validate_assets.py --input assets_processed/ --type all"),
    ]

    for step_name, cmd in steps:
        print(f"\n{'='*60}")
        print(f"Step: {step_name}")
        print(f"{'='*60}")

        if not run_command(cmd):
            print(f"Pipeline failed at step: {step_name}")
            sys.exit(1)

    print("\n✅ Asset pipeline completed successfully!")

if __name__ == '__main__':
    main()
```

## Configuration Files

All scripts support JSON configuration files for complex processing needs.

**Example Configuration Structure:**

```
project/
├── config/
│   ├── atlas_config.json
│   ├── lod_config.json
│   ├── audio_config.json
│   └── animation_config.json
├── scripts/
│   ├── generate_atlas.py
│   ├── generate_lod.py
│   └── ...
├── assets_source/
│   ├── sprites/
│   ├── models/
│   ├── audio/
│   └── animations/
└── assets_processed/
    ├── atlases/
    ├── lods/
    ├── audio/
    └── animations/
```

See the `examples/` directory for complete configuration templates.

## Troubleshooting

### Import Errors

If you see `ModuleNotFoundError`, install missing dependencies:

```bash
pip install Pillow rectpack trimesh numpy
```

### FFmpeg Not Found

Audio processing requires FFmpeg. Install it:

```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/ and add to PATH
```

### Memory Issues

For large assets, you may need to increase Python memory limits or process in batches:

```python
# Process large directories in batches
import os
batch_size = 100
files = sorted(os.listdir('input_dir'))

for i in range(0, len(files), batch_size):
    batch = files[i:i+batch_size]
    # Process batch
```

### Performance

For production pipelines with many assets:

1. **Parallelize:** Use multiprocessing for independent asset processing
2. **Incremental:** Only process changed files (check timestamps)
3. **Caching:** Cache processed assets and reuse when source unchanged

## Advanced Usage

### Custom Packing Algorithms

Extend `generate_atlas.py` to use custom packing algorithms:

```python
from rectpack import newPacker, PackingMode

# Custom MaxRects configuration
packer = newPacker(
    mode=PackingMode.Offline,
    bin_algo=PackingBin.BFF,
    pack_algo=MaxRects,
    rotation=True
)
```

### Mesh Simplification Algorithms

For better LOD quality, integrate with:

- **Simplygon SDK:** Professional mesh simplification
- **Meshlab:** Command-line mesh processing
- **Blender Python API:** Automate Decimate modifier

### Audio Codec Tuning

Fine-tune audio quality with custom FFmpeg parameters:

```bash
# High-quality music (VBR)
ffmpeg -i input.wav -c:a libvorbis -q:a 6 output.ogg

# Low-latency SFX (CBR)
ffmpeg -i input.wav -c:a libvorbis -b:a 64k -compression_level 0 output.ogg
```

## Best Practices

1. **Version Control:** Keep configuration files in version control
2. **Documentation:** Document custom pipeline modifications
3. **Testing:** Validate assets after processing
4. **Incremental:** Process only changed assets for faster iteration
5. **Backups:** Keep source assets separate from processed assets
6. **Automation:** Integrate scripts into build pipeline (CI/CD)

## Contributing

When extending these scripts:

1. Follow existing code style
2. Add error handling for edge cases
3. Update documentation
4. Test with various asset types
5. Consider backward compatibility

## License

These scripts are provided as examples for educational purposes. Adapt them to your project's needs.

## Support

For issues or questions:

1. Check the reference guides in `../references/`
2. Review example configurations in `../examples/`
3. Consult the main SKILL.md documentation

## Additional Resources

- **Texture Atlases:** See `../references/texture-atlas-guide.md`
- **LOD Optimization:** See `../references/lod-optimization-guide.md`
- **Audio Optimization:** See `../references/audio-optimization-guide.md`
- **Animation Optimization:** See `../references/animation-optimization-guide.md`

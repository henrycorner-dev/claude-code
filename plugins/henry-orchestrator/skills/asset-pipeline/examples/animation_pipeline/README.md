# Animation Pipeline Example

This directory demonstrates a complete sprite animation processing pipeline for game development.

## Directory Structure

```
animation_pipeline/
├── source/                  # Source animation frames (input)
│   ├── character_walk/
│   │   ├── walk_01.png
│   │   ├── walk_02.png
│   │   ├── walk_03.png
│   │   └── ...
│   ├── character_idle/
│   └── character_jump/
├── processed/               # Processed sprite sheets (output)
│   ├── character_walk.png
│   ├── character_walk.json
│   ├── character_idle.png
│   └── character_idle.json
└── config.json             # Animation processing configuration
```

## Workflow

### 1. Prepare Source Frames

Place individual animation frames in subdirectories under `source/`:

- **Naming Convention:** `{animation_name}_{frame_number}.png`
  - Example: `walk_01.png`, `walk_02.png`, `walk_03.png`
- **Format:** PNG with transparency
- **Consistent Dimensions:** All frames in an animation should have similar dimensions (will be cropped automatically)

### 2. Configure Processing

Edit `config.json` to specify processing parameters:

```json
{
  "animations": {
    "character_walk": {
      "source_directory": "source/character_walk",
      "frame_duration": 0.1,
      "loop": true
    }
  }
}
```

### 3. Run Processing Script

Process all animations:

```bash
python ../scripts/process_animation.py --config animation_pipeline/config.json
```

Process specific animation:

```bash
python ../scripts/process_animation.py \
  --input animation_pipeline/source/character_walk \
  --output animation_pipeline/processed/character_walk.png \
  --metadata animation_pipeline/processed/character_walk.json
```

### 4. Output Files

**Sprite Sheet (`character_walk.png`):**

- Combined texture atlas of all animation frames
- Frames cropped to minimal bounding box
- Packed efficiently with padding

**Metadata (`character_walk.json`):**

```json
{
  "animation": "character_walk",
  "texture": "character_walk.png",
  "frame_count": 8,
  "loop": true,
  "frames": [
    {
      "index": 0,
      "x": 0,
      "y": 0,
      "w": 64,
      "h": 64,
      "duration": 0.1,
      "source_size": {"w": 128, "h": 128},
      "offset": {"x": 32, "y": 32}
    },
    ...
  ]
}
```

## Processing Features

### Frame Optimization

**Duplicate Removal:**

- Detects identical frames via hash comparison
- Adjusts frame durations to maintain animation timing
- Example: 10 frames with duplicates → 7 unique frames

**Cropping:**

- Removes transparent pixels from each frame
- Stores original size and offset in metadata
- Reduces texture memory by 30-70% typical

**Consistent Pivot Points:**

- Calculates consistent pivot for all frames
- Prevents jittering during playback
- Stored in metadata

### Sprite Sheet Generation

**Packing:**

- Uses MaxRects algorithm for efficient packing
- 2-4 pixel padding with edge extrusion
- Power-of-two texture sizes (512, 1024, 2048)

**Multi-Resolution:**

- Generates @1x, @2x, @3x versions
- Single metadata with normalized UVs
- Load appropriate resolution per platform

### Compression

**Texture Compression:**

- PC: DXT5 (BC3)
- Mobile: ASTC 6x6 or ETC2
- Web: PNG or WebP

**Settings:**

```json
{
  "compression": {
    "enabled": true,
    "format_pc": "DXT5",
    "format_mobile": "ASTC_6x6",
    "format_web": "WebP"
  }
}
```

## Integration Examples

### Unity

```csharp
// Load sprite sheet
Texture2D spriteSheet = Resources.Load<Texture2D>("processed/character_walk");

// Parse metadata
AnimationData animData = JsonUtility.FromJson<AnimationData>(metadataJson);

// Create sprite from frame data
Sprite CreateSprite(AnimationFrame frame) {
    Rect rect = new Rect(frame.x, frame.y, frame.w, frame.h);
    Vector2 pivot = new Vector2(0.5f, 0.5f); // Adjust based on frame.offset
    return Sprite.Create(spriteSheet, rect, pivot);
}

// Play animation
foreach (AnimationFrame frame in animData.frames) {
    spriteRenderer.sprite = CreateSprite(frame);
    yield return new WaitForSeconds(frame.duration);
}
```

### Godot

```gdscript
# Load sprite sheet
var sprite_sheet = preload("res://processed/character_walk.png")

# Parse metadata
var anim_data = JSON.parse(metadata_text).result

# Create animation
var sprite_frames = SpriteFrames.new()
sprite_frames.add_animation("walk")

for frame in anim_data.frames:
    var atlas_texture = AtlasTexture.new()
    atlas_texture.atlas = sprite_sheet
    atlas_texture.region = Rect2(frame.x, frame.y, frame.w, frame.h)
    sprite_frames.add_frame("walk", atlas_texture, frame.duration)

$AnimatedSprite.frames = sprite_frames
$AnimatedSprite.play("walk")
```

### Custom Engine

```python
# Load sprite sheet and metadata
sprite_sheet = load_image("processed/character_walk.png")
anim_data = json.load(open("processed/character_walk.json"))

# Animation playback
class Animation:
    def __init__(self, sprite_sheet, metadata):
        self.sprite_sheet = sprite_sheet
        self.frames = metadata['frames']
        self.current_frame = 0
        self.time_accumulator = 0.0
        self.loop = metadata['loop']

    def update(self, delta_time):
        self.time_accumulator += delta_time
        current_frame_data = self.frames[self.current_frame]

        if self.time_accumulator >= current_frame_data['duration']:
            self.time_accumulator = 0.0
            self.current_frame += 1

            if self.current_frame >= len(self.frames):
                if self.loop:
                    self.current_frame = 0
                else:
                    self.current_frame = len(self.frames) - 1

    def draw(self, x, y):
        frame = self.frames[self.current_frame]
        source_rect = (frame['x'], frame['y'], frame['w'], frame['h'])
        # Adjust position based on offset for consistent placement
        draw_x = x - frame['offset']['x']
        draw_y = y - frame['offset']['y']
        draw_sprite(self.sprite_sheet, source_rect, draw_x, draw_y)
```

## Configuration Options

### config.json

```json
{
  "animations": {
    "animation_name": {
      "source_directory": "source/animation_name",
      "frame_duration": 0.1,
      "loop": true,
      "frame_range": [1, 8],
      "trim_frames": true,
      "remove_duplicates": true
    }
  },
  "output": {
    "directory": "processed",
    "texture_size": 2048,
    "padding": 2,
    "multi_resolution": true,
    "resolutions": ["@1x", "@2x", "@3x"]
  },
  "compression": {
    "enabled": true,
    "format_pc": "DXT5",
    "format_mobile": "ASTC_6x6",
    "format_web": "PNG"
  }
}
```

## Best Practices

1. **Consistent Frame Dimensions:** Keep frame dimensions similar within an animation
2. **Power-of-Two Textures:** Output sprite sheets at 512, 1024, 2048, or 4096
3. **Transparent Backgrounds:** Use PNG with alpha channel for source frames
4. **Naming Conventions:** Use consistent naming (`{anim}_{frame}.png`)
5. **Frame Rates:** 15-30 fps typical for sprite animations
6. **Loop Points:** Ensure first and last frames match for seamless loops
7. **Pivot Points:** Define consistent pivot points in config
8. **Multi-Resolution:** Generate multiple resolutions for different devices
9. **Compression:** Apply appropriate texture compression per platform
10. **Version Control:** Version control both source frames and config

## Troubleshooting

### Problem: Frames Jitter During Playback

**Cause:** Inconsistent pivot points across frames

**Solution:**

- Enable consistent pivot point calculation in config
- Manually specify pivot point in config

### Problem: Large Sprite Sheet Size

**Cause:** Frames not cropped, too much transparent space

**Solution:**

- Enable frame trimming in config
- Check that source frames have transparent backgrounds

### Problem: Animation Appears Choppy

**Cause:** Frame rate too low or uneven frame durations

**Solution:**

- Increase frame count or adjust frame_duration
- Ensure consistent frame timing

### Problem: Visible Seams Between Frames

**Cause:** Insufficient padding or texture filtering

**Solution:**

- Increase padding to 4 pixels
- Use edge extrusion padding
- Disable mipmapping for sprite sheets

## Example Animations

### Walk Cycle (8 frames, 0.1s per frame)

```
Frame 1: Contact (left foot forward)
Frame 2: Passing (right leg passing)
Frame 3: High point (right foot lifting)
Frame 4: Contact (right foot forward)
Frame 5: Passing (left leg passing)
Frame 6: High point (left foot lifting)
Frame 7: Contact (left foot forward)
Frame 8: Transition frame
```

### Idle (4 frames, 0.5s per frame)

```
Frame 1: Standing neutral
Frame 2: Slight lean
Frame 3: Standing neutral
Frame 4: Breathing motion
```

### Jump (6 frames, varying duration)

```
Frame 1: Crouch (0.1s)
Frame 2: Launch (0.05s)
Frame 3: Air ascending (0.15s)
Frame 4: Air peak (0.1s)
Frame 5: Air descending (0.15s)
Frame 6: Land (0.1s)
```

## Conclusion

This animation pipeline automates sprite sheet generation, frame optimization, and metadata creation. Use the provided scripts and configuration to efficiently process sprite animations for your game project.

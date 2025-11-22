# Texture Atlas Optimization Guide

## Overview

Texture atlases (sprite sheets) combine multiple small textures into larger atlas textures, reducing draw calls and improving rendering performance. This guide covers advanced atlas generation techniques, bleeding prevention strategies, and engine-specific formats.

## Atlas Packing Algorithms

### MaxRects Algorithm

The MaxRects (Maximal Rectangles) algorithm maintains a list of free rectangles and places sprites into the best-fitting position.

**Heuristics:**

- **Best Short Side Fit (BSSF):** Minimizes leftover space on the shorter side
- **Best Long Side Fit (BLSF):** Minimizes leftover space on the longer side
- **Best Area Fit (BAF):** Minimizes total leftover area
- **Bottom-Left (BL):** Places sprites as low and left as possible

**Pros:**

- High packing efficiency (85-95% typical)
- Fast computation
- Good for mixed sprite sizes

**Cons:**

- Can produce fragmentation with very irregular sizes

**When to Use:**

- Default choice for most projects
- Mixed sprite sizes
- Need good packing efficiency with reasonable speed

### Guillotine Algorithm

Recursively subdivides space with horizontal or vertical cuts.

**Split Rules:**

- **Shorter Axis:** Split along the shorter axis
- **Longer Axis:** Split along the longer axis
- **Minimize Area:** Choose split that minimizes wasted area
- **Maximize Area:** Choose split that maximizes remaining free area

**Pros:**

- Very fast
- Simple implementation
- Predictable memory usage

**Cons:**

- Lower packing efficiency (75-85%)
- More wasted space with irregular sizes

**When to Use:**

- Need maximum speed
- Sprites are similar sizes
- Packing efficiency is less critical

### Shelf Algorithm

Arranges sprites in horizontal shelves (rows) of fixed height.

**Variants:**

- **Next Fit:** Fill current shelf, move to next when sprite doesn't fit
- **First Fit:** Search all shelves for first fit
- **Best Fit:** Search all shelves for best fit (minimal height waste)

**Pros:**

- Very fast
- Simple to implement
- Good for sprites of similar heights

**Cons:**

- Poor efficiency for varied sprite sizes (70-80%)
- Significant height waste with irregular sprites

**When to Use:**

- Sprites have similar heights (UI elements, fonts)
- Need maximum simplicity
- Speed is critical

### Skyline Algorithm

Maintains a "skyline" representing the top edge of packed sprites and finds the lowest position for each new sprite.

**Variants:**

- **Bottom-Left:** Place at lowest leftmost position
- **Best Fit:** Find position that minimizes waste
- **Min Waste:** Minimize wasted horizontal space

**Pros:**

- Good efficiency (80-90%)
- Works well with varied sprite sizes
- Balances speed and efficiency

**Cons:**

- More complex than Shelf or Guillotine
- Slightly slower than MaxRects

**When to Use:**

- Mixed sprite sizes
- Want balance of speed and efficiency
- Need better results than Shelf but simpler than MaxRects

## Texture Bleeding Prevention

Texture bleeding occurs when pixels from adjacent sprites in an atlas "bleed" into neighboring sprites during rendering, especially when using texture filtering or mipmapping.

### Padding Strategies

**1. Transparent Padding (1-2 pixels)**

Add transparent pixels between sprites.

**Pros:**

- Simple to implement
- Reduces most bleeding issues

**Cons:**

- Transparent pixels may still cause artifacts with certain blend modes
- Not ideal for opaque sprites

**When to Use:**

- Sprites with alpha transparency
- Using premultiplied alpha

**2. Edge Extrusion Padding (1-4 pixels)**

Duplicate edge pixels of each sprite into the padding area.

**Pros:**

- Eliminates bleeding artifacts effectively
- Works well with mipmapping
- Suitable for both opaque and transparent sprites

**Cons:**

- Slightly more complex to implement
- Increases atlas processing time

**When to Use:**

- Default choice for most projects
- Using mipmapping or anisotropic filtering
- Need highest quality results

**3. Color Key Padding**

Fill padding with a specific color that won't be rendered (e.g., magenta).

**Pros:**

- Easy to debug (visible padding in atlas texture)
- Can be filtered out in shader

**Cons:**

- Requires shader support
- Can still cause artifacts without proper filtering

**When to Use:**

- Development/debugging
- Custom shader pipeline
- Need to visualize padding

### Mipmap Considerations

Mipmaps are downsampled versions of textures used when rendering at smaller sizes. Bleeding is more pronounced in mipmaps.

**Strategies:**

- Use larger padding (2-4 pixels) when mipmapping is enabled
- Apply edge extrusion to padding area
- Disable mipmapping for atlases with very small sprites (<16x16)
- Consider separate atlases for sprites requiring mipmapping

**Mipmap-Safe Padding Calculation:**

```
padding_pixels = max(2, ceil(log2(atlas_size / sprite_size)))
```

For a 2048x2048 atlas with 32x32 sprites:

```
padding = max(2, ceil(log2(2048 / 32))) = max(2, ceil(log2(64))) = max(2, 6) = 6 pixels
```

### Texture Wrap Modes

Configure appropriate texture wrapping to prevent bleeding:

**Clamp to Edge:**

- Prevents sampling outside sprite bounds
- Recommended for atlases
- Set in engine material/texture settings

**Repeat:**

- Never use with atlases (causes major bleeding)
- Only for standalone tileable textures

**Mirror:**

- Not suitable for atlases
- Can cause unexpected bleeding patterns

## Atlas Size Considerations

### Power-of-Two Dimensions

**Why Power-of-Two:**

- Better GPU compatibility (older hardware requires POT textures)
- More efficient memory allocation
- Optimal for mipmapping (each mip level is exactly half the previous)
- Some compression formats (PVRTC) require POT dimensions

**Common Sizes:**

- 512x512 - Small atlases, UI elements, mobile
- 1024x1024 - Medium atlases, character sprites
- 2048x2048 - Large atlases, tile sets, PC/console
- 4096x4096 - Very large atlases, high-resolution assets, PC/console only

**Non-Power-of-Two (NPOT) Support:**

- Modern GPUs fully support NPOT textures
- Consider NPOT if targeting only modern platforms (post-2010)
- Saves memory when sprites don't fit POT sizes efficiently
- Still avoid with mipmapping for best results

### Multiple Atlases vs. Single Large Atlas

**Use Multiple Smaller Atlases When:**

- Total sprites exceed 4096x4096 (hardware limit)
- Sprites have different usage patterns (load some atlases, not others)
- Some sprites are transparent, others opaque (separate for blend mode efficiency)
- Different asset update frequencies (UI vs. gameplay)
- Targeting platforms with memory constraints

**Use Single Large Atlas When:**

- All sprites used together
- Minimize draw calls (single atlas = single draw call for all sprites)
- Sprites have similar properties
- Total size fits within target platform limits

### Resolution Targets by Platform

**Mobile:**

- Max atlas size: 2048x2048 (safe for all devices)
- Consider 1024x1024 for broader compatibility
- Use aggressive compression (ASTC, ETC2)
- Separate atlases for different quality tiers

**PC:**

- Max atlas size: 4096x4096 commonly supported
- 8192x8192 possible on modern hardware (use with caution)
- Less aggressive compression (DXT5, BC7)

**Console:**

- PS5/Xbox Series: 4096x4096 safe, 8192x8192 possible
- PS4/Xbox One: 4096x4096 recommended max
- Nintendo Switch: 2048x2048 recommended, 4096x4096 max

**Web:**

- Max atlas size: 2048x2048 (broader compatibility)
- Consider 1024x1024 for older browsers/devices
- Use web-friendly formats (PNG, WebP)

## Texture Compression Formats

Compress atlas textures to reduce memory usage and improve loading times.

### Platform-Specific Formats

**PC:**

- **DXT1 (BC1):** Opaque RGB, 6:1 compression, 4-bit per pixel
- **DXT5 (BC3):** RGBA with alpha, 4:1 compression, 8-bit per pixel
- **BC7:** Higher quality RGBA, 4:1 compression, best for gradients

**Mobile (iOS):**

- **PVRTC:** iOS-specific, 4bpp or 2bpp, requires POT textures
- **ASTC:** Modern iOS (A8+), variable compression (4x4 to 12x12 blocks), best quality

**Mobile (Android):**

- **ETC2:** Standard Android format, 4:1 compression
- **ASTC:** Modern Android, variable compression, best quality

**Web:**

- **PNG:** Lossless, good for UI, larger file size
- **WebP:** Better compression than PNG, broad browser support
- **Basis Universal:** Cross-platform compressed format, transcodes to native formats

### Compression Settings

**High Quality (Minimal Artifacts):**

- BC7 (PC), ASTC 4x4 (mobile)
- Use for main character sprites, important UI elements
- Higher memory usage but best visual quality

**Balanced (Good Quality, Moderate Size):**

- DXT5/BC3 (PC), ETC2 (Android), ASTC 6x6 (mobile)
- Use for most game sprites
- Good balance of quality and memory

**Maximum Compression (Acceptable Quality):**

- DXT1/BC1 for opaque (PC), ASTC 8x8 or 12x12 (mobile)
- Use for background elements, distant objects
- Lowest memory usage, visible compression artifacts

### Alpha Channel Handling

**Premultiplied Alpha:**

- RGB values multiplied by alpha before storage
- Reduces bleeding artifacts in transparent areas
- Recommended for most sprite atlases
- Use "Premultiply Alpha" option in texture settings

**Straight Alpha:**

- RGB and alpha stored independently
- Can cause dark halos around transparent edges
- Use only if engine requires it

**Alpha Test (Cutout):**

- Binary alpha (fully opaque or transparent)
- No alpha blending, uses alpha testing
- Good for foliage, fences, cutout sprites
- Allows opaque-only compression (DXT1)

## Engine-Specific Atlas Formats

### Unity Sprite Atlas

**Format:**

- PNG or compressed texture (DXT, ASTC, ETC2)
- Sprite metadata stored in Unity asset file
- Supports tight packing with polygon mesh option

**Configuration:**

```csharp
// Unity Sprite Atlas settings
- Type: Sprite Atlas
- Include in Build: Yes
- Allow Rotation: Optional (better packing, but complicates logic)
- Tight Packing: Yes (for irregular sprites)
- Padding: 2-4 pixels
- Filter Mode: Bilinear
- Compression: Platform-specific
```

**Metadata:**

- Unity stores sprite rectangles, pivots, and borders internally
- Access via `sprite.rect`, `sprite.pivot`

**Integration:**

```csharp
// Load sprite from atlas
SpriteAtlas atlas = Resources.Load<SpriteAtlas>("Atlases/UIAtlas");
Sprite sprite = atlas.GetSprite("button_normal");
```

### Godot AtlasTexture

**Format:**

- PNG or compressed texture
- Sprite regions defined in Godot resource files (.tres)

**Configuration:**

```gdscript
# Godot AtlasTexture resource
[resource]
atlas = ExtResource("atlas_texture.png")
region = Rect2(0, 0, 64, 64)  # x, y, width, height
margin = Rect2(2, 2, 2, 2)    # padding
```

**Integration:**

```gdscript
# Load sprite from atlas
var atlas_texture = AtlasTexture.new()
atlas_texture.atlas = preload("res://atlases/sprites.png")
atlas_texture.region = Rect2(64, 0, 64, 64)
$Sprite.texture = atlas_texture
```

### TexturePacker JSON

**Format:**

- JSON metadata file with sprite rectangles
- Widely supported by game engines and frameworks

**JSON Structure:**

```json
{
  "frames": {
    "sprite_name.png": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": { "x": 2, "y": 2, "w": 64, "h": 64 },
      "sourceSize": { "w": 68, "h": 68 },
      "pivot": { "x": 0.5, "y": 0.5 }
    }
  },
  "meta": {
    "size": { "w": 2048, "h": 2048 },
    "scale": 1
  }
}
```

**Integration:**

- Parse JSON to extract sprite regions
- Map sprite names to texture coordinates
- Apply pivot points and rotation if needed

### Cocos2d Plist

**Format:**

- XML Plist file with sprite metadata
- Used by Cocos2d game engine

**Structure:**

```xml
<key>sprite_name.png</key>
<dict>
    <key>frame</key>
    <string>{{0,0},{64,64}}</string>
    <key>offset</key>
    <string>{0,0}</string>
    <key>rotated</key>
    <false/>
    <key>sourceSize</key>
    <string>{64,64}</string>
</dict>
```

### Custom Formats

**Binary Format for Performance:**

- Store sprite metadata in binary format for faster parsing
- Include: sprite name hash, UV coordinates (0-1 range), dimensions, pivot point
- Example structure:
  ```
  Header: atlas_width, atlas_height, sprite_count
  Per-Sprite: name_hash (uint32), x, y, w, h (uint16), pivot_x, pivot_y (float)
  ```

## Advanced Techniques

### Sprite Rotation in Atlas

**Benefits:**

- Better packing efficiency (5-15% improvement)
- Reduces wasted space for tall/narrow sprites

**Drawbacks:**

- Complicates rendering logic (must rotate UVs)
- May require additional shader support
- Debugging more difficult

**When to Use:**

- Packing efficiency is critical
- Engine supports rotated sprites natively
- Have many tall or wide sprites

**Implementation:**

- Packer stores rotation flag per sprite
- Renderer rotates UVs by 90 degrees when rendering
- Pivot points must be adjusted for rotation

### Trimming/Cropping Sprites

**Purpose:**

- Remove transparent pixels from sprite edges
- Reduce atlas size significantly (20-40% typical)

**Process:**

1. Detect non-transparent bounding box of sprite
2. Crop sprite to minimal bounding box
3. Store original sprite size and offset in metadata
4. Renderer applies offset when positioning sprite

**Metadata Required:**

- `sourceSize`: Original sprite dimensions
- `spriteSourceSize`: Position and size within original sprite
- `trimmed`: Boolean flag indicating if sprite was trimmed

**Benefits:**

- Smaller atlas textures
- Better packing efficiency
- Reduced memory usage

**Drawbacks:**

- Requires metadata support
- Complicates rendering (must apply offsets)
- Not suitable for all sprite types (e.g., tiles)

### Multi-Resolution Atlases

Generate atlases at multiple resolutions for different device tiers.

**Strategy:**

- **@1x:** 1024x1024, for low-end mobile
- **@2x:** 2048x2048, for mid-range devices
- **@3x:** 4096x4096, for high-end PC/console

**Process:**

1. Generate atlas at highest resolution (e.g., @3x)
2. Downscale to lower resolutions (@2x, @1x)
3. Metadata uses normalized UVs (0-1 range) to work across resolutions
4. Load appropriate atlas based on device capability

**Benefits:**

- Optimize memory usage per device
- Single metadata file works for all resolutions
- Better performance on low-end devices

**Implementation:**

```python
# Generate atlases at multiple resolutions
generate_atlas(sprites, size=4096, output="atlas@3x.png")
downscale_atlas("atlas@3x.png", scale=0.5, output="atlas@2x.png")
downscale_atlas("atlas@2x.png", scale=0.5, output="atlas@1x.png")
```

### Dynamic Atlas Updates

For games with user-generated content or downloadable assets.

**Challenges:**

- Can't rebuild entire atlas at runtime (too slow)
- Need to find space in existing atlas or create new atlas

**Strategies:**

1. **Reserve Atlas Space:** Pre-allocate regions for dynamic sprites
2. **Dynamic Atlas Creation:** Create small separate atlases for new content
3. **Atlas Stitching:** Combine small atlases periodically (during loading screens)

**Implementation:**

- Maintain free rectangle list for available atlas space
- Use MaxRects to pack new sprites into free space
- Update metadata with new sprite locations
- Upload updated atlas texture to GPU

## Performance Optimization

### Draw Call Batching

**Goal:** Minimize draw calls by rendering all sprites from one atlas in a single batch.

**Requirements:**

- All sprites use same atlas texture
- All sprites use same material/shader
- Sprites rendered in same pass (same Z-order, blend mode)

**Optimization:**

- Group sprites by atlas
- Sort sprites by atlas before rendering
- Use instanced rendering if engine supports

### Memory vs. Performance Trade-offs

**Larger Atlases (Fewer, Bigger):**

- **Pros:** Fewer draw calls, better batching
- **Cons:** More memory per atlas, longer load times, more memory waste if only using few sprites

**Smaller Atlases (Many, Smaller):**

- **Pros:** Load only needed atlases, less memory waste, faster individual load times
- **Cons:** More draw calls, worse batching, more atlas switches

**Recommendation:**

- Default to fewer, larger atlases (1024-2048)
- Use multiple atlases only when clear benefit (different usage patterns)
- Profile both approaches with your actual game

### Texture Streaming

For games with many atlases, stream textures in/out based on usage.

**Strategy:**

- Load atlases only when needed (per level, per area)
- Unload unused atlases to free memory
- Preload atlases for upcoming areas during transitions

**Implementation:**

- Track atlas usage per scene/area
- Load atlases on scene load
- Unload on scene unload
- Use priority system for limited memory scenarios

## Debugging and Validation

### Visual Atlas Inspection

Generate debug atlas with sprite boundaries drawn.

**Visualization:**

- Draw colored rectangles around each sprite
- Label sprites with names
- Highlight padding areas
- Show rotated sprites differently

**Tools:**

- Use image editor (Photoshop, GIMP) with sprite metadata overlay
- Custom debug renderer in game engine
- TexturePacker has built-in preview

### Bleeding Detection

**Test:**

- Render sprites at various scales
- Enable mipmapping and anisotropic filtering
- Look for color artifacts at sprite edges
- Test with contrasting colors (checkerboard pattern)

**Fixes:**

- Increase padding
- Use edge extrusion
- Adjust mipmap settings
- Check texture wrap mode

### Performance Profiling

**Metrics to Track:**

- Atlas texture memory usage
- Number of draw calls per frame
- Atlas texture switches per frame
- GPU texture bandwidth usage
- Load times for atlases

**Tools:**

- Unity Profiler, Godot Profiler
- GPU vendor tools (NVIDIA Nsight, AMD GPU Profiler)
- Custom profiling with engine APIs

### Automated Testing

**Tests:**

1. Validate all sprites fit within atlas bounds
2. Check for overlapping sprites in atlas
3. Verify padding between sprites
4. Confirm metadata matches atlas texture
5. Test loading and rendering all sprites

**CI/CD Integration:**

- Run atlas generation in build pipeline
- Validate atlases automatically
- Fail build on atlas generation errors
- Compare atlas sizes to detect regressions

## Best Practices Checklist

- [ ] Use MaxRects algorithm for general-purpose packing
- [ ] Apply 2-4 pixel padding with edge extrusion
- [ ] Use power-of-two atlas dimensions for compatibility
- [ ] Enable texture compression appropriate for target platform
- [ ] Generate multiple atlas resolutions for different device tiers
- [ ] Trim transparent pixels from sprites before packing
- [ ] Group sprites by usage pattern (UI, gameplay, effects)
- [ ] Test for bleeding artifacts at various scales and filtering modes
- [ ] Profile draw calls and texture memory usage
- [ ] Automate atlas generation in build pipeline
- [ ] Use premultiplied alpha for transparent sprites
- [ ] Set texture wrap mode to "Clamp to Edge"
- [ ] Validate atlases with automated tests
- [ ] Document atlas organization and sprite naming conventions
- [ ] Version control atlas generation scripts and configurations

## Conclusion

Texture atlases are a critical optimization for 2D games and UI rendering. Proper atlas generation with appropriate packing algorithms, bleeding prevention, and compression can significantly improve performance and reduce memory usage. Follow the strategies in this guide and adapt them to your specific project requirements and target platforms.

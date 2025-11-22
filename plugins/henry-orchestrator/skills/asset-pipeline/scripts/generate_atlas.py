#!/usr/bin/env python3
"""
Texture Atlas Generation Script

Generates optimized texture atlases from individual sprites with configurable
packing algorithms, padding, and compression settings.

Requirements:
    pip install Pillow rectpack

Usage:
    python generate_atlas.py --input sprites/ --output atlas.png --config config.json
    python generate_atlas.py --input sprites/ --output atlas.png --size 2048 --padding 2
"""

import argparse
import json
import os
import sys
from pathlib import Path
from PIL import Image
import hashlib

try:
    import rectpack
except ImportError:
    print("Error: rectpack library required. Install with: pip install rectpack")
    sys.exit(1)


class SpriteFrame:
    """Represents a single sprite frame"""
    def __init__(self, path, image):
        self.path = path
        self.name = Path(path).stem
        self.image = image
        self.original_size = image.size
        self.trimmed_image = None
        self.trimmed_rect = None  # (x, y, w, h) offset from original
        self.hash = None

    def calculate_hash(self):
        """Calculate image hash for duplicate detection"""
        self.hash = hashlib.md5(self.image.tobytes()).hexdigest()

    def trim_transparent(self):
        """Trim transparent pixels from sprite"""
        bbox = self.image.getbbox()
        if bbox:
            self.trimmed_image = self.image.crop(bbox)
            self.trimmed_rect = bbox
        else:
            # Fully transparent image
            self.trimmed_image = self.image
            self.trimmed_rect = (0, 0, self.image.width, self.image.height)


class AtlasGenerator:
    """Generates texture atlases from sprites"""

    def __init__(self, config):
        self.config = config
        self.sprites = []
        self.atlas_image = None
        self.metadata = {}

    def load_sprites(self, input_dir):
        """Load all sprite images from directory"""
        print(f"Loading sprites from {input_dir}...")

        input_path = Path(input_dir)
        if not input_path.exists():
            print(f"Error: Input directory {input_dir} does not exist")
            sys.exit(1)

        supported_formats = ('.png', '.jpg', '.jpeg', '.bmp', '.tga')
        sprite_files = []

        for ext in supported_formats:
            sprite_files.extend(input_path.glob(f'**/*{ext}'))

        for sprite_path in sorted(sprite_files):
            try:
                img = Image.open(sprite_path)
                # Convert to RGBA if not already
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')

                sprite = SpriteFrame(str(sprite_path), img)
                sprite.calculate_hash()

                if self.config.get('trim_sprites', True):
                    sprite.trim_transparent()
                else:
                    sprite.trimmed_image = sprite.image
                    sprite.trimmed_rect = (0, 0, img.width, img.height)

                self.sprites.append(sprite)
                print(f"  Loaded: {sprite.name} ({sprite.original_size[0]}x{sprite.original_size[1]})")

            except Exception as e:
                print(f"  Warning: Failed to load {sprite_path}: {e}")

        print(f"Loaded {len(self.sprites)} sprites")

    def remove_duplicates(self):
        """Remove duplicate sprites based on image hash"""
        if not self.config.get('remove_duplicates', True):
            return

        print("Checking for duplicate sprites...")
        unique_sprites = []
        seen_hashes = {}
        duplicates_count = 0

        for sprite in self.sprites:
            if sprite.hash in seen_hashes:
                duplicates_count += 1
                print(f"  Duplicate: {sprite.name} (same as {seen_hashes[sprite.hash].name})")
            else:
                seen_hashes[sprite.hash] = sprite
                unique_sprites.append(sprite)

        self.sprites = unique_sprites
        print(f"Removed {duplicates_count} duplicate sprites")

    def pack_sprites(self):
        """Pack sprites into atlas using MaxRects algorithm"""
        print("Packing sprites into atlas...")

        atlas_width = self.config.get('texture_size', {}).get('width', 2048)
        atlas_height = self.config.get('texture_size', {}).get('height', 2048)
        padding = self.config.get('padding', {}).get('pixels', 2)
        allow_rotation = self.config.get('allow_rotation', False)

        # Create packer
        packer = rectpack.newPacker(
            mode=rectpack.PackingMode.Offline,
            rotation=allow_rotation
        )

        # Add bins (atlas texture)
        packer.add_bin(atlas_width, atlas_height)

        # Add rectangles (sprites with padding)
        for sprite in self.sprites:
            w = sprite.trimmed_image.width + padding * 2
            h = sprite.trimmed_image.height + padding * 2
            packer.add_rect(w, h, rid=sprite)

        # Pack
        packer.pack()

        # Check if all sprites fit
        all_rects = packer.rect_list()
        if len(all_rects) < len(self.sprites):
            print(f"Warning: Only {len(all_rects)}/{len(self.sprites)} sprites fit in atlas")
            print(f"Consider increasing atlas size or using multiple atlases")

        return all_rects

    def create_atlas_image(self, packed_rects):
        """Create final atlas image with packed sprites"""
        print("Creating atlas image...")

        atlas_width = self.config.get('texture_size', {}).get('width', 2048)
        atlas_height = self.config.get('texture_size', {}).get('height', 2048)
        padding = self.config.get('padding', {}).get('pixels', 2)
        padding_type = self.config.get('padding', {}).get('type', 'edge_extrusion')

        # Create atlas image
        self.atlas_image = Image.new('RGBA', (atlas_width, atlas_height), (0, 0, 0, 0))

        # Place sprites
        self.metadata = {
            'meta': {
                'size': {'w': atlas_width, 'h': atlas_height},
                'scale': 1
            },
            'frames': {}
        }

        for bin_index, x, y, w, h, sprite in packed_rects:
            # Account for padding
            sprite_x = x + padding
            sprite_y = y + padding
            sprite_w = sprite.trimmed_image.width
            sprite_h = sprite.trimmed_image.height

            # Paste sprite
            self.atlas_image.paste(sprite.trimmed_image, (sprite_x, sprite_y))

            # Apply padding (edge extrusion or transparent)
            if padding_type == 'edge_extrusion' and padding > 0:
                self._apply_edge_extrusion(sprite_x, sprite_y, sprite_w, sprite_h, padding)

            # Store metadata
            frame_data = {
                'frame': {'x': sprite_x, 'y': sprite_y, 'w': sprite_w, 'h': sprite_h},
                'rotated': False,
                'trimmed': self.config.get('trim_sprites', True),
                'spriteSourceSize': {
                    'x': sprite.trimmed_rect[0],
                    'y': sprite.trimmed_rect[1],
                    'w': sprite_w,
                    'h': sprite_h
                },
                'sourceSize': {'w': sprite.original_size[0], 'h': sprite.original_size[1]},
                'pivot': {'x': 0.5, 'y': 0.5}
            }

            self.metadata['frames'][sprite.name] = frame_data

        print(f"Packed {len(packed_rects)} sprites into {atlas_width}x{atlas_height} atlas")

    def _apply_edge_extrusion(self, x, y, w, h, padding):
        """Apply edge extrusion padding to prevent bleeding"""
        # Top edge
        if padding > 0 and y > 0:
            top_edge = self.atlas_image.crop((x, y, x + w, y + 1))
            for i in range(padding):
                self.atlas_image.paste(top_edge, (x, y - i - 1))

        # Bottom edge
        if padding > 0 and y + h < self.atlas_image.height:
            bottom_edge = self.atlas_image.crop((x, y + h - 1, x + w, y + h))
            for i in range(padding):
                self.atlas_image.paste(bottom_edge, (x, y + h + i))

        # Left edge
        if padding > 0 and x > 0:
            left_edge = self.atlas_image.crop((x, y, x + 1, y + h))
            for i in range(padding):
                self.atlas_image.paste(left_edge, (x - i - 1, y))

        # Right edge
        if padding > 0 and x + w < self.atlas_image.width:
            right_edge = self.atlas_image.crop((x + w - 1, y, x + w, y + h))
            for i in range(padding):
                self.atlas_image.paste(right_edge, (x + w + i, y))

    def save_atlas(self, output_path):
        """Save atlas image and metadata"""
        print(f"Saving atlas to {output_path}...")

        # Save image
        self.atlas_image.save(output_path, 'PNG', optimize=True)

        # Save metadata
        metadata_path = Path(output_path).with_suffix('.json')
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=2)

        print(f"Atlas saved: {output_path}")
        print(f"Metadata saved: {metadata_path}")

        # Print statistics
        atlas_size = os.path.getsize(output_path) / 1024 / 1024
        print(f"\nAtlas Statistics:")
        print(f"  Texture Size: {self.atlas_image.width}x{self.atlas_image.height}")
        print(f"  Sprite Count: {len(self.metadata['frames'])}")
        print(f"  File Size: {atlas_size:.2f} MB")

        # Calculate packing efficiency
        total_sprite_area = sum(
            frame['frame']['w'] * frame['frame']['h']
            for frame in self.metadata['frames'].values()
        )
        atlas_area = self.atlas_image.width * self.atlas_image.height
        efficiency = (total_sprite_area / atlas_area) * 100
        print(f"  Packing Efficiency: {efficiency:.1f}%")


def load_config(config_path):
    """Load configuration from JSON file"""
    if config_path and Path(config_path).exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}


def main():
    parser = argparse.ArgumentParser(description='Generate texture atlas from sprites')
    parser.add_argument('--input', required=True, help='Input directory containing sprites')
    parser.add_argument('--output', required=True, help='Output atlas image path')
    parser.add_argument('--config', help='Configuration JSON file')
    parser.add_argument('--size', type=int, default=2048, help='Atlas size (width and height)')
    parser.add_argument('--padding', type=int, default=2, help='Padding between sprites (pixels)')

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    # Override with command-line arguments
    if 'texture_size' not in config:
        config['texture_size'] = {}
    config['texture_size']['width'] = args.size
    config['texture_size']['height'] = args.size

    if 'padding' not in config:
        config['padding'] = {}
    config['padding']['pixels'] = args.padding

    # Generate atlas
    generator = AtlasGenerator(config)
    generator.load_sprites(args.input)
    generator.remove_duplicates()
    packed_rects = generator.pack_sprites()
    generator.create_atlas_image(packed_rects)
    generator.save_atlas(args.output)

    print("\nAtlas generation complete!")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Sprite Animation Processing Script

Processes sprite animation frames into optimized sprite sheets with metadata.
Supports frame cropping, duplicate removal, and sprite sheet packing.

Requirements:
    pip install Pillow rectpack

Usage:
    python process_animation.py --input frames/ --output anim.png --metadata anim.json
    python process_animation.py --config animation_pipeline/config.json
"""

import argparse
import json
import sys
from pathlib import Path
from PIL import Image
import hashlib

try:
    import rectpack
except ImportError:
    print("Error: rectpack library required. Install with: pip install rectpack")
    sys.exit(1)


class AnimationFrame:
    """Represents a single animation frame"""
    def __init__(self, path, image, index):
        self.path = path
        self.name = Path(path).stem
        self.image = image
        self.index = index
        self.original_size = image.size
        self.cropped_image = None
        self.crop_rect = None  # (x, y, w, h) within original
        self.hash = None

    def calculate_hash(self):
        """Calculate image hash for duplicate detection"""
        self.hash = hashlib.md5(self.image.tobytes()).hexdigest()

    def crop_to_content(self):
        """Crop frame to minimal bounding box"""
        bbox = self.image.getbbox()
        if bbox:
            self.cropped_image = self.image.crop(bbox)
            self.crop_rect = bbox
        else:
            # Fully transparent
            self.cropped_image = self.image
            self.crop_rect = (0, 0, self.image.width, self.image.height)


class AnimationProcessor:
    """Processes sprite animations into sprite sheets"""

    def __init__(self, config):
        self.config = config
        self.frames = []
        self.unique_frames = []
        self.frame_map = {}  # Maps original frame index to unique frame index
        self.sprite_sheet = None
        self.metadata = {}

    def load_frames(self, input_dir):
        """Load animation frames from directory"""
        print(f"Loading animation frames from {input_dir}...")

        input_path = Path(input_dir)
        if not input_path.exists():
            print(f"Error: Input directory {input_dir} does not exist")
            sys.exit(1)

        # Find all image files
        image_files = sorted(input_path.glob('*.png'))
        image_files.extend(sorted(input_path.glob('*.jpg')))

        for index, img_path in enumerate(sorted(image_files)):
            try:
                img = Image.open(img_path)
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')

                frame = AnimationFrame(str(img_path), img, index)
                frame.calculate_hash()
                frame.crop_to_content()

                self.frames.append(frame)
                print(f"  Frame {index}: {frame.name} ({frame.original_size[0]}x{frame.original_size[1]})")

            except Exception as e:
                print(f"  Warning: Failed to load {img_path}: {e}")

        print(f"Loaded {len(self.frames)} frames")

    def remove_duplicates(self):
        """Remove duplicate frames and create frame mapping"""
        print("\nChecking for duplicate frames...")

        seen_hashes = {}
        duplicates = 0

        for frame in self.frames:
            if frame.hash in seen_hashes:
                # Duplicate frame
                unique_frame_index = seen_hashes[frame.hash]
                self.frame_map[frame.index] = unique_frame_index
                duplicates += 1
                print(f"  Frame {frame.index} is duplicate of frame {unique_frame_index}")
            else:
                # Unique frame
                unique_frame_index = len(self.unique_frames)
                seen_hashes[frame.hash] = unique_frame_index
                self.frame_map[frame.index] = unique_frame_index
                self.unique_frames.append(frame)

        print(f"Removed {duplicates} duplicate frames")
        print(f"Unique frames: {len(self.unique_frames)}")

    def pack_frames(self):
        """Pack frames into sprite sheet"""
        print("\nPacking frames into sprite sheet...")

        sheet_size = self.config.get('texture_size', 2048)
        padding = self.config.get('padding', 2)

        # Create packer
        packer = rectpack.newPacker(mode=rectpack.PackingMode.Offline)
        packer.add_bin(sheet_size, sheet_size)

        # Add rectangles
        for frame in self.unique_frames:
            w = frame.cropped_image.width + padding * 2
            h = frame.cropped_image.height + padding * 2
            packer.add_rect(w, h, rid=frame)

        # Pack
        packer.pack()

        packed_rects = packer.rect_list()
        if len(packed_rects) < len(self.unique_frames):
            print(f"Warning: Only {len(packed_rects)}/{len(self.unique_frames)} frames fit")

        return packed_rects, sheet_size

    def create_sprite_sheet(self, packed_rects, sheet_size):
        """Create sprite sheet image"""
        print("Creating sprite sheet...")

        padding = self.config.get('padding', 2)

        # Create sprite sheet
        self.sprite_sheet = Image.new('RGBA', (sheet_size, sheet_size), (0, 0, 0, 0))

        # Place frames
        for bin_idx, x, y, w, h, frame in packed_rects:
            # Account for padding
            frame_x = x + padding
            frame_y = y + padding

            # Paste frame
            self.sprite_sheet.paste(frame.cropped_image, (frame_x, frame_y))

            # Store position for this frame
            frame.atlas_x = frame_x
            frame.atlas_y = frame_y

        print(f"Sprite sheet created: {sheet_size}x{sheet_size}")

    def generate_metadata(self, frame_duration, loop):
        """Generate animation metadata"""
        print("Generating metadata...")

        # Build frame list (accounting for duplicates)
        frame_list = []

        for original_index in range(len(self.frames)):
            unique_index = self.frame_map[original_index]
            unique_frame = self.unique_frames[unique_index]

            frame_data = {
                'index': original_index,
                'unique_index': unique_index,
                'x': unique_frame.atlas_x,
                'y': unique_frame.atlas_y,
                'w': unique_frame.cropped_image.width,
                'h': unique_frame.cropped_image.height,
                'duration': frame_duration,
                'source_size': {
                    'w': unique_frame.original_size[0],
                    'h': unique_frame.original_size[1]
                },
                'offset': {
                    'x': unique_frame.crop_rect[0],
                    'y': unique_frame.crop_rect[1]
                }
            }

            frame_list.append(frame_data)

        self.metadata = {
            'animation': self.config.get('animation_name', 'animation'),
            'frame_count': len(frame_list),
            'unique_frame_count': len(self.unique_frames),
            'loop': loop,
            'texture': self.config.get('output_texture', 'sprite_sheet.png'),
            'frames': frame_list
        }

    def save(self, output_texture, output_metadata):
        """Save sprite sheet and metadata"""
        print(f"\nSaving sprite sheet to {output_texture}...")
        output_texture_path = Path(output_texture)
        output_texture_path.parent.mkdir(parents=True, exist_ok=True)

        self.sprite_sheet.save(output_texture, 'PNG', optimize=True)

        print(f"Saving metadata to {output_metadata}...")
        with open(output_metadata, 'w') as f:
            json.dump(self.metadata, f, indent=2)

        print("\nAnimation processing complete!")
        print(f"  Frames: {self.metadata['frame_count']} ({self.metadata['unique_frame_count']} unique)")
        print(f"  Texture: {output_texture}")
        print(f"  Metadata: {output_metadata}")


def load_config(config_path):
    """Load configuration from JSON file"""
    if config_path and Path(config_path).exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}


def main():
    parser = argparse.ArgumentParser(description='Process sprite animation frames')
    parser.add_argument('--input', help='Input directory containing animation frames')
    parser.add_argument('--output', help='Output sprite sheet image')
    parser.add_argument('--metadata', help='Output metadata JSON file')
    parser.add_argument('--config', help='Configuration JSON file')
    parser.add_argument('--duration', type=float, default=0.1, help='Frame duration (seconds)')
    parser.add_argument('--loop', action='store_true', help='Animation loops')

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    if args.config:
        # Config mode: process all animations in config
        animations = config.get('animations', {})

        if not animations:
            print("Error: No animations defined in config")
            sys.exit(1)

        for anim_name, anim_config in animations.items():
            print(f"\n{'='*60}")
            print(f"Processing animation: {anim_name}")
            print(f"{'='*60}")

            # Merge with global output config
            processor_config = {
                'animation_name': anim_name,
                'texture_size': config.get('output', {}).get('texture_size', 2048),
                'padding': config.get('output', {}).get('padding', 2),
            }

            processor = AnimationProcessor(processor_config)

            # Load frames
            source_dir = anim_config.get('source_directory')
            if not source_dir:
                print(f"Error: No source_directory specified for {anim_name}")
                continue

            processor.load_frames(source_dir)

            # Process
            if config.get('optimization', {}).get('remove_duplicates', True):
                processor.remove_duplicates()
            else:
                # No duplicate removal, direct mapping
                processor.unique_frames = processor.frames
                processor.frame_map = {i: i for i in range(len(processor.frames))}

            packed_rects, sheet_size = processor.pack_frames()
            processor.create_sprite_sheet(packed_rects, sheet_size)

            # Generate metadata
            frame_duration = anim_config.get('frame_duration', 0.1)
            loop = anim_config.get('loop', False)
            processor.generate_metadata(frame_duration, loop)

            # Save
            output_dir = config.get('output', {}).get('directory', 'processed')
            output_texture = f"{output_dir}/{anim_name}.png"
            output_metadata = f"{output_dir}/{anim_name}.json"
            processor.config['output_texture'] = output_texture

            processor.save(output_texture, output_metadata)

    else:
        # Single animation mode
        if not args.input or not args.output or not args.metadata:
            print("Error: --input, --output, and --metadata required without --config")
            sys.exit(1)

        processor_config = {
            'animation_name': Path(args.input).name,
            'texture_size': 2048,
            'padding': 2,
            'output_texture': args.output
        }

        processor = AnimationProcessor(processor_config)
        processor.load_frames(args.input)
        processor.remove_duplicates()
        packed_rects, sheet_size = processor.pack_frames()
        processor.create_sprite_sheet(packed_rects, sheet_size)
        processor.generate_metadata(args.duration, args.loop)
        processor.save(args.output, args.metadata)


if __name__ == '__main__':
    main()

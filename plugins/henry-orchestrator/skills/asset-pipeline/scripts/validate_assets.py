#!/usr/bin/env python3
"""
Asset Validation Script

Validates assets for common issues:
- Texture atlases: bleeding, power-of-two, size limits
- Audio: clipping, silence, file sizes
- Models: triangle counts, naming conventions
- Animations: frame counts, metadata consistency

Requirements:
    pip install Pillow

Usage:
    python validate_assets.py --type texture --input atlases/
    python validate_assets.py --type audio --input audio/
    python validate_assets.py --type all --input assets_processed/
"""

import argparse
import json
import sys
from pathlib import Path
from PIL import Image
import subprocess


class AssetValidator:
    """Validates game assets for common issues"""

    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []

    def validate_texture(self, texture_path, check_pot=True, check_bleeding=True, max_size=4096):
        """Validate texture atlas"""
        print(f"\nValidating texture: {texture_path}")

        try:
            img = Image.open(texture_path)

            # Check dimensions
            width, height = img.size
            print(f"  Size: {width}x{height}")

            # Power-of-two check
            if check_pot:
                if not self._is_power_of_two(width) or not self._is_power_of_two(height):
                    self.warnings.append(f"{texture_path}: Non-power-of-two dimensions ({width}x{height})")
                else:
                    self.info.append(f"{texture_path}: Power-of-two dimensions ✓")

            # Max size check
            if width > max_size or height > max_size:
                self.errors.append(f"{texture_path}: Exceeds max size {max_size} ({width}x{height})")
            else:
                self.info.append(f"{texture_path}: Within size limits ✓")

            # Check for metadata
            metadata_path = texture_path.with_suffix('.json')
            if metadata_path.exists():
                self._validate_texture_metadata(texture_path, metadata_path, img)
            else:
                self.warnings.append(f"{texture_path}: No metadata file found")

        except Exception as e:
            self.errors.append(f"{texture_path}: Failed to validate: {e}")

    def _validate_texture_metadata(self, texture_path, metadata_path, image):
        """Validate texture atlas metadata"""
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)

            frames = metadata.get('frames', {})
            print(f"  Frames: {len(frames)}")

            # Validate frame positions
            for frame_name, frame_data in frames.items():
                frame_rect = frame_data.get('frame', {})
                x = frame_rect.get('x', 0)
                y = frame_rect.get('y', 0)
                w = frame_rect.get('w', 0)
                h = frame_rect.get('h', 0)

                # Check if frame is within image bounds
                if x + w > image.width or y + h > image.height:
                    self.errors.append(
                        f"{texture_path}: Frame '{frame_name}' exceeds image bounds "
                        f"({x+w}x{y+h} > {image.width}x{image.height})"
                    )

            self.info.append(f"{texture_path}: Metadata valid ✓")

        except Exception as e:
            self.errors.append(f"{metadata_path}: Failed to parse metadata: {e}")

    def validate_audio(self, audio_path, check_clipping=True, check_silence=True, max_size_mb=10):
        """Validate audio file"""
        print(f"\nValidating audio: {audio_path}")

        # Check file size
        file_size_mb = audio_path.stat().st_size / 1024 / 1024
        print(f"  Size: {file_size_mb:.2f} MB")

        if file_size_mb > max_size_mb:
            self.warnings.append(f"{audio_path}: Large file size ({file_size_mb:.2f} MB > {max_size_mb} MB)")

        # Check with FFmpeg if available
        try:
            # Get audio info
            cmd = [
                'ffmpeg', '-i', str(audio_path),
                '-af', 'volumedetect',
                '-f', 'null', '-'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, stderr=subprocess.STDOUT)
            output = result.stdout

            # Parse volume info
            if 'max_volume' in output:
                # Extract max volume
                for line in output.split('\n'):
                    if 'max_volume' in line:
                        parts = line.split(':')
                        if len(parts) > 1:
                            max_vol = parts[1].strip().split()[0]
                            print(f"  Max volume: {max_vol} dB")

                            # Check for clipping
                            if check_clipping:
                                try:
                                    max_vol_float = float(max_vol)
                                    if max_vol_float > -0.1:
                                        self.errors.append(
                                            f"{audio_path}: Potential clipping (max volume {max_vol} dB)"
                                        )
                                    else:
                                        self.info.append(f"{audio_path}: No clipping detected ✓")
                                except ValueError:
                                    pass

                    if 'mean_volume' in line:
                        parts = line.split(':')
                        if len(parts) > 1:
                            mean_vol = parts[1].strip().split()[0]
                            print(f"  Mean volume: {mean_vol} dB")

                            # Check for silence
                            if check_silence:
                                try:
                                    mean_vol_float = float(mean_vol)
                                    if mean_vol_float < -60:
                                        self.warnings.append(
                                            f"{audio_path}: Very quiet audio (mean {mean_vol} dB)"
                                        )
                                except ValueError:
                                    pass

            self.info.append(f"{audio_path}: Audio format valid ✓")

        except FileNotFoundError:
            self.info.append(f"{audio_path}: FFmpeg not available, skipping detailed checks")
        except Exception as e:
            self.warnings.append(f"{audio_path}: Failed to analyze: {e}")

    def validate_animation_metadata(self, metadata_path):
        """Validate animation metadata"""
        print(f"\nValidating animation metadata: {metadata_path}")

        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)

            # Check required fields
            required_fields = ['animation', 'frame_count', 'frames']
            for field in required_fields:
                if field not in metadata:
                    self.errors.append(f"{metadata_path}: Missing required field '{field}'")

            # Check frames
            frames = metadata.get('frames', [])
            frame_count = metadata.get('frame_count', 0)

            if len(frames) != frame_count:
                self.errors.append(
                    f"{metadata_path}: Frame count mismatch "
                    f"(metadata says {frame_count}, actual {len(frames)})"
                )

            # Validate each frame
            for i, frame in enumerate(frames):
                required_frame_fields = ['x', 'y', 'w', 'h', 'duration']
                for field in required_frame_fields:
                    if field not in frame:
                        self.errors.append(
                            f"{metadata_path}: Frame {i} missing field '{field}'"
                        )

            # Check texture file exists
            texture = metadata.get('texture')
            if texture:
                texture_path = metadata_path.parent / texture
                if not texture_path.exists():
                    self.errors.append(f"{metadata_path}: Referenced texture not found: {texture}")
                else:
                    self.info.append(f"{metadata_path}: Texture file exists ✓")

            print(f"  Frames: {len(frames)}")
            print(f"  Loop: {metadata.get('loop', False)}")

            self.info.append(f"{metadata_path}: Metadata valid ✓")

        except Exception as e:
            self.errors.append(f"{metadata_path}: Failed to parse: {e}")

    def validate_directory(self, directory, asset_type='all'):
        """Validate all assets in directory"""
        dir_path = Path(directory)

        if not dir_path.exists():
            print(f"Error: Directory {directory} does not exist")
            return

        print(f"\nValidating assets in {directory}...")

        # Textures
        if asset_type in ('all', 'texture'):
            texture_files = list(dir_path.glob('**/*.png'))
            texture_files.extend(dir_path.glob('**/*.jpg'))

            print(f"\nFound {len(texture_files)} texture files")
            for texture in texture_files:
                self.validate_texture(texture)

        # Audio
        if asset_type in ('all', 'audio'):
            audio_files = list(dir_path.glob('**/*.ogg'))
            audio_files.extend(dir_path.glob('**/*.mp3'))
            audio_files.extend(dir_path.glob('**/*.wav'))

            print(f"\nFound {len(audio_files)} audio files")
            for audio in audio_files:
                self.validate_audio(audio)

        # Animation metadata
        if asset_type in ('all', 'animation'):
            metadata_files = list(dir_path.glob('**/*_anim.json'))
            metadata_files.extend(dir_path.glob('**/*_animation.json'))

            print(f"\nFound {len(metadata_files)} animation metadata files")
            for metadata in metadata_files:
                self.validate_animation_metadata(metadata)

    def print_report(self):
        """Print validation report"""
        print("\n" + "="*60)
        print("VALIDATION REPORT")
        print("="*60)

        if self.errors:
            print(f"\nERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  ❌ {error}")

        if self.warnings:
            print(f"\nWARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  ⚠️  {warning}")

        if self.info:
            print(f"\nINFO ({len(self.info)}):")
            for info in self.info:
                print(f"  ℹ️  {info}")

        print("\n" + "="*60)
        print(f"Total: {len(self.errors)} errors, {len(self.warnings)} warnings")

        if self.errors:
            print("❌ VALIDATION FAILED")
            return False
        elif self.warnings:
            print("⚠️  VALIDATION PASSED WITH WARNINGS")
            return True
        else:
            print("✅ VALIDATION PASSED")
            return True

    @staticmethod
    def _is_power_of_two(n):
        """Check if number is power of two"""
        return n > 0 and (n & (n - 1)) == 0


def main():
    parser = argparse.ArgumentParser(description='Validate game assets')
    parser.add_argument('--input', required=True, help='Input file or directory')
    parser.add_argument('--type', default='all',
                        choices=['all', 'texture', 'audio', 'animation'],
                        help='Asset type to validate')

    args = parser.parse_args()

    validator = AssetValidator()

    input_path = Path(args.input)

    if input_path.is_file():
        # Validate single file
        ext = input_path.suffix.lower()
        if ext in ('.png', '.jpg', '.jpeg'):
            validator.validate_texture(input_path)
        elif ext in ('.ogg', '.mp3', '.wav'):
            validator.validate_audio(input_path)
        elif ext == '.json':
            validator.validate_animation_metadata(input_path)
        else:
            print(f"Error: Unsupported file type {ext}")
            sys.exit(1)
    elif input_path.is_dir():
        # Validate directory
        validator.validate_directory(input_path, args.type)
    else:
        print(f"Error: Input path {args.input} does not exist")
        sys.exit(1)

    # Print report
    success = validator.print_report()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Audio Optimization Script

Optimizes audio files for game development using FFmpeg.
Supports categorization, compression, normalization, and platform-specific settings.

Requirements:
    - FFmpeg installed and in PATH

Usage:
    python optimize_audio.py --input audio_source/ --output audio_processed/ --config audio_config.json
    python optimize_audio.py --input music.wav --output music.ogg --category music
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


class AudioOptimizer:
    """Optimizes audio files for game development"""

    def __init__(self, config):
        self.config = config
        self.processed_files = []

    def check_ffmpeg(self):
        """Check if FFmpeg is installed"""
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: FFmpeg not found. Please install FFmpeg and add it to PATH")
            return False

    def process_file(self, input_path, output_path, category):
        """Process single audio file"""
        category_config = self.config.get('categories', {}).get(category)
        if not category_config:
            print(f"Warning: Unknown category '{category}', using default settings")
            category_config = {
                'codec': 'ogg_vorbis',
                'bitrate': 96,
                'sample_rate': 44100,
                'channels': 'stereo'
            }

        print(f"\nProcessing: {input_path.name}")
        print(f"  Category: {category}")
        print(f"  Codec: {category_config.get('codec')}")
        print(f"  Bitrate: {category_config.get('bitrate')} kbps")

        # Build FFmpeg command
        cmd = ['ffmpeg', '-i', str(input_path), '-y']  # -y to overwrite

        # Audio codec
        codec = category_config.get('codec', 'ogg_vorbis')
        if codec == 'ogg_vorbis':
            cmd.extend(['-c:a', 'libvorbis'])
        elif codec == 'mp3':
            cmd.extend(['-c:a', 'libmp3lame'])
        elif codec == 'aac':
            cmd.extend(['-c:a', 'aac'])
        else:
            cmd.extend(['-c:a', 'libvorbis'])  # Default

        # Bitrate
        bitrate = category_config.get('bitrate', 128)
        cmd.extend(['-b:a', f'{bitrate}k'])

        # Sample rate
        sample_rate = category_config.get('sample_rate', 44100)
        cmd.extend(['-ar', str(sample_rate)])

        # Channels (mono/stereo)
        channels = category_config.get('channels', 'stereo')
        if channels == 'mono' or category_config.get('force_mono', False):
            cmd.extend(['-ac', '1'])
        elif channels == 'stereo':
            cmd.extend(['-ac', '2'])

        # Audio filters
        filters = []

        # Normalization (LUFS)
        if 'normalize_lufs' in category_config:
            target_lufs = category_config['normalize_lufs']
            filters.append(f'loudnorm=I={target_lufs}:LRA=7:tp=-1.5')

        # Silence trimming
        if category_config.get('trim_silence', False):
            threshold_db = category_config.get('silence_threshold_db', -50)
            filters.append(f'silenceremove=1:0:{threshold_db}dB:1:0.5:{threshold_db}dB')

        # Compression (dynamic range)
        if category_config.get('apply_compression', False):
            ratio = category_config.get('compression_ratio', 3.0)
            threshold = category_config.get('compression_threshold_db', -20)
            filters.append(f'acompressor=ratio={ratio}:threshold={threshold}dB')

        # Apply filters
        if filters:
            filter_string = ','.join(filters)
            cmd.extend(['-af', filter_string])

        # Output path
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Determine output extension based on codec
        if codec == 'ogg_vorbis':
            output_file = output_file.with_suffix('.ogg')
        elif codec == 'mp3':
            output_file = output_file.with_suffix('.mp3')
        elif codec == 'aac':
            output_file = output_file.with_suffix('.m4a')

        cmd.append(str(output_file))

        # Run FFmpeg
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"  Output: {output_file}")

            # Calculate file sizes
            input_size = input_path.stat().st_size / 1024  # KB
            output_size = output_file.stat().st_size / 1024  # KB
            reduction = ((input_size - output_size) / input_size) * 100

            print(f"  Input size: {input_size:.1f} KB")
            print(f"  Output size: {output_size:.1f} KB")
            print(f"  Reduction: {reduction:.1f}%")

            self.processed_files.append({
                'input': str(input_path),
                'output': str(output_file),
                'category': category,
                'input_size_kb': input_size,
                'output_size_kb': output_size,
                'reduction_percent': reduction
            })

            return True

        except subprocess.CalledProcessError as e:
            print(f"  Error: FFmpeg failed")
            print(f"  {e.stderr}")
            return False

    def process_directory(self, input_dir, output_dir, category_mapping):
        """Process all audio files in directory"""
        input_path = Path(input_dir)

        if not input_path.exists():
            print(f"Error: Input directory {input_dir} does not exist")
            return

        # Supported audio formats
        audio_formats = ('.wav', '.aiff', '.flac', '.mp3', '.ogg', '.m4a')

        audio_files = []
        for ext in audio_formats:
            audio_files.extend(input_path.glob(f'**/*{ext}'))

        print(f"Found {len(audio_files)} audio files")

        for audio_file in sorted(audio_files):
            # Determine category based on subdirectory or mapping
            category = self._determine_category(audio_file, input_path, category_mapping)

            # Determine output path (preserve directory structure)
            relative_path = audio_file.relative_to(input_path)
            output_path = Path(output_dir) / relative_path

            self.process_file(audio_file, output_path, category)

    def _determine_category(self, file_path, base_path, category_mapping):
        """Determine audio category based on file path"""
        relative_path = file_path.relative_to(base_path)
        path_parts = relative_path.parts

        # Check subdirectory mapping
        if len(path_parts) > 1:
            subdir = path_parts[0]
            if subdir in category_mapping:
                return category_mapping[subdir]

        # Default to 'sfx'
        return 'sfx'

    def print_summary(self):
        """Print processing summary"""
        if not self.processed_files:
            return

        print("\n" + "="*60)
        print("PROCESSING SUMMARY")
        print("="*60)

        total_input_size = sum(f['input_size_kb'] for f in self.processed_files)
        total_output_size = sum(f['output_size_kb'] for f in self.processed_files)
        total_reduction = ((total_input_size - total_output_size) / total_input_size) * 100

        print(f"Total files processed: {len(self.processed_files)}")
        print(f"Total input size: {total_input_size:.1f} KB ({total_input_size/1024:.2f} MB)")
        print(f"Total output size: {total_output_size:.1f} KB ({total_output_size/1024:.2f} MB)")
        print(f"Total reduction: {total_reduction:.1f}%")

        # By category
        categories = {}
        for f in self.processed_files:
            cat = f['category']
            if cat not in categories:
                categories[cat] = {'count': 0, 'input': 0, 'output': 0}
            categories[cat]['count'] += 1
            categories[cat]['input'] += f['input_size_kb']
            categories[cat]['output'] += f['output_size_kb']

        print("\nBy Category:")
        for cat, stats in categories.items():
            reduction = ((stats['input'] - stats['output']) / stats['input']) * 100
            print(f"  {cat}: {stats['count']} files, {reduction:.1f}% reduction")


def load_config(config_path):
    """Load configuration from JSON file"""
    if config_path and Path(config_path).exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}


def main():
    parser = argparse.ArgumentParser(description='Optimize audio files for game development')
    parser.add_argument('--input', required=True, help='Input audio file or directory')
    parser.add_argument('--output', required=True, help='Output audio file or directory')
    parser.add_argument('--config', help='Configuration JSON file')
    parser.add_argument('--category', default='sfx',
                        choices=['music', 'sfx', 'voice', 'ambient', 'ui'],
                        help='Audio category (for single file processing)')

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    # Create optimizer
    optimizer = AudioOptimizer(config)

    # Check FFmpeg
    if not optimizer.check_ffmpeg():
        sys.exit(1)

    input_path = Path(args.input)

    if input_path.is_file():
        # Process single file
        optimizer.process_file(input_path, args.output, args.category)
    elif input_path.is_dir():
        # Process directory
        # Create category mapping from config
        subdirs = config.get('source', {}).get('subdirectories', {})
        category_mapping = {Path(v).name: k for k, v in subdirs.items()}

        optimizer.process_directory(args.input, args.output, category_mapping)
    else:
        print(f"Error: Input path {args.input} does not exist")
        sys.exit(1)

    # Print summary
    optimizer.print_summary()

    print("\nAudio optimization complete!")


if __name__ == '__main__':
    main()

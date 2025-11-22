#!/usr/bin/env python3
"""
Keyword Analyzer for App Store Optimization

This script analyzes keyword density and provides suggestions for optimizing
app store descriptions (particularly for Google Play Store where descriptions
are indexed for search).

Usage:
    python keyword-analyzer.py <description_file> [--keywords keyword1,keyword2,...]

Example:
    python keyword-analyzer.py description.txt --keywords meditation,mindfulness,sleep
"""

import argparse
import re
from collections import Counter
from typing import Dict, List, Tuple
import sys


def read_file(filepath: str) -> str:
    """Read content from file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)


def clean_text(text: str) -> str:
    """Clean text for analysis - remove special characters but keep words."""
    # Remove URLs
    text = re.sub(r'http\S+|www.\S+', '', text)
    # Remove emojis and special characters, keep alphanumeric and spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()


def extract_words(text: str) -> List[str]:
    """Extract individual words from text."""
    return [word for word in text.split() if len(word) > 2]  # Ignore words <= 2 chars


def extract_phrases(text: str, n: int = 2) -> List[str]:
    """Extract n-word phrases from text."""
    words = text.split()
    phrases = []
    for i in range(len(words) - n + 1):
        phrase = ' '.join(words[i:i+n])
        if all(len(word) > 2 for word in words[i:i+n]):  # Ignore short words
            phrases.append(phrase)
    return phrases


def calculate_keyword_density(text: str, keyword: str) -> float:
    """Calculate keyword density as percentage."""
    total_words = len(extract_words(text))
    keyword_words = len(keyword.split())

    if keyword_words == 1:
        keyword_count = text.split().count(keyword)
    else:
        # For phrases, count occurrences
        keyword_count = text.count(keyword)

    if total_words == 0:
        return 0.0

    density = (keyword_count * keyword_words / total_words) * 100
    return round(density, 2)


def find_keyword_positions(text: str, keyword: str) -> List[int]:
    """Find positions of keyword in text (word index)."""
    positions = []
    words = text.split()
    keyword_words = keyword.split()
    keyword_len = len(keyword_words)

    for i in range(len(words) - keyword_len + 1):
        if ' '.join(words[i:i+keyword_len]) == keyword:
            positions.append(i)

    return positions


def analyze_keyword_placement(text: str, keyword: str) -> Dict:
    """Analyze keyword placement in text."""
    positions = find_keyword_positions(text, keyword)
    total_words = len(text.split())

    if not positions:
        return {
            'count': 0,
            'positions': [],
            'in_first_250_chars': False,
            'distribution': 'None'
        }

    # Check if in first 250 characters
    first_250 = text[:250]
    in_first_250 = keyword in first_250

    # Analyze distribution
    if len(positions) == 1:
        distribution = 'Single occurrence'
    else:
        # Calculate distribution spread
        position_percentages = [pos / total_words for pos in positions]
        spread = max(position_percentages) - min(position_percentages)

        if spread > 0.5:
            distribution = 'Well distributed'
        elif spread > 0.25:
            distribution = 'Moderately distributed'
        else:
            distribution = 'Clustered'

    return {
        'count': len(positions),
        'positions': positions,
        'in_first_250_chars': in_first_250,
        'distribution': distribution
    }


def get_top_words(text: str, n: int = 20) -> List[Tuple[str, int]]:
    """Get top n most frequent words."""
    words = extract_words(text)

    # Common stop words to exclude
    stop_words = {
        'the', 'and', 'for', 'with', 'you', 'your', 'our', 'app', 'this',
        'that', 'from', 'can', 'all', 'are', 'has', 'have', 'will', 'more',
        'get', 'use', 'new', 'now', 'just', 'also', 'how', 'any', 'each',
        'into', 'them', 'than', 'been', 'were', 'many', 'some', 'these'
    }

    filtered_words = [word for word in words if word not in stop_words]
    counter = Counter(filtered_words)

    return counter.most_common(n)


def get_top_phrases(text: str, n: int = 10, phrase_length: int = 2) -> List[Tuple[str, int]]:
    """Get top n most frequent phrases."""
    phrases = extract_phrases(text, phrase_length)
    counter = Counter(phrases)
    return counter.most_common(n)


def analyze_description(description: str, target_keywords: List[str] = None) -> Dict:
    """Perform comprehensive analysis of app description."""
    cleaned = clean_text(description)

    # Basic stats
    original_length = len(description)
    word_count = len(extract_words(cleaned))

    # Keyword analysis
    keyword_analysis = {}
    if target_keywords:
        for keyword in target_keywords:
            keyword_lower = keyword.lower().strip()
            density = calculate_keyword_density(cleaned, keyword_lower)
            placement = analyze_keyword_placement(cleaned, keyword_lower)

            # Recommendations
            recommendations = []
            if density == 0:
                recommendations.append("Keyword not found - consider adding")
            elif density < 1:
                recommendations.append("Low density - consider adding more instances")
            elif density > 4:
                recommendations.append("High density - risk of keyword stuffing")

            if placement['count'] > 0 and not placement['in_first_250_chars']:
                recommendations.append("Not in first 250 chars - add earlier")

            if placement['count'] > 1 and placement['distribution'] == 'Clustered':
                recommendations.append("Clustered - distribute more evenly")

            keyword_analysis[keyword] = {
                'density': density,
                'count': placement['count'],
                'in_first_250': placement['in_first_250_chars'],
                'distribution': placement['distribution'],
                'recommendations': recommendations
            }

    # Top words and phrases
    top_words = get_top_words(cleaned, 20)
    top_2word_phrases = get_top_phrases(cleaned, 10, 2)
    top_3word_phrases = get_top_phrases(cleaned, 5, 3)

    return {
        'stats': {
            'character_count': original_length,
            'word_count': word_count,
            'first_250_chars': description[:250]
        },
        'keyword_analysis': keyword_analysis,
        'top_words': top_words,
        'top_2word_phrases': top_2word_phrases,
        'top_3word_phrases': top_3word_phrases
    }


def print_analysis(analysis: Dict):
    """Print formatted analysis results."""
    stats = analysis['stats']

    print("\n" + "="*70)
    print("APP STORE KEYWORD ANALYSIS")
    print("="*70)

    # Basic stats
    print("\n📊 BASIC STATISTICS")
    print("-" * 70)
    print(f"Character count: {stats['character_count']} / 4000")
    print(f"Word count: {stats['word_count']}")
    print(f"\nFirst 250 characters (critical for visibility):")
    print(f'"{stats["first_250_chars"]}..."')

    # Keyword analysis
    if analysis['keyword_analysis']:
        print("\n🎯 TARGET KEYWORD ANALYSIS")
        print("-" * 70)

        for keyword, data in analysis['keyword_analysis'].items():
            print(f"\nKeyword: '{keyword}'")
            print(f"  Occurrences: {data['count']}")
            print(f"  Density: {data['density']}% (optimal: 2-3%)")
            print(f"  In first 250 chars: {'✓ Yes' if data['in_first_250'] else '✗ No'}")
            print(f"  Distribution: {data['distribution']}")

            if data['recommendations']:
                print(f"  Recommendations:")
                for rec in data['recommendations']:
                    print(f"    • {rec}")
            else:
                print(f"  ✓ Optimization looks good")

    # Top words
    print("\n📈 TOP KEYWORDS (excluding common words)")
    print("-" * 70)
    print("Single words:")
    for word, count in analysis['top_words'][:15]:
        print(f"  {word:20} - {count:3} occurrences")

    # Top phrases
    print("\n📈 TOP 2-WORD PHRASES")
    print("-" * 70)
    for phrase, count in analysis['top_2word_phrases']:
        print(f"  {phrase:30} - {count:3} occurrences")

    print("\n📈 TOP 3-WORD PHRASES")
    print("-" * 70)
    for phrase, count in analysis['top_3word_phrases']:
        print(f"  {phrase:40} - {count:3} occurrences")

    # General recommendations
    print("\n💡 GENERAL RECOMMENDATIONS")
    print("-" * 70)

    if stats['character_count'] < 2000:
        print("  • Consider expanding description to utilize available space")
    elif stats['character_count'] > 3800:
        print("  • Description is near limit - ensure most important info is early")

    if analysis['keyword_analysis']:
        has_issues = any(
            data['recommendations']
            for data in analysis['keyword_analysis'].values()
        )
        if not has_issues:
            print("  ✓ Keyword optimization looks good!")
        else:
            print("  • Review keyword recommendations above")

    print("\n" + "="*70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description='Analyze keyword density and optimization for app store descriptions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python keyword-analyzer.py description.txt
  python keyword-analyzer.py description.txt --keywords meditation,mindfulness,sleep
  python keyword-analyzer.py description.txt -k "guided meditation,sleep sounds,anxiety relief"
        """
    )

    parser.add_argument(
        'file',
        help='Path to text file containing app description'
    )

    parser.add_argument(
        '-k', '--keywords',
        help='Comma-separated list of target keywords or phrases to analyze',
        default=None
    )

    args = parser.parse_args()

    # Read description
    description = read_file(args.file)

    # Parse keywords
    target_keywords = None
    if args.keywords:
        target_keywords = [kw.strip() for kw in args.keywords.split(',')]

    # Analyze
    analysis = analyze_description(description, target_keywords)

    # Print results
    print_analysis(analysis)


if __name__ == '__main__':
    main()

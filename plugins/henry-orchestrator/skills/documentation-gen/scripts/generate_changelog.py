#!/usr/bin/env python3
"""
Generate changelog from git commit history.

This script parses git commits using conventional commit format
and generates a CHANGELOG.md following Keep a Changelog format.
"""

import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple


# Conventional commit types to changelog categories
COMMIT_TYPE_MAP = {
    'feat': 'Added',
    'fix': 'Fixed',
    'docs': 'Changed',
    'style': 'Changed',
    'refactor': 'Changed',
    'perf': 'Changed',
    'test': None,  # Skip test commits
    'chore': None,  # Skip chore commits
    'build': 'Changed',
    'ci': None,  # Skip CI commits
    'revert': 'Fixed',
}


def parse_conventional_commit(message: str) -> Tuple[str, str, bool, str]:
    """
    Parse a conventional commit message.

    Args:
        message: Commit message

    Returns:
        Tuple of (type, scope, breaking, description)
    """
    # Match pattern: type(scope)!: description
    pattern = r'^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$'
    match = re.match(pattern, message)

    if match:
        commit_type, scope, breaking, description = match.groups()
        return commit_type, scope or '', bool(breaking), description.strip()

    # No conventional commit format, return as-is
    return '', '', False, message.strip()


def get_git_log(since_tag: str = None, until_tag: str = 'HEAD') -> List[Dict]:
    """
    Get git log with commit information.

    Args:
        since_tag: Starting tag/commit (exclusive)
        until_tag: Ending tag/commit (inclusive)

    Returns:
        List of commit dictionaries
    """
    # Build git log command
    git_range = f"{since_tag}..{until_tag}" if since_tag else until_tag
    cmd = [
        'git', 'log', git_range,
        '--pretty=format:%H%n%an%n%ae%n%ad%n%s%n%b%n---END---',
        '--date=short'
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running git log: {e}", file=sys.stderr)
        sys.exit(1)

    # Parse output
    commits = []
    lines = result.stdout.split('\n')
    i = 0

    while i < len(lines):
        if not lines[i]:
            i += 1
            continue

        commit_hash = lines[i]
        author = lines[i + 1]
        email = lines[i + 2]
        date = lines[i + 3]
        subject = lines[i + 4]

        # Read body until ---END---
        body_lines = []
        i += 5
        while i < len(lines) and lines[i] != '---END---':
            body_lines.append(lines[i])
            i += 1

        body = '\n'.join(body_lines).strip()

        # Check for breaking change in body
        breaking_in_body = 'BREAKING CHANGE:' in body or 'BREAKING-CHANGE:' in body

        # Parse conventional commit
        commit_type, scope, breaking, description = parse_conventional_commit(subject)

        # Extract issue numbers
        issues = re.findall(r'#(\d+)', subject + ' ' + body)

        commits.append({
            'hash': commit_hash,
            'author': author,
            'email': email,
            'date': date,
            'type': commit_type,
            'scope': scope,
            'breaking': breaking or breaking_in_body,
            'description': description,
            'body': body,
            'issues': issues,
        })

        i += 1

    return commits


def group_commits_by_category(commits: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Group commits by changelog category.

    Args:
        commits: List of commit dictionaries

    Returns:
        Dictionary mapping categories to commits
    """
    grouped = defaultdict(list)

    for commit in commits:
        commit_type = commit['type']
        category = COMMIT_TYPE_MAP.get(commit_type, 'Changed')

        # Skip commits with None category (test, chore, ci)
        if category is None:
            continue

        # Breaking changes go to separate category
        if commit['breaking']:
            grouped['Breaking Changes'].append(commit)
        else:
            grouped[category].append(commit)

    return dict(grouped)


def format_commit(commit: Dict) -> str:
    """
    Format a commit as a changelog entry.

    Args:
        commit: Commit dictionary

    Returns:
        Formatted changelog entry
    """
    description = commit['description']

    # Add scope if present
    if commit['scope']:
        description = f"**{commit['scope']}**: {description}"

    # Add issue references
    if commit['issues']:
        issue_refs = ', '.join(f"#{issue}" for issue in commit['issues'])
        description = f"{description} ({issue_refs})"

    # Mark breaking changes
    if commit['breaking']:
        description = f"**BREAKING:** {description}"

    return f"- {description}"


def generate_changelog_section(
    version: str,
    date: str,
    grouped_commits: Dict[str, List[Dict]]
) -> str:
    """
    Generate a changelog section for a version.

    Args:
        version: Version string
        date: Release date (YYYY-MM-DD)
        grouped_commits: Commits grouped by category

    Returns:
        Formatted changelog section
    """
    lines = [f"## [{version}] - {date}", ""]

    # Order of categories
    category_order = [
        'Breaking Changes',
        'Added',
        'Changed',
        'Deprecated',
        'Removed',
        'Fixed',
        'Security',
    ]

    for category in category_order:
        if category not in grouped_commits:
            continue

        commits = grouped_commits[category]
        if not commits:
            continue

        lines.append(f"### {category}")
        lines.append("")

        for commit in commits:
            lines.append(format_commit(commit))

        lines.append("")

    return '\n'.join(lines)


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Generate changelog from git history'
    )
    parser.add_argument(
        'range',
        nargs='?',
        help='Git range (e.g., v1.0.0..HEAD or v1.0.0..v2.0.0)'
    )
    parser.add_argument(
        '--version',
        default='Unreleased',
        help='Version for this changelog section'
    )
    parser.add_argument(
        '--date',
        default=datetime.now().strftime('%Y-%m-%d'),
        help='Release date (YYYY-MM-DD format)'
    )
    parser.add_argument(
        '--output',
        '-o',
        help='Output file (default: stdout)'
    )

    args = parser.parse_args()

    # Parse git range
    since_tag = None
    until_tag = 'HEAD'

    if args.range:
        if '..' in args.range:
            parts = args.range.split('..')
            since_tag = parts[0] if parts[0] else None
            until_tag = parts[1] if len(parts) > 1 and parts[1] else 'HEAD'
        else:
            since_tag = args.range

    # Get commits
    commits = get_git_log(since_tag, until_tag)

    if not commits:
        print("No commits found in range", file=sys.stderr)
        sys.exit(1)

    # Group commits
    grouped = group_commits_by_category(commits)

    # Generate changelog section
    changelog = generate_changelog_section(args.version, args.date, grouped)

    # Output
    if args.output:
        with open(args.output, 'w') as f:
            f.write(changelog)
        print(f"Changelog written to {args.output}", file=sys.stderr)
    else:
        print(changelog)


if __name__ == '__main__':
    main()

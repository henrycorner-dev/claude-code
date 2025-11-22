#!/usr/bin/env python3
"""
Extract JSDoc documentation from JavaScript/TypeScript files and generate markdown.

This script parses JSDoc comments from JS/TS files and generates
API documentation in markdown format.
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional


def parse_jsdoc_comment(comment: str) -> Dict:
    """
    Parse a JSDoc comment into structured format.

    Args:
        comment: Raw JSDoc comment text

    Returns:
        Dictionary with parsed JSDoc tags
    """
    # Remove comment delimiters and leading asterisks
    lines = []
    for line in comment.split('\n'):
        line = line.strip()
        if line.startswith('/**'):
            line = line[3:].strip()
        elif line.startswith('*/'):
            continue
        elif line.startswith('*'):
            line = line[1:].strip()
        lines.append(line)

    text = '\n'.join(lines)

    parsed = {
        'description': '',
        'params': [],
        'returns': None,
        'throws': [],
        'examples': [],
        'since': None,
        'deprecated': None,
        'see': [],
    }

    # Extract description (everything before first tag)
    parts = re.split(r'\n\s*@', text, 1)
    if parts:
        parsed['description'] = parts[0].strip()

    if len(parts) < 2:
        return parsed

    # Parse tags
    tags_text = '@' + parts[1]
    tag_pattern = r'@(\w+)(?:\s+(.+?))?(?=\n\s*@|\Z)'

    for match in re.finditer(tag_pattern, tags_text, re.DOTALL):
        tag_name, tag_value = match.groups()
        tag_value = tag_value.strip() if tag_value else ''

        if tag_name in ['param', 'arg', 'argument']:
            # Parse: @param {type} name - description
            param_match = re.match(
                r'\{([^}]+)\}\s+(\[?)(\w+)(\]?)\s*-?\s*(.+)?',
                tag_value,
                re.DOTALL
            )
            if param_match:
                type_str, opt_open, name, opt_close, desc = param_match.groups()
                optional = bool(opt_open and opt_close)
                parsed['params'].append({
                    'name': name,
                    'type': type_str,
                    'optional': optional,
                    'description': desc.strip() if desc else ''
                })

        elif tag_name in ['returns', 'return']:
            # Parse: @returns {type} description
            return_match = re.match(r'\{([^}]+)\}\s*(.+)?', tag_value, re.DOTALL)
            if return_match:
                type_str, desc = return_match.groups()
                parsed['returns'] = {
                    'type': type_str,
                    'description': desc.strip() if desc else ''
                }

        elif tag_name == 'throws':
            # Parse: @throws {ErrorType} description
            throws_match = re.match(r'\{([^}]+)\}\s*(.+)?', tag_value, re.DOTALL)
            if throws_match:
                type_str, desc = throws_match.groups()
                parsed['throws'].append({
                    'type': type_str,
                    'description': desc.strip() if desc else ''
                })

        elif tag_name in ['example', 'examples']:
            parsed['examples'].append(tag_value)

        elif tag_name == 'since':
            parsed['since'] = tag_value

        elif tag_name == 'deprecated':
            parsed['deprecated'] = tag_value

        elif tag_name == 'see':
            parsed['see'].append(tag_value)

    return parsed


def extract_jsdoc_blocks(file_path: str) -> List[Dict]:
    """
    Extract JSDoc comment blocks and associated code from a file.

    Args:
        file_path: Path to JavaScript/TypeScript file

    Returns:
        List of dictionaries with JSDoc and code information
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = []

    # Pattern to match JSDoc comment followed by function/class/const
    pattern = r'/\*\*[\s\S]*?\*/\s*(export\s+)?(async\s+)?(function|class|const|let|var)\s+(\w+)'

    for match in re.finditer(pattern, content):
        full_match = match.group(0)
        export = match.group(1)
        async_keyword = match.group(2)
        item_type = match.group(3)
        name = match.group(4)

        # Extract JSDoc comment
        jsdoc_match = re.search(r'/\*\*[\s\S]*?\*/', full_match)
        if not jsdoc_match:
            continue

        jsdoc_comment = jsdoc_match.group(0)
        parsed = parse_jsdoc_comment(jsdoc_comment)

        # Determine if it's a function, class, or variable
        if item_type == 'function':
            item_kind = 'async function' if async_keyword else 'function'
        elif item_type == 'class':
            item_kind = 'class'
        else:
            # Check if it's a function assignment
            after_match = content[match.end():match.end() + 100]
            if re.match(r'\s*=\s*(async\s+)?\(', after_match):
                item_kind = 'async function' if 'async' in after_match[:50] else 'function'
            else:
                item_kind = 'constant'

        blocks.append({
            'name': name,
            'type': item_kind,
            'exported': bool(export),
            'jsdoc': parsed,
            'line': content[:match.start()].count('\n') + 1
        })

    return blocks


def format_markdown(file_path: str, blocks: List[Dict]) -> str:
    """
    Format extracted JSDoc blocks as markdown.

    Args:
        file_path: Source file path
        blocks: List of JSDoc block dictionaries

    Returns:
        Markdown-formatted documentation
    """
    lines = []

    # File header
    module_name = Path(file_path).stem
    lines.append(f"# {module_name}")
    lines.append("")

    # Group by type
    classes = [b for b in blocks if b['type'] == 'class']
    functions = [b for b in blocks if 'function' in b['type']]
    constants = [b for b in blocks if b['type'] == 'constant']

    # Classes
    if classes:
        lines.append("## Classes")
        lines.append("")

        for cls in classes:
            format_item(cls, lines)

    # Functions
    if functions:
        lines.append("## Functions")
        lines.append("")

        for func in functions:
            format_item(func, lines)

    # Constants
    if constants:
        lines.append("## Constants")
        lines.append("")

        for const in constants:
            format_item(const, lines)

    return '\n'.join(lines)


def format_item(item: Dict, lines: List[str]):
    """
    Format a single item (function/class/constant) as markdown.

    Args:
        item: Item dictionary
        lines: List to append markdown lines to
    """
    jsdoc = item['jsdoc']

    # Item header
    if item['type'] == 'function' or item['type'] == 'async function':
        # Build function signature
        params = ', '.join(p['name'] for p in jsdoc.get('params', []))
        async_prefix = 'async ' if item['type'] == 'async function' else ''
        lines.append(f"### {async_prefix}{item['name']}({params})")
    else:
        lines.append(f"### {item['name']}")

    lines.append("")

    # Export indicator
    if item['exported']:
        lines.append("**Exported**")
        lines.append("")

    # Description
    if jsdoc.get('description'):
        lines.append(jsdoc['description'])
        lines.append("")

    # Parameters
    if jsdoc.get('params'):
        lines.append("**Parameters:**")
        for param in jsdoc['params']:
            opt_str = ', optional' if param['optional'] else ''
            lines.append(f"- `{param['name']}` ({param['type']}{opt_str}): {param['description']}")
        lines.append("")

    # Returns
    if jsdoc.get('returns'):
        ret = jsdoc['returns']
        lines.append(f"**Returns:** `{ret['type']}` - {ret['description']}")
        lines.append("")

    # Throws
    if jsdoc.get('throws'):
        lines.append("**Throws:**")
        for exc in jsdoc['throws']:
            lines.append(f"- `{exc['type']}`: {exc['description']}")
        lines.append("")

    # Examples
    if jsdoc.get('examples'):
        lines.append("**Examples:**")
        for example in jsdoc['examples']:
            lines.append("```javascript")
            lines.append(example)
            lines.append("```")
        lines.append("")

    # Since
    if jsdoc.get('since'):
        lines.append(f"**Since:** {jsdoc['since']}")
        lines.append("")

    # Deprecated
    if jsdoc.get('deprecated'):
        lines.append(f"**Deprecated:** {jsdoc['deprecated']}")
        lines.append("")

    # See also
    if jsdoc.get('see'):
        lines.append("**See also:**")
        for see in jsdoc['see']:
            lines.append(f"- {see}")
        lines.append("")

    lines.append("---")
    lines.append("")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Extract JSDoc documentation to markdown'
    )
    parser.add_argument(
        'files',
        nargs='+',
        help='JavaScript/TypeScript files to process'
    )
    parser.add_argument(
        '--output',
        '-o',
        help='Output file (default: stdout)'
    )

    args = parser.parse_args()

    all_docs = []

    for file_path in args.files:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}", file=sys.stderr)
            continue

        blocks = extract_jsdoc_blocks(file_path)
        if not blocks:
            print(f"No JSDoc found in {file_path}", file=sys.stderr)
            continue

        markdown = format_markdown(file_path, blocks)
        all_docs.append(markdown)

    output = '\n\n'.join(all_docs)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Documentation written to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Extract documentation from Python files and generate markdown.

This script parses Python source files, extracts docstrings from
functions and classes, and generates API documentation in markdown format.
"""

import ast
import inspect
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional


def parse_google_docstring(docstring: str) -> Dict[str, any]:
    """
    Parse Google-style docstring into structured format.

    Args:
        docstring: Raw docstring text

    Returns:
        Dictionary with parsed sections
    """
    if not docstring:
        return {}

    lines = docstring.split('\n')
    sections = {
        'summary': '',
        'description': '',
        'args': [],
        'returns': '',
        'raises': [],
        'examples': [],
        'notes': [],
    }

    current_section = 'summary'
    current_content = []

    for line in lines:
        line = line.strip()

        # Check for section headers
        if line in ['Args:', 'Arguments:', 'Parameters:']:
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'args'
            continue
        elif line in ['Returns:', 'Return:']:
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'returns'
            continue
        elif line in ['Raises:', 'Raises:']:
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'raises'
            continue
        elif line in ['Example:', 'Examples:']:
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'examples'
            continue
        elif line in ['Note:', 'Notes:']:
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = 'notes'
            continue

        # Add content to current section
        current_content.append(line)

    # Add final section
    if current_content:
        if current_section == 'summary' and not sections['summary']:
            # First paragraph is summary, rest is description
            text = '\n'.join(current_content).strip()
            parts = text.split('\n\n', 1)
            sections['summary'] = parts[0]
            if len(parts) > 1:
                sections['description'] = parts[1]
        else:
            sections[current_section] = '\n'.join(current_content).strip()

    # Parse args section
    if isinstance(sections['args'], str):
        args_text = sections['args']
        args = []
        for line in args_text.split('\n'):
            # Match: name (type): description
            match = re.match(r'^\s*(\w+)\s*\(([^)]+)\):\s*(.+)$', line)
            if match:
                name, type_str, desc = match.groups()
                args.append({
                    'name': name,
                    'type': type_str,
                    'description': desc
                })
        sections['args'] = args

    # Parse raises section
    if isinstance(sections['raises'], str):
        raises_text = sections['raises']
        raises = []
        for line in raises_text.split('\n'):
            # Match: ExceptionType: description
            match = re.match(r'^\s*(\w+):\s*(.+)$', line)
            if match:
                exc_type, desc = match.groups()
                raises.append({
                    'type': exc_type,
                    'description': desc
                })
        sections['raises'] = raises

    return sections


def extract_function_info(node: ast.FunctionDef) -> Dict:
    """
    Extract information from a function definition.

    Args:
        node: AST FunctionDef node

    Returns:
        Dictionary with function information
    """
    docstring = ast.get_docstring(node)
    parsed = parse_google_docstring(docstring) if docstring else {}

    # Extract signature
    args = []
    for arg in node.args.args:
        arg_name = arg.arg
        arg_type = None
        if arg.annotation:
            arg_type = ast.unparse(arg.annotation)
        args.append({'name': arg_name, 'type': arg_type})

    # Extract return type
    return_type = None
    if node.returns:
        return_type = ast.unparse(node.returns)

    return {
        'name': node.name,
        'type': 'function',
        'args': args,
        'return_type': return_type,
        'docstring': parsed,
        'line': node.lineno,
    }


def extract_class_info(node: ast.ClassDef) -> Dict:
    """
    Extract information from a class definition.

    Args:
        node: AST ClassDef node

    Returns:
        Dictionary with class information
    """
    docstring = ast.get_docstring(node)
    parsed = parse_google_docstring(docstring) if docstring else {}

    # Extract methods
    methods = []
    for item in node.body:
        if isinstance(item, ast.FunctionDef):
            methods.append(extract_function_info(item))

    # Extract base classes
    bases = [ast.unparse(base) for base in node.bases]

    return {
        'name': node.name,
        'type': 'class',
        'bases': bases,
        'methods': methods,
        'docstring': parsed,
        'line': node.lineno,
    }


def extract_module_info(file_path: str) -> Dict:
    """
    Extract documentation from a Python module.

    Args:
        file_path: Path to Python file

    Returns:
        Dictionary with module information
    """
    with open(file_path, 'r') as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        print(f"Error parsing {file_path}: {e}", file=sys.stderr)
        return {}

    # Extract module docstring
    module_docstring = ast.get_docstring(tree)
    parsed_module_doc = parse_google_docstring(module_docstring) if module_docstring else {}

    # Extract top-level functions and classes
    functions = []
    classes = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # Only top-level functions
            if isinstance(node, ast.FunctionDef) and not any(
                isinstance(parent, (ast.ClassDef, ast.FunctionDef))
                for parent in ast.walk(tree)
                if node in ast.walk(parent) and parent != node
            ):
                functions.append(extract_function_info(node))
        elif isinstance(node, ast.ClassDef):
            classes.append(extract_class_info(node))

    return {
        'file': file_path,
        'docstring': parsed_module_doc,
        'functions': functions,
        'classes': classes,
    }


def format_markdown(module_info: Dict) -> str:
    """
    Format module information as markdown.

    Args:
        module_info: Module information dictionary

    Returns:
        Markdown-formatted documentation
    """
    lines = []

    # Module header
    module_name = Path(module_info['file']).stem
    lines.append(f"# {module_name}")
    lines.append("")

    # Module docstring
    if module_info['docstring']:
        doc = module_info['docstring']
        if doc.get('summary'):
            lines.append(doc['summary'])
            lines.append("")
        if doc.get('description'):
            lines.append(doc['description'])
            lines.append("")

    # Classes
    if module_info['classes']:
        lines.append("## Classes")
        lines.append("")

        for cls in module_info['classes']:
            lines.append(f"### {cls['name']}")
            lines.append("")

            if cls['bases']:
                bases_str = ', '.join(cls['bases'])
                lines.append(f"**Inherits from:** {bases_str}")
                lines.append("")

            doc = cls['docstring']
            if doc.get('summary'):
                lines.append(doc['summary'])
                lines.append("")

            # Methods
            if cls['methods']:
                lines.append("#### Methods")
                lines.append("")

                for method in cls['methods']:
                    format_function(method, lines)

    # Functions
    if module_info['functions']:
        lines.append("## Functions")
        lines.append("")

        for func in module_info['functions']:
            format_function(func, lines)

    return '\n'.join(lines)


def format_function(func: Dict, lines: List[str]):
    """
    Format a function as markdown and append to lines.

    Args:
        func: Function information dictionary
        lines: List to append markdown lines to
    """
    # Function signature
    args_str = ', '.join(
        f"{arg['name']}: {arg['type']}" if arg['type'] else arg['name']
        for arg in func['args']
    )
    return_str = f" -> {func['return_type']}" if func['return_type'] else ""
    lines.append(f"##### `{func['name']}({args_str}){return_str}`")
    lines.append("")

    doc = func['docstring']

    # Summary
    if doc.get('summary'):
        lines.append(doc['summary'])
        lines.append("")

    # Description
    if doc.get('description'):
        lines.append(doc['description'])
        lines.append("")

    # Parameters
    if doc.get('args'):
        lines.append("**Parameters:**")
        for arg in doc['args']:
            type_str = f" ({arg['type']})" if arg.get('type') else ""
            lines.append(f"- `{arg['name']}`{type_str}: {arg['description']}")
        lines.append("")

    # Returns
    if doc.get('returns'):
        lines.append(f"**Returns:** {doc['returns']}")
        lines.append("")

    # Raises
    if doc.get('raises'):
        lines.append("**Raises:**")
        for exc in doc['raises']:
            lines.append(f"- `{exc['type']}`: {exc['description']}")
        lines.append("")

    # Examples
    if doc.get('examples'):
        lines.append("**Example:**")
        lines.append("```python")
        lines.append(doc['examples'])
        lines.append("```")
        lines.append("")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Extract Python documentation to markdown'
    )
    parser.add_argument(
        'files',
        nargs='+',
        help='Python files to process'
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

        module_info = extract_module_info(file_path)
        markdown = format_markdown(module_info)
        all_docs.append(markdown)

    output = '\n\n---\n\n'.join(all_docs)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Documentation written to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == '__main__':
    main()

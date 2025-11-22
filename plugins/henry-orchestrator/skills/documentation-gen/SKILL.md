---
name: documentation-gen
description: This skill should be used when the user asks to "generate README", "create documentation", "auto-generate docs", "write API docs", "create wiki pages", "maintain changelog", "update documentation", "generate API reference", or mentions documentation generation, README creation, or changelog maintenance.
version: 0.1.0
---

# Documentation Generation

This skill provides guidance for automatically generating and maintaining project documentation including READMEs, API documentation, wikis, and changelogs.

## Purpose

Generate comprehensive, well-structured documentation from code, comments, commit history, and project structure. Maintain documentation consistency across projects while adapting to specific project needs.

## When to Use

Use this skill when:
- Generating new README files for projects
- Creating API documentation from code
- Building wiki pages from project information
- Maintaining changelogs from git history
- Updating outdated documentation
- Standardizing documentation across projects

## Documentation Types

### README Generation

Generate README.md files with standard sections:

1. **Analyze project structure** to understand the codebase
2. **Extract key information**:
   - Project name and description
   - Installation requirements
   - Usage examples from code
   - Configuration options
   - Dependencies
3. **Identify entry points** (main files, CLI commands)
4. **Generate structure** following the README template in `references/readme-template.md`
5. **Add badges** for build status, coverage, version if applicable

### API Documentation

Generate API reference documentation:

1. **Scan source code** for exported functions, classes, methods
2. **Extract docstrings/comments** from code
3. **Parse function signatures** for parameters and return types
4. **Generate markdown** with clear structure:
   - Function/class name and signature
   - Description
   - Parameters with types
   - Return values
   - Usage examples
   - Notes/warnings
5. **Organize by module/namespace**
6. **Reference `references/api-doc-patterns.md`** for detailed formatting patterns

### Wiki/Guide Generation

Create comprehensive guides and wiki pages:

1. **Identify documentation needs** based on project complexity
2. **Common wiki pages**:
   - Getting Started
   - Architecture Overview
   - Contributing Guide
   - Deployment Guide
   - Troubleshooting
3. **Structure each page** with clear hierarchy
4. **Include code examples** and commands
5. **Link pages together** for easy navigation
6. **Use `examples/wiki-structure/`** as reference

### Changelog Maintenance

Maintain CHANGELOG.md following Keep a Changelog format:

1. **Use `scripts/generate_changelog.py`** to extract from git history
2. **Categorize changes**:
   - Added (new features)
   - Changed (changes to existing functionality)
   - Deprecated (soon-to-be-removed features)
   - Removed (removed features)
   - Fixed (bug fixes)
   - Security (security fixes)
3. **Format as**:
   ```
   ## [Version] - YYYY-MM-DD
   ### Added
   - Feature description
   ```
4. **Parse conventional commits** (feat:, fix:, docs:, etc.)
5. **Group related changes** for clarity
6. **Reference `references/changelog-conventions.md`** for standards

## Documentation Quality Standards

Ensure all generated documentation:

1. **Clarity**: Use clear, concise language avoiding jargon
2. **Completeness**: Cover all public APIs and features
3. **Accuracy**: Verify information matches actual code
4. **Examples**: Include practical, working code examples
5. **Structure**: Use consistent formatting and hierarchy
6. **Maintenance**: Include version information and last updated date
7. **Accessibility**: Write for intended audience skill level

## Workflow

### Initial Documentation Generation

1. **Analyze project**:
   - Scan directory structure
   - Identify language and frameworks
   - Find existing documentation
   - Check package.json, setup.py, or equivalent
2. **Choose documentation types** based on project needs
3. **Generate content** using appropriate templates
4. **Validate accuracy** against code
5. **Format consistently** following project conventions

### Documentation Updates

1. **Identify changes** requiring documentation updates:
   - New features from git diff
   - API changes
   - Configuration changes
   - Breaking changes
2. **Update relevant sections** maintaining structure
3. **Verify examples** still work
4. **Update version numbers** and dates
5. **Commit with clear message**: `docs: update API documentation for v2.0`

## Code Analysis Techniques

### Extracting Documentation from Code

1. **For Python**:
   - Parse docstrings (Google, NumPy, or Sphinx style)
   - Use `scripts/extract_python_docs.py`
   - Extract from `__doc__` attributes

2. **For JavaScript/TypeScript**:
   - Parse JSDoc comments
   - Extract from exported functions/classes
   - Use TypeScript types for parameter documentation
   - Use `scripts/extract_js_docs.py`

3. **For other languages**:
   - Search for standardized comment patterns
   - Parse function/class definitions
   - Extract type information

### Project Structure Analysis

1. **Identify project type**:
   - Check for package.json (Node.js)
   - Check for setup.py/pyproject.toml (Python)
   - Check for Cargo.toml (Rust)
   - Check for go.mod (Go)

2. **Find entry points**:
   - Look for main files (main.py, index.js, main.go)
   - Check CLI definitions (argparse, commander, clap)
   - Identify exported APIs

3. **Map dependencies**:
   - Extract from package files
   - Identify required versions
   - Note peer dependencies

## Additional Resources

### Reference Files

For detailed patterns and conventions, consult:
- **`references/readme-template.md`** - Complete README structure with examples
- **`references/api-doc-patterns.md`** - API documentation formatting patterns
- **`references/changelog-conventions.md`** - Changelog standards and conventional commits
- **`references/docstring-styles.md`** - Language-specific docstring formats

### Example Files

Working examples in `examples/`:
- **`examples/README-python.md`** - Python project README
- **`examples/README-nodejs.md`** - Node.js project README
- **`examples/API-docs.md`** - Sample API documentation
- **`examples/CHANGELOG.md`** - Well-maintained changelog
- **`examples/wiki-structure/`** - Complete wiki structure

### Scripts

Utility scripts in `scripts/`:
- **`scripts/generate_changelog.py`** - Generate changelog from git history
- **`scripts/extract_python_docs.py`** - Extract Python docstrings to markdown
- **`scripts/extract_js_docs.py`** - Extract JSDoc to markdown
- **`scripts/validate_docs.sh`** - Check documentation completeness

## Best Practices

1. **Start simple**: Basic README before comprehensive docs
2. **Update with code**: Document changes in same commit
3. **Test examples**: Verify all code examples work
4. **Version awareness**: Match documentation to code version
5. **Automate**: Use scripts for repetitive documentation tasks
6. **Review regularly**: Keep documentation up-to-date
7. **Consider audience**: Write for users' technical level
8. **Link effectively**: Cross-reference related documentation

## Common Patterns

### Project README Structure

Standard sections in order:
1. Project name and badges
2. Description (one-liner + expanded)
3. Features
4. Installation
5. Quick Start/Usage
6. Configuration
7. Documentation links
8. Contributing
9. License

### API Documentation Organization

Organize API docs by:
1. Module/namespace
2. Class/interface
3. Public methods/functions
4. Properties/attributes
5. Constants/enums

### Changelog Entry Format

```markdown
## [1.2.0] - 2025-01-15

### Added
- New feature X for improved performance
- Support for Y configuration option

### Fixed
- Bug in Z causing incorrect behavior (#123)

### Changed
- Updated dependency A to v2.0
```

## Tips

- **Use code scanning** instead of manual extraction when possible
- **Leverage existing tools** (JSDoc, Sphinx, godoc) when available
- **Maintain consistency** across all documentation files
- **Include diagrams** for complex architectures (reference in wikis)
- **Keep changelogs user-focused** (what changed, not how)
- **Update examples** when APIs change
- **Add troubleshooting sections** based on common issues

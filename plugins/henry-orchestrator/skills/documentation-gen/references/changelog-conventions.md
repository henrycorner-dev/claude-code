# Changelog Conventions

Standards and best practices for maintaining changelogs.

## Keep a Changelog Format

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standard:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New features that are in progress

## [1.2.0] - 2025-01-15

### Added

- New feature X for improved performance
- Support for Y configuration option

### Changed

- Updated dependency A to v2.0
- Refactored module B for better maintainability

### Deprecated

- Function Z will be removed in v2.0.0

### Removed

- Old API endpoint /v1/legacy

### Fixed

- Bug in authentication causing session timeout (#123)
- Memory leak in cache implementation (#145)

### Security

- Fixed XSS vulnerability in user input handling (CVE-2025-1234)

## [1.1.0] - 2025-01-01

...

[unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/releases/tag/v1.1.0
```

## Change Categories

### Added

New features, functionality, or capabilities added to the project.

**Examples:**

```markdown
### Added

- User authentication with OAuth2 support
- Dark mode theme option
- Export data to CSV functionality
- New command `--verbose` for detailed output
- Support for PostgreSQL database
```

### Changed

Changes to existing functionality that don't break compatibility.

**Examples:**

```markdown
### Changed

- Improved performance of search algorithm by 40%
- Updated UI design for better accessibility
- Changed default timeout from 30s to 60s
- Refactored error handling for consistency
- Updated documentation with new examples
```

### Deprecated

Features that are still available but will be removed in a future version.

**Examples:**

```markdown
### Deprecated

- `oldFunction()` - use `newFunction()` instead, will be removed in v3.0.0
- Configuration option `legacy_mode` - no longer needed
- `/api/v1` endpoint - migrate to `/api/v2`
```

### Removed

Features, functionality, or deprecated items that have been removed.

**Examples:**

```markdown
### Removed

- Support for Internet Explorer 11
- Deprecated `oldFunction()` method
- Legacy configuration file format
- Unused dependency `old-library`
```

### Fixed

Bug fixes and corrections to existing functionality.

**Examples:**

```markdown
### Fixed

- Fixed crash when opening files with special characters (#234)
- Corrected calculation error in tax module (#245)
- Fixed memory leak in image processing
- Resolved race condition in async handler
- Fixed typo in error message
```

### Security

Security-related changes, vulnerability fixes, and improvements.

**Examples:**

```markdown
### Security

- Fixed SQL injection vulnerability in user query (CVE-2025-1234)
- Updated dependencies to patch security issues
- Improved password hashing algorithm
- Added rate limiting to prevent DoS attacks
- Fixed XSS vulnerability in comment rendering
```

## Conventional Commits

Map conventional commit types to changelog categories:

| Commit Type | Changelog Category | Description                             |
| ----------- | ------------------ | --------------------------------------- |
| `feat:`     | Added              | New feature                             |
| `fix:`      | Fixed              | Bug fix                                 |
| `docs:`     | Changed            | Documentation changes                   |
| `style:`    | Changed            | Code style changes (formatting, etc.)   |
| `refactor:` | Changed            | Code refactoring                        |
| `perf:`     | Changed            | Performance improvements                |
| `test:`     | (Often omitted)    | Test additions/changes                  |
| `chore:`    | (Often omitted)    | Build process or auxiliary tool changes |
| `build:`    | Changed            | Build system changes                    |
| `ci:`       | (Often omitted)    | CI configuration changes                |
| `revert:`   | Fixed              | Reverts a previous change               |

### Parsing Conventional Commits

Extract category from commit message:

```
feat: add user profile page
^^^^^
type -> maps to "Added"

fix(auth): resolve token expiration issue
^^^
type -> maps to "Fixed"

feat!: redesign API endpoints
     ^
breaking change indicator
```

Breaking changes (indicated by `!` or `BREAKING CHANGE:` footer) should be highlighted:

```markdown
### Changed

- **BREAKING:** Redesigned API endpoints - see migration guide
```

## Writing Good Changelog Entries

### Be User-Focused

Write for users of your software, not developers:

**Bad:**

```markdown
- Refactored UserController to use dependency injection
- Updated tests to use Jest instead of Mocha
- Changed variable naming convention
```

**Good:**

```markdown
- Improved application startup time by 50%
- Fixed bug causing data loss on network interruption
- Added ability to export reports as PDF
```

### Be Specific

Provide enough detail to understand the change:

**Bad:**

```markdown
- Fixed bug
- Improved performance
- Updated dependencies
```

**Good:**

```markdown
- Fixed crash when uploading files larger than 10MB (#234)
- Improved search performance for large datasets (10,000+ records)
- Updated axios to v1.6.0 to fix security vulnerability (CVE-2025-1234)
```

### Link to Issues/PRs

Reference relevant issues or pull requests:

```markdown
- Fixed authentication timeout issue (#123)
- Added dark mode support (PR #145, closes #100)
- Resolved memory leak in cache (fixes #156, #157)
```

### Group Related Changes

Group similar changes together:

```markdown
### Added

- User profile management:
  - Profile picture upload
  - Bio and social links
  - Privacy settings
- Email notifications:
  - Daily digest option
  - Custom notification preferences
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/) (SemVer):

**Format:** MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes (breaking changes)
- **MINOR**: Added functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

**Examples:**

- `1.0.0` -> `1.0.1`: Bug fixes only
- `1.0.0` -> `1.1.0`: New features, no breaking changes
- `1.0.0` -> `2.0.0`: Breaking changes

### Pre-release Versions

```markdown
## [2.0.0-beta.1] - 2025-01-15

### Added

- Preview of new API v2 (subject to change)

## [2.0.0-alpha.1] - 2025-01-01

### Added

- Early access to experimental features
```

## Unreleased Section

Maintain an `[Unreleased]` section at the top for changes not yet released:

```markdown
## [Unreleased]

### Added

- Work-in-progress feature X

### Fixed

- Bug Y fixed in development
```

When releasing, move these changes to a new version section:

```markdown
## [1.3.0] - 2025-01-20

### Added

- Work-in-progress feature X (now complete)

### Fixed

- Bug Y fixed in development
```

## Dating Entries

Use ISO 8601 date format (YYYY-MM-DD):

```markdown
## [1.2.0] - 2025-01-15

           ^^^^^^^^^^
           ISO 8601 format
```

## Linking Versions

Add comparison links at the bottom:

```markdown
[unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

These links help users see exactly what changed between versions.

## Breaking Changes

Highlight breaking changes prominently:

````markdown
### Changed

- **BREAKING:** Renamed `oldMethod()` to `newMethod()`
- **BREAKING:** Changed configuration file format - see [migration guide](MIGRATING.md)
- **BREAKING:** Minimum Node.js version is now 18.0.0

**Migration Guide:**

To migrate from v1.x to v2.x:

1. Update `oldMethod()` calls:

   ```javascript
   // Old
   obj.oldMethod(arg);

   // New
   obj.newMethod(arg);
   ```
````

2. Update configuration file:

   ```json
   // Old format
   { "setting": "value" }

   // New format
   { "settings": { "name": "value" } }
   ```

````

## Automated Changelog Generation

### From Git History

Use conventional commits to generate changelog automatically:

```bash
# Using generate_changelog.py
python scripts/generate_changelog.py v1.1.0..HEAD > CHANGELOG-new.md
````

The script should:

1. Parse commit messages between versions
2. Extract conventional commit types
3. Map to changelog categories
4. Group by category
5. Format as Keep a Changelog

### Manual Review Required

Always review auto-generated changelogs:

- Remove internal/developer-only changes
- Rewrite technical messages for users
- Add context where needed
- Group related changes
- Highlight breaking changes

## Multi-Project Changelogs

For monorepos or multi-package projects:

### Separate Changelogs

```
packages/
  package-a/
    CHANGELOG.md
  package-b/
    CHANGELOG.md
CHANGELOG.md  (root-level, aggregated)
```

### Aggregated Changelog

```markdown
## [1.2.0] - 2025-01-15

### Package A

#### Added

- Feature X

### Package B

#### Fixed

- Bug Y
```

## Example: Complete Changelog

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Work in progress feature Z

## [2.0.0] - 2025-01-20

### Added

- Complete redesign of user interface
- Support for multiple themes (light, dark, high-contrast)
- Export data to PDF format
- Real-time collaboration features
- Offline mode with automatic sync

### Changed

- **BREAKING:** Minimum Node.js version is now 18.0.0
- **BREAKING:** Changed API response format - see [migration guide](MIGRATING.md)
- Improved performance of data processing by 3x
- Updated all dependencies to latest versions
- Redesigned settings page for better usability

### Deprecated

- REST API v1 endpoints - migrate to v2 by 2025-06-01

### Removed

- **BREAKING:** Support for Internet Explorer 11
- Legacy configuration file format (.legacy.json)
- Deprecated `processOldFormat()` function

### Fixed

- Fixed crash when handling large files (>100MB) (#234)
- Resolved memory leak in image cache (#245)
- Fixed incorrect calculation in tax module (#256)
- Corrected timezone handling for international users (#267)

### Security

- Fixed SQL injection vulnerability in search (CVE-2025-1234)
- Updated bcrypt to v5.1.0 for improved password hashing
- Added rate limiting to prevent brute force attacks

## [1.5.2] - 2025-01-10

### Fixed

- Fixed regression in file upload (#223)
- Corrected error message typo

## [1.5.1] - 2025-01-05

### Fixed

- Fixed authentication bug introduced in v1.5.0 (#220)

### Security

- Updated dependency with known vulnerability

## [1.5.0] - 2025-01-01

### Added

- User profile customization options
- Email notification preferences
- Keyboard shortcuts for common actions

### Changed

- Improved error messages for better clarity
- Updated documentation with new examples

### Fixed

- Fixed date picker not working on mobile (#210)
- Resolved issue with duplicate notifications (#215)

## [1.0.0] - 2024-12-15

Initial release.

### Added

- User authentication and authorization
- Data management interface
- Basic reporting features
- API for third-party integrations

[unreleased]: https://github.com/user/repo/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/user/repo/compare/v1.5.2...v2.0.0
[1.5.2]: https://github.com/user/repo/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/user/repo/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/user/repo/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

## Best Practices Summary

1. **Keep it updated**: Add entries with each release
2. **Be consistent**: Follow Keep a Changelog format
3. **Write for users**: Focus on user-facing changes
4. **Be specific**: Provide enough detail to understand impact
5. **Link issues**: Reference relevant issues and PRs
6. **Group logically**: Group related changes together
7. **Highlight breaking changes**: Make them obvious
8. **Use semantic versioning**: MAJOR.MINOR.PATCH
9. **Date entries**: Use ISO 8601 format
10. **Review auto-generated**: Always manually review generated changelogs

## Common Mistakes

❌ **Don't:**

- Include internal refactorings users don't see
- Use vague descriptions ("fixed bug", "improved performance")
- Forget to update on each release
- Mix developer and user perspectives
- Skip version numbers
- Use inconsistent formatting

✅ **Do:**

- Focus on user-facing changes
- Be specific and descriptive
- Update regularly with releases
- Write from user perspective
- Follow semantic versioning
- Use consistent Keep a Changelog format

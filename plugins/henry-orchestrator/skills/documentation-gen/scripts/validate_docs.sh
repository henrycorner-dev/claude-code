#!/bin/bash
# Validate documentation completeness and quality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

error() {
    echo -e "${RED}ERROR: $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check if README exists
check_readme() {
    echo "Checking README..."

    if [ ! -f "README.md" ]; then
        error "README.md not found"
        return 1
    fi

    # Check for required sections
    local required_sections=(
        "# "
        "## Installation"
        "## Usage"
        "## License"
    )

    for section in "${required_sections[@]}"; do
        if ! grep -q "$section" README.md; then
            warning "README.md missing section: $section"
        fi
    done

    # Check for code examples
    if ! grep -q '```' README.md; then
        warning "README.md has no code examples"
    fi

    # Check for links
    if ! grep -q 'http' README.md && ! grep -q '\[.*\](.*)' README.md; then
        warning "README.md has no links"
    fi

    success "README.md exists"
}

# Check if CHANGELOG exists and follows Keep a Changelog format
check_changelog() {
    echo "Checking CHANGELOG..."

    if [ ! -f "CHANGELOG.md" ]; then
        warning "CHANGELOG.md not found"
        return 0
    fi

    # Check format
    if ! grep -q "# Changelog" CHANGELOG.md; then
        warning "CHANGELOG.md doesn't follow Keep a Changelog format"
    fi

    # Check for version entries
    if ! grep -q "## \[" CHANGELOG.md; then
        warning "CHANGELOG.md has no version entries"
    fi

    # Check for dates
    if ! grep -q "[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}" CHANGELOG.md; then
        warning "CHANGELOG.md entries missing dates"
    fi

    success "CHANGELOG.md exists and formatted correctly"
}

# Check for LICENSE file
check_license() {
    echo "Checking LICENSE..."

    if [ ! -f "LICENSE" ] && [ ! -f "LICENSE.md" ] && [ ! -f "LICENSE.txt" ]; then
        warning "LICENSE file not found"
        return 0
    fi

    success "LICENSE file exists"
}

# Check for CONTRIBUTING guide
check_contributing() {
    echo "Checking CONTRIBUTING guide..."

    if [ ! -f "CONTRIBUTING.md" ]; then
        warning "CONTRIBUTING.md not found (optional but recommended)"
        return 0
    fi

    success "CONTRIBUTING.md exists"
}

# Check Python docstrings
check_python_docs() {
    echo "Checking Python documentation..."

    local python_files=$(find . -name "*.py" -not -path "*/.*" -not -path "*/venv/*" -not -path "*/node_modules/*" 2>/dev/null)

    if [ -z "$python_files" ]; then
        return 0
    fi

    local missing_docstrings=0

    for file in $python_files; do
        # Check for functions/classes without docstrings
        local funcs=$(grep -c "^def \|^class " "$file" 2>/dev/null || echo 0)
        local docs=$(grep -c '"""' "$file" 2>/dev/null || echo 0)

        if [ "$funcs" -gt 0 ] && [ "$docs" -eq 0 ]; then
            warning "Python file $file has no docstrings"
            ((missing_docstrings++))
        fi
    done

    if [ $missing_docstrings -eq 0 ]; then
        success "Python files have docstrings"
    fi
}

# Check JavaScript/TypeScript JSDoc comments
check_js_docs() {
    echo "Checking JavaScript/TypeScript documentation..."

    local js_files=$(find . \( -name "*.js" -o -name "*.ts" \) -not -path "*/.*" -not -path "*/node_modules/*" -not -path "*/dist/*" 2>/dev/null)

    if [ -z "$js_files" ]; then
        return 0
    fi

    local missing_jsdoc=0

    for file in $js_files; do
        # Check for exported functions without JSDoc
        local exports=$(grep -c "^export \(function\|class\|const\)" "$file" 2>/dev/null || echo 0)
        local jsdocs=$(grep -c "/\*\*" "$file" 2>/dev/null || echo 0)

        if [ "$exports" -gt 0 ] && [ "$jsdocs" -eq 0 ]; then
            warning "JS/TS file $file has exported items without JSDoc"
            ((missing_jsdoc++))
        fi
    done

    if [ $missing_jsdoc -eq 0 ]; then
        success "JavaScript/TypeScript files have JSDoc comments"
    fi
}

# Check markdown links
check_markdown_links() {
    echo "Checking markdown links..."

    local md_files=$(find . -name "*.md" -not -path "*/.*" -not -path "*/node_modules/*" 2>/dev/null)

    if [ -z "$md_files" ]; then
        return 0
    fi

    local broken_links=0

    for file in $md_files; do
        # Extract relative file links (not URLs)
        local links=$(grep -o '\[.*\]([^http][^)]*\.md)' "$file" 2>/dev/null | sed 's/.*(\([^)]*\)).*/\1/' || echo "")

        for link in $links; do
            local dir=$(dirname "$file")
            local target="$dir/$link"

            if [ ! -f "$target" ]; then
                warning "Broken link in $file: $link"
                ((broken_links++))
            fi
        done
    done

    if [ $broken_links -eq 0 ]; then
        success "All markdown links are valid"
    fi
}

# Check for package.json or setup.py with proper metadata
check_package_metadata() {
    echo "Checking package metadata..."

    if [ -f "package.json" ]; then
        # Check Node.js package metadata
        if ! grep -q '"description"' package.json; then
            warning "package.json missing description"
        fi

        if ! grep -q '"license"' package.json; then
            warning "package.json missing license"
        fi

        if ! grep -q '"repository"' package.json; then
            warning "package.json missing repository"
        fi

        success "package.json has metadata"
    elif [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        # Python package
        if [ -f "setup.py" ]; then
            if ! grep -q "description=" setup.py; then
                warning "setup.py missing description"
            fi

            if ! grep -q "license=" setup.py; then
                warning "setup.py missing license"
            fi
        fi

        success "Python package metadata found"
    else
        warning "No package.json or setup.py found"
    fi
}

# Main execution
main() {
    echo "Validating documentation..."
    echo ""

    check_readme
    check_changelog
    check_license
    check_contributing
    check_python_docs
    check_js_docs
    check_markdown_links
    check_package_metadata

    echo ""
    echo "================================"
    echo "Documentation Validation Results"
    echo "================================"
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"

    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}Documentation validation failed${NC}"
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Documentation validation passed with warnings${NC}"
        exit 0
    else
        echo -e "${GREEN}Documentation validation passed${NC}"
        exit 0
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            echo "Usage: validate_docs.sh [options]"
            echo ""
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo ""
            echo "This script validates documentation completeness:"
            echo "  - Checks for README.md with required sections"
            echo "  - Validates CHANGELOG.md format"
            echo "  - Checks for LICENSE file"
            echo "  - Validates docstrings/JSDoc in code"
            echo "  - Checks markdown links"
            echo "  - Validates package metadata"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
    shift
done

main

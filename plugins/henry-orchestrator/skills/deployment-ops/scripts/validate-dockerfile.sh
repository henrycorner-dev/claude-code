#!/bin/bash
# Dockerfile validation and security check script

set -euo pipefail

DOCKERFILE="${1:-Dockerfile}"

echo "=== Dockerfile Validation ==="
echo "Checking: $DOCKERFILE"
echo

# Check if file exists
if [ ! -f "$DOCKERFILE" ]; then
    echo "❌ Error: $DOCKERFILE not found"
    exit 1
fi

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

# Function to report error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to report warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to report pass
pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASSED++))
}

echo "--- Security Checks ---"

# Check for latest tag
if grep -q "FROM.*:latest" "$DOCKERFILE"; then
    error "Using :latest tag (use specific version)"
else
    pass "No :latest tags found"
fi

# Check for running as root
if ! grep -q "USER" "$DOCKERFILE"; then
    error "No USER instruction found (runs as root)"
else
    pass "USER instruction present"
fi

# Check for secrets in ENV
if grep -qE "ENV.*(PASSWORD|SECRET|KEY|TOKEN).*=" "$DOCKERFILE"; then
    error "Potential secrets in ENV instructions"
else
    pass "No obvious secrets in ENV"
fi

# Check for COPY of sensitive files
if grep -qE "COPY.*(\.env|credentials|secret|password)" "$DOCKERFILE"; then
    warning "Copying potentially sensitive files"
else
    pass "No sensitive files copied"
fi

echo
echo "--- Best Practices ---"

# Check for multi-stage build
if grep -qE "FROM.*AS" "$DOCKERFILE"; then
    pass "Multi-stage build detected"
else
    warning "Not using multi-stage build"
fi

# Check for layer optimization
if grep -qE "RUN.*&&" "$DOCKERFILE"; then
    pass "Commands combined with &&"
else
    warning "Consider combining RUN commands"
fi

# Check for apt-get clean
if grep -q "apt-get install" "$DOCKERFILE"; then
    if ! grep -q "apt-get clean\|rm -rf /var/lib/apt/lists" "$DOCKERFILE"; then
        warning "apt-get used but no cleanup"
    else
        pass "apt-get cleanup present"
    fi
fi

# Check for WORKDIR
if ! grep -q "WORKDIR" "$DOCKERFILE"; then
    warning "No WORKDIR instruction"
else
    pass "WORKDIR instruction present"
fi

# Check for HEALTHCHECK
if ! grep -q "HEALTHCHECK" "$DOCKERFILE"; then
    warning "No HEALTHCHECK instruction"
else
    pass "HEALTHCHECK present"
fi

# Check for .dockerignore
if [ ! -f ".dockerignore" ]; then
    warning ".dockerignore file not found"
else
    pass ".dockerignore file exists"
fi

echo
echo "--- Size Optimization ---"

# Check for alpine or slim base
if grep -qE "FROM.*(alpine|slim|distroless)" "$DOCKERFILE"; then
    pass "Using minimal base image"
else
    warning "Consider using alpine, slim, or distroless base image"
fi

# Check for node_modules or __pycache__ COPY
if grep -qE "COPY \. " "$DOCKERFILE"; then
    if [ ! -f ".dockerignore" ]; then
        warning "Copying everything without .dockerignore"
    fi
fi

echo
echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Errors: $ERRORS${NC}"

# Exit with error if there are errors
if [ $ERRORS -gt 0 ]; then
    echo
    echo "❌ Validation failed with $ERRORS error(s)"
    exit 1
else
    echo
    echo "✅ Validation passed"
    exit 0
fi

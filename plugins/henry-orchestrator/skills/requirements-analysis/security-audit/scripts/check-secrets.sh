#!/bin/bash

# Check for Hardcoded Secrets Script
# Scans codebase for potential secrets and credentials

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Hardcoded Secrets Scanner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

FINDINGS=0

# File patterns to search
FILE_PATTERNS=(
    "*.py"
    "*.js"
    "*.ts"
    "*.jsx"
    "*.tsx"
    "*.java"
    "*.go"
    "*.php"
    "*.rb"
    "*.env"
    "*.config"
    "*.yml"
    "*.yaml"
    "*.json"
)

# Patterns to search for
declare -A PATTERNS=(
    ["API Keys"]="(api[_-]?key|apikey|api[_-]?secret)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9]{20,}"
    ["AWS Keys"]="(aws[_-]?access[_-]?key[_-]?id|aws[_-]?secret[_-]?access[_-]?key)['\"]?\s*[:=]\s*['\"]?[A-Z0-9]{20,}"
    ["Private Keys"]="-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----"
    ["Passwords"]="(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?[^'\"\\s]{8,}"
    ["Database URLs"]="(mysql|postgresql|mongodb):\/\/[^\\s\"']*:[^\\s\"']*@"
    ["JWT Tokens"]="eyJ[a-zA-Z0-9_-]{10,}\\.eyJ[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}"
    ["Generic Secrets"]="(secret|token|auth)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9]{20,}"
    ["GitHub Tokens"]="gh[pousr]_[a-zA-Z0-9]{36,}"
    ["Slack Tokens"]="xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}"
    ["Google API"]="AIza[0-9A-Za-z\\-_]{35}"
    ["Heroku API"]="[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
)

# Exclusions
EXCLUDE_PATTERNS=(
    "*/node_modules/*"
    "*/.git/*"
    "*/venv/*"
    "*/env/*"
    "*/__pycache__/*"
    "*/dist/*"
    "*/build/*"
    "*.min.js"
    "*.min.css"
)

# Build exclude arguments
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS ! -path '$pattern'"
done

# Function to search for pattern
search_pattern() {
    local name=$1
    local pattern=$2
    local found=0

    echo -e "${BLUE}Checking for: $name${NC}"

    for file_pattern in "${FILE_PATTERNS[@]}"; do
        while IFS= read -r file; do
            while IFS= read -r line; do
                found=1
                FINDINGS=$((FINDINGS + 1))
                echo -e "${RED}✗ Found in $file:${NC}"
                echo -e "  ${YELLOW}$line${NC}"
                echo ""
            done < <(grep -n -E "$pattern" "$file" 2>/dev/null || true)
        done < <(eval "find . -name '$file_pattern' $EXCLUDE_ARGS -type f" 2>/dev/null || true)
    done

    if [ $found -eq 0 ]; then
        echo -e "${GREEN}✓ No issues found${NC}"
    fi

    echo ""
}

# Run checks
for name in "${!PATTERNS[@]}"; do
    search_pattern "$name" "${PATTERNS[$name]}"
done

# Check for common sensitive files
echo -e "${BLUE}Checking for sensitive files...${NC}"

SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "credentials.json"
    "secret.yml"
    "secret.yaml"
    "secrets.json"
    "id_rsa"
    "id_dsa"
    "*.pem"
    "*.key"
    "*.p12"
    "*.pfx"
)

for pattern in "${SENSITIVE_FILES[@]}"; do
    while IFS= read -r file; do
        # Skip if in git directory
        if [[ $file == *"/.git/"* ]]; then
            continue
        fi

        FINDINGS=$((FINDINGS + 1))
        echo -e "${RED}✗ Sensitive file found: $file${NC}"
    done < <(find . -name "$pattern" -type f 2>/dev/null | grep -v ".git" || true)
done

echo ""

# Check .gitignore
echo -e "${BLUE}Checking .gitignore configuration...${NC}"

if [ -f ".gitignore" ]; then
    RECOMMENDED_IGNORES=(
        ".env"
        "*.pem"
        "*.key"
        "credentials.json"
        "secrets.yml"
    )

    MISSING_IGNORES=()
    for pattern in "${RECOMMENDED_IGNORES[@]}"; do
        if ! grep -q "^$pattern$" .gitignore 2>/dev/null; then
            MISSING_IGNORES+=("$pattern")
        fi
    done

    if [ ${#MISSING_IGNORES[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ Consider adding these patterns to .gitignore:${NC}"
        for pattern in "${MISSING_IGNORES[@]}"; do
            echo "  - $pattern"
        done
        echo ""
    else
        echo -e "${GREEN}✓ .gitignore looks good${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠ No .gitignore file found${NC}"
    echo ""
fi

# Check environment variables
echo -e "${BLUE}Checking for environment variable usage...${NC}"

ENV_VAR_PATTERNS=(
    "os\\.environ\\.get"
    "process\\.env\\."
    "System\\.getenv"
    "ENV\\["
)

USES_ENV_VARS=false
for pattern in "${ENV_VAR_PATTERNS[@]}"; do
    if grep -r -E "$pattern" . --include="*.py" --include="*.js" --include="*.ts" --include="*.java" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv 2>/dev/null | head -1 > /dev/null; then
        USES_ENV_VARS=true
        break
    fi
done

if [ "$USES_ENV_VARS" = true ]; then
    echo -e "${GREEN}✓ Code uses environment variables (good practice)${NC}"
else
    echo -e "${YELLOW}⚠ No environment variable usage detected${NC}"
    echo "  Consider using environment variables for secrets"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Scan Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $FINDINGS -gt 0 ]; then
    echo -e "${RED}Total findings: $FINDINGS${NC}"
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    echo "1. Remove hardcoded secrets from code"
    echo "2. Use environment variables instead"
    echo "3. Add sensitive files to .gitignore"
    echo "4. Rotate any exposed credentials immediately"
    echo "5. Use secret management tools (AWS Secrets Manager, HashiCorp Vault, etc.)"
    echo "6. Enable git-secrets or similar pre-commit hooks"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ No obvious secrets found${NC}"
    echo ""
    echo "Note: This is a basic scan. Consider using:"
    echo "  - TruffleHog: pip install trufflehog"
    echo "  - git-secrets: https://github.com/awslabs/git-secrets"
    echo "  - detect-secrets: pip install detect-secrets"
    echo ""
    exit 0
fi

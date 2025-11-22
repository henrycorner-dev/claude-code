#!/bin/bash

# Security Scanning Script
# Performs automated security checks on codebase

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/security-scan-$TIMESTAMP.txt"

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Security Scanning Tool${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Initialize report
{
    echo "Security Scan Report"
    echo "===================="
    echo "Date: $(date)"
    echo "Directory: $(pwd)"
    echo ""
} > "$REPORT_FILE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to add section to report
add_section() {
    echo "" >> "$REPORT_FILE"
    echo "========================================" >> "$REPORT_FILE"
    echo "$1" >> "$REPORT_FILE"
    echo "========================================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Function to run check
run_check() {
    local name=$1
    local command=$2

    echo -e "${BLUE}Running: $name${NC}"
    add_section "$name"

    if eval "$command" >> "$REPORT_FILE" 2>&1; then
        echo -e "${GREEN}✓ $name completed${NC}"
    else
        echo -e "${YELLOW}⚠ $name completed with warnings${NC}"
    fi
    echo ""
}

# 1. Check for hardcoded secrets
echo -e "${BLUE}[1/8] Checking for hardcoded secrets...${NC}"
add_section "Hardcoded Secrets Check"

if command_exists trufflehog; then
    trufflehog filesystem . --json >> "$REPORT_FILE" 2>&1 || true
    echo -e "${GREEN}✓ TruffleHog scan completed${NC}"
else
    echo "Searching for common patterns..."
    {
        echo "Searching for potential secrets in code..."
        echo ""
        echo "API Keys:"
        grep -r -i "api[_-]key\s*=" --include="*.py" --include="*.js" --include="*.env" . 2>/dev/null || echo "None found"
        echo ""
        echo "Passwords:"
        grep -r -i "password\s*=" --include="*.py" --include="*.js" --include="*.env" . 2>/dev/null || echo "None found"
        echo ""
        echo "Private Keys:"
        grep -r "BEGIN.*PRIVATE KEY" --include="*.pem" --include="*.key" . 2>/dev/null || echo "None found"
    } >> "$REPORT_FILE"
    echo -e "${YELLOW}⚠ TruffleHog not installed. Using basic pattern matching.${NC}"
fi
echo ""

# 2. Python dependency vulnerabilities
echo -e "${BLUE}[2/8] Checking Python dependencies...${NC}"
if [ -f "requirements.txt" ] && command_exists pip-audit; then
    run_check "Python Dependency Vulnerabilities (pip-audit)" "pip-audit -r requirements.txt"
elif [ -f "requirements.txt" ] && command_exists safety; then
    run_check "Python Dependency Vulnerabilities (safety)" "safety check -r requirements.txt"
else
    echo -e "${YELLOW}⚠ No requirements.txt or vulnerability scanner found${NC}"
    echo ""
fi

# 3. Node.js dependency vulnerabilities
echo -e "${BLUE}[3/8] Checking Node.js dependencies...${NC}"
if [ -f "package.json" ] && command_exists npm; then
    run_check "Node.js Dependency Vulnerabilities" "npm audit"
elif [ -f "package.json" ] && command_exists yarn; then
    run_check "Node.js Dependency Vulnerabilities" "yarn audit"
else
    echo -e "${YELLOW}⚠ No package.json found${NC}"
    echo ""
fi

# 4. Bandit (Python security linter)
echo -e "${BLUE}[4/8] Running Bandit (Python)...${NC}"
if command_exists bandit; then
    run_check "Bandit Python Security Analysis" "bandit -r . -f txt"
else
    echo -e "${YELLOW}⚠ Bandit not installed (pip install bandit)${NC}"
    echo ""
fi

# 5. Semgrep (multi-language security scanner)
echo -e "${BLUE}[5/8] Running Semgrep...${NC}"
if command_exists semgrep; then
    run_check "Semgrep Security Scan" "semgrep --config=auto --error ."
else
    echo -e "${YELLOW}⚠ Semgrep not installed (pip install semgrep)${NC}"
    echo ""
fi

# 6. Check for common vulnerabilities
echo -e "${BLUE}[6/8] Checking for common vulnerability patterns...${NC}"
add_section "Common Vulnerability Patterns"

{
    echo "SQL Injection Patterns:"
    grep -r "execute.*+" --include="*.py" . 2>/dev/null | head -20 || echo "None found"
    grep -r "execute.*f\"" --include="*.py" . 2>/dev/null | head -20 || echo "None found"

    echo ""
    echo "Command Injection Patterns:"
    grep -r "os\.system" --include="*.py" . 2>/dev/null | head -20 || echo "None found"
    grep -r "subprocess.*shell=True" --include="*.py" . 2>/dev/null | head -20 || echo "None found"

    echo ""
    echo "Insecure Deserialization:"
    grep -r "pickle\.loads" --include="*.py" . 2>/dev/null | head -20 || echo "None found"
    grep -r "yaml\.load[^_]" --include="*.py" . 2>/dev/null | head -20 || echo "None found"

    echo ""
    echo "Weak Cryptography:"
    grep -r -E "md5|sha1|DES" --include="*.py" --include="*.js" . 2>/dev/null | head -20 || echo "None found"

    echo ""
    echo "Debug Mode in Production:"
    grep -r "debug.*=.*True" --include="*.py" . 2>/dev/null | head -20 || echo "None found"
    grep -r "DEBUG.*=.*true" --include="*.js" --include="*.env" . 2>/dev/null | head -20 || echo "None found"
} >> "$REPORT_FILE"

echo -e "${GREEN}✓ Pattern check completed${NC}"
echo ""

# 7. Check file permissions
echo -e "${BLUE}[7/8] Checking file permissions...${NC}"
add_section "File Permissions Check"

{
    echo "World-writable files:"
    find . -type f -perm -002 2>/dev/null | grep -v ".git" | head -20 || echo "None found"

    echo ""
    echo "Files with passwords/keys in name:"
    find . -type f \( -name "*password*" -o -name "*secret*" -o -name "*.key" -o -name "*.pem" \) 2>/dev/null | grep -v ".git" || echo "None found"
} >> "$REPORT_FILE"

echo -e "${GREEN}✓ Permission check completed${NC}"
echo ""

# 8. Check for security headers (if web application)
echo -e "${BLUE}[8/8] Searching for security headers configuration...${NC}"
add_section "Security Headers Check"

{
    echo "Security headers in code:"
    grep -r "Content-Security-Policy" --include="*.py" --include="*.js" . 2>/dev/null | head -10 || echo "None found"
    grep -r "X-Frame-Options" --include="*.py" --include="*.js" . 2>/dev/null | head -10 || echo "None found"
    grep -r "Strict-Transport-Security" --include="*.py" --include="*.js" . 2>/dev/null | head -10 || echo "None found"
} >> "$REPORT_FILE"

echo -e "${GREEN}✓ Headers check completed${NC}"
echo ""

# Generate summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Scan Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Report saved to: ${GREEN}$REPORT_FILE${NC}"
echo ""

# Count findings
HIGH_COUNT=$(grep -c "HIGH" "$REPORT_FILE" 2>/dev/null || echo "0")
MEDIUM_COUNT=$(grep -c "MEDIUM" "$REPORT_FILE" 2>/dev/null || echo "0")
LOW_COUNT=$(grep -c "LOW" "$REPORT_FILE" 2>/dev/null || echo "0")

echo -e "${RED}High severity issues: $HIGH_COUNT${NC}"
echo -e "${YELLOW}Medium severity issues: $MEDIUM_COUNT${NC}"
echo -e "${GREEN}Low severity issues: $LOW_COUNT${NC}"
echo ""

# Recommendations
echo -e "${BLUE}Recommendations:${NC}"
echo "1. Review the report file for detailed findings"
echo "2. Install missing security tools for comprehensive scanning:"

if ! command_exists trufflehog; then
    echo "   - TruffleHog: pip install trufflehog"
fi

if ! command_exists bandit; then
    echo "   - Bandit: pip install bandit"
fi

if ! command_exists semgrep; then
    echo "   - Semgrep: pip install semgrep"
fi

if ! command_exists pip-audit; then
    echo "   - pip-audit: pip install pip-audit"
fi

echo "3. Address high severity issues immediately"
echo "4. Schedule regular security scans"
echo ""

exit 0

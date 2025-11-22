#!/bin/bash
# Docker image optimization analyzer

set -euo pipefail

IMAGE="${1:-}"

if [ -z "$IMAGE" ]; then
    echo "Usage: $0 <image:tag>"
    echo "Example: $0 myapp:latest"
    exit 1
fi

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=== Docker Image Optimization Analysis ==="
echo "Analyzing: $IMAGE"
echo

# Check if image exists
if ! docker image inspect "$IMAGE" &> /dev/null; then
    echo -e "${RED}❌ Error: Image $IMAGE not found${NC}"
    exit 1
fi

echo "--- Image Information ---"
SIZE=$(docker image inspect "$IMAGE" --format='{{.Size}}' | awk '{print $1/1024/1024}')
echo -e "Size: ${BLUE}$(printf "%.2f" $SIZE) MB${NC}"

CREATED=$(docker image inspect "$IMAGE" --format='{{.Created}}')
echo "Created: $CREATED"

LAYERS=$(docker history "$IMAGE" --no-trunc | wc -l)
echo "Layers: $LAYERS"

echo
echo "--- Layer Analysis ---"
docker history "$IMAGE" --human --format "table {{.CreatedBy}}\t{{.Size}}" | head -20

echo
echo "--- Optimization Suggestions ---"

SUGGESTIONS=0

# Check image size
if (( $(echo "$SIZE > 500" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Image is large (>500MB)${NC}"
    echo "   Consider:"
    echo "   - Using alpine or slim base image"
    echo "   - Multi-stage builds"
    echo "   - Removing unnecessary dependencies"
    ((SUGGESTIONS++))
fi

# Check layer count
if [ "$LAYERS" -gt 20 ]; then
    echo -e "${YELLOW}⚠️  Many layers ($LAYERS)${NC}"
    echo "   Consider:"
    echo "   - Combining RUN commands with &&"
    echo "   - Using multi-stage builds"
    ((SUGGESTIONS++))
fi

# Check for package managers
if docker history "$IMAGE" --no-trunc | grep -q "apt-get install\|yum install\|apk add"; then
    if ! docker history "$IMAGE" --no-trunc | grep -q "apt-get clean\|yum clean\|rm -rf /var/lib/apt"; then
        echo -e "${YELLOW}⚠️  Package manager used without cleanup${NC}"
        echo "   Add cleanup commands:"
        echo "   - apt-get: && apt-get clean && rm -rf /var/lib/apt/lists/*"
        echo "   - yum: && yum clean all"
        echo "   - apk: && rm -rf /var/cache/apk/*"
        ((SUGGESTIONS++))
    fi
fi

# Check for development dependencies
if docker run --rm "$IMAGE" sh -c "which git gcc make" 2>/dev/null | grep -q "/"; then
    echo -e "${YELLOW}⚠️  Development tools found in image${NC}"
    echo "   Consider:"
    echo "   - Using multi-stage build"
    echo "   - Removing build tools from final image"
    ((SUGGESTIONS++))
fi

# Check base image
BASE_IMAGE=$(docker history "$IMAGE" --no-trunc --format "{{.CreatedBy}}" | tail -1 | grep -oP 'FROM \K[^\s]+' || echo "unknown")
if [[ "$BASE_IMAGE" == *":latest"* ]]; then
    echo -e "${YELLOW}⚠️  Using :latest tag for base image${NC}"
    echo "   Pin to specific version for reproducibility"
    ((SUGGESTIONS++))
fi

if [[ ! "$BASE_IMAGE" =~ alpine|slim|distroless ]]; then
    echo -e "${YELLOW}⚠️  Not using minimal base image${NC}"
    echo "   Consider:"
    echo "   - alpine (smallest)"
    echo "   - slim (debian-based)"
    echo "   - distroless (google)"
    ((SUGGESTIONS++))
fi

echo
echo "--- Security Scan ---"

# Check if trivy is available
if command -v trivy &> /dev/null; then
    echo "Running Trivy scan..."
    VULNS=$(trivy image --severity HIGH,CRITICAL --quiet "$IMAGE" | grep "Total:" | awk '{print $2}')
    if [ -n "$VULNS" ] && [ "$VULNS" -gt 0 ]; then
        echo -e "${RED}⚠️  Found $VULNS HIGH/CRITICAL vulnerabilities${NC}"
        echo "   Run: trivy image $IMAGE"
        ((SUGGESTIONS++))
    else
        echo -e "${GREEN}✅ No HIGH/CRITICAL vulnerabilities found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Trivy not installed${NC}"
    echo "   Install: https://github.com/aquasecurity/trivy"
fi

echo
echo "--- Best Practices Check ---"

# Check if running as root
USER=$(docker image inspect "$IMAGE" --format='{{.Config.User}}')
if [ -z "$USER" ] || [ "$USER" = "root" ] || [ "$USER" = "0" ]; then
    echo -e "${YELLOW}⚠️  Image runs as root${NC}"
    echo "   Add: USER nonroot"
    ((SUGGESTIONS++))
else
    echo -e "${GREEN}✅ Running as non-root user ($USER)${NC}"
fi

# Check for health check
HEALTHCHECK=$(docker image inspect "$IMAGE" --format='{{.Config.Healthcheck}}')
if [ "$HEALTHCHECK" = "<nil>" ]; then
    echo -e "${YELLOW}⚠️  No health check defined${NC}"
    echo "   Add: HEALTHCHECK instruction"
    ((SUGGESTIONS++))
else
    echo -e "${GREEN}✅ Health check configured${NC}"
fi

echo
echo "--- Comparison with Alpine ---"

# Try to estimate alpine equivalent
if [[ "$BASE_IMAGE" =~ node ]]; then
    ALPINE_ESTIMATE=50
    echo "Estimated alpine equivalent: ~${ALPINE_ESTIMATE}MB"
    SAVINGS=$(echo "$SIZE - $ALPINE_ESTIMATE" | bc)
    if (( $(echo "$SAVINGS > 0" | bc -l) )); then
        echo -e "${GREEN}Potential savings: ~$(printf "%.2f" $SAVINGS)MB${NC}"
    fi
elif [[ "$BASE_IMAGE" =~ python ]]; then
    ALPINE_ESTIMATE=100
    echo "Estimated alpine equivalent: ~${ALPINE_ESTIMATE}MB"
    SAVINGS=$(echo "$SIZE - $ALPINE_ESTIMATE" | bc)
    if (( $(echo "$SAVINGS > 0" | bc -l) )); then
        echo -e "${GREEN}Potential savings: ~$(printf "%.2f" $SAVINGS)MB${NC}"
    fi
fi

echo
echo "=== Summary ==="
if [ $SUGGESTIONS -eq 0 ]; then
    echo -e "${GREEN}✅ Image is well optimized!${NC}"
else
    echo -e "${YELLOW}Found $SUGGESTIONS optimization opportunities${NC}"
fi

echo
echo "--- Quick Wins ---"
echo "1. Use multi-stage builds"
echo "2. Switch to alpine/slim base"
echo "3. Combine RUN commands"
echo "4. Clean package manager cache"
echo "5. Add .dockerignore"
echo "6. Run as non-root user"
echo "7. Remove development tools"

echo
echo "--- Analysis Tools ---"
echo "• dive - Interactive layer explorer: dive $IMAGE"
echo "• docker-slim - Automatic optimization: docker-slim build $IMAGE"
echo "• trivy - Vulnerability scanner: trivy image $IMAGE"

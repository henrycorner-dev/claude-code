#!/bin/bash
# Kubernetes manifest validation script

set -euo pipefail

MANIFEST="${1:-}"

if [ -z "$MANIFEST" ]; then
    echo "Usage: $0 <manifest.yaml>"
    exit 1
fi

# Check if file exists
if [ ! -f "$MANIFEST" ]; then
    echo "❌ Error: $MANIFEST not found"
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

echo "=== Kubernetes Manifest Validation ==="
echo "Checking: $MANIFEST"
echo

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "⚠️  kubectl not found, skipping kubectl validation"
    KUBECTL_AVAILABLE=false
else
    KUBECTL_AVAILABLE=true
fi

# Basic YAML syntax validation
echo "--- YAML Syntax ---"
if command -v yamllint &> /dev/null; then
    if yamllint "$MANIFEST" 2>&1 | grep -q "error"; then
        error "YAML syntax errors found"
    else
        pass "YAML syntax is valid"
    fi
else
    warning "yamllint not installed, skipping YAML validation"
fi

# kubectl dry-run validation
if [ "$KUBECTL_AVAILABLE" = true ]; then
    echo
    echo "--- Kubectl Validation ---"
    if kubectl apply --dry-run=client -f "$MANIFEST" &> /dev/null; then
        pass "kubectl dry-run passed"
    else
        error "kubectl dry-run failed"
    fi
fi

echo
echo "--- Security Checks ---"

# Check for runAsNonRoot
if grep -q "kind: Deployment\|kind: StatefulSet\|kind: Pod" "$MANIFEST"; then
    if grep -q "runAsNonRoot: true" "$MANIFEST"; then
        pass "runAsNonRoot is enabled"
    else
        warning "runAsNonRoot not set to true"
    fi

    # Check for runAsUser
    if grep -q "runAsUser:" "$MANIFEST"; then
        pass "runAsUser is specified"
    else
        warning "runAsUser not specified"
    fi

    # Check for readOnlyRootFilesystem
    if grep -q "readOnlyRootFilesystem: true" "$MANIFEST"; then
        pass "readOnlyRootFilesystem enabled"
    else
        warning "readOnlyRootFilesystem not enabled"
    fi

    # Check for capabilities drop
    if grep -q "drop:" "$MANIFEST"; then
        pass "Capabilities drop configured"
    else
        warning "No capabilities drop configured"
    fi
fi

# Check for secrets in plaintext
if grep -qE "password:|secret:|token:" "$MANIFEST" | grep -v "secretKeyRef"; then
    warning "Potential secrets in plaintext (use secrets)"
fi

echo
echo "--- Resource Management ---"

# Check for resource requests and limits
if grep -q "kind: Deployment\|kind: StatefulSet" "$MANIFEST"; then
    if grep -q "resources:" "$MANIFEST"; then
        pass "Resource configuration present"

        if grep -q "requests:" "$MANIFEST"; then
            pass "Resource requests defined"
        else
            error "No resource requests defined"
        fi

        if grep -q "limits:" "$MANIFEST"; then
            pass "Resource limits defined"
        else
            warning "No resource limits defined"
        fi
    else
        error "No resource configuration"
    fi
fi

echo
echo "--- Health Checks ---"

# Check for probes
if grep -q "kind: Deployment\|kind: StatefulSet" "$MANIFEST"; then
    if grep -q "livenessProbe:" "$MANIFEST"; then
        pass "Liveness probe configured"
    else
        warning "No liveness probe"
    fi

    if grep -q "readinessProbe:" "$MANIFEST"; then
        pass "Readiness probe configured"
    else
        warning "No readiness probe"
    fi
fi

echo
echo "--- High Availability ---"

# Check replica count
if grep -q "kind: Deployment\|kind: StatefulSet" "$MANIFEST"; then
    REPLICAS=$(grep "replicas:" "$MANIFEST" | head -1 | awk '{print $2}')
    if [ -n "$REPLICAS" ]; then
        if [ "$REPLICAS" -ge 2 ]; then
            pass "Multiple replicas configured ($REPLICAS)"
        else
            warning "Only 1 replica configured"
        fi
    fi

    # Check for PodDisruptionBudget
    if grep -q "kind: PodDisruptionBudget" "$MANIFEST"; then
        pass "PodDisruptionBudget present"
    else
        warning "No PodDisruptionBudget"
    fi

    # Check for anti-affinity
    if grep -q "podAntiAffinity" "$MANIFEST"; then
        pass "Pod anti-affinity configured"
    else
        warning "No pod anti-affinity rules"
    fi
fi

echo
echo "--- Best Practices ---"

# Check for labels
if grep -q "labels:" "$MANIFEST"; then
    pass "Labels present"

    # Check for recommended labels
    if grep -q "app:" "$MANIFEST"; then
        pass "app label present"
    else
        warning "app label missing"
    fi
else
    warning "No labels defined"
fi

# Check for namespace
if grep -q "namespace:" "$MANIFEST"; then
    pass "Namespace specified"
else
    warning "No namespace specified (will use default)"
fi

# Check for HPA if Deployment
if grep -q "kind: Deployment" "$MANIFEST"; then
    if grep -q "kind: HorizontalPodAutoscaler" "$MANIFEST"; then
        pass "HorizontalPodAutoscaler present"
    else
        warning "Consider adding HorizontalPodAutoscaler"
    fi
fi

# Check for NetworkPolicy
if grep -q "kind: NetworkPolicy" "$MANIFEST"; then
    pass "NetworkPolicy defined"
else
    warning "No NetworkPolicy (consider for security)"
fi

# Check for image pull policy
if grep -q "imagePullPolicy:" "$MANIFEST"; then
    if grep -q "imagePullPolicy: Always" "$MANIFEST"; then
        warning "imagePullPolicy: Always may cause rate limits"
    else
        pass "Image pull policy configured appropriately"
    fi
else
    warning "No imagePullPolicy specified"
fi

# Check for image tags (not latest)
if grep -qE "image:.*:latest" "$MANIFEST"; then
    error "Using :latest tag (specify version)"
else
    pass "No :latest tags found"
fi

echo
echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Errors: $ERRORS${NC}"

# Exit with error if there are critical errors
if [ $ERRORS -gt 0 ]; then
    echo
    echo "❌ Validation failed with $ERRORS error(s)"
    exit 1
else
    echo
    echo "✅ Validation passed"
    if [ $WARNINGS -gt 0 ]; then
        echo "   (with $WARNINGS warning(s))"
    fi
    exit 0
fi

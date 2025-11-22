# Docker Comprehensive Guide

Advanced Dockerfile optimization, security hardening, and multi-architecture builds.

## Multi-Stage Build Patterns

### Node.js Application

**Optimized Production Build:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only necessary files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Python Application

**With Virtual Environment:**
```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

# Copy application
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Go Application

**Minimal Image with Distroless:**
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage - distroless
FROM gcr.io/distroless/static-debian12
WORKDIR /

# Copy binary from builder
COPY --from=builder /app/main /main

# Run as non-root
USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/main"]
```

## Layer Optimization

### Ordering Best Practices

**Bad - Frequent Rebuilds:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Good - Optimized Caching:**
```dockerfile
FROM node:20-alpine
WORKDIR /app

# Dependencies (rarely change)
COPY package*.json ./
RUN npm ci

# Source code (changes frequently)
COPY . .

CMD ["npm", "start"]
```

### Combining Commands

**Bad - Multiple Layers:**
```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim
RUN apt-get clean
```

**Good - Single Layer:**
```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Security Hardening

### Non-Root User

**Alpine:**
```dockerfile
FROM alpine:3.19

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown appuser:appgroup /app

USER appuser
```

**Debian/Ubuntu:**
```dockerfile
FROM debian:12-slim

RUN groupadd -r appgroup -g 1001 && \
    useradd -r -u 1001 -g appgroup appuser

WORKDIR /app
RUN chown appuser:appgroup /app

USER appuser
```

### Minimal Base Images

**Size Comparison:**
- `ubuntu:22.04` - ~77MB
- `debian:12-slim` - ~74MB
- `alpine:3.19` - ~7MB
- `gcr.io/distroless/static` - ~2MB

**Distroless Benefits:**
- No shell or package manager
- Minimal attack surface
- Only runtime dependencies
- Cannot execute arbitrary commands

**When to Use Each:**
- **Alpine**: Balance of size and compatibility
- **Distroless**: Maximum security for static binaries
- **Slim**: Need more tools, compatibility
- **Full**: Development only

### Secret Management

**Bad - Secrets in Image:**
```dockerfile
# NEVER do this
COPY .env .
RUN echo "API_KEY=secret123" >> /app/config
```

**Good - Runtime Secrets:**
```dockerfile
# Use environment variables at runtime
ENV API_KEY=""

# Or mount secrets
VOLUME /run/secrets
```

**Docker Build Secrets:**
```dockerfile
# syntax=docker/dockerfile:1
FROM alpine

RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && \
    curl -H "Authorization: Bearer $API_KEY" https://api.example.com/data > /data.json
```

Build command:
```bash
docker build --secret id=api_key,src=./api_key.txt .
```

## .dockerignore

**Comprehensive Example:**
```
# Version control
.git
.gitignore
.gitattributes

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# Dependencies
node_modules
vendor
__pycache__
*.pyc

# Build artifacts
dist
build
*.log
coverage

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Documentation
README.md
docs
*.md

# Tests
tests
test
*.test.js
*.spec.js

# Environment
.env
.env.local
.env.*.local

# Docker
Dockerfile*
docker-compose*.yml
.dockerignore
```

## Health Checks

### Application Health

```dockerfile
FROM node:20-alpine

COPY . /app
WORKDIR /app

RUN npm ci

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "server.js"]
```

**healthcheck.js:**
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => process.exit(1));
request.end();
```

## Multi-Architecture Builds

### Buildx Setup

```bash
# Create builder
docker buildx create --name mybuilder --use

# Inspect builder
docker buildx inspect --bootstrap
```

### Multi-Platform Dockerfile

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.21-alpine AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app
COPY . .

RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o app

FROM alpine:3.19
COPY --from=builder /app/app /app
CMD ["/app"]
```

### Build and Push

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag myimage:latest \
  --push \
  .
```

## Build Arguments and Variables

### Build-Time Arguments

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

ARG BUILD_DATE
ARG VERSION
ARG COMMIT_SHA

LABEL org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$COMMIT_SHA

COPY . /app
WORKDIR /app

# Use ARG in RUN
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc && \
    npm ci && \
    rm .npmrc
```

Build command:
```bash
docker build \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VERSION=1.2.3 \
  --build-arg COMMIT_SHA=$(git rev-parse HEAD) \
  --build-arg NPM_TOKEN=${NPM_TOKEN} \
  -t myapp:1.2.3 \
  .
```

## Caching Strategies

### BuildKit Cache Mounts

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Cache npm packages
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Cache pip packages
FROM python:3.11-slim
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Cache Go modules
FROM golang:1.21
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
```

### External Cache

**GitHub Actions:**
```yaml
- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myimage:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Registry Cache:**
```bash
docker buildx build \
  --cache-from type=registry,ref=myregistry/myimage:cache \
  --cache-to type=registry,ref=myregistry/myimage:cache,mode=max \
  --tag myimage:latest \
  --push \
  .
```

## Image Scanning

### Trivy

```bash
# Scan local image
trivy image myimage:latest

# Scan for HIGH and CRITICAL only
trivy image --severity HIGH,CRITICAL myimage:latest

# Generate report
trivy image --format json --output report.json myimage:latest

# Scan Dockerfile
trivy config Dockerfile
```

### Docker Scout

```bash
# Scan image
docker scout cves myimage:latest

# Compare images
docker scout compare --to myimage:old myimage:latest

# Recommendations
docker scout recommendations myimage:latest
```

### Grype

```bash
# Scan image
grype myimage:latest

# Output formats
grype myimage:latest -o json
grype myimage:latest -o sarif
```

## Performance Optimization

### Minimize Context

**Bad:**
```bash
docker build .  # Sends entire directory
```

**Good:**
```bash
# Use .dockerignore to exclude files
# Or specify context
docker build -f docker/Dockerfile -t app:latest ./src
```

### Parallel Builds

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### BuildKit Features

Enable BuildKit:
```bash
export DOCKER_BUILDKIT=1
docker build .
```

Or in docker-compose:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      x-bake:
        build-args:
          BUILDKIT_INLINE_CACHE: 1
```

## Advanced Patterns

### Development vs Production

**Multi-Target Dockerfile:**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development target
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Production target
FROM base AS production
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

Build specific target:
```bash
# Development
docker build --target development -t app:dev .

# Production
docker build --target production -t app:prod .
```

### Conditional Logic

```dockerfile
ARG ENVIRONMENT=production

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./

# Install all deps for dev, only production for prod
RUN if [ "$ENVIRONMENT" = "development" ]; then \
      npm install; \
    else \
      npm ci --only=production; \
    fi

COPY . .

CMD ["npm", "start"]
```

## Debugging

### Interactive Shell

```bash
# Run with shell
docker run -it myimage:latest /bin/sh

# Override entrypoint
docker run -it --entrypoint /bin/sh myimage:latest

# Execute in running container
docker exec -it container_name /bin/sh
```

### Build Debugging

```bash
# Stop at specific stage
docker build --target builder -t debug .
docker run -it debug /bin/sh

# See detailed build output
BUILDKIT_PROGRESS=plain docker build .
```

### Layer Inspection

```bash
# Inspect image
docker history myimage:latest

# Dive tool for detailed analysis
dive myimage:latest
```

## Best Practices Summary

**Image Size:**
- Use multi-stage builds
- Choose minimal base images
- Combine RUN commands
- Clean up in same layer
- Use .dockerignore

**Security:**
- Run as non-root user
- Scan for vulnerabilities
- Use specific version tags
- Don't store secrets in images
- Minimize installed packages
- Keep base images updated

**Performance:**
- Order layers by change frequency
- Use BuildKit cache mounts
- Leverage build cache
- Minimize build context
- Use external cache for CI

**Maintainability:**
- Document ARGs and defaults
- Add labels for metadata
- Use meaningful stage names
- Keep Dockerfiles simple
- Version your images properly

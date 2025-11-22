---
name: deployment-ops
description: This skill should be used when the user asks to "set up CI/CD", "create GitHub Actions workflow", "configure Jenkins pipeline", "containerize application", "write Dockerfile", "set up Docker Compose", "deploy to Kubernetes", "create K8s manifests", "set up monitoring", "configure Prometheus", "add Grafana dashboards", "optimize deployment pipeline", or mentions deployment automation, container orchestration, or infrastructure monitoring.
version: 0.1.0
---

# Deployment Operations

Specialized guidance for CI/CD pipelines, containerization, orchestration, and monitoring infrastructure. Provides workflows, best practices, and reusable configurations for modern deployment operations.

## Purpose

Assist with designing, implementing, and optimizing deployment infrastructure including:

- **CI/CD Pipelines**: GitHub Actions, Jenkins, GitLab CI
- **Containerization**: Docker, multi-stage builds, optimization
- **Orchestration**: Kubernetes deployments, services, and configurations
- **Monitoring**: Prometheus metrics, Grafana dashboards, alerting

## When to Use This Skill

Use this skill for deployment operations tasks:

- Setting up or modifying CI/CD pipelines
- Creating Docker containers and optimizing images
- Deploying applications to Kubernetes
- Implementing monitoring and observability
- Troubleshooting deployment issues
- Optimizing build and deployment processes

## CI/CD Pipelines

### GitHub Actions Workflows

Create workflow files in `.github/workflows/` directory:

**Basic Structure:**

```yaml
name: Workflow Name
on: [push, pull_request]
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Step name
        run: command
```

**Common Patterns:**

- Use caching for dependencies (`actions/cache`)
- Run tests in parallel with matrix strategy
- Use secrets for credentials (`${{ secrets.SECRET_NAME }}`)
- Implement conditional steps with `if:` conditions
- Use artifacts for sharing data between jobs

**Best Practices:**

- Pin action versions (`@v4` not `@main`)
- Use minimal permissions with `permissions:`
- Fail fast in matrix builds
- Set reasonable timeouts
- Use reusable workflows for common patterns

For detailed patterns and examples, see `references/github-actions.md`.

### Jenkins Pipelines

Create `Jenkinsfile` in repository root:

**Declarative Pipeline Structure:**

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // build steps
            }
        }
    }
}
```

**Key Features:**

- Use agents for distributed builds
- Define environment variables in `environment` block
- Implement post-build actions in `post` section
- Use `when` directives for conditional execution
- Store credentials in Jenkins credential store

For Jenkins best practices and advanced patterns, see `references/jenkins.md`.

## Containerization

### Docker Best Practices

**Multi-Stage Builds:**
Reduce image size by separating build and runtime dependencies:

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]
```

**Key Optimization Techniques:**

- Use alpine or distroless base images
- Order layers from least to most frequently changed
- Combine RUN commands to reduce layers
- Use `.dockerignore` to exclude unnecessary files
- Run as non-root user for security
- Use specific version tags, never `latest`

**Security Considerations:**

- Scan images with `docker scan` or Trivy
- Keep base images updated
- Minimize installed packages
- Don't store secrets in images
- Use multi-stage builds to exclude build tools

For detailed Dockerfile examples and optimization techniques, see `references/docker.md`.

### Docker Compose

For local development and multi-container applications:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

## Kubernetes Orchestration

### Core Resource Types

**Deployment:**
Manages stateless application replicas:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

**Service:**
Exposes applications internally or externally:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP # or LoadBalancer, NodePort
```

**ConfigMap & Secrets:**
Manage configuration and sensitive data:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  config.yaml: |
    key: value
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  password: base64encodedvalue
```

**Best Practices:**

- Set resource requests and limits
- Use liveness and readiness probes
- Implement horizontal pod autoscaling
- Use namespaces for isolation
- Apply labels consistently
- Version ConfigMaps and trigger rolling updates
- Never commit unencrypted secrets

For comprehensive Kubernetes patterns and production configurations, see `references/kubernetes.md`.

## Monitoring and Observability

### Prometheus Metrics

**Instrumentation Patterns:**

For applications, expose metrics endpoint (typically `/metrics`):

```python
# Python example
from prometheus_client import Counter, Histogram, start_http_server

request_count = Counter('app_requests_total', 'Total requests')
request_duration = Histogram('app_request_duration_seconds', 'Request duration')

@request_duration.time()
def handle_request():
    request_count.inc()
    # handle request
```

**Key Metric Types:**

- **Counter**: Monotonically increasing value (requests, errors)
- **Gauge**: Value that can go up or down (active connections, queue size)
- **Histogram**: Observations in buckets (request duration, response size)
- **Summary**: Similar to histogram with quantiles

**ServiceMonitor for Kubernetes:**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-metrics
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
    - port: metrics
      interval: 30s
```

### Grafana Dashboards

**Dashboard Components:**

- Panels for visualizing metrics
- Variables for dynamic filtering
- Alerts for threshold violations
- Annotations for deployment markers

**Common Query Patterns:**

- Rate of change: `rate(metric[5m])`
- Aggregation: `sum(metric) by (label)`
- Percentiles: `histogram_quantile(0.95, metric)`

For detailed monitoring setup, alerting rules, and dashboard examples, see `references/monitoring.md`.

## Deployment Workflow

### Standard Deployment Process

1. **Build Phase:**
   - Run tests and linting
   - Build artifacts (binaries, containers)
   - Tag with version/commit hash
   - Push to registry

2. **Deployment Phase:**
   - Update manifests with new image tags
   - Apply to staging environment first
   - Run smoke tests
   - Promote to production with rolling update
   - Monitor metrics and logs

3. **Rollback Strategy:**
   - Keep previous versions available
   - Implement automated rollback on failure
   - Use Kubernetes rollout history
   - Monitor error rates during deployment

### Environment Strategy

**Recommended Environments:**

- **Development**: Local Docker Compose
- **Staging**: Kubernetes cluster mirroring production
- **Production**: Kubernetes with HA and monitoring

**Configuration Management:**

- Use separate ConfigMaps per environment
- Externalize all environment-specific values
- Use tools like Kustomize or Helm for overlays
- Never hardcode environment values

## Troubleshooting

### Common Issues

**Container Issues:**

- Check logs: `docker logs <container>`
- Inspect: `docker inspect <container>`
- Execute shell: `docker exec -it <container> sh`
- Check resource usage: `docker stats`

**Kubernetes Issues:**

- Check pod status: `kubectl get pods`
- View logs: `kubectl logs <pod>`
- Describe resource: `kubectl describe <resource> <name>`
- Check events: `kubectl get events --sort-by='.lastTimestamp'`

**CI/CD Pipeline Issues:**

- Review workflow/pipeline logs
- Check secret availability
- Verify permissions and credentials
- Test commands locally first

For detailed troubleshooting guides and debugging techniques, see `references/troubleshooting.md`.

## Additional Resources

### Reference Files

Detailed documentation for specific topics:

- **`references/github-actions.md`** - Advanced GitHub Actions patterns, reusable workflows, marketplace actions
- **`references/jenkins.md`** - Jenkins pipeline best practices, shared libraries, distributed builds
- **`references/docker.md`** - Comprehensive Dockerfile optimization, security hardening, multi-arch builds
- **`references/kubernetes.md`** - Production K8s patterns, StatefulSets, operators, Helm charts
- **`references/monitoring.md`** - Complete monitoring setup, alerting rules, Grafana dashboards, PromQL queries
- **`references/troubleshooting.md`** - Debugging techniques, common issues, performance optimization

### Example Files

Working configurations in `examples/`:

- **`examples/github-actions-nodejs.yml`** - Complete Node.js CI/CD workflow
- **`examples/github-actions-python.yml`** - Python testing and Docker deployment
- **`examples/Dockerfile.nodejs`** - Optimized multi-stage Node.js Dockerfile
- **`examples/Dockerfile.python`** - Python application with production best practices
- **`examples/docker-compose.yml`** - Full-stack development environment
- **`examples/k8s-deployment.yaml`** - Production-ready Kubernetes deployment
- **`examples/prometheus-config.yml`** - Prometheus configuration with alerting
- **`examples/grafana-dashboard.json`** - Application metrics dashboard

### Utility Scripts

Tools in `scripts/`:

- **`scripts/validate-dockerfile.sh`** - Dockerfile linting and security checks
- **`scripts/k8s-validate.sh`** - Kubernetes manifest validation
- **`scripts/docker-optimize.sh`** - Analyze and suggest image optimizations

## Integration with Other Components

### With CI/CD:

- Build and push Docker images in pipeline
- Deploy to Kubernetes from GitHub Actions/Jenkins
- Run integration tests against deployed services
- Implement automated rollback on test failure

### With Monitoring:

- Add deployment annotations to Grafana
- Monitor deployment rollout progress
- Alert on deployment failures or degraded performance
- Track deployment frequency and lead time metrics

### Security Integration:

- Scan containers for vulnerabilities
- Implement image signing and verification
- Use pod security policies/standards
- Rotate credentials regularly
- Audit cluster access and operations

## Quick Reference

### Docker Commands

- Build: `docker build -t image:tag .`
- Run: `docker run -p 8080:80 image:tag`
- Push: `docker push registry/image:tag`
- Compose up: `docker-compose up -d`

### Kubernetes Commands

- Apply: `kubectl apply -f manifest.yaml`
- Get status: `kubectl get pods -n namespace`
- Logs: `kubectl logs -f pod-name`
- Port forward: `kubectl port-forward pod-name 8080:80`
- Scale: `kubectl scale deployment/name --replicas=5`

### Common Patterns

- Blue-green deployments for zero-downtime
- Canary releases for gradual rollout
- Rolling updates as default Kubernetes strategy
- GitOps with ArgoCD or Flux for declarative deployments

## Best Practices Summary

**CI/CD:**

- Run tests before deployment
- Use caching to speed up builds
- Implement proper secret management
- Version all artifacts
- Enable rollback capability

**Containers:**

- Use multi-stage builds
- Minimize image size
- Run as non-root user
- Scan for vulnerabilities
- Use specific version tags

**Kubernetes:**

- Set resource limits
- Implement health checks
- Use horizontal autoscaling
- Separate configs per environment
- Enable monitoring and logging

**Monitoring:**

- Instrument application code
- Set up alerts for critical metrics
- Monitor deployment impact
- Track SLIs and SLOs
- Visualize trends over time

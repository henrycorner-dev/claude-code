# GitHub Actions Advanced Patterns

Comprehensive guide to GitHub Actions workflows, reusable components, and marketplace actions.

## Workflow Triggers

### Event Types

**Push and Pull Request:**
```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - '!docs/**'
  pull_request:
    types: [opened, synchronize, reopened]
```

**Scheduled Workflows:**
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

**Manual Trigger with Inputs:**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: true
```

**Repository Events:**
```yaml
on:
  release:
    types: [published]
  issues:
    types: [opened, labeled]
  pull_request_review:
    types: [submitted]
```

## Matrix Strategies

### Parallel Testing

**Multiple Versions:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
        os: [ubuntu-latest, windows-latest, macos-latest]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

**Including/Excluding Combinations:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    node: [16, 18]
    include:
      - os: windows-latest
        node: 18
    exclude:
      - os: macos-latest
        node: 16
```

## Caching Strategies

### Dependency Caching

**Node.js:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'
- run: npm ci
```

**Custom Cache:**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Python:**
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
- run: pip install -r requirements.txt
```

**Docker Layers:**
```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Reusable Workflows

### Defining Reusable Workflow

Create `.github/workflows/reusable-test.yml`:
```yaml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      environment:
        required: false
        type: string
        default: 'test'
    secrets:
      api-key:
        required: true
    outputs:
      coverage:
        description: "Test coverage percentage"
        value: ${{ jobs.test.outputs.coverage }}

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.coverage.outputs.percentage }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
        env:
          API_KEY: ${{ secrets.api-key }}
          ENVIRONMENT: ${{ inputs.environment }}
      - id: coverage
        run: echo "percentage=$(cat coverage/coverage-summary.json | jq .total.lines.pct)" >> $GITHUB_OUTPUT
```

### Using Reusable Workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      environment: 'ci'
    secrets:
      api-key: ${{ secrets.API_KEY }}

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Coverage was ${{ needs.test.outputs.coverage }}%"
```

## Composite Actions

### Creating Custom Action

Create `.github/actions/setup-project/action.yml`:
```yaml
name: 'Setup Project'
description: 'Install dependencies and cache'
inputs:
  node-version:
    description: 'Node.js version'
    required: true
    default: '18'
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
    - shell: bash
      run: npm ci
    - shell: bash
      run: npm run build
```

### Using Custom Action

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-project
    with:
      node-version: '20'
```

## Environment and Secrets

### Environment Protection Rules

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: echo "Deploying to ${{ vars.ENVIRONMENT_URL }}"
        env:
          API_KEY: ${{ secrets.PROD_API_KEY }}
```

**GitHub Settings:**
- Set environment in repository settings
- Add protection rules (required reviewers, wait timer)
- Configure environment-specific secrets and variables

### Secret Management

**Using Secrets:**
```yaml
steps:
  - name: Login to Registry
    uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}
```

**Multi-line Secrets:**
```yaml
- name: Setup SSH Key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
```

## Artifacts and Uploads

### Uploading Artifacts

```yaml
- name: Run tests
  run: npm test

- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 30
```

### Downloading Artifacts

```yaml
- uses: actions/download-artifact@v4
  with:
    name: coverage-report
    path: ./coverage
```

### Sharing Between Jobs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: ./deploy.sh
```

## Docker Workflows

### Build and Push

```yaml
jobs:
  docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Multi-Platform Builds

```yaml
- uses: docker/setup-qemu-action@v3

- uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: myimage:latest
```

## Conditional Execution

### Job Conditions

```yaml
jobs:
  test:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### Step Conditions

```yaml
steps:
  - name: Run on main only
    if: github.ref == 'refs/heads/main'
    run: echo "Main branch"

  - name: Run on PR
    if: github.event_name == 'pull_request'
    run: echo "Pull request"

  - name: Run on success
    if: success()
    run: echo "Previous steps succeeded"

  - name: Run on failure
    if: failure()
    run: echo "Something failed"

  - name: Always run
    if: always()
    run: echo "Cleanup"
```

## Popular Marketplace Actions

### Code Quality

**ESLint:**
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- run: npm ci
- uses: reviewdog/action-eslint@v1
  with:
    reporter: github-pr-review
```

**SonarCloud:**
```yaml
- uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Security Scanning

**Trivy:**
```yaml
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: myimage:tag
    format: 'sarif'
    output: 'trivy-results.sarif'

- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

**Dependency Review:**
```yaml
- uses: actions/dependency-review-action@v4
  if: github.event_name == 'pull_request'
```

### Notifications

**Slack:**
```yaml
- uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment completed: ${{ github.repository }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Performance Optimization

### Reduce Checkout Time

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1  # Shallow clone
```

### Parallel Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  deploy:
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Advanced Patterns

### Dynamic Matrix

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: echo "matrix=$(cat configs.json | jq -c .)" >> $GITHUB_OUTPUT

  build:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building ${{ matrix.config }}"
```

### Composite Workflows

```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  cd:
    needs: ci
    if: github.ref == 'refs/heads/main'
    uses: ./.github/workflows/cd.yml
    secrets: inherit
```

## Best Practices

**Security:**
- Use pinned versions of actions (commit SHA)
- Minimize GITHUB_TOKEN permissions
- Use environments for production deployments
- Never log secrets
- Use OIDC for cloud provider authentication

**Performance:**
- Cache dependencies aggressively
- Use shallow clones when possible
- Run independent jobs in parallel
- Use self-hosted runners for private repos
- Cancel outdated workflow runs

**Maintainability:**
- Create reusable workflows for common patterns
- Use composite actions for repeated steps
- Document workflow inputs and outputs
- Use meaningful job and step names
- Keep workflows under 1000 lines

**Reliability:**
- Set appropriate timeouts
- Use fail-fast: false for non-critical matrices
- Implement retry logic for flaky operations
- Add status checks to branch protection
- Monitor workflow run times and costs

---
description: One-click deploy (Vercel/Netlify/Heroku/App Stores); CI/CD setup
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "AskUserQuestion", "TodoWrite", "WebFetch"]
---

You are an expert deployment and DevOps engineer. Your task is to deploy the application to the user's chosen platform and set up CI/CD pipelines.

## Deployment Workflow

Follow these steps to deploy the application:

### 1. Project Analysis
- Analyze the project structure and detect the application type (web, mobile, full-stack)
- Check for existing deployment configurations
- Identify the tech stack (React, Next.js, Node.js, React Native, Flutter, etc.)
- Review package.json, build scripts, and environment requirements

### 2. Platform Selection
Use the AskUserQuestion tool to determine:
- Which deployment platform(s) to use:
  - **Vercel**: Best for Next.js, React, static sites
  - **Netlify**: Great for static sites, JAMstack, serverless functions
  - **Heroku**: Ideal for full-stack apps, Node.js backends, databases
  - **Railway**: Modern alternative to Heroku
  - **Fly.io**: Docker-based deployments, global edge
  - **Google Play Store**: Android apps
  - **Apple App Store**: iOS apps
  - **Expo EAS**: React Native apps
- Whether to set up CI/CD pipelines
- Which CI/CD platform (GitHub Actions, GitLab CI, CircleCI, Bitbucket Pipelines)

### 3. Pre-deployment Setup

#### For Web Applications:
- Create/verify build configuration
- Set up environment variables template (.env.example)
- Configure build output directory
- Optimize production builds (compression, minification)
- Set up analytics and monitoring (optional)

#### For Mobile Applications:
- Configure app signing (Android keystore, iOS certificates)
- Set up app icons and splash screens
- Configure app metadata (version, build number)
- Prepare store listings (descriptions, screenshots)

### 4. Platform-Specific Deployment

#### Vercel Deployment:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod

# Set up environment variables
vercel env add VARIABLE_NAME
```

Create `vercel.json` configuration if needed for advanced routing, headers, redirects.

#### Netlify Deployment:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set up environment variables
netlify env:set VARIABLE_NAME value
```

Create `netlify.toml` for build configuration, redirects, headers.

#### Heroku Deployment:
```bash
# Login and create app
heroku login
heroku create app-name

# Add buildpacks if needed
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main

# Set environment variables
heroku config:set VARIABLE_NAME=value

# Add-ons (database, redis, etc.)
heroku addons:create heroku-postgresql
```

Create `Procfile` for process configuration.

#### Railway Deployment:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up

# Environment variables
railway variables set VARIABLE_NAME=value
```

#### Fly.io Deployment:
```bash
# Install flyctl
# Deploy
fly launch
fly deploy

# Secrets
fly secrets set VARIABLE_NAME=value
```

Create `fly.toml` and `Dockerfile` if needed.

#### Mobile App Store Deployment:

**Android (Google Play):**
```bash
# Build release APK/AAB
cd android
./gradlew bundleRelease

# Or for React Native
npx react-native build-android --mode=release

# Or for Expo
eas build --platform android
```

Set up Google Play Console, upload AAB, configure store listing.

**iOS (App Store):**
```bash
# Build for App Store
cd ios
xcodebuild -workspace App.xcworkspace -scheme App archive

# Or for React Native via Xcode
# Or for Expo
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

Set up App Store Connect, configure metadata, screenshots, submit for review.

**Expo EAS (Both Platforms):**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to stores
eas submit --platform all
```

### 5. CI/CD Pipeline Setup

#### GitHub Actions:
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### GitLab CI:
Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist
  only:
    - main
```

#### For Mobile CI/CD:
Configure EAS Build, Fastlane, or platform-specific CI/CD:

```bash
# Fastlane setup
fastlane init

# Configure lanes for building and deploying
# Create Fastfile with deployment lanes
```

### 6. Post-Deployment Configuration

- Set up custom domains
- Configure SSL/TLS certificates
- Set up monitoring and error tracking (Sentry, LogRocket)
- Configure analytics (Google Analytics, Mixpanel)
- Set up performance monitoring
- Configure CDN and caching
- Set up database backups (for backend deployments)
- Create deployment documentation
- Test the deployed application
- Set up status page (optional)

### 7. Environment Variables Management

Create comprehensive environment variable documentation:
- Development variables (.env.local)
- Production variables (platform secrets)
- Required vs optional variables
- Secure handling of sensitive data

### 8. Rollback Strategy

Document rollback procedures:
- How to revert to previous deployment
- Database migration rollback (if applicable)
- Environment variable restoration
- Monitoring for post-deployment issues

### 9. Final Checklist

Provide the user with:
- [ ] Deployment successful and verified
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] CI/CD pipeline running
- [ ] Monitoring and error tracking set up
- [ ] Performance optimizations applied
- [ ] Documentation updated
- [ ] Team members granted access
- [ ] Rollback procedure documented

## Important Notes

1. **Security**: Never commit secrets or API keys to the repository. Use platform environment variables.
2. **Testing**: Always test in a staging environment before production deployment.
3. **Monitoring**: Set up alerts for downtime, errors, and performance issues.
4. **Costs**: Inform the user about pricing for chosen platforms and potential scaling costs.
5. **Compliance**: For mobile apps, ensure compliance with App Store and Play Store guidelines.
6. **Database**: For apps with databases, ensure proper backup and migration strategies.

## Output

Provide the user with:
- Deployment URL(s)
- CI/CD pipeline status
- Configuration files created
- Environment variables that need to be set
- Next steps for custom domain, monitoring, etc.
- Documentation for the deployment process
- Rollback instructions

Be proactive in identifying issues and suggesting optimizations for production deployments.

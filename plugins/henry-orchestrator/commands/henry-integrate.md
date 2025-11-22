---
description: Adds third-party services (Stripe, Analytics); API keys prompt.
argument-hint: Optional service name (stripe, analytics, auth, etc.) or preferences
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "TodoWrite", "AskUserQuestion"]
---

# Third-Party Service Integration

Guide the user through integrating third-party services into their application by intelligently detecting the project type, recommending appropriate services, securely handling API keys, and setting up the necessary configuration.

## Core Principles

- **Detect project context**: Analyze existing files, framework, and dependencies to understand the project
- **Recommend intelligently**: Suggest services that match the project's needs and stack
- **Secure credential handling**: Always use environment variables, never hardcode API keys
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Validate installations**: Test integrations after setup when possible
- **Follow best practices**: Use official SDKs and current best practices for each service

**Initial request:** $ARGUMENTS

---

## Phase 1: Context Analysis & Service Selection

**Goal**: Understand the project and determine which third-party services to integrate

**Actions**:

1. Create todo list with all phases:
   - Analyze project context
   - Select services to integrate
   - Confirm services with user
   - Collect API credentials
   - Install required packages
   - Configure services
   - Update environment files
   - Test integrations
   - Document setup

2. Analyze existing project context:
   - Check package.json for framework (Next.js, React, Express, etc.)
   - Check existing dependencies for already-integrated services
   - Look for existing .env files and current integrations
   - Check for frontend vs backend vs full-stack setup
   - Identify the project type (e-commerce, SaaS, content site, etc.)

3. Parse user arguments from $ARGUMENTS:
   - Specific service names (stripe, analytics, auth, sentry, etc.)
   - Project requirements
   - Any preferences mentioned

4. Recommend services based on project type:

   **E-commerce/Payment Projects**:
   - Stripe (payments)
   - PayPal (alternative payments)
   - Shopify API (if e-commerce)

   **Analytics & Monitoring**:
   - Google Analytics 4
   - Plausible Analytics (privacy-friendly)
   - PostHog (product analytics)
   - Mixpanel (user analytics)
   - Sentry (error tracking)
   - LogRocket (session replay)

   **Authentication**:
   - NextAuth.js / Auth.js
   - Clerk
   - Auth0
   - Supabase Auth
   - Firebase Auth

   **Database & Backend**:
   - Supabase
   - Firebase
   - PlanetScale
   - Neon
   - MongoDB Atlas

   **Email Services**:
   - SendGrid
   - Resend
   - Postmark
   - AWS SES

   **Cloud Storage**:
   - AWS S3
   - Cloudinary
   - UploadThing

   **Other Services**:
   - Vercel Analytics
   - OpenAI API
   - Twilio (SMS)
   - Slack API (notifications)

**Output**: Recommended services list with reasoning

---

## Phase 2: Service Selection Confirmation

**Goal**: Present service recommendations and get user confirmation

**Actions**:

1. Present recommended services in a clear format:
   ```
   Recommended Third-Party Services:

   Payments: Stripe (industry standard, great DX)
   Analytics: Google Analytics 4 (comprehensive, free)
   Error Tracking: Sentry (excellent debugging tools)

   Based on: [reasoning from project analysis]
   ```

2. Use AskUserQuestion to confirm or modify:
   - Ask which services to integrate from recommendations
   - Allow user to add services not in the recommendations
   - Ask about priority (which to set up first)
   - Ask if they already have accounts/API keys for any services

3. Finalize the service list based on user input

**Output**: Confirmed list of services to integrate

---

## Phase 3: Credential Collection

**Goal**: Securely collect API keys and credentials for selected services

**Actions**:

1. Update TodoWrite: Mark "Collect API credentials" as in_progress

2. For each selected service, use AskUserQuestion to:
   - Ask if they have an existing account or need setup guidance
   - Request necessary API keys/credentials
   - Explain what credentials are needed and where to find them

3. Service-specific credential requirements:

   **Stripe**:
   - Publishable Key (pk_test_... or pk_live_...)
   - Secret Key (sk_test_... or sk_live_...)
   - Webhook Secret (whsec_...) - optional initially

   **Google Analytics**:
   - Measurement ID (G-XXXXXXXXXX)

   **Sentry**:
   - DSN URL
   - Organization slug
   - Project name

   **SendGrid**:
   - API Key

   **Supabase**:
   - Project URL
   - Anon/Public Key
   - Service Role Key (for server-side)

   **OpenAI**:
   - API Key (sk-...)
   - Organization ID (optional)

   **Clerk**:
   - Publishable Key
   - Secret Key

   **Auth0**:
   - Domain
   - Client ID
   - Client Secret

4. Provide guidance for obtaining credentials:
   ```
   To get your Stripe API keys:
   1. Go to https://dashboard.stripe.com/test/apikeys
   2. Copy the "Publishable key" (starts with pk_test_)
   3. Reveal and copy the "Secret key" (starts with sk_test_)

   Note: Start with test keys, switch to live keys when ready for production
   ```

5. Store credentials temporarily in memory (never write to files yet)

**Output**: Collected credentials ready for configuration

---

## Phase 4: Package Installation

**Goal**: Install required npm packages and SDKs for each service

**Actions**:

1. Update TodoWrite: Mark "Install required packages" as in_progress

2. Determine package manager (npm, yarn, or pnpm):
   ```bash
   # Check for lock files
   ls package-lock.json yarn.lock pnpm-lock.yaml
   ```

3. Install packages based on selected services:

   **Stripe**:
   ```bash
   npm install stripe @stripe/stripe-js
   npm install -D @types/stripe
   ```

   **Google Analytics (Next.js)**:
   ```bash
   npm install @next/third-parties
   ```

   **Google Analytics (React)**:
   ```bash
   npm install react-ga4
   ```

   **Sentry**:
   ```bash
   npm install @sentry/nextjs  # or @sentry/react, @sentry/node
   ```

   **SendGrid**:
   ```bash
   npm install @sendgrid/mail
   ```

   **Supabase**:
   ```bash
   npm install @supabase/supabase-js
   ```

   **OpenAI**:
   ```bash
   npm install openai
   ```

   **Clerk**:
   ```bash
   npm install @clerk/nextjs  # or @clerk/clerk-react
   ```

   **Auth0**:
   ```bash
   npm install @auth0/nextjs-auth0  # or auth0-js
   ```

   **PostHog**:
   ```bash
   npm install posthog-js
   ```

   **Mixpanel**:
   ```bash
   npm install mixpanel-browser
   ```

4. Handle installation errors:
   - Check Node.js version compatibility
   - Suggest clearing node_modules and reinstalling if needed
   - Verify network connection for package downloads

**Output**: Required packages installed successfully

---

## Phase 5: Environment Configuration

**Goal**: Set up environment variables securely

**Actions**:

1. Update TodoWrite: Mark "Update environment files" as in_progress

2. Check for existing .env files:
   - .env.local (Next.js)
   - .env (general)
   - .env.example (template)

3. Create or update .env file structure based on framework:

   **For Next.js**:
   - Use .env.local for local development (gitignored)
   - Use .env.example for template
   - Use NEXT_PUBLIC_ prefix for client-side variables

   **For other frameworks**:
   - Use .env for local development (gitignored)
   - Use .env.example for template
   - Use VITE_ or REACT_APP_ prefix if applicable

4. Add environment variables for each service:

   **Stripe (.env.local)**:
   ```
   # Stripe
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Use NEXT_PUBLIC_ prefix for client-side access in Next.js
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

   **Google Analytics**:
   ```
   # Google Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   **Sentry**:
   ```
   # Sentry
   SENTRY_DSN=https://...@sentry.io/...
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```

   **SendGrid**:
   ```
   # SendGrid
   SENDGRID_API_KEY=SG...
   ```

   **Supabase**:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

5. Update .env.example with placeholder values:
   ```
   # Stripe (get from https://dashboard.stripe.com/test/apikeys)
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

6. Verify .gitignore includes .env files:
   ```
   # Environment files
   .env
   .env.local
   .env.*.local
   ```

**Output**: Environment variables configured securely

---

## Phase 6: Service Configuration & Integration

**Goal**: Create configuration files and initialize each service

**Actions**:

1. Update TodoWrite: Mark "Configure services" as in_progress

2. Create service-specific configuration based on framework:

### Stripe Integration

**For Next.js (App Router)**:

Create `lib/stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

Create `lib/stripe-client.ts`:
```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**For Express/Node backend**:

Create `config/stripe.js` or `stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});
```

### Google Analytics Integration

**For Next.js (App Router)**:

Update `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
```

**For React (with react-ga4)**:

Create `lib/analytics.ts`:
```typescript
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(process.env.REACT_APP_GA_MEASUREMENT_ID!);
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};
```

### Sentry Integration

**For Next.js**:

Run Sentry wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

Or create `sentry.client.config.ts` and `sentry.server.config.ts` manually.

**For React**:

Create `lib/sentry.ts`:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### SendGrid Integration

**For Next.js API Routes**:

Create `lib/sendgrid.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: 'your-verified-sender@example.com',
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
```

### Supabase Integration

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Clerk Integration

**For Next.js (App Router)**:

Update `app/layout.tsx`:
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

Create `middleware.ts`:
```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### OpenAI Integration

Create `lib/openai.ts`:
```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

3. For each service, create necessary files in appropriate locations:
   - `/lib` for utility/config files (Next.js, React)
   - `/config` for backend configuration (Express, NestJS)
   - `/utils` as alternative location

**Output**: All services configured with proper initialization

---

## Phase 7: Testing & Validation

**Goal**: Verify that integrations work correctly

**Actions**:

1. Update TodoWrite: Mark "Test integrations" as in_progress

2. For each service, create simple test implementations:

   **Stripe Test**:
   - Create a test API route that lists products or creates a test customer
   - Verify the Stripe client initializes without errors

   **Analytics Test**:
   - Check that analytics scripts load in browser
   - Verify no console errors related to analytics

   **Sentry Test**:
   - Trigger a test error to verify error tracking works
   ```typescript
   // Add to a test page
   throw new Error('Test Sentry integration');
   ```

   **SendGrid Test**:
   - Send a test email (if user approves)
   - Verify email is sent successfully

   **Database (Supabase/Firebase) Test**:
   - Test connection by fetching data or checking status
   - Verify authentication if applicable

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Check browser console and server logs for:
   - Successful initialization messages
   - No authentication errors
   - No missing environment variable warnings

5. Document any issues found and resolve them

**Output**: Validated working integrations

---

## Phase 8: Documentation & Next Steps

**Goal**: Document the integration and provide guidance for usage

**Actions**:

1. Mark all todos as completed

2. Create or update INTEGRATIONS.md in project root:
   ```markdown
   # Third-Party Service Integrations

   ## Configured Services

   ### Stripe (Payments)
   - **Status**: Configured
   - **Mode**: Test Mode
   - **Files**:
     - `lib/stripe.ts` - Server-side client
     - `lib/stripe-client.ts` - Client-side client
   - **Environment Variables**:
     - `STRIPE_SECRET_KEY` - Server-side only
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side
   - **Documentation**: https://stripe.com/docs
   - **Dashboard**: https://dashboard.stripe.com

   ### Google Analytics
   - **Status**: Configured
   - **Measurement ID**: G-XXXXXXXXXX
   - **Files**: `app/layout.tsx`
   - **Dashboard**: https://analytics.google.com

   [... for each service ...]

   ## Environment Variables

   All API keys and secrets are stored in `.env.local` (gitignored).
   See `.env.example` for required variables.

   ## Usage Examples

   ### Stripe Payment Example
   \`\`\`typescript
   import { stripe } from '@/lib/stripe';

   // Create a payment intent
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 2000,
     currency: 'usd',
   });
   \`\`\`

   ### Send Email with SendGrid
   \`\`\`typescript
   import { sendEmail } from '@/lib/sendgrid';

   await sendEmail(
     'user@example.com',
     'Welcome!',
     '<h1>Welcome to our app!</h1>'
   );
   \`\`\`

   ## Next Steps

   1. **Stripe**: Implement checkout flow and webhook handlers
   2. **Analytics**: Set up custom events and conversion tracking
   3. **Sentry**: Configure source maps for better error tracking
   4. **Production**: Switch from test to production credentials

   ## Security Notes

   - Never commit `.env.local` or any file with real credentials
   - Use test/sandbox credentials during development
   - Rotate API keys regularly
   - Use webhook signatures to verify requests
   - Implement rate limiting for API routes
   ```

3. Update README.md with integration information:
   ```markdown
   ## Third-Party Services

   This project uses the following services:
   - **Stripe** for payments
   - **Google Analytics** for analytics
   - **Sentry** for error tracking

   See [INTEGRATIONS.md](./INTEGRATIONS.md) for setup details.
   ```

4. Present summary to user:
   ```
   Third-Party Service Integration Complete!

   Integrated Services:
   ✓ Stripe (Payments)
   ✓ Google Analytics (Analytics)
   ✓ Sentry (Error Tracking)

   Configuration Files Created:
   - lib/stripe.ts
   - lib/stripe-client.ts
   - app/layout.tsx (updated)
   - sentry.client.config.ts

   Environment Variables:
   - .env.local (created with your API keys)
   - .env.example (updated with placeholders)

   Documentation:
   - INTEGRATIONS.md (created)
   - README.md (updated)

   Next Steps:
   1. Review the integration documentation in INTEGRATIONS.md
   2. Test the integrations in your application
   3. Implement service-specific features (payments, tracking, etc.)
   4. Before production: Switch to production API keys
   5. Set up webhook endpoints for services that need them

   Important Security Reminders:
   - Your .env.local file is gitignored and secure
   - Never commit real API keys to version control
   - Use test/sandbox credentials until ready for production
   - Review Stripe webhook signatures documentation
   ```

5. Provide service-specific next steps:

   **For Stripe**:
   - Set up webhook endpoints for payment events
   - Implement checkout flow
   - Add customer portal for subscriptions
   - Test with Stripe's test card numbers

   **For Analytics**:
   - Set up custom events for important actions
   - Configure conversion goals
   - Set up e-commerce tracking if applicable

   **For Sentry**:
   - Configure source maps for better stack traces
   - Set up release tracking
   - Configure alerts for critical errors

   **For Auth Services**:
   - Protect routes that require authentication
   - Set up user profile pages
   - Configure OAuth providers

**Output**: Complete integration with documentation and clear next steps

---

## Important Notes

### Security Best Practices

1. **Environment Variables**:
   - Always use .env files, never hardcode
   - Use .env.local for Next.js (higher priority than .env)
   - Ensure .env files are in .gitignore
   - Create .env.example with placeholder values

2. **API Key Safety**:
   - Use test/sandbox keys during development
   - Never expose secret keys to client-side code
   - Use NEXT_PUBLIC_ prefix only for truly public keys
   - Rotate keys if accidentally committed

3. **Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS in production
   - Implement idempotency for webhooks

### Service Selection Priority

1. Explicit user request in $ARGUMENTS
2. Project type indicators (e-commerce → Stripe)
3. Existing dependencies (don't duplicate)
4. Modern best practices and DX

### Common Service Combinations

**E-commerce Stack**:
- Stripe (payments)
- SendGrid (transactional emails)
- Google Analytics (tracking)
- Sentry (error monitoring)

**SaaS Stack**:
- Clerk or Auth0 (authentication)
- Stripe (subscriptions)
- PostHog or Mixpanel (product analytics)
- Sentry (error tracking)

**Content Platform**:
- Supabase (database + auth)
- Cloudinary (media storage)
- Google Analytics (analytics)
- SendGrid (newsletters)

### Error Handling

- Verify API keys are valid before proceeding
- Check network connectivity for API calls
- Provide troubleshooting steps for common issues
- Test integrations before marking as complete

### Framework-Specific Considerations

**Next.js**:
- Use .env.local for local development
- Use NEXT_PUBLIC_ for client-side variables
- API routes for server-side service calls

**React (CRA/Vite)**:
- Use REACT_APP_ or VITE_ prefixes
- Use .env for local development
- Backend required for secret API keys

**Express/Node**:
- Use dotenv package
- All services can be server-side
- Implement CORS for frontend communication

---

**Begin with Phase 1: Context Analysis & Service Selection**

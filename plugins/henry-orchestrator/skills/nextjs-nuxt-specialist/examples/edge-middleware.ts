/**
 * Edge Middleware Examples
 *
 * Comprehensive examples of edge middleware patterns for authentication,
 * geolocation, A/B testing, and rate limiting across different frameworks.
 */

// ============================================================================
// Example 1: Next.js Edge Middleware - Authentication & Authorization
// ============================================================================

// File: middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

interface UserPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  // Get authentication token
  const token = request.cookies.get('auth-token')?.value;

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT at edge
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const user = payload as unknown as UserPayload;

    // Check admin-only routes
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.sub);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-role', user.role);

    return response;
  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session-expired');

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');

    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// ============================================================================
// Example 2: Geolocation-Based Routing & Content Localization
// ============================================================================

// File: middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja'] as const;
const DEFAULT_LOCALE = 'en';

const COUNTRY_TO_LOCALE: Record<string, string> = {
  US: 'en',
  GB: 'en',
  ES: 'es',
  MX: 'es',
  FR: 'fr',
  DE: 'de',
  JP: 'ja',
};

export function geoMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if already has locale prefix
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get country from geo headers
  const country = request.geo?.country || 'US';

  // Check for user's locale preference in cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any)
      ? cookieLocale
      : COUNTRY_TO_LOCALE[country] || DEFAULT_LOCALE;

  // Redirect to localized path
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);

  // Set locale cookie for future visits
  response.cookies.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    path: '/',
  });

  // Add geo headers for analytics
  response.headers.set('x-geo-country', country);
  response.headers.set('x-geo-city', request.geo?.city || 'Unknown');
  response.headers.set('x-locale', locale);

  return response;
}

// ============================================================================
// Example 3: A/B Testing & Feature Flags
// ============================================================================

// File: middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXPERIMENTS = {
  'new-homepage': {
    enabled: true,
    percentage: 50, // 50% of users
    variants: ['control', 'variant-a'] as const,
  },
  'checkout-flow': {
    enabled: true,
    percentage: 25, // 25% of users
    variants: ['control', 'variant-b'] as const,
  },
} as const;

type ExperimentKey = keyof typeof EXPERIMENTS;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getVariant(userId: string, experimentKey: ExperimentKey): string | null {
  const experiment = EXPERIMENTS[experimentKey];

  if (!experiment.enabled) {
    return null;
  }

  // Deterministic variant assignment based on user ID
  const hash = hashString(`${userId}-${experimentKey}`);
  const bucket = hash % 100;

  // Check if user is in experiment
  if (bucket >= experiment.percentage) {
    return null; // Not in experiment
  }

  // Assign variant
  const variantIndex = bucket % experiment.variants.length;
  return experiment.variants[variantIndex];
}

export function abTestMiddleware(request: NextRequest) {
  // Get or create user ID
  let userId = request.cookies.get('user-id')?.value;

  if (!userId) {
    userId = crypto.randomUUID();
  }

  // Check experiments
  const newHomepageVariant = getVariant(userId, 'new-homepage');
  const checkoutFlowVariant = getVariant(userId, 'checkout-flow');

  // Rewrite URLs based on variants
  const url = request.nextUrl.clone();
  const response = (() => {
    if (newHomepageVariant === 'variant-a' && url.pathname === '/') {
      url.pathname = '/homepage-variant-a';
      return NextResponse.rewrite(url);
    }

    if (checkoutFlowVariant === 'variant-b' && url.pathname.startsWith('/checkout')) {
      url.pathname = url.pathname.replace('/checkout', '/checkout-variant-b');
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  })();

  // Set cookies
  response.cookies.set('user-id', userId, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'strict',
    path: '/',
  });

  if (newHomepageVariant) {
    response.cookies.set('exp-new-homepage', newHomepageVariant, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
  }

  if (checkoutFlowVariant) {
    response.cookies.set('exp-checkout-flow', checkoutFlowVariant, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
  }

  // Add headers for analytics
  response.headers.set('x-user-id', userId);
  if (newHomepageVariant) {
    response.headers.set('x-exp-homepage', newHomepageVariant);
  }
  if (checkoutFlowVariant) {
    response.headers.set('x-exp-checkout', checkoutFlowVariant);
  }

  return response;
}

// ============================================================================
// Example 4: Rate Limiting at Edge
// ============================================================================

// File: middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for demonstration)
// In production, use Redis or similar distributed store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS = {
  '/api/public': { requests: 100, windowMs: 60000 }, // 100 req/min
  '/api/auth': { requests: 5, windowMs: 60000 }, // 5 req/min
  '/api/upload': { requests: 10, windowMs: 60000 }, // 10 req/min
} as const;

function getRateLimitKey(ip: string, pathname: string): string {
  return `${ip}:${pathname}`;
}

function checkRateLimit(
  ip: string,
  pathname: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getRateLimitKey(ip, pathname);
  const now = Date.now();

  const record = rateLimitStore.get(key);

  // No record or window expired - create new
  if (!record || now > record.resetAt) {
    const resetAt = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetAt,
    };
  }

  // Within window - check limit
  if (record.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment and allow
  record.count++;

  return {
    allowed: true,
    remaining: limit.requests - record.count,
    resetAt: record.resetAt,
  };
}

export function rateLimitMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find matching rate limit
  const limitEntry = Object.entries(RATE_LIMITS).find(([path]) => pathname.startsWith(path));

  if (!limitEntry) {
    return NextResponse.next();
  }

  const [, limit] = limitEntry;

  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Check rate limit
  const { allowed, remaining, resetAt } = checkRateLimit(ip, pathname, limit);

  // Build response
  const response = allowed
    ? NextResponse.next()
    : new NextResponse('Too Many Requests', { status: 429 });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(limit.requests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)));

  if (!allowed) {
    response.headers.set('Retry-After', String(Math.ceil((resetAt - Date.now()) / 1000)));
  }

  return response;
}

// ============================================================================
// Example 5: Security Headers
// ============================================================================

export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.example.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return response;
}

// ============================================================================
// Example 6: Combining Multiple Middleware
// ============================================================================

export function middleware(request: NextRequest) {
  // Chain multiple middleware
  let response = securityHeadersMiddleware(request);

  // Apply rate limiting
  response = rateLimitMiddleware(request);
  if (response.status === 429) {
    return response; // Early return if rate limited
  }

  // Apply authentication
  response = middleware(request);
  if (response.status === 401 || response.status === 403) {
    return response;
  }

  // Apply A/B testing
  response = abTestMiddleware(request);

  // Apply geolocation
  response = geoMiddleware(request);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

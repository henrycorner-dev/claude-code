#!/usr/bin/env node
/**
 * Core Web Vitals Measurement Script
 *
 * Measures Core Web Vitals using web-vitals library
 * Can be used in browser or Node.js with Puppeteer
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Browser Usage (include this in your application)
// ============================================================================

const browserCode = `
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Configuration
const ANALYTICS_ENDPOINT = '/api/analytics';
const ENABLE_CONSOLE_LOGGING = true;

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });

  // Use sendBeacon for reliability (survives page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
  } else {
    // Fallback to fetch with keepalive
    fetch(ANALYTICS_ENDPOINT, {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    });
  }

  if (ENABLE_CONSOLE_LOGGING) {
    console.log(\`[\${metric.name}]\`, {
      value: \`\${metric.value.toFixed(2)} \${getUnit(metric.name)}\`,
      rating: metric.rating,
      delta: metric.delta
    });
  }
}

/**
 * Get unit for metric
 */
function getUnit(metricName) {
  if (metricName === 'CLS') return '';
  return 'ms';
}

/**
 * Initialize Core Web Vitals tracking
 */
export function initWebVitals() {
  getCLS(sendToAnalytics);  // Cumulative Layout Shift
  getFID(sendToAnalytics);  // First Input Delay
  getFCP(sendToAnalytics);  // First Contentful Paint
  getLCP(sendToAnalytics);  // Largest Contentful Paint
  getTTFB(sendToAnalytics); // Time to First Byte
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initWebVitals();
}
`;

// ============================================================================
// Node.js Usage (Puppeteer for automated testing)
// ============================================================================

async function measureWebVitals(url) {
  let browser;

  try {
    // Check if puppeteer is installed
    try {
      require.resolve('puppeteer');
    } catch (e) {
      console.error('❌ Puppeteer not found. Install it with:');
      console.error('   npm install --save-dev puppeteer');
      process.exit(1);
    }

    const puppeteer = require('puppeteer');

    console.log(`🚀 Measuring Core Web Vitals for: ${url}`);
    console.log('');

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport to desktop
    await page.setViewport({ width: 1920, height: 1080 });

    const metrics = {};

    // Inject web-vitals library
    await page.evaluateOnNewDocument(() => {
      window.webVitalsMetrics = {};
    });

    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);

    // Get navigation timing
    const navigationTiming = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        domComplete: perfData.domComplete - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart,
      };
    });

    // Get paint timing
    const paintTiming = await page.evaluate(() => {
      const paints = performance.getEntriesByType('paint');
      return {
        fcp: paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: 0, // Will be calculated separately
      };
    });

    // Get LCP
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        let lcpValue = 0;
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.renderTime || lastEntry.loadTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 1000);
      });
    });

    // Get CLS
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });

    // Compile results
    const results = {
      url,
      timestamp: new Date().toISOString(),
      metrics: {
        // Core Web Vitals
        lcp: { value: lcp, unit: 'ms', rating: rateLCP(lcp) },
        fcp: { value: paintTiming.fcp, unit: 'ms', rating: rateFCP(paintTiming.fcp) },
        cls: { value: cls, unit: '', rating: rateCLS(cls) },
        ttfb: { value: navigationTiming.ttfb, unit: 'ms', rating: rateTTFB(navigationTiming.ttfb) },

        // Additional metrics
        dns: { value: navigationTiming.dns, unit: 'ms' },
        tcp: { value: navigationTiming.tcp, unit: 'ms' },
        download: { value: navigationTiming.download, unit: 'ms' },
        domInteractive: { value: navigationTiming.domInteractive, unit: 'ms' },
        domComplete: { value: navigationTiming.domComplete, unit: 'ms' },
        loadComplete: { value: navigationTiming.loadComplete, unit: 'ms' },
      },
    };

    // Display results
    console.log('📊 Core Web Vitals:');
    console.log('===================');
    displayMetric('LCP', results.metrics.lcp);
    displayMetric('FCP', results.metrics.fcp);
    displayMetric('CLS', results.metrics.cls);
    displayMetric('TTFB', results.metrics.ttfb);

    console.log('');
    console.log('⏱️  Additional Metrics:');
    console.log('======================');
    console.log(`DNS Lookup:      ${results.metrics.dns.value.toFixed(2)} ms`);
    console.log(`TCP Connection:  ${results.metrics.tcp.value.toFixed(2)} ms`);
    console.log(`Download:        ${results.metrics.download.value.toFixed(2)} ms`);
    console.log(`DOM Interactive: ${results.metrics.domInteractive.value.toFixed(2)} ms`);
    console.log(`DOM Complete:    ${results.metrics.domComplete.value.toFixed(2)} ms`);
    console.log(`Load Complete:   ${results.metrics.loadComplete.value.toFixed(2)} ms`);

    // Save to file
    const outputFile = path.join(process.cwd(), 'web-vitals-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log('');
    console.log(`✅ Report saved to: ${outputFile}`);

    return results;
  } catch (error) {
    console.error('❌ Error measuring Web Vitals:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ============================================================================
// Rating Functions (based on Google thresholds)
// ============================================================================

function rateLCP(value) {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

function rateFCP(value) {
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
}

function rateCLS(value) {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

function rateTTFB(value) {
  if (value <= 800) return 'good';
  if (value <= 1800) return 'needs-improvement';
  return 'poor';
}

// ============================================================================
// Display Functions
// ============================================================================

function displayMetric(name, metric) {
  const emoji =
    {
      good: '✅',
      'needs-improvement': '⚠️',
      poor: '❌',
    }[metric.rating] || '❓';

  const value = metric.unit ? `${metric.value.toFixed(2)} ${metric.unit}` : metric.value.toFixed(3);

  console.log(`${emoji} ${name.padEnd(6)} ${value.padStart(12)} (${metric.rating})`);
}

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node measure-metrics.js <url>');
    console.log('');
    console.log('Examples:');
    console.log('  node measure-metrics.js https://example.com');
    console.log('  node measure-metrics.js http://localhost:3000');
    console.log('');
    console.log('Requirements:');
    console.log('  npm install --save-dev puppeteer');
    console.log('');
    console.log('Output:');
    console.log('  - Console output with metrics and ratings');
    console.log('  - JSON report saved to web-vitals-report.json');
    process.exit(0);
  }

  const url = args[0];

  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    console.error('❌ Invalid URL:', url);
    process.exit(1);
  }

  measureWebVitals(url).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  measureWebVitals,
  rateLCP,
  rateFCP,
  rateCLS,
  rateTTFB,
  browserCode, // Export browser code for documentation
};

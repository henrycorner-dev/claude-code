/**
 * React Lazy Loading Examples
 *
 * Demonstrates various lazy loading patterns in React:
 * - Image lazy loading
 * - Component lazy loading
 * - Route lazy loading
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// ============================================================================
// 1. IMAGE LAZY LOADING
// ============================================================================

/**
 * Native lazy loading for images
 */
function ImageLazyLoading() {
  return (
    <div>
      <h2>Image Lazy Loading</h2>

      {/* Native lazy loading (Chrome 76+) */}
      <img
        src="https://example.com/image.jpg"
        alt="Lazy loaded image"
        loading="lazy"
        width="800"
        height="600"
      />

      {/* Multiple images */}
      <div className="gallery">
        {[1, 2, 3, 4, 5].map(i => (
          <img
            key={i}
            src={`https://example.com/image-${i}.jpg`}
            alt={`Image ${i}`}
            loading="lazy"
            width="400"
            height="300"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Custom lazy loading with Intersection Observer
 */
function IntersectionObserverLazyImage({ src, alt, ...props }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Load 100px before entering viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}

// ============================================================================
// 2. COMPONENT LAZY LOADING
// ============================================================================

// Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const CodeEditor = lazy(() => import('./components/CodeEditor'));

/**
 * Conditional component lazy loading
 */
function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Load chart only when needed */}
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart data={chartData} />
        </Suspense>
      )}

      {/* Load video player on demand */}
      <button onClick={() => setShowVideo(true)}>
        Play Video
      </button>

      {showVideo && (
        <Suspense fallback={<VideoSkeleton />}>
          <VideoPlayer src="https://example.com/video.mp4" />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Lazy loading with preloading on hover
 */
function PreloadOnHover() {
  const [showEditor, setShowEditor] = useState(false);
  const editorPromise = React.useRef(null);

  const preloadEditor = () => {
    if (!editorPromise.current) {
      editorPromise.current = import('./components/CodeEditor');
    }
  };

  return (
    <div>
      <button
        onMouseEnter={preloadEditor} // Preload on hover
        onClick={() => setShowEditor(true)}
      >
        Open Code Editor
      </button>

      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <CodeEditor />
        </Suspense>
      )}
    </div>
  );
}

// ============================================================================
// 3. ROUTE-BASED LAZY LOADING
// ============================================================================

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

/**
 * Route-based code splitting
 */
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Nested Suspense boundaries for granular loading
 */
function ComplexPage() {
  return (
    <div>
      {/* Top-level Suspense for critical content */}
      <Suspense fallback={<FullPageLoader />}>
        <Header />
        <MainContent />
      </Suspense>
    </div>
  );
}

function MainContent() {
  return (
    <div className="layout">
      {/* Sidebar loads independently */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      {/* Main content loads independently */}
      <main>
        <Suspense fallback={<ContentSkeleton />}>
          <Content />
        </Suspense>
      </main>

      {/* Footer loads independently */}
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  );
}

// ============================================================================
// LOADING COMPONENTS (Skeletons)
// ============================================================================

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
      <p>Loading page...</p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="chart-skeleton">
      <div className="skeleton-bar" />
      <div className="skeleton-bar" />
      <div className="skeleton-bar" />
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="video-skeleton">
      <div className="skeleton-player" />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="editor-skeleton">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton">
      <div className="skeleton-item" />
      <div className="skeleton-item" />
      <div className="skeleton-item" />
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="content-skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-paragraph" />
      <div className="skeleton-paragraph" />
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="footer-skeleton">
      <div className="skeleton-text" />
    </div>
  );
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading failed:', error, errorInfo);

    // Send to error tracking service
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h2>Failed to load component</h2>
          <p>Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * App with error boundary
 */
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// ============================================================================
// ADVANCED: PREFETCHING
// ============================================================================

/**
 * Prefetch routes on link hover
 */
function PrefetchLink({ to, children, ...props }) {
  const [isPrefetched, setIsPrefetched] = useState(false);

  const prefetch = () => {
    if (!isPrefetched) {
      // Webpack magic comment tells it to prefetch
      import(/* webpackPrefetch: true */ `./pages${to}`);
      setIsPrefetched(true);
    }
  };

  return (
    <Link to={to} onMouseEnter={prefetch} {...props}>
      {children}
    </Link>
  );
}

/**
 * Usage
 */
function Navigation() {
  return (
    <nav>
      <PrefetchLink to="/dashboard">Dashboard</PrefetchLink>
      <PrefetchLink to="/profile">Profile</PrefetchLink>
      <PrefetchLink to="/settings">Settings</PrefetchLink>
    </nav>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AppWithErrorBoundary;
export {
  ImageLazyLoading,
  IntersectionObserverLazyImage,
  Dashboard,
  PreloadOnHover,
  ComplexPage,
  PrefetchLink,
  Navigation
};

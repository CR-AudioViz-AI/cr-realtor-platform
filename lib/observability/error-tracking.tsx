// =============================================================================
// SENTRY ERROR TRACKING SERVICE
// CR AudioViz AI - Realtor Platform
// Created: Monday, December 30, 2025 | 2:56 PM EST
// Phase 4: Sentry Error Tracking Integration
// Free tier: 5K errors/month
//
// 2026-08-21: renamed from .ts to .tsx. It contains JSX - withErrorBoundary
// returns a <Sentry.ErrorBoundary> - and TypeScript cannot parse JSX in a .ts
// file, so this module produced 29 SYNTAX errors and had never compiled. It has
// no importers, which is why nothing broke: Sentry error tracking on this
// platform has never been wired up at all.
//
// Left in place rather than deleted because the integration is wanted; it now at
// least parses, and the gap is visible instead of hidden behind a file nobody
// could build.
// =============================================================================

'use client';

import * as Sentry from '@sentry/nextjs';
import { ErrorLevel, ErrorContext, OBSERVABILITY_CONFIG } from './config';

class ErrorTrackingService {
  private initialized = false;

  /**
   * Initialize Sentry
   * This is typically done in instrumentation.ts or sentry.client.config.ts
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;

    const { sentry: config } = OBSERVABILITY_CONFIG;

    if (!config.enabled || !config.dsn) {
      console.log('[ErrorTracking] Sentry disabled or missing DSN');
      return;
    }

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      sampleRate: config.sampleRate,
      tracesSampleRate: config.tracesSampleRate,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    this.initialized = true;
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string; name?: string; role?: string }) {
    if (!this.isEnabled()) return;
    
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      segment: user.role,
    });
  }

  /**
   * Clear user context (call on logout)
   */
  clearUser() {
    if (!this.isEnabled()) return;
    Sentry.setUser(null);
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | unknown, context?: ErrorContext) {
    if (!this.isEnabled()) {
      console.error('[ErrorTracking] Exception:', error, context);
      return;
    }

    Sentry.withScope((scope) => {
      if (context) {
        if (context.user_id) scope.setTag('user_id', context.user_id);
        if (context.agent_id) scope.setTag('agent_id', context.agent_id);
        if (context.page) scope.setTag('page', context.page);
        if (context.action) scope.setTag('action', context.action);
        if (context.metadata) scope.setContext('metadata', context.metadata);
      }
      
      Sentry.captureException(error);
    });
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: ErrorLevel = 'info', context?: ErrorContext) {
    if (!this.isEnabled()) {
      console.log(`[ErrorTracking] ${level}:`, message, context);
      return;
    }

    Sentry.withScope((scope) => {
      scope.setLevel(level as Sentry.SeverityLevel);
      
      if (context) {
        if (context.user_id) scope.setTag('user_id', context.user_id);
        if (context.agent_id) scope.setTag('agent_id', context.agent_id);
        if (context.page) scope.setTag('page', context.page);
        if (context.action) scope.setTag('action', context.action);
        if (context.metadata) scope.setContext('metadata', context.metadata);
      }
      
      Sentry.captureMessage(message);
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    level: ErrorLevel = 'info',
    data?: Record<string, unknown>
  ) {
    if (!this.isEnabled()) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level: level as Sentry.SeverityLevel,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, operation: string) {
    if (!this.isEnabled()) return null;
    
    return Sentry.startInactiveSpan({
      name,
      op: operation,
    });
  }

  /**
   * Set custom tag
   */
  setTag(key: string, value: string) {
    if (!this.isEnabled()) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, unknown>) {
    if (!this.isEnabled()) return;
    Sentry.setContext(name, context);
  }

  /**
   * Check if Sentry is enabled
   */
  private isEnabled(): boolean {
    return this.initialized && OBSERVABILITY_CONFIG.sentry.enabled;
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();

// Export convenience functions
export const captureException = (error: Error | unknown, context?: ErrorContext) =>
  errorTracking.captureException(error, context);

export const captureMessage = (message: string, level?: ErrorLevel, context?: ErrorContext) =>
  errorTracking.captureMessage(message, level, context);

export const setErrorUser = (user: { id: string; email?: string; name?: string }) =>
  errorTracking.setUser(user);

// Error boundary helper
// 2026-08-30: fallback narrowed from ReactNode to ReactElement.
//
// Sentry.ErrorBoundary's fallback accepts ReactElement | FallbackRender, not the
// whole of ReactNode — ReactNode includes string, number, bigint and Iterable, none
// of which it can render as a boundary fallback.
//
// Narrowing the parameter rather than casting at the call site: the constraint is
// real, and a caller passing a bare string here should be told at their call site,
// not have it silently accepted and fail inside Sentry.
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactElement
) {
  return function WrappedComponent(props: P) {
    return (
      <Sentry.ErrorBoundary
        fallback={fallback || <DefaultErrorFallback />}
        onError={(error, componentStack) => {
          errorTracking.captureException(error, {
            metadata: { componentStack },
          });
        }}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    );
  };
}

// Default error fallback component
function DefaultErrorFallback() {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">We've been notified and are working on a fix.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Refresh Page
      </button>
    </div>
  );
}

export default errorTracking;

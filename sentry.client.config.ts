import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  ignoreErrors: [
    'Java object is gone',
    'postMessage',
    'navigation_performance_logger',
    'Error invoking postMessage',
    'java.lang.RuntimeException',
    ' TypeError: Cannot read properties of null',
    'Android WebView',
    'Calling window.postMessage on destroyed context',
  ],
  integrations: [
    Sentry.replayIntegration(),
  ],
})

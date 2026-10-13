import * as Sentry from "@sentry/react";
import { isBetaEnvironment } from "@/utils/environment";

/**
 * Initializes Sentry for error tracking and crash reporting.
 * Activates only if VITE_SENTRY_DSN is configured.
 */
export const initSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: isBetaEnvironment() ? "beta" : import.meta.env.MODE || "production",
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
  });
};

export { Sentry };

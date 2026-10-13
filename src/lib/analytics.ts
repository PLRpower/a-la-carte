declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

/**
 * Initializes privacy-friendly Umami Analytics without cookies (GDPR/CNIL compliant).
 * Injects script only if VITE_UMAMI_WEBSITE_ID is configured.
 */
export const initAnalytics = (): void => {
  if (typeof window === "undefined") return;

  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  if (!websiteId) {
    return;
  }

  const existingScript = document.querySelector('script[data-website-id]');
  if (existingScript) return;

  const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";
  const script = document.createElement("script");
  script.defer = true;
  script.src = scriptUrl;
  script.setAttribute("data-website-id", websiteId);
  document.head.appendChild(script);
};

/**
 * Tracks custom events (e.g. signup funnel, subscription clicks, conversions).
 */
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, string | number | boolean>
): void => {
  if (typeof window === "undefined") return;

  if (window.umami && typeof window.umami.track === "function") {
    window.umami.track(eventName, eventData);
  } else if (import.meta.env.DEV) {
    console.debug("[Umami Analytics Dev]", eventName, eventData);
  }
};

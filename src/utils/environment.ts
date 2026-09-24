/**
 * Environment detection and navigation helpers for Production and Beta (preview) branches.
 */

export const isBetaEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Explicit env flag configured on Vercel preview environment
  if (import.meta.env.VITE_IS_BETA === 'true') {
    return true;
  }

  const host = window.location.hostname;

  // 2. Dedicated beta or preview subdomain/prefix (e.g. beta.domain.com, preview-app.vercel.app)
  if (host.startsWith('beta.') || host.startsWith('preview.') || host.startsWith('preview-')) {
    return true;
  }

  // 3. Vercel git branch preview URLs (e.g. project-git-develop-*.vercel.app)
  if (host.includes('-git-develop') || host.includes('-develop') || host.includes('preview')) {
    return true;
  }

  return false;
};

/**
 * Returns the target Production URL for users wishing to leave Beta or fallback after a bug.
 */
export const getProductionUrl = (): string => {
  // Explicit override if configured in env vars
  if (import.meta.env.VITE_PROD_URL) {
    return import.meta.env.VITE_PROD_URL;
  }

  if (typeof window === 'undefined') return '/';

  const host = window.location.hostname;
  const protocol = window.location.protocol;

  // If on preview-domain.vercel.app -> domain.vercel.app
  if (host.startsWith('preview-')) {
    const mainHost = host.replace(/^preview-/, '');
    return `${protocol}//${mainHost}`;
  }

  // If on beta.domain.com or preview.domain.com -> domain.com
  if (host.startsWith('beta.') || host.startsWith('preview.')) {
    const mainHost = host.replace(/^(beta|preview)\./, '');
    return `${protocol}//${mainHost}`;
  }

  // If on Vercel branch preview deployment: remove -git-develop-...
  if (host.includes('-git-develop')) {
    const rootHost = host.replace(/-git-develop-[^.]+/, '');
    return `${protocol}//${rootHost}`;
  }

  // Fallback for localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return '/';
  }

  return 'https://a-la-carte-app.vercel.app';
};

/**
 * Returns the target Beta URL for users wishing to join preview from Production.
 */
export const getBetaUrl = (): string => {
  // Explicit override if configured in env vars
  if (import.meta.env.VITE_BETA_URL) {
    return import.meta.env.VITE_BETA_URL;
  }

  if (typeof window === 'undefined') return '/';

  const host = window.location.hostname;
  const protocol = window.location.protocol;

  // If already on beta or localhost
  if (isBetaEnvironment() || host === 'localhost' || host === '127.0.0.1') {
    return window.location.href;
  }

  // If on custom domain (domain.com -> beta.domain.com)
  if (!host.endsWith('.vercel.app')) {
    return `${protocol}//beta.${host}`;
  }

  // Target preview domain
  return `https://preview-a-la-carte-app.vercel.app`;
};

const ANALYTICS_KEY = 'calibrate_analytics';

function track(event: string, payload?: Record<string, unknown>) {
  const entry = { event, payload: payload ?? {}, ts: new Date().toISOString() };
  try {
    // Persist to localStorage for pilot debugging
    const existing = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    existing.push(entry);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(existing));
  } catch (e) {
    // ignore
  }
  // Console log for developers; in production wire this to PostHog/Segment
  // eslint-disable-next-line no-console
  console.log('[analytics]', entry);
}

export default { track };

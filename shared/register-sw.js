// Register the service worker and check for a new version on every launch and every return to the app.
// When a new version takes over, the home screen reloads on the next start tap (never mid-activity).
export function registerSW(swUrl) {
  if (!('serviceWorker' in navigator)) return;
  // no offline cache while developing on this PC (it would serve stale files)
  if (location.hostname === 'localhost' && !location.search.includes('sw=1')) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) window.__swUpdateReady = true; });
  navigator.serviceWorker.register(swUrl).then(reg => {
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
}

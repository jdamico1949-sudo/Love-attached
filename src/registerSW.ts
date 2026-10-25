import { registerSW } from "virtual:pwa-register";

// The default injected registerSW.js just calls navigator.serviceWorker
// .register() once and leans on the browser's own update check, which
// is throttled (commonly ~24h) and, on iOS Safari especially, can leave
// a visitor stuck on a stale cached build long after a new one has
// shipped -- skipWaiting/clientsClaim (already on in the generated
// service worker) only take effect once an update is actually detected.
// registerSW's own `immediate:true` checks once on load; the extra
// setInterval and visibilitychange listener below force that same check
// again periodically and every time the tab comes back into view, so a
// visitor reopening the app is far more likely to be looking at the
// current build rather than whatever was cached at some point in the past.
const updateServiceWorker = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    setInterval(() => registration.update(), 60 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") registration.update();
    });
  },
});

export { updateServiceWorker };

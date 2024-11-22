let appCacheFiles = [ "/", "/index.html" ]

let appCache = "eventdriven-frontend";

/**
 * The install event is fired when the service worker 
 * is installed.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('install', (event) => {
	console.log('[Service Worker] Install Event', event)
	event.waitUntil(
    caches.open(appCache).then(function(cache) {
      return cache.addAll(appCacheFiles);
    })
  );
});

/**
 * The activate vent is fired when the  service worker is activated
 * and added to the home screen.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('activate', (event) => {
	console.log('[Service Worker] Activate Event ', event)
});

console.info('reload')

/**
 * Listen for incoming Push events
 */

addEventListener('push', (event) => {
  let data = {};
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] ${event.data.text()}`);

  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  
  if (event.data) {
    data = event.data.json();
  }
  
  // Customize the UI for the message box 
  let title = data.title || "Flight update";
  let options = {
      body: data.body || "Your flight status has been updated",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
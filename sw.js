// YKS Panelim — çevrimdışı çalışma. Sürüm değişince eski önbellek silinir.
const CACHE = 'yks-panelim-v8';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192-v2.png', './icon-512-v2.png', './icon-maskable-512-v2.png', './apple-touch-icon-v2.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // Sayfa: önce internetten dene (güncel kalsın), yoksa önbellekten aç
    if (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('.webmanifest')) {
      e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; })));
  } else if (u.hostname.includes('fonts.g')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => m)));
  }
});

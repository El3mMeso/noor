const C='noor-v3',F=['./','index.html','style.css','app.js','prayer.js','adhkar.js','quran.js','fonts/AmiriQuran.ttf','data/surahs.json','manifest.json','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{if(x.ok&&e.request.method==='GET'){const c=x.clone();caches.open(C).then(k=>k.put(e.request,c))}return x})))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.openWindow('./'))});

const CACHE = "islem-defteri-v2";
const ASSETS = ["./","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  const url = new URL(e.request.url);
  if(url.pathname.startsWith("/api")) return;

  if(e.request.mode === "navigate" || url.pathname.endsWith("index.html")){
    e.respondWith(
      fetch(e.request).then(res=>{
        const c = res.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,c));
        return res;
      }).catch(()=>caches.match(e.request).then(m=>m || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
      const c = res.clone();
      caches.open(CACHE).then(cache=>cache.put(e.request,c));
      return res;
    }).catch(()=>caches.match("./index.html")))
  );
});
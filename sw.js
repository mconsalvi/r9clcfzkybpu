/* Expedition Atlas — service worker
   Caches the app shell so the atlas opens from the home screen even offline.
   Bump CACHE whenever you upload a new index.html. */
var CACHE='atlas-v5.7.0', PHOTOS='atlas-photos';
var SHELL=['./','./index.html','./sw.js'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  /* the photo cache survives new versions of the atlas; only old shells are dropped */
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE&&k!==PHOTOS;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  var u=new URL(e.request.url);
  /* your photos never change once uploaded: take them from the phone first, the network only the first time */
  if(u.origin===location.origin&&/\/photos\/[^/]+\.(bin|jpe?g|png|webp)$/i.test(u.pathname)){
    e.respondWith(caches.open(PHOTOS).then(function(c){ return c.match(e.request).then(function(hit){
      return hit||fetch(e.request).then(function(r){ if(r.ok) c.put(e.request,r.clone()); return r; }); }); }));
    return;
  }
  /* everything else, photos.json included: network first, cache as fallback, so you always get the newest upload */
  e.respondWith(fetch(e.request).then(function(r){
    var copy=r.clone(); caches.open(CACHE).then(function(c){c.put(e.request,copy);}); return r;
  }).catch(function(){ return caches.match(e.request).then(function(r){ return r||caches.match('./index.html'); }); }));
});

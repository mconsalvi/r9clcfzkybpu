/* Expedition Atlas — service worker
   Caches the app shell so the atlas opens from the home screen even offline.
   Bump CACHE whenever you upload a new index.html. */
var CACHE='atlas-v5.5.1';
var SHELL=['./','./index.html','./sw.js'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
/* network first, cache as fallback: you always get the newest upload when online */
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(function(r){
    var copy=r.clone(); caches.open(CACHE).then(function(c){c.put(e.request,copy);}); return r;
  }).catch(function(){ return caches.match(e.request).then(function(r){ return r||caches.match('./index.html'); }); }));
});

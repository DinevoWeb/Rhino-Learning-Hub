const CACHE='rhino-hub-app-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('rhino-hub-app-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 // Never cache authentication, user records, external videos, or API requests.
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{try{const response=await fetch(event.request);if(response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone())}return response}catch{const cached=await caches.match('./index.html');return cached||new Response('Connect to the internet to open Rhino Hub.',{status:503,headers:{'Content-Type':'text/plain'}})}})());
  return;
 }
 if(ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href))event.respondWith((async()=>{const cached=await caches.match(event.request);return cached||fetch(event.request)})());
});

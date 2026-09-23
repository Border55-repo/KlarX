const CACHE="kova-pwa-v8";
const SHELL=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./icon.svg","./firebase-web-config.json"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){
      client.postMessage({type:"pwa-updated"});
    }
  })());
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const isData=url.hostname==="raw.githubusercontent.com" && url.pathname.includes("/bridge/data/");
  if(isData){
    event.respondWith(
      fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(url.origin===self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const data=event.notification.data||{};
  const params=new URLSearchParams();
  if(data.organization)params.set("org",data.organization);
  if(data.eventId)params.set("event",data.eventId);
  const target="./"+(params.toString()?"?"+params.toString():"");
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    const existing=list.find(client=>"focus" in client);
    if(existing){
      existing.postMessage({type:"notificationclick",organization:data.organization||"",eventId:data.eventId||""});
      return existing.focus();
    }
    return clients.openWindow(target);
  }));
});


self.addEventListener("push",event=>{
  let payload={};
  try{payload=event.data?.json()||{}}catch{payload={body:event.data?.text()||""}}
  const eventData=payload.event||{};
  const title=payload.title||"KOVA Companion";
  const options={
    body:payload.body||"Ny KOVA-oppdatering",
    icon:"./icon.svg",
    badge:"./icon.svg",
    tag:payload.changeId||undefined,
    renotify:false,
    data:{
      organization:payload.organization||"",
      eventId:eventData.id||"",
      kind:payload.kind||"",
      sourceUrl:eventData.sourceUrl||""
    }
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("pushsubscriptionchange",event=>{
  event.waitUntil(
    self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
      for(const client of list)client.postMessage({type:"pushsubscriptionchange"});
    })
  );
});

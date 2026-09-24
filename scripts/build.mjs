import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';

// Archive the code; deploy only links to the independent Kova Companion.
const target='https://border55-repo.github.io/KOVA-Companion-Android/';
await rm('dist',{recursive:true,force:true});
for(const [path,suffix] of [['',''],['kova',''],['kova/admin','admin/']]){
  const dir='dist/'+path;
  const url=target+suffix;
  await mkdir(dir,{recursive:true});
  await writeFile(dir+'/index.html',`<!doctype html>
<html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kova Companion har flyttet</title><link rel="canonical" href="${url}">
<style>body{font:18px system-ui;max-width:38rem;margin:12vh auto;padding:24px;color:#eef3f8;background:#071626}a{color:#8bd5ff}p{line-height:1.6}</style></head>
<body><h1>Kova Companion har fått egen adresse</h1><p><a id="destination" href="${url}">Åpne Kova Companion${suffix?' – Admin':''}</a></p>
<p>Har du installert nettappen på iPhone? Åpne den nye adressen i Safari, legg den til på Hjem-skjermen og slå på varsler der.</p>
<script>const destination=new URL(${JSON.stringify(url)});destination.search=location.search;destination.hash=location.hash;document.getElementById('destination').href=destination.href;
const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!installed)location.replace(destination.href);</script></body></html>`);
}
// Keep existing push subscriptions alive during the move. Do not clear shared
// origin storage or URKH's caches and registrations.
const worker=`const target=${JSON.stringify(target)};
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate')return;
  const source=new URL(event.request.url);
  const destination=new URL(source.pathname.includes('/admin/')?'admin/':'',target);
  destination.search=source.search;destination.hash=source.hash;
  event.respondWith(Promise.resolve(Response.redirect(destination.href,302)));
});
self.addEventListener('push',event=>{
  let payload={};try{payload=event.data?.json()||{}}catch{payload={body:event.data?.text()||''}}
  event.waitUntil(self.registration.showNotification(payload.title||'Kova Companion',{
    body:payload.body||'Ny oppdatering',tag:payload.changeId,
    icon:target+'icon.svg',data:payload
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const data=event.notification.data||{};
  const destination=new URL(target);
  if(data.kind==='announcement')destination.hash='changelogCard';
  if(data.organization)destination.searchParams.set('org',data.organization);
  if(data.event?.id)destination.searchParams.set('event',data.event.id);
  event.waitUntil(self.clients.openWindow(destination.href));
});
`;
for(const path of ['dist/sw.js','dist/kova/sw.js'])await writeFile(path,worker);
await writeFile('dist/404.html',await readFile('dist/index.html'));
console.log('Published migration links only. KlarX and other product pages are not included.');

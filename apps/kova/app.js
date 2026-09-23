const DATA_BASE = "https://raw.githubusercontent.com/Border55-repo/KOVA-Companion-Android/main/bridge/data";

const state = {
  orgs: [],
  org: localStorage.getItem("kova.pwa.org") || "UllensakerRKH",
  events: [],
  view: "all",
  search: "",
  type: "",
  favorites: new Set(JSON.parse(localStorage.getItem("kova.pwa.favorites") || "[]")),
  followed: new Set(JSON.parse(localStorage.getItem("kova.pwa.followed") || '["UllensakerRKH"]')),
  selected: null,
};

const $ = id => document.getElementById(id);
const orgSelect = $("orgSelect");
const typeSelect = $("typeSelect");
const eventsEl = $("events");
const emptyEl = $("empty");
const statusText = $("statusText");
const searchInput = $("searchInput");
const template = $("eventTemplate");

function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true}
function eventKey(event){return (event.orgCode || state.org) + "|" + event.id}
function displayTime(value=""){
  const t=value.trim();
  if(!t)return "Tid ikke oppgitt";
  if(t.startsWith("->"))return "Til " + (t.match(/\d{1,2}:\d{2}/)?.[0] || t);
  return t;
}
function saveSet(key,set){localStorage.setItem(key,JSON.stringify([...set]))}
function dateInRange(dateIso,days){
  if(!dateIso)return false;
  const date=new Date(dateIso+"T00:00:00");
  const today=new Date(); today.setHours(0,0,0,0);
  const end=new Date(today); end.setDate(end.getDate()+days);
  return date>=today && date<=end;
}
function orgName(code){return state.orgs.find(o=>o.code===code)?.name || code}
function updateConnection(){
  $("connectionText").textContent=navigator.onLine ? "På nett" : "Frakoblet – viser cache hvis tilgjengelig";
}
function updateFollowUi(){
  const followed=state.followed.has(state.org);
  $("followBtn").textContent=followed ? "★ Følger" : "☆ Følg";
  $("followBtn").classList.toggle("active",followed);
  $("followSummary").textContent=state.followed.size ? `${state.followed.size} korps fulgt` : "Ingen korps fulgt";
}
function updateTypes(){
  const current=typeSelect.value;
  const types=[...new Set(state.events.map(e=>e.type).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"nb"));
  typeSelect.innerHTML='<option value="">Alle typer</option>'+types.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
  state.type=types.includes(current) ? current : "";
  typeSelect.value=state.type;
}
function filteredEvents(){
  const q=state.search.trim().toLowerCase();
  return state.events.filter(event=>{
    if(state.view==="favorites" && !state.favorites.has(eventKey(event)))return false;
    if(state.view==="week" && !dateInRange(event.dateIso,7))return false;
    if(state.view==="month" && !dateInRange(event.dateIso,30))return false;
    if(state.view==="all" && event.dateIso && !dateInRange(event.dateIso,3650))return false;
    if(state.type && event.type!==state.type)return false;
    return !q || [event.description,event.type,event.dateLabel,event.time,event.orgName]
      .some(v=>(v||"").toLowerCase().includes(q));
  }).sort((a,b)=>(a.dateIso+a.time).localeCompare(b.dateIso+b.time));
}
function render(){
  eventsEl.innerHTML="";
  const list=filteredEvents();
  $("eventCount").textContent=list.length;
  emptyEl.classList.toggle("hidden",list.length!==0);
  const multi=state.view==="followed";

  for(const event of list){
    const node=template.content.cloneNode(true);
    node.querySelector(".type").textContent=event.type||"Aktivitet";
    node.querySelector(".description").textContent=event.description||"KOVA-aktivitet";
    node.querySelector(".meta").textContent=[event.dateLabel,displayTime(event.time)].filter(Boolean).join(" • ");
    const chip=node.querySelector(".org-chip");
    chip.textContent=event.orgName||orgName(event.orgCode);
    chip.classList.toggle("hidden",!multi);
    const fav=node.querySelector(".favorite");
    fav.textContent=state.favorites.has(eventKey(event)) ? "★" : "☆";
    fav.onclick=()=>{
      const key=eventKey(event);
      state.favorites.has(key)?state.favorites.delete(key):state.favorites.add(key);
      saveSet("kova.pwa.favorites",state.favorites);
      render();
    };
    node.querySelector(".event-main").onclick=()=>openDetail(event);
    eventsEl.appendChild(node);
  }
}
function openDetail(event){
  state.selected=event;
  $("detailType").textContent=event.type||"Aktivitet";
  $("detailTitle").textContent=event.description||"KOVA-aktivitet";
  $("detailMeta").textContent=[event.dateLabel,displayTime(event.time)].filter(Boolean).join(" • ");
  $("detailOrg").textContent=event.orgName||orgName(event.orgCode);
  $("detailKovaLink").href=event.sourceUrl||"https://www.kova.no/";
  updateDialogFavorite();
  $("detailDialog").showModal();
}
function updateDialogFavorite(){
  if(!state.selected)return;
  $("favoriteDialogBtn").textContent=state.favorites.has(eventKey(state.selected)) ? "★ Fjern favoritt" : "☆ Legg til favoritt";
}
async function fetchJson(url){
  const response=await fetch(url,{cache:"no-store"});
  if(!response.ok)throw new Error("Kunne ikke hente oppdaterte KOVA-data");
  return response.json();
}
async function loadOrganizations(){
  const payload=await fetchJson(`${DATA_BASE}/organizations.json`);
  state.orgs=payload.organizations.filter(o=>o.category==="hjelpekorps");
  orgSelect.innerHTML=state.orgs.map(o=>`<option value="${escapeHtml(o.code)}">${escapeHtml(o.name)}</option>`).join("");
  if(!state.orgs.some(o=>o.code===state.org))state.org="UllensakerRKH";
  orgSelect.value=state.org;
  updateFollowUi();
}
async function loadOneOrg(code){
  const payload=await fetchJson(`${DATA_BASE}/${encodeURIComponent(code)}.json`);
  return {
    payload,
    events:(payload.events||[]).map(event=>({
      ...event,
      orgCode:code,
      orgName:payload.organization?.name||orgName(code),
    })),
  };
}
async function loadCurrent(){
  const {payload,events}=await loadOneOrg(state.org);
  state.events=events;
  $("orgTitle").textContent=payload.organization?.name||state.org;
  statusText.textContent="KOVA-data oppdatert "+formatUpdated(payload.updatedAt);
}
async function loadMany(codes,title,emptyText){
  if(!codes.length){
    state.events=[];
    $("orgTitle").textContent=title;
    statusText.textContent=emptyText;
    return;
  }
  const results=await Promise.allSettled(codes.map(loadOneOrg));
  state.events=results.filter(r=>r.status==="fulfilled").flatMap(r=>r.value.events);
  $("orgTitle").textContent=title;
  const ok=results.filter(r=>r.status==="fulfilled").length;
  statusText.textContent=`Lastet ${ok} av ${codes.length} korps`;
}
async function loadFollowed(){
  await loadMany([...state.followed],"Fulgte korps","Ingen korps er fulgt ennå");
}
async function loadFavorites(){
  const codes=[...new Set([...state.favorites].map(key=>key.split("|")[0]).filter(Boolean))];
  await loadMany(codes,"Mine aktiviteter","Ingen favoritter er lagret ennå");
}
async function loadEvents(){
  statusText.textContent="Oppdaterer…";
  updateConnection();
  try{
    if(state.view==="followed")await loadFollowed();
    else if(state.view==="favorites")await loadFavorites();
    else await loadCurrent();
    updateTypes();
    render();
  }catch(error){
    statusText.textContent=(navigator.onLine?"Kunne ikke hente KOVA":"Frakoblet")+" – "+(error.message||"ukjent feil");
    render();
  }
}
function formatUpdated(value){
  if(!value)return "";
  try{return new Intl.DateTimeFormat("nb-NO",{dateStyle:"short",timeStyle:"short"}).format(new Date(value))}
  catch{return value}
}
function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function eventTime(event){
  return (event.time||"").match(/\d{1,2}:\d{2}/)?.[0]||"";
}
function calendarDate(event,time){
  const date=new Date(event.dateIso+"T00:00:00");
  if(time){
    const [h,m]=time.split(":").map(Number);
    date.setHours(h,m,0,0);
  }
  return date;
}
function icsDay(date){
  const p=n=>String(n).padStart(2,"0");
  return `${date.getFullYear()}${p(date.getMonth()+1)}${p(date.getDate())}`;
}
function icsStamp(date){
  const p=n=>String(n).padStart(2,"0");
  return `${icsDay(date)}T${p(date.getHours())}${p(date.getMinutes())}00`;
}
function escapeIcs(value=""){return String(value).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;")}
async function addToCalendar(event){
  const time=eventTime(event);
  const start=calendarDate(event,time);
  const end=new Date(start);
  if(time)end.setHours(end.getHours()+1); else end.setDate(end.getDate()+1);
  const dateLines=time
    ? [`DTSTART:${icsStamp(start)}`,`DTEND:${icsStamp(end)}`]
    : [`DTSTART;VALUE=DATE:${icsDay(start)}`,`DTEND;VALUE=DATE:${icsDay(end)}`];
  const ics=[
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//KOVA Companion//PWA//NO","BEGIN:VEVENT",
    `UID:${escapeIcs(eventKey(event))}@kova-companion`,
    ...dateLines,
    `SUMMARY:${escapeIcs(event.description||"KOVA-aktivitet")}`,
    `DESCRIPTION:${escapeIcs((event.type||"Aktivitet")+" – "+(event.orgName||orgName(event.orgCode)))}`,
    `URL:${escapeIcs(event.sourceUrl||"https://www.kova.no/")}`,
    "END:VEVENT","END:VCALENDAR",""
  ].join("\r\n");
  const file=new File([ics],"kova-aktivitet.ics",{type:"text/calendar"});
  if(navigator.canShare?.({files:[file]})){
    await navigator.share({files:[file],title:event.description||"KOVA-aktivitet"});
    return;
  }
  const url=URL.createObjectURL(file);
  const a=document.createElement("a"); a.href=url; a.download=file.name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function shareEvent(event){
  const text=`${event.description||"KOVA-aktivitet"}\n${event.dateLabel||event.dateIso} ${displayTime(event.time)}\n${event.orgName||orgName(event.orgCode)}`;
  const url=event.sourceUrl||"https://www.kova.no/";
  if(navigator.share){
    await navigator.share({title:event.description||"KOVA-aktivitet",text,url});
  }else{
    await navigator.clipboard.writeText(text+"\n"+url);
    $("shareBtn").textContent="Kopiert";
    setTimeout(()=>{$("shareBtn").textContent="Del aktivitet"},1200);
  }
}

orgSelect.addEventListener("change",async()=>{
  state.org=orgSelect.value;
  localStorage.setItem("kova.pwa.org",state.org);
  updateFollowUi();
  if(state.view==="followed"){
    state.view="all";
    document.querySelectorAll("#viewTabs button").forEach(b=>b.classList.toggle("active",b.dataset.view==="all"));
  }
  await loadEvents();
});
typeSelect.addEventListener("change",()=>{state.type=typeSelect.value;render()});
searchInput.addEventListener("input",()=>{state.search=searchInput.value;render()});
$("refreshBtn").onclick=loadEvents;
$("followBtn").onclick=async()=>{
  state.followed.has(state.org)?state.followed.delete(state.org):state.followed.add(state.org);
  saveSet("kova.pwa.followed",state.followed);
  updateFollowUi();
  if(state.view==="followed")await loadEvents();
};
$("viewTabs").addEventListener("click",async event=>{
  const btn=event.target.closest("button[data-view]"); if(!btn)return;
  state.view=btn.dataset.view;
  document.querySelectorAll("#viewTabs button").forEach(b=>b.classList.toggle("active",b===btn));
  await loadEvents();
});
$("closeDialog").onclick=()=> $("detailDialog").close();
$("favoriteDialogBtn").onclick=()=>{
  if(!state.selected)return;
  const key=eventKey(state.selected);
  state.favorites.has(key)?state.favorites.delete(key):state.favorites.add(key);
  saveSet("kova.pwa.favorites",state.favorites);
  updateDialogFavorite(); render();
};
$("calendarBtn").onclick=async()=>{if(state.selected)await addToCalendar(state.selected)};
$("shareBtn").onclick=async()=>{if(state.selected)await shareEvent(state.selected)};

window.addEventListener("online",()=>{updateConnection();loadEvents()});
window.addEventListener("offline",updateConnection);

let installPrompt=null;
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault(); installPrompt=event; $("installBtn").classList.remove("hidden");
});
$("installBtn").onclick=async()=>{
  if(!installPrompt)return;
  await installPrompt.prompt(); installPrompt=null; $("installBtn").classList.add("hidden");
};
if(isIOS()&&!isStandalone())$("installHint").classList.remove("hidden");

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

(async()=>{
  updateConnection();
  try{
    await loadOrganizations();
    await loadEvents();
  }catch(error){
    statusText.textContent=error.message||"Oppstart feilet";
  }
})();

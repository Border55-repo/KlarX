const DATA_BASE="https://raw.githubusercontent.com/Border55-repo/KOVA-Companion-Android/main/bridge/data";
const ADMIN_EMAIL="superuser@kova-companion.local";
const $=id=>document.getElementById(id);
let firebase=null;
let currentOrgRows=[];

async function initFirebase(){
  if(firebase)return firebase;
  const [appModule,authModule,firestoreModule,config]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"),
    fetch("../firebase-web-config.json",{cache:"no-store"}).then(r=>{
      if(!r.ok)throw new Error("Kunne ikke hente Firebase-konfigurasjon");
      return r.json();
    })
  ]);
  const app=appModule.getApps().length?appModule.getApps()[0]:appModule.initializeApp(config);
  firebase={
    app,
    auth:authModule.getAuth(app),
    signInWithEmailAndPassword:authModule.signInWithEmailAndPassword,
    signOut:authModule.signOut,
    onAuthStateChanged:authModule.onAuthStateChanged,
    updatePassword:authModule.updatePassword,
    db:firestoreModule.getFirestore(app),
    doc:firestoreModule.doc,
    getDoc:firestoreModule.getDoc,
    setDoc:firestoreModule.setDoc,
    updateDoc:firestoreModule.updateDoc,
    collection:firestoreModule.collection,
    getDocs:firestoreModule.getDocs,
    serverTimestamp:firestoreModule.serverTimestamp
  };
  return firebase;
}

function show(id){
  for(const name of ["loginView","passwordView","dashboardView"])$(name).classList.toggle("hidden",name!==id);
}
function err(id,message=""){
  $(id).textContent=message;
  $(id).classList.toggle("hidden",!message);
}
async function fetchJson(path){
  const sep=path.includes("?")?"&":"?";
  const response=await fetch(path+`${sep}ts=${Date.now()}`,{cache:"no-store"});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function dateValue(value){
  if(!value)return null;
  if(typeof value?.toDate==="function")return value.toDate();
  const date=new Date(value);
  return Number.isNaN(date.getTime())?null:date;
}
function fmt(value){
  const date=dateValue(value);
  if(!date)return "–";
  return new Intl.DateTimeFormat("nb-NO",{dateStyle:"short",timeStyle:"short"}).format(date);
}
function ageMinutes(value){
  const date=dateValue(value);
  return date?Math.max(0,(Date.now()-date.getTime())/60000):Infinity;
}
function healthState(runtime){
  if(!runtime?.lastRunAt)return {level:"unknown",label:"Ukjent",hint:"Venter på første live Bridge-status."};
  const age=ageMinutes(runtime.lastRunAt);
  if(runtime.status==="error"||age>30)return {level:"error",label:"Feil",hint:`Siste Bridge-kjøring: ${fmt(runtime.lastRunAt)}`};
  if(runtime.status==="degraded"||age>12||Number(runtime.pendingPushes||0)>0){
    return {level:"warning",label:"Advarsel",hint:`Siste Bridge-kjøring: ${fmt(runtime.lastRunAt)}`};
  }
  return {level:"ok",label:"Grønn",hint:`Bridge kjørte ${fmt(runtime.lastRunAt)}`};
}
function renderSystemHealth(runtime){
  const state=healthState(runtime);
  const card=$("systemHealth");
  card.classList.remove("health-ok","health-warning","health-error","health-unknown");
  card.classList.add("health-"+state.level);
  $("systemHealthLabel").textContent=state.label;
  $("systemHealthHint").textContent=state.hint;
}
async function ensureProfile(user){
  const f=await initFirebase();
  const ref=f.doc(f.db,"adminUsers",user.uid);
  let snap=await f.getDoc(ref);
  if(!snap.exists()){
    await f.setDoc(ref,{
      username:"superuser",
      email:ADMIN_EMAIL,
      role:"superuser",
      mustChangePassword:true,
      createdAt:f.serverTimestamp(),
      updatedAt:f.serverTimestamp()
    });
    snap=await f.getDoc(ref);
  }
  return {ref,data:snap.data()};
}
async function handleUser(user){
  if(!user){show("loginView");return}
  if(user.email!==ADMIN_EMAIL){
    await (await initFirebase()).signOut((await initFirebase()).auth);
    err("loginError","Denne kontoen har ikke admin-tilgang.");
    show("loginView");
    return;
  }
  try{
    const profile=await ensureProfile(user);
    if(profile.data.mustChangePassword){show("passwordView");return}
    show("dashboardView");
    await loadDashboard();
  }catch(error){
    show("loginView");
    err("loginError","Adminprofil kunne ikke åpnes: "+(error.message||String(error)));
  }
}

$("loginForm").addEventListener("submit",async event=>{
  event.preventDefault();err("loginError");
  const username=$("username").value.trim().toLowerCase();
  if(username!=="superuser"){err("loginError","Ukjent brukernavn.");return}
  try{
    const f=await initFirebase();
    await f.signInWithEmailAndPassword(f.auth,ADMIN_EMAIL,$("password").value);
  }catch(error){
    const code=String(error?.code||"");
    const message=
      code.includes("auth/invalid-credential") ? "Feil brukernavn/passord, eller superuser-kontoen finnes ikke i Firebase." :
      code.includes("auth/user-not-found") ? "Superuser-kontoen finnes ikke i Firebase Authentication." :
      code.includes("auth/wrong-password") ? "Passordet er feil." :
      code.includes("auth/operation-not-allowed") ? "Email/Password-innlogging er ikke aktivert i Firebase Authentication." :
      code.includes("auth/network-request-failed") ? "Kunne ikke kontakte Firebase. Sjekk nettforbindelsen." :
      "Innlogging feilet: "+(error?.message||code||"ukjent feil");
    err("loginError",message);
  }
});

$("passwordForm").addEventListener("submit",async event=>{
  event.preventDefault();err("passwordError");
  const a=$("newPassword").value,b=$("confirmPassword").value;
  if(a.length<12){err("passwordError","Nytt passord må ha minst 12 tegn.");return}
  if(a!==b){err("passwordError","Passordene er ikke like.");return}
  try{
    const f=await initFirebase();
    const user=f.auth.currentUser;
    if(!user)throw new Error("Ikke innlogget");
    await f.updatePassword(user,a);
    await f.updateDoc(f.doc(f.db,"adminUsers",user.uid),{
      mustChangePassword:false,
      passwordChangedAt:f.serverTimestamp(),
      updatedAt:f.serverTimestamp()
    });
    show("dashboardView");
    await loadDashboard();
  }catch(error){
    err("passwordError","Passordbytte feilet: "+(error.message||String(error)));
  }
});

async function loadOrganizations(){
  const index=await fetchJson(`${DATA_BASE}/index.json`);
  const rows=(index.organizations||[]).filter(o=>o.category==="hjelpekorps");
  return {
    count:rows.length,
    rows:rows.map(org=>({
      name:org.name,
      code:org.code,
      status:org.status||"unknown",
      eventCount:Number(org.eventCount||0),
      updatedAt:org.updatedAt||"",
      lastCheckedAt:"",
      error:null
    }))
  };
}
function renderOrgRows(){
  const q=$("orgSearch").value.trim().toLowerCase();
  $("orgRows").innerHTML=currentOrgRows.filter(row=>
    !q||row.name.toLowerCase().includes(q)||row.code.toLowerCase().includes(q)
  ).map(row=>{
    const age=ageMinutes(row.lastCheckedAt);
    const freshness=!Number.isFinite(age)?"Venter":age>35?"Gammel":age>25?"Snart gammel":"Fersk";
    const statusClass=row.status==="error"?"status-error":age>35?"status-warning":"status-ok";
    const statusText=row.status==="error"?"Feil":freshness;
    return `<tr>
      <td><strong>${escapeHtml(row.name)}</strong><br><span class="muted">${escapeHtml(row.code)}</span></td>
      <td class="${statusClass}">${escapeHtml(statusText)}</td>
      <td>${row.eventCount}</td>
      <td>${escapeHtml(fmt(row.lastCheckedAt))}</td>
      <td>${escapeHtml(fmt(row.updatedAt))}</td>
    </tr>`;
  }).join("");
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function loadDashboard(){
  const f=await initFirebase();
  $("lastRefresh").textContent="Oppdaterer…";
  const [health,orgData,release,pushSnap,cacheSnap,runtimeSnap,commandSnap]=await Promise.all([
    fetchJson(`${DATA_BASE}/health.json`),
    loadOrganizations(),
    fetchJson(`${DATA_BASE}/app-update.json`),
    f.getDocs(f.collection(f.db,"webPushSubscriptions")),
    f.getDoc(f.doc(f.db,"publicConfig","pwa")),
    f.getDoc(f.doc(f.db,"adminRuntime","bridge")),
    f.getDoc(f.doc(f.db,"adminCommands","bridgeSync"))
  ]);

  const runtime=runtimeSnap.exists()?runtimeSnap.data():null;
  const checks=Object.values(runtime?.organizationChecks||{});
  const checkByCode=new Map(checks.map(item=>[item.code,item]));
  currentOrgRows=orgData.rows.map(row=>{
    const check=checkByCode.get(row.code);
    return {
      ...row,
      lastCheckedAt:check?.checkedAt||"",
      error:check?.error||null,
      status:check?.status==="error"?"error":row.status
    };
  }).sort((a,b)=>a.name.localeCompare(b.name,"nb"));
  renderOrgRows();
  renderSystemHealth(runtime);

  const enabled=[...pushSnap.docs].filter(d=>d.data().enabled!==false).length;
  const totalEvents=currentOrgRows.reduce((sum,row)=>sum+row.eventCount,0);
  const cache=cacheSnap.exists()?cacheSnap.data():{cacheEpoch:0};
  const command=commandSnap.exists()?commandSnap.data():null;

  $("bridgeStatus").textContent=runtime?.status||health.status||"–";
  $("bridgeTime").textContent=fmt(runtime?.lastRunAt||health.lastFullySuccessfulRunAt||health.checkedAt);
  $("corpsCount").textContent=orgData.count;
  $("eventTotal").textContent=totalEvents;
  $("pwaDevices").textContent=pushSnap.size;
  $("pwaActive").textContent=`${enabled} aktive abonnement`;
  $("pendingPush").textContent=runtime?.pendingPushes??health.pendingPushes??"–";
  $("lastPush").textContent=health.lastPushAt?`sist ${fmt(health.lastPushAt)} • ${health.lastPushCount??0}`:"ingen push registrert";
  $("androidVersion").textContent=(release.tagName||"–").replace(/^v/,"");
  $("cacheEpoch").textContent=cache.cacheEpoch??"–";
  $("polledThisRun").textContent=runtime?.polledThisRun??health.polledThisRun??"–";
  $("bridgeSyncStatus").textContent=command
    ? `Status: ${command.status||"ukjent"}${command.completedAt?" • ferdig "+fmt(command.completedAt):command.startedAt?" • startet "+fmt(command.startedAt):command.requestedAt?" • bedt om "+fmt(command.requestedAt):""}`
    : "Ingen aktiv synkforespørsel.";
  $("lastRefresh").textContent="Oppdatert "+new Intl.DateTimeFormat("nb-NO",{timeStyle:"medium"}).format(new Date());
}

$("refreshBtn").onclick=()=>loadDashboard().catch(e=>$("lastRefresh").textContent="Oppdatering feilet: "+e.message);
$("bridgeSyncBtn").onclick=async()=>{
  const f=await initFirebase();
  const button=$("bridgeSyncBtn");
  button.disabled=true;
  $("bridgeSyncStatus").textContent="Sender synkforespørsel…";
  try{
    const requestId=(crypto.randomUUID?.()||String(Date.now())+"-"+Math.random().toString(16).slice(2));
    await f.setDoc(f.doc(f.db,"adminCommands","bridgeSync"),{
      action:"bridgeSync",
      status:"requested",
      requestId,
      requestedBy:"superuser",
      requestedAt:f.serverTimestamp()
    });
    $("bridgeSyncStatus").textContent="Synk er bestilt. Bridge plukker den opp på neste 5-minuttersrunde.";
    setTimeout(()=>loadDashboard().catch(()=>{}),5000);
  }catch(error){
    $("bridgeSyncStatus").textContent="Kunne ikke bestille synk: "+(error.message||String(error));
  }finally{
    button.disabled=false;
  }
};
$("orgSearch").addEventListener("input",renderOrgRows);
$("signOutBtn").onclick=async()=>{
  const f=await initFirebase();await f.signOut(f.auth);show("loginView");
};
$("cacheRefreshBtn").onclick=async()=>{
  const f=await initFirebase();
  const ref=f.doc(f.db,"publicConfig","pwa");
  const snap=await f.getDoc(ref);
  const current=snap.exists()?(snap.data().cacheEpoch||0):0;
  $("cacheRefreshBtn").disabled=true;
  $("cacheMessage").textContent="Publiserer ny cache-generasjon…";
  try{
    await f.setDoc(ref,{cacheEpoch:current+1,updatedAt:f.serverTimestamp()});
    $("cacheMessage").textContent=`Ny PWA-cachegenerasjon ${current+1} er publisert.`;
    await loadDashboard();
  }catch(error){
    $("cacheMessage").textContent="Cache-refresh feilet: "+(error.message||String(error));
  }finally{
    $("cacheRefreshBtn").disabled=false;
  }
};

(async()=>{
  try{
    const f=await initFirebase();
    f.onAuthStateChanged(f.auth,handleUser);
  }catch(error){
    err("loginError","Adminpanelet kunne ikke starte: "+(error.message||String(error)));
  }
})();

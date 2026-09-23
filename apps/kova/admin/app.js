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
function fmt(value){
  if(!value)return "–";
  try{return new Intl.DateTimeFormat("nb-NO",{dateStyle:"short",timeStyle:"short"}).format(new Date(value))}
  catch{return value}
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
    err("loginError","Innlogging feilet. Kontroller passordet.");
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
  const organizations=await fetchJson(`${DATA_BASE}/organizations.json`);
  const corps=organizations.organizations.filter(o=>o.category==="hjelpekorps");
  const results=await Promise.allSettled(corps.map(async org=>{
    const safe=org.code.replace(/[^A-Za-z0-9._-]+/g,"_").replace(/^_+|_+$/g,"");
    const payload=await fetchJson(`${DATA_BASE}/${encodeURIComponent(safe)}.json`);
    return {
      name:org.name,code:org.code,status:payload.status||"ok",
      eventCount:(payload.events||[]).length,updatedAt:payload.updatedAt||""
    };
  }));
  return {
    count:corps.length,
    rows:results.map((r,i)=>r.status==="fulfilled"?r.value:{
      name:corps[i].name,code:corps[i].code,status:"error",eventCount:0,updatedAt:""
    })
  };
}
function renderOrgRows(){
  const q=$("orgSearch").value.trim().toLowerCase();
  $("orgRows").innerHTML=currentOrgRows.filter(row=>
    !q||row.name.toLowerCase().includes(q)||row.code.toLowerCase().includes(q)
  ).map(row=>`<tr>
    <td><strong>${escapeHtml(row.name)}</strong><br><span class="muted">${escapeHtml(row.code)}</span></td>
    <td class="${row.status==="ok"?"status-ok":"status-error"}">${escapeHtml(row.status)}</td>
    <td>${row.eventCount}</td>
    <td>${escapeHtml(fmt(row.updatedAt))}</td>
  </tr>`).join("");
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function loadDashboard(){
  const f=await initFirebase();
  $("lastRefresh").textContent="Oppdaterer…";
  const [health,orgData,release,pushSnap,cacheSnap]=await Promise.all([
    fetchJson(`${DATA_BASE}/health.json`),
    loadOrganizations(),
    fetchJson(`${DATA_BASE}/app-update.json`),
    f.getDocs(f.collection(f.db,"webPushSubscriptions")),
    f.getDoc(f.doc(f.db,"publicConfig","pwa"))
  ]);

  currentOrgRows=orgData.rows.sort((a,b)=>a.name.localeCompare(b.name,"nb"));
  renderOrgRows();
  const enabled=[...pushSnap.docs].filter(d=>d.data().enabled!==false).length;
  const totalEvents=currentOrgRows.reduce((sum,row)=>sum+row.eventCount,0);
  const cache=cacheSnap.exists()?cacheSnap.data():{cacheEpoch:0};

  $("bridgeStatus").textContent=health.status||"–";
  $("bridgeTime").textContent=fmt(health.lastFullySuccessfulRunAt||health.checkedAt);
  $("corpsCount").textContent=orgData.count;
  $("eventTotal").textContent=totalEvents;
  $("pwaDevices").textContent=pushSnap.size;
  $("pwaActive").textContent=`${enabled} aktive abonnement`;
  $("pendingPush").textContent=health.pendingPushes??"–";
  $("lastPush").textContent=health.lastPushAt?`sist ${fmt(health.lastPushAt)} • ${health.lastPushCount??0}`:"ingen push registrert";
  $("androidVersion").textContent=(release.tagName||"–").replace(/^v/,"");
  $("cacheEpoch").textContent=cache.cacheEpoch??"–";
  $("polledThisRun").textContent=health.polledThisRun??"–";
  $("lastRefresh").textContent="Oppdatert "+new Intl.DateTimeFormat("nb-NO",{timeStyle:"medium"}).format(new Date());
}

$("refreshBtn").onclick=()=>loadDashboard().catch(e=>$("lastRefresh").textContent="Oppdatering feilet: "+e.message);
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

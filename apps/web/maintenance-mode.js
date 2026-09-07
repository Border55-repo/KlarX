(() => {
  const ENDPOINT = "https://julian-project-maintenance.juliannordli.chatgpt.site/api/maintenance";
  const PROJECT_KEY = "klarx";
  const ID = "jp-maintenance-overlay";
  function render(state) {
    const active = state?.active && (state.all || state.projects?.includes(PROJECT_KEY)) && (!state.until || Date.parse(state.until) > Date.now());
    document.getElementById(ID)?.remove();
    document.documentElement.removeAttribute("data-maintenance");
    if (!active) return;
    document.documentElement.setAttribute("data-maintenance", "true");
    const overlay = document.createElement("section");
    overlay.id = ID;
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "jp-maintenance-title");
    const until = state.until ? new Date(state.until).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" }) : "snart";
    overlay.innerHTML = '<div class="jp-maintenance-card"><span class="jp-maintenance-light" aria-hidden="true"></span><p>PLANLAGT VEDLIKEHOLD</p><h1 id="jp-maintenance-title">Vi er straks tilbake</h1><div class="jp-maintenance-message"></div><small>Forventet tilgjengelig igjen: <strong class="jp-maintenance-until"></strong></small><button type="button">Prøv igjen</button></div>';
    overlay.querySelector(".jp-maintenance-message").textContent = state.message || "Vi gjør en kort teknisk oppdatering. Prøv igjen om litt.";
    overlay.querySelector(".jp-maintenance-until").textContent = until;
    overlay.querySelector("button").addEventListener("click", check);
    const style = document.createElement("style");
    style.textContent = '#jp-maintenance-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0,#123f59 0,transparent 42%),#06131c;color:#f5fbff;font:16px/1.5 system-ui,sans-serif}.jp-maintenance-card{width:min(540px,100%);padding:clamp(28px,7vw,52px);border:1px solid #326176;border-radius:28px;background:linear-gradient(145deg,#102c39,#091922);box-shadow:0 28px 90px #0008}.jp-maintenance-light{display:block;width:18px;height:18px;border-radius:50%;background:#58d4ff;box-shadow:0 0 28px #58d4ff;animation:jpPulse 1.6s ease-in-out infinite}.jp-maintenance-card p{margin:28px 0 8px;color:#6edcff;font-size:.78rem;font-weight:850;letter-spacing:.16em}.jp-maintenance-card h1{margin:0 0 16px;color:#fff;font-size:clamp(2rem,8vw,3.4rem);line-height:1;letter-spacing:-.04em}.jp-maintenance-message{color:#b9cdd7;font-size:1.08rem}.jp-maintenance-card small{display:block;margin-top:24px;color:#8ea9b6}.jp-maintenance-card button{margin-top:24px;padding:12px 18px;border:0;border-radius:11px;background:#e23d4f;color:white;font:inherit;font-weight:750;cursor:pointer}@keyframes jpPulse{50%{opacity:.35;transform:scale(.72)}}@media(prefers-reduced-motion:reduce){.jp-maintenance-light{animation:none}}';
    overlay.append(style);
    document.body.append(overlay);
    overlay.querySelector("button").focus();
  }
  async function check() {
    try { const response = await fetch(ENDPOINT + "?t=" + Date.now(), { cache: "no-store" }); if (response.ok) render(await response.json()); }
    catch { /* Feil i statuskontrollen skal aldri låse appen. */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check, { once: true }); else check();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  window.setInterval(check, 60_000);
})();


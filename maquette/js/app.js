/* =========================================================================
   Coquille de la maquette : en-têtes, menu Setup, routeur, modales,
   aides présentateur (étapes des fils rouges, projecteur, popups-gags).
   ========================================================================= */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const SCREENS = {};                       // enregistrés par js/screens/*.js
  const state = { org: 'wdf', page: 'org-overview', sub: null, params: {}, step: null };

  // ---------- Menu « Scale Center » (libellés réels de l'outil) ----------
  const MENU = [
    { key: 'alerts', label: 'Alerts' },
    { key: 'org-overview', label: 'Org Overview' },
    { key: 'org-performance', label: 'Org Performance' },
    { key: 'performance-analysis', label: 'Performance Analysis' },
    { group: 'Scale Insights', items: [
      { key: 'apexguru', label: 'ApexGuru Insights' },
      { key: 'database', label: 'Database Insights' },
      { key: 'deployment', label: 'Deployment Insights' },
      { key: 'governor', label: 'Governor Limit Insights' },
      { key: 'lex', label: 'Lightning Experience Insights' },
      { key: 'multiframework', label: 'Multi-Framework Insights (Beta)' },
      { key: 'report', label: 'Report Insights' },
      { key: 'search', label: 'Search Insights' }
    ] }
  ];

  const ORG = () => window.ORGS[state.org];

  // ---------- Squelette ----------
  function shell() {
    document.body.innerHTML = `
      <header class="global-header">
        <svg class="cloud" viewBox="0 0 64 44" aria-hidden="true"><path fill="#0d9dda" d="M26 6c4-5 12-6 17-1 3-2 8-2 11 1 5 1 9 6 9 11 0 7-6 12-12 12-2 4-7 6-11 4-3 5-10 6-14 3-5 3-12 1-14-4-6 0-10-5-9-10 0-4 3-7 6-8-1-5 4-10 9-9 2-1 5 0 8 1z"/></svg>
        <div class="global-search"><input placeholder="Search Setup" aria-label="Search Setup"></div>
        <div class="header-icons"><span>☆</span><span>＋</span><span>?</span><span>⚙</span><span>🔔</span><span class="avatar" title="Démo Présentateur">DP</span></div>
      </header>
      <div class="org-banner" id="orgBanner"></div>
      <div class="setup-bar"><div class="app-launcher">⋮⋮⋮</div><div class="app-name">Setup</div><div class="setup-tab active">Home</div><div class="setup-tab">Object Manager ⌄</div></div>
      <div class="demo-tag" title="Aucune donnée réelle : orgs, classes et chiffres sont inventés">Maquette — données fictives</div>
      <div class="layout">
        <nav class="sidenav" id="sidenav"></nav>
        <main class="main" id="main"></main>
      </div>
      <div class="presenter-bar hidden" id="pbar"></div>`;
  }

  function renderBanner() {
    const o = ORG();
    $('#orgBanner').innerHTML = `⚠ <b>${o.name}</b> — ${o.slogan} <button class="org-switch" id="orgSwitch">Changer d'org (O)</button>`;
    $('#orgSwitch').onclick = () => switchOrg();
  }

  function renderNav() {
    const cur = state.page;
    const item = (it, pad) => `<li><a href="#/${state.org}/${it.key}" style="--pad:${pad}px" class="${cur === it.key ? 'current' : ''}">${it.label}</a></li>`;
    $('#sidenav').innerHTML = `
      <div class="quickfind"><input value="scale cent" aria-label="Quick Find"></div>
      <ul class="tree">
        <li><span style="--pad:8px"><span class="caret">⌄</span>Scale</span></li>
        <li><span style="--pad:20px"><span class="caret">⌄</span><span class="hl">Scale Cent</span>er</span></li>
        ${MENU.map(m => m.group
          ? `<li><span style="--pad:36px"><span class="caret">⌄</span>${m.group}</span></li>` + m.items.map(i => item(i, 66)).join('')
          : item(m, 52)).join('')}
        <li><span style="--pad:20px"><span class="caret">›</span>Scale Test</span></li>
      </ul>
      <p class="muted" style="padding:14px 10px;font-size:12px">Didn't find what you're looking for? Try using Global Search.</p>`;
  }

  // ---------- Briques réutilisables pour les écrans ----------
  const UI = {
    pageHeader(title, icon) {
      return `<div class="page-header"><div class="page-icon">${icon || '⚙'}</div><div><div class="eyebrow">Setup</div><h1>${title}</h1></div></div>`;
    },
    feedback: '<span class="feedback"><span>👍</span><span>👎</span></span>',
    info(txt, cls) { return `<div class="info-bar ${cls || ''}"><i class="i">i</i><div>${txt}</div></div>`; },
    /** En-tête commun à toute la famille « Scale Insights » */
    insightHeader(title, reports, selected, opts) {
      opts = opts || {};
      return `<div class="card-head"><h2 class="card-title">${title}</h2>${UI.feedback}</div>
        ${opts.intro || ''}
        <div class="row" style="margin-bottom:6px">
          <div class="field"><label>Select Report</label>
            <select class="select" data-report>${reports.map((r, i) => `<option value="${i}" ${i === selected ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
          <div class="spacer"></div>
          <button class="btn brand" data-generate>＋ Generate Insight Report</button>
          <button class="btn" data-refresh>⟳ Refresh</button>
        </div>
        ${opts.generated ? UI.info(`You're currently viewing insights generated ${opts.generated}.`) : ''}`;
    },
    tabs(list, active, attr) {
      return `<div class="tabs" ${attr || ''}>${list.map(t => `<div class="tab ${t.key === active ? 'active' : ''}" data-tab="${t.key}">${t.icon ? `<span class="ico">${t.icon}</span>` : ''}${t.label}</div>`).join('')}</div>`;
    },
    sevCards(c, selected, labels) {
      const L = labels || { critical: 'Critical', major: 'Major', minor: 'Minor' };
      return `<div class="sev-cards">${Object.keys(L).map(k => `<div class="sev ${selected === k ? 'selected' : ''}" data-sev="${k}"><span class="badge b-${k === 'safe' ? 'safe' : k}">${L[k]}</span><div class="n n-${k}">${c[k]}</div>${c[k + 'Cap'] ? `<div class="cap">${c[k + 'Cap']}</div>` : ''}</div>`).join('')}</div>`;
    },
    table(cols, rows, opts) {
      opts = opts || {};
      return `<table class="dt"><thead><tr>${cols.map(c => `<th class="${c.num ? 'num' : ''}">${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr ${opts.rowAttr ? opts.rowAttr(r, i) : ''}>${cols.map(c => {
        const v = typeof c.get === 'function' ? c.get(r, i) : r[c.key];
        const cls = (c.num ? 'num ' : '') + (c.cls ? (typeof c.cls === 'function' ? c.cls(r) : c.cls) : '');
        return `<td class="${cls}">${v == null ? '' : v}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table>${opts.pager ? `<div class="pager"><span>‹</span><span class="cur">1</span>${Array.from({ length: opts.pager - 1 }, (_, i) => `<span>${i + 2}</span>`).join('')}<span>›</span></div>` : ''}`;
    },
    /** delta signé coloré : rouge si régression (sens configurable) */
    delta(v, unit, goodWhenNegative = true, d = 2) {
      if (v == null) return '';
      const bad = goodWhenNegative ? v > 0 : v < 0;
      const txt = (v > 0 ? '' : '') + SC.fmt.dec(v, d) + (unit || '');
      return `<span class="${v === 0 ? '' : bad ? 'pos' : 'neg'}">${txt}</span>`;
    },
    code(lines, good) {
      return `<pre class="code ${good ? 'good' : ''}">${lines.map(l => l === '...' ? '<span class="ln">...</span>' : `<span class="ln">${l[0]}.</span> ${esc(l[1])}`).join('\n')}</pre>`;
    }
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ---------- Modales, toasts, popups-gags ----------
  function modal(html, opts) {
    opts = opts || {};
    const bd = document.createElement('div'); bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}"><button class="modal-x" aria-label="Fermer">✕</button>${html}</div>`;
    document.body.appendChild(bd);
    const close = () => bd.remove();
    bd.querySelector('.modal-x').onclick = close;
    bd.addEventListener('click', (e) => { if (e.target === bd) close(); });
    $$('[data-close]', bd).forEach(b => b.onclick = close);
    return { el: bd, close };
  }
  function toast(title, body, ms) {
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span style="font-size:22px">✔</span><div><b>${title}</b>${body || ''}</div><span style="margin-left:auto;cursor:pointer">✕</span>`;
    document.body.appendChild(t);
    t.lastChild.onclick = () => t.remove();
    setTimeout(() => t.remove(), ms || 4200);
  }
  /** Popup décalée (humour assumé, ou résumé quand l'écran est chargé) */
  function gag(id, anchor) {
    const g = (window.GAGS || {})[id]; if (!g) return;
    $$('.gag').forEach(x => x.remove());
    const d = document.createElement('div'); d.className = 'gag' + (anchor ? '' : ' center');
    d.innerHTML = `<button class="gag-close">✕</button>${g.title ? `<div class="gag-title">${g.title}</div>` : ''}<div>${g.text}</div>`;
    document.body.appendChild(d);
    if (anchor) {
      const r = anchor.getBoundingClientRect();
      d.style.left = Math.min(window.innerWidth - 440, Math.max(10, r.left)) + 'px';
      d.style.top = Math.min(window.innerHeight - 200, r.bottom + 12) + 'px';
    }
    d.querySelector('.gag-close').onclick = () => d.remove();
  }

  // ---------- Projecteur (surlignage d'une zone) ----------
  function spot(sel) {
    $$('.spot').forEach(x => x.classList.remove('spot'));
    if (!sel) return;
    const t = $(sel);
    if (t) { t.classList.add('spot'); t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  // ---------- Routeur ----------
  function parse() {
    const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
    const parts = path.split('/').filter(Boolean);
    state.org = window.ORGS[parts[0]] ? parts[0] : 'wdf';
    state.page = parts[1] || 'org-overview';
    state.sub = parts.slice(2).join('/') || null;
    state.params = Object.fromEntries(new URLSearchParams(qs || ''));
    if (state.params.return) sessionStorage.setItem('sc-return', state.params.return);
  }
  function render() {
    // Lien direct vers une étape (utilisé par le deck) : #/step/<fil>/<n>?return=<slide>
    const m = location.hash.match(/^#\/step\/(\d)\/(\d+)(?:\?(.*))?$/);
    if (m) {
      const q = Object.fromEntries(new URLSearchParams(m[3] || ''));
      if (q.return) sessionStorage.setItem('sc-return', q.return);
      fil = +m[1]; gotoStep(+m[2] - 1); return;
    }
    parse();
    $$('.gag,.backdrop,.dropdown').forEach(x => x.remove());
    renderBanner(); renderNav();
    const main = $('#main');
    const scr = SCREENS[state.page] || SCREENS['org-overview'];
    main.innerHTML = '';
    main.scrollTop = 0;
    scr(main, ORG(), state);
    if (state.params.spot) setTimeout(() => spot(state.params.spot), 250);
    if (state.params.gag) setTimeout(() => gag(state.params.gag), 400);
    updatePresenterBar();
    captureHelpers();
  }

  /* ---------- Aides à la génération des captures du deck (deck/tools/captures.py) ----------
     ?cap=1           masque la barre présentateur
     ?click=a;b       clique successivement sur les sélecteurs a puis b (1100 ms d’écart)
     ?rects=x|y|z     publie les rectangles (px) de x, y, z dans <html data-rects="…">  */
  function captureHelpers() {
    const p = state.params;
    if (p.cap === '1') { const b = $('#pbar'); if (b) b.classList.add('hidden'); pbarVisible = false; }
    const clicks = (p.click || '').split(';').filter(Boolean);
    clicks.forEach((sel, i) => setTimeout(() => { const t = $(sel); if (t) t.click(); }, 500 + i * 1100));
    if (p.rects) setTimeout(() => {
      const out = {};
      p.rects.split('|').forEach(sel => {
        const t = $(sel); if (!t) { out[sel] = null; return; }
        const r = t.getBoundingClientRect();
        out[sel] = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
      });
      document.documentElement.setAttribute('data-rects', JSON.stringify(out));
    }, 900 + clicks.length * 1100);
  }
  function go(org, page, sub, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    location.hash = `#/${org || state.org}/${page}${sub ? '/' + sub : ''}${qs}`;
  }
  function switchOrg() { go(state.org === 'wdf' ? 'eng' : 'wdf', state.page); }

  // ---------- Fils rouges (étapes pilotées au clavier) ----------
  let fil = 1, stepIdx = -1;
  function steps() { return (window.STEPS || {})['fil' + fil] || []; }
  function gotoStep(i) {
    const s = steps(); if (!s.length) return;
    stepIdx = Math.max(0, Math.min(s.length - 1, i));
    const st = s[stepIdx];
    const p = Object.assign({}, st.params || {});
    if (st.spot) p.spot = st.spot;
    if (st.gag) p.gag = st.gag;
    go(st.org, st.page, st.sub, p);
    pbarVisible = true; updatePresenterBar();
  }
  // Barre présentateur : visible par défaut (P pour la masquer), entièrement cliquable
  let pbarVisible = true;
  try { const sv = JSON.parse(sessionStorage.getItem('sc-fil') || 'null'); if (sv) { fil = sv.fil; stepIdx = sv.step; } } catch (e) { }
  function updatePresenterBar() {
    const b = $('#pbar'); if (!b) return;
    try { sessionStorage.setItem('sc-fil', JSON.stringify({ fil, step: stepIdx })); } catch (e) { }
    const s = steps(), st = s[stepIdx];
    const onStep = st && st.org === state.org && st.page === state.page && (st.sub || null) === (state.sub || null);
    b.classList.toggle('hidden', !pbarVisible);
    b.innerHTML = `
      <button class="pb-fil ${fil === 1 ? 'on' : ''}" data-fil="1" title="Watt De France — le déploiement du mardi">Fil 1</button>
      <button class="pb-fil ${fil === 2 ? 'on' : ''}" data-fil="2" title="EnGénie Mutuelle — le pic de fin de mois">Fil 2</button>
      <button class="pb-btn" data-nav="-1" title="Étape précédente (←)">◀</button>
      <select class="pb-sel" title="Aller à une étape">${stepIdx < 0 ? '<option>— démarrer le fil —</option>' : ''}${s.map((x, i) => `<option value="${i}" ${i === stepIdx ? 'selected' : ''}>${i + 1}/${s.length} · ${x.title}</option>`).join('')}</select>
      <button class="pb-btn" data-nav="1" title="Étape suivante (→)">▶</button>
      ${stepIdx >= 0 && !onStep ? '<span class="pb-off" title="Vous avez quitté l\'étape : ▶ ou ◀ pour y revenir">hors parcours</span>' : ''}
      ${st && st.spot ? '<button class="pb-btn" data-act="H" title="Projecteur (H)">🔦</button>' : ''}
      ${st && st.gag ? '<button class="pb-btn" data-act="G" title="Popup décalée (G)">💬</button>' : ''}
      <button class="pb-btn" data-act="E" title="Entracte (E)">🍿</button>
      <button class="pb-btn" data-act="?" title="Aide (?)">?</button>`;
    b.querySelectorAll('[data-fil]').forEach(x => x.onclick = () => { fil = +x.dataset.fil; gotoStep(0); });
    b.querySelectorAll('[data-nav]').forEach(x => x.onclick = () => gotoStep(stepIdx < 0 ? 0 : stepIdx + +x.dataset.nav));
    b.querySelector('.pb-sel').onchange = (e) => gotoStep(+e.target.value);
    b.querySelectorAll('[data-act]').forEach(x => x.onclick = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: x.dataset.act })));
  }

  function help() {
    modal(`<div class="modal-head">Aides présentateur</div><div class="modal-body help-overlay"><table>
      <tr><td>→ / ←</td><td>Étape suivante / précédente du fil rouge courant</td></tr>
      <tr><td>1 … 9</td><td>Aller directement à l'étape N du fil courant</td></tr>
      <tr><td>F</td><td>Basculer fil 1 (Watt De France) / fil 2 (EnGénie Mutuelle)</td></tr>
      <tr><td>H</td><td>Projecteur sur la zone clé de l'étape (re-appuyer pour éteindre)</td></tr>
      <tr><td>G</td><td>Afficher la popup décalée de l'étape</td></tr>
      <tr><td>O</td><td>Changer d'org (même écran)</td></tr>
      <tr><td>E</td><td>L'entracte de 2 heures (activation de Scale Center)</td></tr>
      <tr><td>P</td><td>Afficher / masquer la barre présentateur</td></tr>
      <tr><td>B</td><td>Retour au deck (slide d'origine)</td></tr>
      <tr><td>Échap</td><td>Fermer popup / modale / projecteur</td></tr>
    </table></div>`);
  }
  function entracte() {
    const d = document.createElement('div'); d.className = 'entracte';
    let s = 2 * 3600;
    d.innerHTML = `<div style="font-size:60px">🍿</div><h2>Entracte</h2><div class="clock" id="clk">02:00:00</div>
      <p>« Performance metrics take about 2 hours to appear. »<br>Scale Center s'active. Les boissons sont au fond de la salle.<br><small>(Échap pour tricher.)</small></p>`;
    document.body.appendChild(d);
    const iv = setInterval(() => { s -= 37; if (s < 0) s = 0; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; const c = $('#clk'); if (c) c.textContent = [h, m, ss].map(n => String(n).padStart(2, '0')).join(':'); else clearInterval(iv); }, 60);
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const k = e.key;
    if (k === 'Escape') { $$('.gag,.backdrop,.entracte,.dropdown').forEach(x => x.remove()); spot(null); return; }
    if (k === 'ArrowRight') gotoStep(stepIdx + 1);
    else if (k === 'ArrowLeft') gotoStep(stepIdx - 1);
    else if (/^[1-9]$/.test(k)) gotoStep(+k - 1);
    else if (k === 'f' || k === 'F') { fil = fil === 1 ? 2 : 1; stepIdx = -1; pbarVisible = true; updatePresenterBar(); }
    else if (k === 'h' || k === 'H') { const st = steps()[stepIdx]; if ($('.spot')) spot(null); else if (st && st.spot) spot(st.spot); }
    else if (k === 'g' || k === 'G') { const st = steps()[stepIdx]; if (st && st.gag) gag(st.gag); }
    else if (k === 'o' || k === 'O') switchOrg();
    else if (k === 'e' || k === 'E') entracte();
    else if (k === 'p' || k === 'P') { pbarVisible = !pbarVisible; updatePresenterBar(); }
    else if (k === '?') help();
    else if (k === 'b' || k === 'B') { const r = sessionStorage.getItem('sc-return'); if (r) location.href = r; else history.back(); }
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', () => { shell(); if (!location.hash) location.hash = '#/wdf/org-overview'; render(); });

  window.APP = { register: (k, fn) => SCREENS[k] = fn, UI, modal, toast, gag, spot, go, state, esc };
})();

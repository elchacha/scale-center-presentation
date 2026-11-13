/* =========================================================================
   Mini-bibliothèque de graphiques SVG (aucune dépendance, hors ligne)
   - lineChart : séries temporelles, survol, sélection au glisser synchronisée
   - barGroups : barres groupées (avant / après)
   - bars      : barres simples (catégories)
   - donut     : anneau + légende chiffrée
   - hbars     : barres horizontales « Top N »
   - worldMap  : carte du monde (topojson embarqué)
   ========================================================================= */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];

  // ---------- formats « à la française » comme dans les captures ----------
  const nf = (d) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d });
  function compact(v) {
    const a = Math.abs(v);
    if (a >= 1e6) return nf(a >= 1e7 ? 0 : 1).format(v / 1e6) + 'M';
    if (a >= 1e3) return nf(a >= 1e4 ? 0 : 1).format(v / 1e3) + 'K';
    return nf(0).format(v);
  }
  const int = (v) => nf(0).format(v);
  const dec = (v, d = 2) => nf(d).format(v);
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (t) => { const d = new Date(t); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLbl = (t) => { const d = new Date(t); return MONTHS[d.getUTCMonth()] + ' ' + pad(d.getUTCDate()); };
  const shortDT = (t) => { const d = new Date(t); return (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + '/' + String(d.getUTCFullYear()).slice(2) + ', ' + hhmm(t); };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function legendHTML(items, withValues) {
    return '<ul class="legend-list">' + items.map(i =>
      `<li><i style="background:${i.color}"></i><span>${i.label}</span>${withValues ? `<span class="lv">${i.valueTxt}</span>` : ''}</li>`).join('') + '</ul>';
  }

  // ---------- Groupes de sélection synchronisée ----------
  const groups = {};
  function groupOf(name) { return groups[name] || (groups[name] = { charts: [], range: null }); }

  /**
   * lineChart(container, opts)
   *  opts.x        : tableau de timestamps (ms, UTC)
   *  opts.series   : [{ name, color?, values[], dashed? }]
   *  opts.height   : hauteur du tracé (px)
   *  opts.yLabel / opts.xLabel
   *  opts.group    : nom du groupe de sélection synchronisée (optionnel)
   *  opts.onAnalyze: (type, [t0,t1]) => void — active la sélection au glisser
   *  opts.markers  : [{ x, label, color }] (lignes verticales, ex. déploiements)
   *  opts.band     : [t0, t1] zone grisée fixe (fenêtre analysée)
   *  opts.limit    : valeur d'une ligne de limite (rouge)
   *  opts.ticks    : 'hours' | 'days' | 'minutes'
   */
  function lineChart(container, o) {
    container.classList.add('chart');
    const wrap = document.createElement('div');
    wrap.className = 'chart-wrap';
    container.appendChild(wrap);
    const plot = document.createElement('div');
    plot.style.position = 'relative';
    wrap.appendChild(plot);
    const leg = document.createElement('div');
    leg.innerHTML = legendHTML(o.series.map((s, i) => ({ label: s.name, color: s.color || PALETTE[i % 10] })));
    wrap.appendChild(leg);

    // largeur réelle en px → le texte des axes n'est jamais déformé
    const W = Math.max(320, Math.round(plot.getBoundingClientRect().width) || 900), H = o.height || 240, M = { l: 56, r: 12, t: 22, b: 40 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H + M.t + M.b}` }, plot);
    svg.style.height = (H + M.t + M.b) + 'px';
    const x0 = o.x[0], x1 = o.x[o.x.length - 1];
    let ymax = o.yMax || niceMax(Math.max(o.limit || 0, ...o.series.flatMap(s => s.values.filter(v => v != null))) * 1.08);
    const X = (t) => M.l + (t - x0) / (x1 - x0) * (W - M.l - M.r);
    const Y = (v) => M.t + H - v / ymax * H;

    // grille + axe Y
    const g = el('g', { class: 'grid' }, svg), ax = el('g', { class: 'axis' }, svg);
    for (let i = 0; i <= 4; i++) {
      const v = ymax * i / 4, y = Y(v);
      el('line', { x1: M.l, x2: W - M.r, y1: y, y2: y }, g);
      el('text', { x: M.l - 8, y: y + 4, 'text-anchor': 'end' }, ax).textContent = compact(v);
    }
    if (o.yLabel) { const t = el('text', { x: 14, y: M.t + H / 2, transform: `rotate(-90 14 ${M.t + H / 2})`, 'text-anchor': 'middle' }, ax); t.textContent = o.yLabel; }
    // axe X
    // pas des graduations choisi pour garder ≥ 58 px entre deux étiquettes
    const span = x1 - x0, plotW = W - M.l - M.r;
    const steps = [60e3, 2 * 60e3, 5 * 60e3, 10 * 60e3, 30 * 60e3, 36e5, 2 * 36e5, 3 * 36e5, 6 * 36e5, 12 * 36e5, 24 * 36e5];
    const step = steps.find(s => plotW / (span / s) >= 58) || 24 * 36e5;
    for (let t = Math.ceil(x0 / step) * step; t <= x1; t += step) {
      const d = new Date(t);
      const lbl = (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) ? dayLbl(t) : hhmm(t);
      el('text', { x: X(t), y: M.t + H + 18, 'text-anchor': 'middle' }, ax).textContent = lbl;
    }
    el('text', { x: (M.l + W - M.r) / 2, y: M.t + H + 36, 'text-anchor': 'middle' }, ax).textContent = o.xLabel || 'Time (UTC)';

    if (o.band) el('rect', { x: X(o.band[0]), y: M.t, width: Math.max(2, X(o.band[1]) - X(o.band[0])), height: H, fill: 'rgba(0,0,0,.07)' }, svg);
    if (o.limit) el('line', { x1: M.l, x2: W - M.r, y1: Y(o.limit), y2: Y(o.limit), stroke: '#e15759', 'stroke-width': 2 }, svg);

    // séries
    o.series.forEach((s, i) => {
      const c = s.color || PALETTE[i % 10];
      let d = '', pen = false;
      s.values.forEach((v, j) => {
        if (v == null) { pen = false; return; }
        d += (pen ? 'L' : 'M') + X(o.x[j]).toFixed(1) + ' ' + Y(v).toFixed(1);
        pen = true;
      });
      el('path', { d, fill: 'none', stroke: c, 'stroke-width': s.width || 2, 'stroke-dasharray': s.dashed ? '4 3' : '', 'vector-effect': 'non-scaling-stroke' }, svg);
    });
    let lastMx = -1e9, stagger = 0;
    (o.markers || []).forEach(m => {
      const mg = el('g', { class: 'marker', 'data-label': m.label }, svg);   // ciblable (captures : g.marker[data-label=…])
      el('line', { x1: X(m.x), x2: X(m.x), y1: M.t, y2: M.t + H, stroke: m.color || '#f28e2b', 'stroke-width': 2 }, mg);
      stagger = X(m.x) - lastMx < 130 ? (stagger ? 0 : 12) : 0; lastMx = X(m.x);   // étiquettes proches : décalées
      const tx = el('text', { x: X(m.x), y: M.t - 6 - stagger, 'text-anchor': 'middle', fill: m.color || '#f28e2b', 'font-size': 11, 'font-weight': 700 }, mg);
      tx.textContent = m.label;
    });

    // survol
    const tip = document.createElement('div'); tip.className = 'chart-tip'; tip.style.display = 'none'; plot.appendChild(tip);
    const cursor = el('line', { y1: M.t, y2: M.t + H, stroke: '#bbb', 'stroke-width': 1, visibility: 'hidden' }, svg);
    const toT = (clientX) => { const r = svg.getBoundingClientRect(); return x0 + ((clientX - r.left) / r.width * W - M.l) / (W - M.l - M.r) * (x1 - x0); };
    const idxOf = (tt) => { let b = 0; for (let i = 0; i < o.x.length; i++) if (Math.abs(o.x[i] - tt) < Math.abs(o.x[b] - tt)) b = i; return b; };
    const stepMs = o.x[1] - o.x[0];

    // sélection
    const grp = o.group ? groupOf(o.group) : { charts: [], range: null };
    const band = el('rect', { class: 'sel-band', y: M.t, height: H, visibility: 'hidden' }, svg);
    const btn = document.createElement('div'); btn.className = 'sel-menu-btn'; btn.textContent = '▾'; btn.style.display = 'none'; plot.appendChild(btn);
    grp.charts = grp.charts.filter(c => c.alive());            // oublie les graphiques d'un rendu précédent
    const me = {
      alive: () => document.body.contains(svg),
      draw(range) {
        if (!range) { band.setAttribute('visibility', 'hidden'); btn.style.display = 'none'; return; }
        const a = X(range[0]), b = X(range[1]);
        band.setAttribute('x', Math.min(a, b)); band.setAttribute('width', Math.max(3, Math.abs(b - a))); band.setAttribute('visibility', 'visible');
        if (o.onAnalyze) {
          const r = svg.getBoundingClientRect();
          btn.style.left = (Math.min(a, b) / W * r.width + 2) + 'px'; btn.style.top = (M.t / (H + M.t + M.b) * r.height + 2) + 'px';
          btn.style.display = 'flex';
        }
      }
    };
    grp.charts.push(me);
    if (grp.range) me.draw(grp.range);

    let dragStart = null;
    svg.addEventListener('mousedown', (e) => { if (!o.onAnalyze) return; dragStart = toT(e.clientX); e.preventDefault(); });
    window.addEventListener('mouseup', () => { dragStart = null; });
    svg.addEventListener('mousemove', (e) => {
      const tt = toT(e.clientX);
      if (tt < x0 || tt > x1) { tip.style.display = 'none'; cursor.setAttribute('visibility', 'hidden'); return; }
      if (dragStart != null) {
        const r = [Math.min(dragStart, tt), Math.max(dragStart, tt)];
        r[0] = Math.floor(r[0] / stepMs) * stepMs; r[1] = Math.ceil(r[1] / stepMs) * stepMs;
        grp.range = r; grp.charts.forEach(c => c.draw(r)); return;
      }
      const i = idxOf(tt);
      cursor.setAttribute('x1', X(o.x[i])); cursor.setAttribute('x2', X(o.x[i])); cursor.setAttribute('visibility', 'visible');
      const rows = o.series.map((s, j) => ({ v: s.values[i], c: s.color || PALETTE[j % 10] })).filter(r => r.v != null).sort((a, b) => b.v - a.v).slice(0, 9);
      tip.innerHTML = `<div class="t">${hhmm(o.x[i])} - ${hhmm(o.x[i] + stepMs)}</div>` + rows.map(r => `<div><i style="background:${r.c}"></i>${o.fmt ? o.fmt(r.v) : dec(r.v, 2)}</div>`).join('');
      const r = svg.getBoundingClientRect();
      const px = X(o.x[i]) / W * r.width;
      tip.style.left = (px > r.width - 160 ? px - 150 : px + 12) + 'px'; tip.style.top = '10px'; tip.style.display = 'block';
    });
    svg.addEventListener('mouseleave', () => { tip.style.display = 'none'; cursor.setAttribute('visibility', 'hidden'); });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!o.onAnalyze || !grp.range) return;
      const types = window.SC_ANALYSIS_TYPES || [];
      const dd = document.createElement('div'); dd.className = 'dropdown';
      dd.innerHTML = '<div class="dd-title">Start Analysis:</div>' + types.map(t => `<div class="dd-item" data-t="${t.key}" title="${t.tip || ''}"><span class="di">${t.icon}</span>${t.label}</div>`).join('') + '<div class="dd-item" data-t="cancel"><span class="di">✕</span>Cancel</div>';
      dd.style.left = btn.style.left; dd.style.top = (parseFloat(btn.style.top) + 22) + 'px';
      plot.appendChild(dd);
      const close = () => dd.remove();
      dd.addEventListener('click', (ev) => {
        const it = ev.target.closest('.dd-item'); if (!it) return;
        close();
        if (it.dataset.t !== 'cancel') o.onAnalyze(it.dataset.t, grp.range.slice());
      });
      setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
    });
    return { select(r) { grp.range = r; grp.charts.filter(c => c.alive()).forEach(c => c.draw(r)); } };
  }

  /** barGroups : catégories × séries (ex. Before gris / After vert-rouge) */
  function barGroups(container, o) {
    container.classList.add('chart');
    const W = Math.max(320, Math.round(container.getBoundingClientRect().width) || 600), H = o.height || 200, M = { l: 54, r: 10, t: 14, b: 46 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H + M.t + M.b}` }, container);
    const ymax = niceMax(Math.max(...o.series.flatMap(s => s.values)) * 1.1);
    const Y = (v) => M.t + H - v / ymax * H;
    const g = el('g', { class: 'grid' }, svg), ax = el('g', { class: 'axis' }, svg);
    for (let i = 0; i <= 4; i++) { const v = ymax * i / 4; el('line', { x1: M.l, x2: W - M.r, y1: Y(v), y2: Y(v) }, g); el('text', { x: M.l - 6, y: Y(v) + 4, 'text-anchor': 'end' }, ax).textContent = compact(v); }
    const cw = (W - M.l - M.r) / o.categories.length, bw = Math.min(46, cw / (o.series.length + 1.2));
    o.categories.forEach((c, i) => {
      const cx = M.l + cw * i + cw / 2;
      o.series.forEach((s, j) => {
        const v = s.values[i], x = cx - (o.series.length * bw) / 2 + j * bw + 2;
        const col = typeof s.color === 'function' ? s.color(i, v) : s.color;
        const r = el('rect', { x, y: Y(v), width: bw - 4, height: M.t + H - Y(v), fill: col }, svg);
        el('title', {}, r).textContent = `${s.name} — ${c} : ${o.fmt ? o.fmt(v) : int(v)}`;
      });
      const lines = String(c).split('\n');
      lines.forEach((ln, k) => { el('text', { x: cx, y: M.t + H + 16 + k * 13, 'text-anchor': 'middle' }, ax).textContent = ln; });
    });
    if (o.xLabel) el('text', { x: (M.l + W) / 2, y: H + M.t + M.b - 2, 'text-anchor': 'middle' }, ax).textContent = o.xLabel;
    if (o.yLabel) el('text', { x: 12, y: M.t + H / 2, transform: `rotate(-90 12 ${M.t + H / 2})`, 'text-anchor': 'middle' }, ax).textContent = o.yLabel;
  }

  /** donut : anneau + légende chiffrée */
  function donut(container, o) {
    container.classList.add('chart');
    container.style.display = 'flex'; container.style.alignItems = 'center'; container.style.gap = '18px'; container.style.flexWrap = 'wrap';
    const S = o.size || 200, R = S / 2, r = R * 0.47;
    const svg = el('svg', { viewBox: `0 0 ${S} ${S}`, width: S, height: S }, container);
    svg.style.width = S + 'px'; svg.style.flex = 'none';
    const total = o.items.reduce((a, b) => a + b.value, 0) || 1;
    let a0 = -Math.PI / 2;
    o.items.forEach((it, i) => {
      const a1 = a0 + it.value / total * Math.PI * 2;
      const big = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a, rr) => [R + rr * Math.cos(a), R + rr * Math.sin(a)];
      const [xa, ya] = p(a0, R), [xb, yb] = p(a1, R), [xc, yc] = p(a1, r), [xd, yd] = p(a0, r);
      const d = it.value / total > 0.9999
        ? `M${R} 0 A${R} ${R} 0 1 1 ${R - 0.01} 0 Z M${R} ${R - r} A${r} ${r} 0 1 0 ${R + 0.01} ${R - r} Z`
        : `M${xa} ${ya} A${R} ${R} 0 ${big} 1 ${xb} ${yb} L${xc} ${yc} A${r} ${r} 0 ${big} 0 ${xd} ${yd} Z`;
      const path = el('path', { d, fill: it.color || PALETTE[i % 10], 'fill-rule': 'evenodd', stroke: '#fff', 'stroke-width': 1 }, svg);
      el('title', {}, path).textContent = it.label;
      a0 = a1;
    });
    const leg = document.createElement('div');
    leg.innerHTML = legendHTML(o.items.map((it, i) => ({
      label: it.label, color: it.color || PALETTE[i % 10],
      valueTxt: (o.fmt ? o.fmt(it.value) : int(it.value)) + '&nbsp;&nbsp;' + dec(it.value / total * 100, 1) + '%'
    })), true);
    leg.style.minWidth = '260px';
    container.appendChild(leg);
  }

  /** bars : barres verticales simples (ex. EPT par navigateur) */
  function bars(container, o) {
    barGroups(container, { categories: o.categories, series: [{ name: o.name || '', values: o.values, color: o.color || '#4e79a7' }], height: o.height, yLabel: o.yLabel, xLabel: o.xLabel, fmt: o.fmt });
  }

  /** hbars : « Top N » horizontaux */
  function hbars(container, items, opts) {
    const max = Math.max(...items.map(i => i.value)) || 1;
    container.innerHTML = items.map(i => `<div class="hbar-row"><div class="hl1"><span>${i.label}</span><span>${(opts && opts.fmt) ? opts.fmt(i.value) : int(i.value)}</span></div><div class="bar ${opts && opts.teal ? 'teal' : ''}" style="width:${Math.max(3, i.value / max * 82)}%"></div></div>`).join('');
  }

  /** worldMap : carte (projection équirectangulaire), valeurs par nom de pays */
  function worldMap(container, o) {
    container.classList.add('map-wrap');
    const W = 900, H = 450;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    svg.style.width = '100%';
    const topo = window.WORLD_110M;
    const fc = window.topojson.feature(topo, topo.objects.countries);
    const P = ([lon, lat]) => [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
    // un saut de longitude > 180° (antiméridien : Russie, Fidji…) coupe le tracé au lieu de traverser la carte
    const ring = (r) => r.map((c, i) => ((i && Math.abs(c[0] - r[i - 1][0]) < 180) ? 'L' : 'M') + P(c).map(n => n.toFixed(1)).join(' ')).join('') + 'Z';
    const vals = Object.values(o.values);
    const vmin = Math.min(...vals), vmax = Math.max(...vals);
    const mix = (a, b, t) => [0, 2, 4].map(k => Math.round(parseInt(a.substr(k, 2), 16) * (1 - t) + parseInt(b.substr(k, 2), 16) * t).toString(16).padStart(2, '0')).join('');
    const [ca, cb] = o.scale === 'usage' ? ['d8e6fe', '0b5cab'] : ['4bca81', 'c23934'];
    const tip = document.createElement('div'); tip.className = 'chart-tip'; tip.style.display = 'none'; container.style.position = 'relative'; container.appendChild(tip);
    fc.features.forEach(f => {
      if (f.properties.name === 'Antarctica') return;
      const g = f.geometry; if (!g) return;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      const d = polys.map(p => p.map(ring).join('')).join('');
      const v = o.values[f.properties.name];
      const fill = v == null ? '#b5b5b5' : '#' + mix(ca, cb, vmax === vmin ? 1 : (v - vmin) / (vmax - vmin));
      const path = el('path', { d, fill }, svg);
      if (v != null) {
        path.addEventListener('mousemove', (e) => {
          const r = container.getBoundingClientRect();
          tip.innerHTML = o.tip ? o.tip(f.properties.name, v) : `<b>${f.properties.name}</b><br>${o.fmt ? o.fmt(v) : int(v)}`;
          tip.style.left = (e.clientX - r.left + 12) + 'px'; tip.style.top = (e.clientY - r.top + 12) + 'px'; tip.style.display = 'block';
        });
        path.addEventListener('mouseleave', () => tip.style.display = 'none');
      }
    });
    const lg = document.createElement('div'); lg.className = 'map-legend';
    lg.innerHTML = o.scale === 'usage' ? '<span>Lowest Page View Count</span><span class="grad blue"></span><span>Highest Page View Count</span>' : '<span>Fastest EPT</span><span class="grad"></span><span>Slowest EPT</span>';
    container.appendChild(lg);
  }

  // ---------- Générateur pseudo-aléatoire déterministe (mêmes courbes à chaque démo) ----------
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  window.SC = Object.assign(window.SC || {}, { lineChart, barGroups, bars, donut, hbars, worldMap, fmt: { compact, int, dec, hhmm, dayLbl, shortDT }, rng, PALETTE });
})();

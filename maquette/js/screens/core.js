/* =========================================================================
   Écrans « socle » : Alerts (+ activation), Org Overview, Org Performance,
   Performance Analysis (liste, création, rapport Consolidated à onglets)
   ========================================================================= */
(function () {
  const { register, UI, modal, toast, gag, go, esc } = window.APP;
  const F = SC.fmt;
  const D = (s) => Date.parse(s);

  // ======================================================== ALERTS (+ activation)
  register('alerts', (main, org, st) => {
    if (st.params.setup === '1') return activation(main, org);
    const a = org.alerts, tab = st.params.tab || 'settings';
    main.innerHTML = UI.pageHeader('Alerts', '☰') + `<div class="card">
      <div class="card-head"><h2 class="card-title">Alerts</h2>${UI.feedback}</div>
      ${UI.tabs([{ key: 'settings', label: 'Settings' }, { key: 'history', label: 'Alerts History' }], tab)}
      <div id="alertBody"></div></div>`;
    const body = main.querySelector('#alertBody');
    if (tab === 'settings') {
      body.innerHTML = `<div class="card-head"><h3 style="font-weight:400;font-size:18px;margin:4px 0">Alerts Saved</h3><button class="btn">⟳</button></div>
        <div class="row" style="justify-content:space-between;margin-bottom:8px"><span>We'll email you when an alert reaches its threshold.</span><a>See Change History</a></div>
        ${UI.table([{ label: 'Alert Name', key: 0 }, { label: 'Alert Description', key: 1 }], a.settings)}
        <div class="field" style="margin:12px 0"><label><b>Recipient Email Address</b></label><input class="text" value="${a.email}" disabled style="background:#f3f3f3"></div>
        <button class="btn brand">Edit</button>`;
    } else {
      body.innerHTML = `<h3 style="font-weight:400;font-size:17px">Active Alerts (${a.active.length})</h3>
        ${a.active.length ? `<div id="activeAlert">${UI.table([{ label: 'Alert Name', key: 0 }, { label: 'Triggered', key: 1 }, { label: 'Value', key: 2, cls: 'bad' }], a.active)}</div>` : UI.info('No active alerts', '').replace('info-bar', 'info-bar" style="background:#eef4ff')}
        <h3 style="font-weight:400;font-size:17px">Cleared Alerts (${a.cleared.length})</h3>
        ${a.cleared.length ? UI.table([{ label: 'Alert Name', key: 0 }, { label: 'Triggered', key: 1 }, { label: 'Cleared', key: 2 }, { label: 'Value', key: 3 }], a.cleared) : UI.info('No cleared alerts')}`;
    }
    main.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => go(org.key, 'alerts', null, { tab: t.dataset.tab }));
  });

  function activation(main, org) {
    main.innerHTML = UI.pageHeader('Alerts', '☰') + `<div class="card" style="min-height:420px">
      <div class="empty-state">${cactus()}
        <p style="margin:18px 0 26px">To enable Scale Center for your org, turn on Enable Scale Center. Performance metrics take about 2 hours to appear.</p>
        <span class="check" id="enableSc">Enable Scale Center <button class="toggle" id="tgl" aria-label="Enable Scale Center"></button></span>
      </div></div>`;
    main.querySelector('#tgl').onclick = () => {
      const m = modal(`<div class="modal-head">Scale Center Agreement</div><div class="modal-body">Scale Center operates, in part, on separate infrastructure that (i) may have different privacy and security protections than your other services; (ii) may be hosted in different physical locations than your other services; and (iii) are further described in the <a>Salesforce Trust and Compliance Documentation</a>.</div><div class="modal-foot"><button class="btn brand" id="agree">I agree</button></div>`);
      m.el.querySelector('#agree').onclick = () => {
        m.close();
        main.querySelector('#tgl').classList.add('on');
        toast('Scale Center enabled', '<div>Performance metrics take about 2 hours to appear.</div>');
        setTimeout(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'E' })), 1600);
      };
    };
  }
  function cactus() {
    return `<svg width="300" height="130" viewBox="0 0 300 130" aria-hidden="true"><g fill="none" stroke="#7fb2e5" stroke-width="3" stroke-linecap="round">
      <circle cx="210" cy="38" r="20" fill="#c9e1fb"/><circle cx="210" cy="38" r="28" stroke-width="2"/>
      <path d="M90 120V58q0-10 10-10t10 10v62M90 80H76q-6 0-6-6V62M110 88h12q6 0 6-6V70" stroke="#4a90d9" stroke-width="7"/>
      <path d="M20 121h260M170 121l22-22 14 14 10-8 18 16M236 92v20M236 100h6M240 84v10"/><path d="M128 56h40M150 64h34M40 64h26" stroke-dasharray="6 6"/></g></svg>`;
  }
  window.APP.cactus = cactus;

  // ======================================================== ORG OVERVIEW
  // Comportement réel (captures v2) : « Analyze Org Health » génère en ~1 min le Top 3 en bas de page ;
  // « View Details » ouvre les onglets Apex / SOQL / Errors (« Summary of Peak Hour Last Week »).
  // ?analyzed=1 : Top 3 déjà généré (captures, étapes) · ?tab=apex|soql|errors
  const ovKey = (org) => 'sc-ov-analyzed-' + org.key;
  register('org-overview', (main, org, st) => {
    const o = org.overview, tab = st.params.tab || 'overview';
    let analyzed = st.params.analyzed === '1';
    try { analyzed = analyzed || sessionStorage.getItem(ovKey(org)) === '1'; } catch (e) { }
    const peakTitle = `<h2 style="font-size:20px;margin:6px 0 4px">Summary of Peak Hour Last Week - ${o.period.replace('–', '-')}</h2>`;
    main.innerHTML = UI.pageHeader('Org Overview', '⌂') + `<div class="card">
      <div class="card-head" style="margin-bottom:-6px">${UI.tabs([{ key: 'overview', label: 'Overview' }, { key: 'apex', label: 'Apex' }, { key: 'soql', label: 'SOQL' }, { key: 'errors', label: 'Errors' }], tab, 'id="ovTabs" style="flex:1;margin:0 0 10px"')}${UI.feedback}</div>
      <div id="ovBody"></div></div>`;
    main.querySelectorAll('#ovTabs [data-tab]').forEach(t => t.onclick = () => go(org.key, 'org-overview', null, { tab: t.dataset.tab }));
    const body = main.querySelector('#ovBody'), d = o.details;

    if (tab === 'overview') {
      body.innerHTML = `
      <div id="ovPeak">
        <div class="card-head"><h2 class="card-title">Summary of Peak Hour Last Week</h2><button class="btn brand" id="analyzeBtn">${analyzed ? '⟳ Analyze Org Health' : 'Analyze Org Health'}</button></div>
        <div class="split">
          <div class="kt">
            <h4>Request Volume Takeaways</h4>
            <ul><li>Peak resource consumption detected on <b>${o.period}</b>.</li><li>Maximum throughput: <b>${o.rps} rps</b> (Requests Per Second).</li></ul>
            <h4>Errors</h4>
            <ul id="ovError"><li><b class="bad">${o.error.count} ${o.error.type}</b> between ${o.error.period}.</li><li><b class="bad">${F.int(o.error.pct)}% above average</b>.</li></ul>
          </div>
          <div><div class="chart-title">Trend of Requests Generated by the Application</div><div id="ovTrend"></div></div>
        </div>
      </div>
      <div id="ovTop3Box" style="margin-top:14px"></div>`;
      const tr = o.trend, x = tr.x;
      const v = SCDATA.series(x, tr.seed, t => tr.peak * SCDATA.workday(t, { weekend: 0.12 }), { noise: 0.07 });
      SC.lineChart(body.querySelector('#ovTrend'), { x, series: [{ name: 'Requests', values: v, color: '#0176d3' }], height: 170, ticks: 'days', markers: [{ x: tr.peakAt, label: 'Peak Resource Usage Hour', color: '#c23934' }], yLabel: 'Requests' });
      const box = body.querySelector('#ovTop3Box');
      const tabFor = ['apex', 'soql', 'errors'];
      const drawTop3 = () => {
        box.innerHTML = `<div id="ovTop3" style="border:1px solid var(--border);border-radius:6px;padding:12px 14px">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><span style="font-size:20px">🔔</span><b>Top 3 Critical Observations for Scale and Performance</b><span class="spacer"></span><span class="btn" style="height:26px;padding:0 6px">⌄</span></div>
          <div class="split-3">${o.top3.map((t, i) => `<div class="ov-card" style="background:#eaf5fe;border:1px solid #1b96ff;border-radius:26px;padding:18px 20px;display:flex;flex-direction:column">
            <span style="width:48px;height:48px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px">${i + 1}</span>
            <div style="color:var(--blue);font-size:17px;font-weight:700;margin:14px 0 12px">${t.title}</div>
            <div style="font-weight:700;margin-bottom:12px">Impact: ${t.impact}</div>
            <div style="font-weight:700">What's the issue?</div><div>${t.issue}</div>
            <ul style="margin:8px 0 12px;padding-left:22px">${t.items.map(x => `<li>${x}</li>`).join('')}</ul>
            <div style="font-weight:700">How to Fix?</div><div style="flex:1">${t.fix}</div>
            <div style="text-align:center;margin-top:14px"><button class="btn brand" data-details="${tabFor[i]}">View Details</button></div></div>`).join('')}</div></div>`;
        box.querySelectorAll('[data-details]').forEach(b => b.onclick = () => go(org.key, 'org-overview', null, { tab: b.dataset.details }));
      };
      if (analyzed) drawTop3();
      body.querySelector('#analyzeBtn').onclick = (e) => {
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = '⏳ Analyzing… (about 1 min)';
        box.innerHTML = `<div class="empty-state" id="ovAnalyzing" style="border:1px dashed var(--border-strong);border-radius:6px;padding:26px">⏳ Analyzing your org health… This takes about a minute.</div>`;
        setTimeout(() => { try { sessionStorage.setItem(ovKey(org), '1'); } catch (er) { } btn.disabled = false; btn.textContent = '⟳ Analyze Org Health'; drawTop3(); }, 4000);
      };
      return;
    }
    const sevCrit = 'Critical issues have the highest priority. Issues with high average Run Time, count, and other factors result in software failure.';
    if (tab === 'apex') {
      body.innerHTML = peakTitle + `<div style="font-weight:700;margin:6px 0 10px">Top Slow Classes</div>${UI.sevCards(d.apex.counts, 'critical')}
        <ul style="margin:0 0 14px;padding-left:20px"><li>${sevCrit}</li><li>Below are the most dominating Apex entry points. Reducing their runtime would increase efficiency and overall user experience.</li><li>Create an <a href="#/${org.key}/performance-analysis">Apex Investigation</a> to dive into more details.</li></ul>
        <div id="ovApexTable">${UI.table(['Component', 'Entry Point ⌄', 'Total Number of Executions ⌄', 'Avg Run Time per Execution (ms) ⌄', 'Number of Executions over 5s ⌄', 'Avg App CPU Time per Execution (ms) ⌄', 'Avg DB Time per Execution (ms) ⌄', 'Avg Apex Execution Time per Execution (ms) ⌄', 'Avg Workflow Execution Time per Execution (ms) ⌄', 'Max Number of Queries per Execution ⌄'].map((l, i) => ({ label: l, num: i > 1, get: r => i < 2 ? r[i] : F.dec(r[i], i === 2 || i === 4 || i === 9 ? 1 : 2) })), d.apex.rows)}</div>`;
    } else if (tab === 'soql') {
      body.innerHTML = peakTitle + `<div style="font-weight:700;margin:6px 0 6px">Top 5 Expensive SOQLs</div><ul style="margin:0 0 12px;padding-left:20px"><li>Fix these top 5 SOQLs to improve the efficiency and scale of concurrent transactions.</li></ul>
        <div id="ovSoqlTable">${UI.table(['Component', 'Class or Package Name ⌄', 'Method ⌄', 'Line Number ⌄', '% of total Query Runtime ⌄', '% of Query over 5s ⌄', 'Total Number of Queries ⌄', 'Avg Runtime per Query (ms) ⌄', 'Max number of Records Returned per Query ⌄'].map((l, i) => ({ label: l, num: i > 2, get: r => { const v = r[i]; if (i < 3) return v; if (v == null) return ''; return i === 3 ? F.int(v) : F.dec(v, i === 4 || i === 5 ? 2 : 1); } })), d.soql)}</div>`;
    } else {
      body.innerHTML = peakTitle + `<div style="font-weight:700;margin:6px 0 6px">Top 5 Apex Errors</div><ul style="margin:0 0 12px;padding-left:20px"><li>Fix run time errors for these locations to increase application efficiency and improve the user experience.</li></ul>
        <div id="ovErrTable">${UI.table([{ label: 'Error Location ↑', key: 0 }, { label: 'Count', get: r => F.dec(r[1], 1) }, { label: 'Error Description', key: 2 }], d.errors.slice().sort((a, b) => a[0].localeCompare(b[0])))}</div>`;
    }
  });

  // ======================================================== ORG PERFORMANCE
  register('org-performance', (main, org, st) => {
    const p = org.orgPerf;
    const empty = st.params.empty === '1';
    main.innerHTML = UI.pageHeader('Org Performance', '⌂') + `<div class="card">
      <div class="card-head"><h2 class="card-title" style="font-size:14px">Performance Metrics</h2>${UI.feedback}</div>
      ${UI.info('See a snapshot of your org\'s performance metrics over a defined time range or compare two time ranges. Time ranges longer than 12 hours can take up to several minutes to load.<br>Click and drag on any chart to select a time range and launch an analysis.')}
      <div class="row" style="margin-bottom:14px">
        <div class="field"><label>Base Time Range</label><select class="select" style="min-width:360px"><option>${p.range}</option><option>Last: 4h</option><option>Last: 12h</option><option>Last: 24h</option><option>Custom</option></select></div>
        <label class="check" style="height:32px"><input type="checkbox"> Compare</label>
        <button class="btn brand" id="submitBtn">Submit</button>
      </div>
      <div id="opBody"></div></div>`;
    const body = main.querySelector('#opBody');
    const draw = () => {
      body.innerHTML = `<div class="tiles" id="opTiles">${p.tiles.map(t => `<div class="tile ${/Row Lock|Concurrent Apex/.test(t[0]) && parseInt(t[1]) > 30 ? 'red' : ''}"><div class="lbl">${t[0]} ⓘ</div><div class="val">${t[1]}</div></div>`).join('')}</div>` +
        p.charts.map((c, i) => `<div class="op-chart" id="opc${i}" style="border-top:1px solid var(--border);padding-top:8px;margin-top:6px">
          <div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="chart-title">⌄ ${c.title} ⓘ</div><div class="chart-sub">${c.sub}</div></div><div class="chart-hint">Click and drag on any chart to select a time range and launch an analysis</div></div>
          <div class="cbox"></div></div>`).join('');
      let first = null;
      p.charts.forEach((c, i) => {
        const h = SC.lineChart(body.querySelector(`#opc${i} .cbox`), {
          x: p.x, height: 200, group: 'op-' + org.key, yLabel: c.yLabel,
          series: c.series.map(s => ({ name: s[0], values: s[1], dashed: !!s[2] })),
          onAnalyze: (type, range) => launchFromSelection(org, type, range)
        });
        if (!first) first = h;
      });
      // ?select=1 : la sélection du pic est pré-dessinée (filet de sécurité si le glisser rate en live)
      if (st.params.select === '1' && p.suggest) first.select(p.suggest); else first.select(null);
    };
    if (empty) {
      body.innerHTML = `<div class="empty-state">${cactus()}<h3>Submit a Query</h3><p>Enter a time range in order to view and analyze org performance details and metrics.</p></div>`;
      main.querySelector('#submitBtn').onclick = draw;
    } else { draw(); main.querySelector('#submitBtn').onclick = draw; }
  });

  // ---------- lancement d'une analyse (pont Org Performance → Performance Analysis)
  function launched() { try { return JSON.parse(sessionStorage.getItem('sc-launched') || '[]'); } catch (e) { return []; } }
  function saveLaunched(l) { try { sessionStorage.setItem('sc-launched', JSON.stringify(l)); } catch (e) { } }
  function typeLabel(k) { return (window.SC_ANALYSIS_TYPES.find(t => t.key === k) || {}).label || k; }
  function launchFromSelection(org, type, range) {
    if (type === 'consolidated' && range[1] - range[0] > 30 * 60e3) range = [range[0], range[0] + 30 * 60e3];
    const m = modal(`<div class="modal-head">Name Your Report<small>Naming this report is optional.<br>The default name is the date and time of the analysis.</small></div>
      <div class="modal-body" style="padding:26px 60px"><div style="margin-bottom:16px"><b>Analysis Type</b><div>${typeLabel(type)}</div></div>
      <div class="field"><label>Enter the report name</label><input class="text" id="rname" placeholder="${F.shortDT(range[0])}"><div class="muted" style="font-size:12px;margin-top:4px">Example: June 7 Sale Surge</div></div></div>
      <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn brand" id="startBtn">Start Report Analysis</button></div>`);
    m.el.querySelector('#rname').focus();
    m.el.querySelector('#startBtn').onclick = () => {
      const name = m.el.querySelector('#rname').value || F.shortDT(range[0]);
      startAnalysis(org, type, range, name);
      m.close();
    };
  }
  function startAnalysis(org, type, range, name) {
    const l = launched();
    const id = 'run-' + Date.now();
    l.unshift({ id, org: org.key, template: org.analysis.reports[0], name, type, start: range[0], end: range[1], created: Date.now() });
    saveLaunched(l);
    go(org.key, 'performance-analysis');
    setTimeout(() => toast('Analysis Started', '<div>See the <a>Performance Analysis</a> tab to check progress.</div>'), 150);
  }
  function allReports(org) {
    const own = org.analysis.reports.map(id => Object.assign({ id }, window.SC_REPORTS[id]));
    const runs = launched().filter(r => r.org === org.key).map(r => Object.assign({}, r, {
      type: typeLabel(r.type), requestor: 'Démo Présentateur', requestDate: new Date(r.created).toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: Date.now() - r.created > 7000 ? 'Completed' : 'In Progress', tab: { consolidated: null, rowlock: 'rowlock', apex: 'apex', concurrency: 'concurrency', database: 'database', flow: 'flow', governor: 'governor', listviews: 'listviews', integrations: 'integrations', platformevents: 'platformevents' }[r.type]
    }));
    return runs.concat(own);
  }
  function resolveReport(org, id) {
    const r = allReports(org).find(x => x.id === id);
    if (!r) return null;
    const base = window.SC_REPORTS[r.template || id] || {};
    const tpl = base.template ? window.SC_REPORTS[base.template] : base;
    return Object.assign({}, tpl, base, r);
  }

  // ======================================================== PERFORMANCE ANALYSIS
  register('performance-analysis', (main, org, st) => {
    if (st.sub) return reportView(main, org, st);
    const list = allReports(org);
    main.innerHTML = UI.pageHeader('Performance Analysis', '⌂') + `<div class="card">
      <h2 class="card-title" style="font-size:14px">Analysis Reports</h2>
      ${UI.info('Start a new analysis report, see report status, and view the last 100 reports for your org. Reports expire after 30 days.')}
      <div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn" id="newAn">New Analysis</button><button class="btn" id="rf">⟳</button></div>
      ${UI.table([
        { label: '', get: (r) => `<a href="#/${org.key}/performance-analysis/${r.id}" title="Open">↗</a>` },
        { label: 'Analysis Name', get: (r) => r.status === 'Completed' ? `<a href="#/${org.key}/performance-analysis/${r.id}"><i>${esc(r.name)}</i></a>` : `<i>${esc(r.name)}</i>` },
        { label: 'Type', key: 'type' }, { label: 'Requestor', key: 'requestor' }, { label: 'Request Date ↓', key: 'requestDate' },
        { label: 'Start Time', get: (r) => new Date(r.start).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' },
        { label: 'End Time', get: (r) => new Date(r.end).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' },
        { label: 'Status', get: (r) => `<span class="status ${r.status === 'Completed' ? 'done' : ''}">${r.status}</span>` }
      ], list)}</div>`;
    main.querySelector('#rf').onclick = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (list.some(r => r.status !== 'Completed')) setTimeout(() => { if (location.hash.endsWith('/performance-analysis')) window.dispatchEvent(new HashChangeEvent('hashchange')); }, 7600);
    main.querySelector('#newAn').onclick = () => {
      const m = modal(`<div class="modal-head">Start a New Analysis</div><div class="modal-body"><div class="split">
        <div class="field"><label><span class="req">*</span> Analysis Type</label><select class="select" id="atype" style="min-width:0;width:100%"><option value="">Select an Option</option>${window.SC_ANALYSIS_TYPES.slice().sort((a, b) => a.label.localeCompare(b.label)).map(t => `<option value="${t.key}">${t.label}</option>`).join('')}</select></div>
        <div class="field"><label><span class="req">*</span> Time Zone</label><select class="select" style="min-width:0;width:100%"><option>UTC</option></select></div>
        <div></div><div class="field"><label><span class="req">*</span> End Date and Time</label><div class="row" style="flex-wrap:nowrap"><input class="text" value="${org.key === 'eng' ? '30 Oct 2026' : '4 Nov 2026'}"><input class="text" value="${org.key === 'eng' ? '10:50' : '11:00'}"></div></div>
      </div><div class="field" style="margin-top:12px"><label>Report Name</label><input class="text" id="nname"></div></div>
      <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn brand" id="sub" disabled>Submit</button></div>`);
      const sel = m.el.querySelector('#atype'), sub = m.el.querySelector('#sub');
      sel.onchange = () => sub.disabled = !sel.value;
      sub.onclick = () => { const end = org.key === 'eng' ? D('2026-10-30T10:50:00Z') : D('2026-11-04T11:00:00Z'); startAnalysis(org, sel.value, [end - 30 * 60e3, end], m.el.querySelector('#nname').value || F.shortDT(end - 30 * 60e3)); m.close(); };
    };
  });

  // ---------- Rapport (Consolidated = tous les onglets)
  const TABS = [
    { key: 'concurrency', label: 'Apex Concurrency', icon: '⑂' }, { key: 'apex', label: 'Apex Summary', icon: '>_' },
    { key: 'database', label: 'Database Performance', icon: '🛢' }, { key: 'failed', label: 'Failed Logins', icon: '👤' },
    { key: 'flow', label: 'Flow Performance', icon: '≋' }, { key: 'governor', label: 'Governor Limits', icon: '⛔' },
    { key: 'integrations', label: 'Integrations Performance', icon: '⊂⊃' }
  ];
  const MORE = [{ key: 'listviews', label: 'List Views and Reports', icon: '▤' }, { key: 'platformevents', label: 'Platform Events', icon: '⇄' }, { key: 'rowlock', label: 'Row Lock', icon: '🔒' }];

  function reportView(main, org, st) {
    const r = resolveReport(org, st.sub);
    if (!r || !r.chart) { main.innerHTML = UI.pageHeader('Performance Analysis') + '<div class="card">Report not found.</div>'; return; }
    const consolidated = /Consolidated/.test(r.type);
    const tab = st.params.tab || r.tab || 'concurrency';
    const visible = consolidated ? TABS.concat(MORE.filter(m => m.key === tab)) : TABS.concat(MORE).filter(t => t.key === tab);
    main.innerHTML = UI.pageHeader('Performance Analysis', '⚙') + `<div class="card">
      <div class="meta-grid">
        <div><div class="k">Analysis Name</div><div class="v">${esc(r.name)}</div></div><div><div class="k">Type</div><div class="v">${r.type}</div></div><div><div class="k">Requestor Name</div><div class="v">${r.requestor}</div></div>
        <div><div class="k">Request Date</div><div class="v">${r.requestDate}</div></div><div><div class="k">Start Date</div><div class="v">${new Date(r.start).toISOString().slice(0, 16).replace('T', ' ')} UTC</div></div><div><div class="k">End Date</div><div class="v">${new Date(r.end).toISOString().slice(0, 16).replace('T', ' ')} UTC</div></div>
      </div>
      <div class="chart-title">Average Request Time (ms) ⓘ</div><div class="chart-sub">Average time for the platform to process and send requests per 10 minutes</div>
      <div id="rpChart"></div>
      <div class="tabs" id="rtabs">${visible.map(t => `<div class="tab ${t.key === tab ? 'active' : ''}" data-tab="${t.key}"><span class="ico">${t.icon}</span>${t.label}</div>`).join('')}${consolidated ? '<div class="tab" id="moreTab">More ⌄</div>' : ''}</div>
      <div id="tabBody"></div></div>`;
    SC.lineChart(main.querySelector('#rpChart'), { x: r.chart.x, series: r.chart.series.map(s => ({ name: s[0], values: s[1] })), band: [r.start, r.end], height: 190, yLabel: 'Average Request Time (ms)' });
    main.querySelectorAll('#rtabs [data-tab]').forEach(t => t.onclick = () => go(org.key, 'performance-analysis', st.sub, { tab: t.dataset.tab }));
    const more = main.querySelector('#moreTab');
    if (more) more.onclick = (e) => {
      const dd = document.createElement('div'); dd.className = 'dropdown';
      dd.innerHTML = MORE.map(m => `<div class="dd-item" data-t="${m.key}"><span class="di">${m.icon}</span>${m.label}</div>`).join('');
      const rr = more.getBoundingClientRect(), mr = main.querySelector('.card').getBoundingClientRect();
      dd.style.left = (rr.left - mr.left) + 'px'; dd.style.top = (rr.bottom - mr.top) + 'px';
      main.querySelector('.card').style.position = 'relative'; main.querySelector('.card').appendChild(dd);
      dd.onclick = (ev) => { const it = ev.target.closest('.dd-item'); if (it) go(org.key, 'performance-analysis', st.sub, { tab: it.dataset.t }); };
      setTimeout(() => document.addEventListener('click', () => dd.remove(), { once: true }), 0);
    };
    TAB_RENDER[tab](main.querySelector('#tabBody'), r, org);
  }

  const kt = (r) => `<div class="kt"><h4>Key Takeaways</h4><ul><li><b>Database Time Recommendations:</b><ul>${r.takeaways.map(t => Array.isArray(t) ? `<ul>${t.map(x => `<li>${x}</li>`).join('')}</ul>` : `<li>${t}</li>`).join('')}</ul></li></ul></div>`;
  const head = (t) => `<div class="card-head"><h3 class="section-title" style="margin-top:0">${t}</h3>${UI.feedback}</div>`;
  const TAB_RENDER = {
    concurrency(el, r) {
      const c = r.concurrency;
      const yn = (title, txt, v) => `<div><div style="font-weight:700;margin-bottom:6px;min-height:36px">${title}</div><div class="tile ${v === 'YES' ? 'red' : 'green'}" style="min-height:110px"><div class="lbl" style="display:block">${txt}</div><div class="val">${v}</div></div></div>`;
      const nb = (title, txt, v) => `<div><div style="font-weight:700;margin-bottom:6px;min-height:36px">${title}</div><div class="tile" style="min-height:110px"><div class="lbl" style="display:block">${txt}</div><div class="val">${v}</div></div></div>`;
      el.innerHTML = head('Apex Concurrency ⓘ') + `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px" id="concTiles">
        ${yn('Org Throttle Applied', 'Your org was throttled due to very high resource utilization', c.throttle)}${yn('Apex Deployment or Invalidation', 'The last deployment or invalidation can cause high compile times and errors', c.deploy)}${yn('App Server Restart Status', 'App server restarts during this time may have caused Concurrent Apex Errors', c.restart)}
        ${nb('Apex Concurrent Errors', 'Total Apex Transactions with Concurrent Apex Errors', c.apexErr)}${nb('Concurrent API Errors', 'Total Transactions with Concurrent API Errors', c.apiErr)}${nb('Concurrent UI Errors', 'Total Transactions with Concurrent UI Errors', c.uiErr)}${nb('Users with Errors', 'Users Experiencing Concurrent Apex or API Errors', c.users)}</div>
        <div class="split" style="margin-top:16px">${kt(r)}<div><div class="chart-title" style="justify-content:center">Time spent (ms) for All Long Running (&gt; 5 s) Apex Transactions</div><div id="cdonut"></div></div></div>`;
      SC.donut(el.querySelector('#cdonut'), { items: c.donut.map(d => ({ label: d[0], value: d[1], color: d[2] })), fmt: v => F.dec(v, 1), size: 210 });
    },
    apex(el, r) {
      const a = r.apex, sev = el.dataset.sev || 'critical';
      const defs = { critical: 'Critical issues have the highest priority. Issues with high average Run Time, count, and other factors result in software failure.', major: 'Major issues reduce a product\'s usability or cause a crucial part of your software to fail.', minor: 'Minor issues deviate from quality standards.' };
      el.innerHTML = head('Apex Performance') + `<div class="split">${kt(r)}<div><div class="chart-title">Time spent (ms) for All Apex Transactions</div><div id="adonut"></div></div></div>
        <div class="section-title"><span class="fold">⌄</span>Top Slow Classes</div><div id="slowCards">${UI.sevCards(a.counts, sev)}</div>
        <ul style="margin:0 0 8px;padding-left:20px"><li>The top contributors to run time appear in red. Prioritize these fixes.</li><li>To see granular details, enable debug logs in Finest mode for these entry points.</li><li>${defs[sev]}</li></ul>
        ${UI.table(['Component', 'Entry Point', 'Total Number of Executions', 'Avg Run Time per Execution (ms)', 'Number of Executions over 5s', 'Avg App CPU Time per Execution (ms)', 'Avg DB Time per Execution (ms)', 'Avg Apex Execution Time per Execution(ms)', 'Avg Workflow Execution Time per Execution(ms)', 'Max Number of Queries per Execution'].map((l, i) => ({
          label: l, num: i > 1, get: (row) => {
            const v = row[i]; if (i < 2) return v;
            const max = Math.max(row[5], row[6], row[7], row[8]);
            const s = i === 2 || i === 4 || i === 9 ? F.int(v) : F.dec(v, 2);
            return (i >= 5 && i <= 8 && v === max) ? `<span class="pos">${s}</span>` : s;
          }
        })), a.slow[sev] || [], { pager: 2 })}
        <div class="section-title"><span class="fold">⌄</span>Apex Errors</div><div class="muted" style="margin:-4px 0 8px">To increase efficiency and improve the user experience, fix these errors.</div>
        ${UI.table([{ label: 'Logic Location', key: 0 }, { label: 'Total Number of Errors', key: 1, num: true }, { label: 'Error Message', key: 2 }], a.errors, { pager: 2 })}
        <div class="section-title" id="soqlFactors"><span class="fold">⌄</span>Factors Contributing to Database Time</div>
        <div style="font-weight:700;margin:4px 0">Top 5 Expensive SOQLs</div><ul style="margin:0 0 8px;padding-left:20px"><li>The top contributors to top SOQLs appear in red. Prioritize these fixes.</li><li>Fix SOQLs to improve the efficiency and scale of concurrent transactions.</li></ul>
        <div id="soqlTable">${UI.table(['Component', 'Class or Package Name', 'Method', 'Line Number', '% of Total Query Runtime', '% of Query over 5s', 'Total Number of Queries', 'Avg Runtime per Query (ms)', 'Max Number of Records Returned per Query'].map((l, i) => ({
          label: l, num: i > 2, get: (row) => { const v = row[i]; if (i < 3) return v; if (v == null) return ''; const s = i === 3 || i === 6 || i === 8 ? F.int(v) : F.dec(v, 2); return (i === 4 && v > 50) || (i === 5 && v > 50) || (i === 7 && v > 1000) || (i === 8 && v > 2000) ? `<span class="pos">${s}</span>` : s; }
        })), a.soql)}</div>
        <div style="font-weight:700;margin:14px 0 4px">Top 5 Expensive DMLs on Objects</div><ul style="margin:0 0 8px;padding-left:20px"><li>Limit the number of fields and records while doing DML to reduce Database Time.</li></ul>
        <div style="max-width:760px">${UI.table([{ label: 'Entity Name', key: 0 }, { label: 'Type of Database Operation', key: 1 }, { label: 'Total Rows Affected', num: true, get: x => F.int(x[2]) }, { label: 'Max Elapsed Time (ms)', num: true, get: x => F.int(x[3]) }], a.dml)}</div>`;
      SC.donut(el.querySelector('#adonut'), { items: a.donut.map(d => ({ label: d[0], value: d[1] })), fmt: v => F.dec(v, 2), size: 210 });
      el.querySelectorAll('[data-sev]').forEach(c => c.onclick = () => { el.dataset.sev = c.dataset.sev; TAB_RENDER.apex(el, r); });
    },
    database(el, r) {
      const d = r.database, sel = +(el.dataset.bar || 0), top = d.top[sel] || d.top[0];
      el.innerHTML = head('Top SOQL Queries by Query Execution Time (ms)') + `<div class="split"><div id="dbBars"></div>
        <div style="line-height:1.9"><div><b>DB CPU Time:</b> ${top.cpu ? F.int(top.cpu) + ' ms' : '—'}</div><div><b>Query Execution Time:</b> ${F.int(top.v)} ms</div><div><b>Frequency:</b> ${top.freq ? F.int(top.freq) : '—'}</div><div><b>Entry Point:</b> ${top.entry || 'N/A'}</div><div><b>SOQL:</b></div><div class="mono" style="line-height:1.5">${top.soql ? esc(top.soql) : 'N/A'}</div></div></div>
        <div class="section-title">Activity</div><div class="split-3"><div><div style="font-weight:700;margin-bottom:6px">Log Record Types by DB CPU Time (ms)</div><div id="dbLog"></div></div><div><div style="font-weight:700;margin-bottom:6px">Top Entry Points by DB CPU Time (ms)</div><div id="dbEntry"></div></div><div><div style="font-weight:700;margin-bottom:6px">Top Users by DB CPU Time (ms)</div><div id="dbUsers"></div></div></div>
        <div class="section-title">DML Statements</div><div class="split-3"><div><div style="font-weight:700;margin-bottom:6px">DML Types by Number of Rows</div><div id="dmlT"></div></div><div><div style="font-weight:700;margin-bottom:6px">Top DMLs by Entity and Number of Rows</div><div id="dmlE"></div></div><div><div style="font-weight:700;margin-bottom:6px">Top DMLs by User and Number of Rows</div><div id="dmlU"></div></div></div>`;
      const bw = el.querySelector('#dbBars');
      const max = d.top[0].v;
      bw.innerHTML = `<div style="display:flex;align-items:flex-end;gap:6px;height:220px;border-bottom:1px solid #ccc;padding:0 6px">${d.top.map((b, i) => `<div data-bar="${i}" title="${F.int(b.v)} ms" style="flex:1;height:${b.v / max * 96}%;background:#4e79a7;cursor:pointer;${i === sel ? 'outline:4px solid #edc948' : ''}"></div>`).join('')}</div><div class="muted" style="text-align:center;margin-top:6px">SOQL</div>`;
      bw.querySelectorAll('[data-bar]').forEach(b => b.onclick = () => { el.dataset.bar = b.dataset.bar; TAB_RENDER.database(el, r); });
      SC.donut(el.querySelector('#dbLog'), { items: d.logTypes.map(x => ({ label: x[0], value: x[1] })), size: 170 });
      SC.hbars(el.querySelector('#dbEntry'), d.entries.map(x => ({ label: x[0], value: x[1] })));
      SC.hbars(el.querySelector('#dbUsers'), d.users.map(x => ({ label: x[0], value: x[1] })), { teal: true });
      SC.donut(el.querySelector('#dmlT'), { items: d.dmlTypes.map(x => ({ label: x[0], value: x[1] })), size: 170 });
      SC.hbars(el.querySelector('#dmlE'), d.dmlEntity.map(x => ({ label: x[0], value: x[1] })));
      SC.hbars(el.querySelector('#dmlU'), d.dmlUser.map(x => ({ label: x[0], value: x[1] })), { teal: true });
    },
    failed(el, r) { el.innerHTML = head('Failed Logins') + `<div style="max-width:460px">${UI.table([{ label: 'Failed Login Reason', key: 0 }, { label: 'Failed Login Count', key: 1, num: true }], r.failedLogins)}</div>`; },
    flow(el, r) {
      el.innerHTML = head('Flow Performance') + UI.table(['Flow Type', 'Entity Prefix', 'Version ID', 'Flow API Version', 'Definition ID', 'Count', 'Avg Execution Time', 'Max Execution Time', 'Sum Execution Time', 'Timeout'].map((l, i) => ({ label: l, num: i >= 5 && i < 9, get: x => i >= 5 && i < 9 ? F.int(x[i]) : x[i] })), r.flows) +
        `<p class="muted" style="font-size:12px">ⓘ Les flows ne sont identifiés que par leurs IDs (Version ID / Definition ID).</p>`;
    },
    governor(el, r) {
      const g = r.governor;
      el.innerHTML = head('Governor Limits Hit') + '<div id="glc"></div><div class="section-title">Governor Limit Contributors</div>' + UI.table([{ label: 'Location of Error', key: 0 }, { label: 'Type of Error', key: 1 }, { label: 'Total Number of transactions', key: 2, num: true }], g.contrib);
      SC.lineChart(el.querySelector('#glc'), { x: g.x, series: [{ name: 'Governor Limits Hit', values: g.hits }], height: 170, yMax: 1, ticks: 'minutes', fmt: v => F.int(v) });
    },
    integrations(el, r) {
      const i = r.integrations;
      el.innerHTML = head('API Summary') + UI.table(['API', 'API Type', 'API Method', 'Count', 'Count Over 5s', 'Percent Over 5s', 'Avg Rows', 'Avg Run Time (ms)', 'Avg CPU Time (ms)', 'Avg DB Time (ms)', 'Avg Callout Time (ms)'].map((l, k) => ({ label: l, num: k > 2, get: x => k > 2 ? F.int(x[k]) : x[k] })), i.api) +
        '<div class="section-title">Callouts Summary</div>' + UI.table(['URL', 'Method', 'Status Code', 'Count', 'Count Over 5s', 'Percent Over 5s', 'Avg Time (ms)', 'Avg Response Size (bytes)'].map((l, k) => ({ label: l, num: k > 1, get: x => k > 2 ? F.int(x[k]) : x[k], cls: k === 2 ? (x => x[2] === '-1' ? 'bad' : '') : null })), i.callouts);
    },
    listviews(el, r) {
      const l = r.listviews;
      el.innerHTML = head('List Views Performance ( &gt; 5 sec)') + UI.table(['Layout ID', 'Entity API Name', 'Total Executions', 'Number Users', 'p50 Time', 'Max Time', 'Sum Time'].map((x, k) => ({ label: x, num: k > 1, get: y => k > 1 ? F.int(y[k]) : y[k] })), l.lv) +
        '<div class="section-title">Reports Performance</div>' + UI.table(['Report ID', 'Report Origin', 'Total Executions', 'Number Users', 'p50 Time', 'Max Time', 'Sum Time'].map((x, k) => ({ label: x, num: k > 1, get: y => k > 1 ? F.int(y[k]) : y[k] })), l.reports);
    },
    platformevents(el, r) {
      el.innerHTML = head('Platform Events') + (r.platformevents && r.platformevents.length ? UI.table([{ label: 'Event', key: 0 }, { label: 'Published', key: 1, num: true }, { label: 'Failed', key: 2, num: true }, { label: 'Avg Delivery Time (ms)', key: 3, num: true }], r.platformevents) : '<div class="empty-state">No platform events in this time range.</div>');
    },
    rowlock(el, r) {
      const k = r.rowlock;
      el.innerHTML = head('Row Lock') + `<div class="split"><div><div style="font-weight:700">Record Locks by User</div><div id="rlU"></div></div><div id="rlEntityBox"><div style="font-weight:700">Record Locks by Entity</div><div id="rlE"></div></div></div>
        <div class="section-title">Top 15 Locked Records</div><div style="max-width:500px" id="rlTop">${UI.table([{ label: 'Locked Record', key: 0, cls: 'mono' }, { label: 'Count', key: 1, num: true }], k.top)}</div>
        <div class="section-title">Record Locks by Entry Point</div><div id="rlEntry">${UI.table([{ label: 'Entry Point', key: 0 }, { label: 'Entity', key: 1 }, { label: 'Object Prefix', key: 2 }, { label: 'Count', key: 3, num: true }], k.byEntry)}</div>
        <div class="section-title">Locked Records by User</div>${UI.table([{ label: 'Time of Error', key: 0 }, { label: 'User ID', key: 1, cls: 'mono' }, { label: 'Locked Record', key: 2, cls: 'mono' }, { label: 'Log Name', key: 3 }], k.rows)}
        <div class="section-title">Longest Running Transactions</div>${UI.table([{ label: 'Entry Point', key: 0 }, { label: 'Run Time (ms)', num: true, get: x => F.int(x[1]) }, { label: 'Apex Exec Time (ms)', num: true, get: x => F.int(x[2]) }, { label: 'Callout Time (ms)', num: true, get: x => F.int(x[3]) }], k.longest)}`;
      SC.donut(el.querySelector('#rlU'), { items: k.byUser.map(x => ({ label: x[0], value: x[1] })), size: 190 });
      SC.donut(el.querySelector('#rlE'), { items: k.byEntity.map(x => ({ label: x[0], value: x[1] })), size: 190 });
    }
  };
})();

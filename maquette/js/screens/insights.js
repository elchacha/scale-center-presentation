/* =========================================================================
   Écrans « Scale Insights » : ApexGuru, Database, Deployment, Governor Limit,
   Lightning Experience, Multi-Framework (Beta), Report, Search
   ========================================================================= */
(function () {
  const { register, UI, modal, gag, go, esc } = window.APP;
  const F = SC.fmt;
  const genModal = (title, extra) => modal(`<div class="modal-head">${title}</div><div class="modal-body">${extra || ''}
      ${UI.info('You\'ve used 0 of the maximum 1 report generation per day.')}${UI.info('You\'ve used 0 of the maximum 3 report generations per 7 days.')}</div>
      <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn brand" data-close>Generate</button></div>`);
  const wireHeader = (main, title) => { const b = main.querySelector('[data-generate]'); if (b) b.onclick = () => genModal('Generate New ' + title + ' Report'); };

  // ======================================================== APEXGURU
  const AG_TABS = [['code', 'Code Recommendations'], ['soql', 'SOQL/DML Analysis'], ['expensive', 'Expensive Methods'], ['unused', 'Unused Methods'], ['tests', 'Test Cases'], ['dups', 'Code Duplicates']];
  register('apexguru', (main, org, st) => {
    const a = org.apexguru, tab = st.params.tab || 'code';
    main.innerHTML = UI.pageHeader('ApexGuru Insights', '⚙') + `<div class="card">
      <div class="card-head"><h2 class="card-title" style="font-size:14px">ApexGuru Insights</h2>${UI.feedback}</div>
      <div class="row"><div class="field"><label>Report Creation Date</label><select class="select" style="min-width:520px">${a.dates.map(d => `<option>${d}</option>`).join('')}</select></div><div class="spacer"></div><button class="btn" id="agGen">⟳ Generate Insight Report</button><button class="btn">⤓ Download PDF</button></div>
      ${UI.info(`You are currently viewing insights generated as of ${a.dates[0]}.<br>Salesforce cannot guarantee the accuracy or safety of these recommendations. You are responsible for your use of ApexGuru and how its recommendations are applied to your organization.`)}
      <div class="info-bar" id="agCodeAnalyzer" style="background:#eef4ff;border:1px solid #b8d4f5;align-items:center"><b>Available where you code.</b>&nbsp;Run these insights in your <span class="chip blue">IDE</span>, <span class="chip blue">CLI</span>, <span class="chip blue">CI/CD</span>, <span class="chip blue">Agentforce</span> using Code Analyzer.<span class="spacer"></span><a><b>See What's New</b></a> | <a><b>Set Up Code Analyzer</b></a></div>
      ${UI.tabs(AG_TABS.map(([k, l]) => ({ key: k, label: `${l} (${a.tabs[k]})` })), tab)}
      <div id="agBody"></div></div>`;
    main.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => go(org.key, 'apexguru', null, { tab: t.dataset.tab }));
    main.querySelector('#agGen').onclick = () => genModal('Generate New ApexGuru Insights Report');
    AG[tab](main.querySelector('#agBody'), a, st);
  });
  function recoCard(r, labelDiag) {
    return `<div class="reco"><div class="reco-head">
      <div><div class="k">${labelDiag || 'Recommendations'}</div><div class="v">${r.reco || r.diag}</div>${r.type ? `<div class="k" style="margin-top:12px">Type</div><div class="v">${r.type}</div>` : ''}</div>
      <div><div class="k">Apex Class</div><div class="v">${r.cls}<span class="copy">📋</span></div><div class="k" style="margin-top:12px">Apex Method</div><div class="v">${r.method}<span class="copy">📋</span></div></div>
      <div>${r.testClass ? `<div class="k">Test Class ⓘ</div><div class="v">${r.testClass}<span class="copy">📋</span></div><div class="k" style="margin-top:12px">Test Method ⓘ</div><div class="v">${r.testMethod}<span class="copy">📋</span></div>` : `<div class="k">Entry Point</div><div class="v">${r.entry || 'N/A'}</div>`}</div></div>
      <div class="code-pair" style="${r.recommended ? '' : 'grid-template-columns:1fr'}"><div><div class="code-lbl bad">⊘ Current Code</div>${UI.code(r.current)}</div>${r.recommended ? `<div><div class="code-lbl good">✓ Recommended Code <span class="copy">📋</span></div>${UI.code(r.recommended, true)}</div>` : ''}</div></div>`;
  }
  const AG = {
    code(el, a, st) {
      const sev = el.dataset.sev || 'critical', c = a.code;
      el.innerHTML = UI.sevCards(c.counts, sev) + `<div id="agRecos">${(c[sev] || []).map(r => recoCard(r)).join('') || '<div class="empty-state">—</div>'}</div>`;
      el.querySelectorAll('[data-sev]').forEach(s => s.onclick = () => { el.dataset.sev = s.dataset.sev; AG.code(el, a, st); });
    },
    soql(el, a) { el.innerHTML = UI.sevCards(a.soql.counts, 'critical') + a.soql.items.map(r => recoCard(r, 'Diagnosis')).join(''); },
    expensive(el, a) {
      const list = (arr) => `<table class="dt">${arr.map((m, i) => `<tr><td style="width:30px">${i + 1}.</td><td class="mono">${esc(m)}</td></tr>`).join('')}</table>`;
      el.innerHTML = `<div class="reco"><div class="code-lbl bad">⊘ Critical Expensive Methods ⓘ</div>${list(a.expensive.critical)}</div><div class="reco"><div class="code-lbl" style="color:#8c4b02">⚠ Expensive Methods ⓘ</div>${list(a.expensive.other)}</div>`;
    },
    unused(el, a) {
      el.innerHTML = `<div class="reco"><div class="code-lbl bad">⊘ Unused Methods ⓘ</div>${a.unused.map(([cls, ms]) => `<div style="margin:12px 0 4px">▣ ${cls}</div><pre class="code">${ms.map(m => `<span class="ln">${m[0]}.</span> ${esc(m[1])}  <span class="muted">${F.int(m[2])} chars</span>`).join('\n')}</pre>`).join('')}</div>`;
    },
    tests(el, a) { el.innerHTML = UI.sevCards(a.tests.counts, 'major') + '<p>Major issues don\'t block implementations, but fixing them improves test reliability and maintainability.</p>' + a.tests.items.map(r => recoCard(r, 'Diagnosis')).join(''); },
    dups(el, a) {
      const d = a.dups;
      el.innerHTML = `<div class="row" style="align-items:flex-start"><div><div class="muted" style="font-size:12px">Impact Level ⓘ</div>${UI.sevCards({ high: d.counts.high, medium: d.counts.medium, low: d.counts.low }, 'high', { high: 'High Impact', medium: 'Medium Impact', low: 'Low Impact' }).replace(/b-high/g, 'b-critical').replace(/b-medium/g, 'b-major').replace(/b-low/g, 'b-minor').replace(/n-high/g, 'n-critical').replace(/n-medium/g, 'n-major').replace(/n-low/g, 'n-minor')}</div><div class="spacer"></div><div style="text-align:right" id="dupChars"><div class="muted">Duplicate Characters</div><div style="font-size:28px;font-weight:700">${d.chars}</div></div></div>
        <div class="row" style="margin-bottom:12px">${['Scope', 'Effort', 'Match Type'].map(l => `<div class="field"><label>${l} ⓘ</label><select class="select" style="min-width:170px"><option>All</option></select></div>`).join('')}</div>
        ${d.items.map(it => `<div class="reco" style="padding:0"><div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#f7f7f7;border-bottom:1px solid var(--border)"><span>⌄</span><b>${it.head}</b><span class="spacer"></span>${it.badges.map((b, i) => `<span class="chip ${['blue', 'yellow', 'grey'][i]}">${b}</span>`).join('')}<span class="muted" style="font-size:12px;margin-left:8px">${it.note}</span></div>
          <div style="padding:14px 18px"><div class="reco-head" style="grid-template-columns:2fr 1fr"><div><div class="k">Diagnosis</div><div class="v">${it.diag}</div></div><div><div class="k">Resolution Pattern ⓘ</div><div class="v">${it.pattern}</div></div></div>
          <div style="border:1px solid var(--border);border-radius:6px;margin-top:12px;padding:10px 14px;background:#fbfbfa"><div style="font-size:15px;margin-bottom:6px">🗐 ${/Near/.test(it.badges[2]) ? 'Near-Duplicate' : 'Identical'} Members (${it.members.length} ${/Near/.test(it.badges[2]) ? 'similar' : ''} copies)</div>
          ${it.members.map(m => `<div style="padding:7px 10px;background:#fff;margin:4px 0">• <b>${m[0]}</b> <span class="muted">${m[1] ? m[1] + ' · ' : ''}${F.int(m[2])} characters</span></div>`).join('')}</div></div></div>`).join('')}`;
    }
  };

  // ======================================================== DATABASE INSIGHTS
  register('database', (main, org, st) => {
    const d = org.database, tab = st.params.tab || 'top';
    main.innerHTML = UI.pageHeader('Database Insights', '⚙') + `<div class="card">${UI.insightHeader('Database Insights', d.reports, 0)}
      <div style="font-size:16px;margin:10px 0 4px">SOQL Insights</div>
      ${UI.tabs([{ key: 'top', label: 'Top 15 Expensive SOQLs' }, { key: 'regressed', label: `Regressed SOQLs (${d.regressed.counts.critical + d.regressed.counts.major + d.regressed.counts.minor})` }, { key: 'qpa', label: 'Query Plan Analyzer' }], tab)}
      <div id="dbBody"></div></div>`;
    wireHeader(main, 'Database Insights');
    main.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => go(org.key, 'database', null, { tab: t.dataset.tab }));
    const body = main.querySelector('#dbBody');
    const reco = 'Use <a>selective</a> queries that follow best practices. Avoid querying large datasets from entities.';
    if (tab === 'top') {
      body.innerHTML = `<div class="kt"><h4 style="font-size:16px">Takeaways</h4><ul><li>These SOQLs running during peak business hours consume high CPU cycles, slowing down transactions.</li><li>Follow the recommendations to speed up processes and improve performance and scale.</li></ul></div>` +
        UI.table([{ label: 'Total Execution Time (ms) ⌄', num: true, get: r => F.int(r[0]) }, { label: 'Count ⌄', num: true, get: r => F.int(r[1]) }, { label: 'Regressed ⌄', get: r => `<span class="${r[2] === 'Yes' ? 'pos' : 'neg'}">${r[2]}</span>` }, { label: 'Object ⌄', key: 3 }, { label: 'Entry Point ⌄', key: 4 }, { label: 'SOQL ⌄', get: r => esc(r[5]) }, { label: 'Recommendation ⌄', get: () => reco }, { label: '', get: (r, i) => `<a data-view="${i}">View</a>` }], d.top);
      body.querySelectorAll('[data-view]').forEach(a => a.onclick = () => {
        const r = d.top[+a.dataset.view];
        modal(`<div class="modal-head">SOQL Recommendation</div><div class="modal-body" style="line-height:1.5">
          ${[['Total Execution Time (ms)', F.int(r[0])], ['Count', F.int(r[1])], ['Object', r[3]], ['Entry Point', r[4]], ['SOQL', `<span class="mono">${esc(r[5])}</span>`], ['Recommendation', reco]].map(([k, v]) => `<div style="padding:10px 0;border-bottom:1px solid var(--border)"><b>${k}</b><span class="copy" style="float:right">📋</span><div style="margin-top:4px">${v}</div></div>`).join('')}</div>`);
      });
    } else if (tab === 'regressed') {
      const rg = d.regressed;
      body.innerHTML = UI.sevCards(rg.counts, 'critical') + `<ul style="padding-left:20px"><li>Critical queries are expensive and executed frequently during peak hours. Major queries show performance decline but run less frequently. Minor queries have lower overall impact.</li><li>Critical queries have the highest priority. High average run time and high execution count during peak hours impact system stability and user experience.</li></ul>
        <div id="regTable">${UI.table([{ label: 'Total Execution Time (ms) ⌄', num: true, get: r => F.int(r[0]) }, { label: 'SOQL ⌄', get: r => esc(r[1]) }, { label: 'Total Execution Count ⌄', num: true, get: r => F.int(r[2]) }, { label: 'Avg regression % ⌄', num: true, get: r => `<span class="pos">${F.dec(r[3], 2)}</span>` }, { label: 'Recommendation', get: r => r[4] }], rg.rows)}</div>`;
    } else {
      body.innerHTML = `<div class="field"><label><span class="req">*</span>SOQL</label><textarea class="text" id="qpaSoql" rows="3">${esc(d.qpa)}</textarea></div>
        <div class="muted" style="margin:4px 0 10px">Analyzing the query will not actually run the query in your production org.</div>
        <button class="btn brand" id="qpaBtn">Analyze</button><div id="qpaRes" style="margin-top:18px"></div>`;
      body.querySelector('#qpaBtn').onclick = () => {
        const res = body.querySelector('#qpaRes');
        res.innerHTML = '<div class="muted">Analyzing…</div>';
        setTimeout(() => {
          res.innerHTML = `<div id="qpaReco" style="border-top:1px solid var(--border);padding-top:12px"><b>Recommendation</b><div>${reco}</div></div>
            <div style="margin-top:16px"><button class="btn" id="devc">🛠 Comparer avec la Developer Console (Query Plan)</button></div>`;
          body.querySelector('#devc').onclick = () => devConsole(d);
        }, 900);
      };
    }
  });
  function devConsole(d) {
    modal(`<div class="modal-head" style="text-align:left;background:#f4f6f9;font-size:15px"><b>Query Plan</b> <small style="display:inline;margin-left:8px">Developer Console — Query Editor</small></div>
      <div class="modal-body" style="padding:10px 14px"><table class="dt" style="font-size:12px"><thead><tr><th>Cardinality</th><th>Fields</th><th>Leading Operation Type</th><th>Cost</th><th>sObject Cardinality</th><th>sObject Type</th></tr></thead>
      <tbody>${d.devconsole.rows.map(r => `<tr><td>${F.int(r[0])}</td><td>${r[1]}</td><td><b class="${r[2] === 'TableScan' ? 'pos' : ''}">${r[2]}</b></td><td>${r[3]}</td><td>${r[4]}</td><td>${(d.qpa.match(/FROM (\w+)/) || [])[1]}</td></tr>`).join('')}</tbody></table>
      <div style="border:1px solid var(--border);background:#fafafa;padding:8px 10px;font-size:12px;margin-top:10px"><b>Notes:</b><br>${d.devconsole.notes.map(n => esc(n)).join('<br>')}</div></div>
      <div class="modal-foot"><button class="btn" data-close>Close</button></div>`, { wide: true });
  }

  // ======================================================== DEPLOYMENT INSIGHTS
  register('deployment', (main, org, st) => {
    const dep = org.deployment, ri = +(st.params.report || 0), r = dep.reports[ri], tab = st.params.tab || 'errors';
    main.innerHTML = UI.pageHeader('Deployment Insights', '⚙') + `<div class="card">${UI.insightHeader('Deployment Insights', dep.reports.map(x => x.label), ri, { generated: r.generated })}
      <div class="split" style="grid-template-columns:1.3fr 1fr;border-bottom:1px solid var(--border);padding-bottom:14px">
        <div class="kt" id="depKey"><div style="font-size:16px;margin-bottom:6px">Key Insights</div><ul>${r.key.map(k => `<li>${k[0]}</li>`).join('')}</ul></div>
        <div class="row" style="align-items:stretch;flex-wrap:nowrap"><div class="tile green" style="flex:1;border-radius:0"><div class="lbl"><b style="color:var(--text)">Successful Deployments</b></div><div class="val">${r.successful}</div></div><div class="tile red" style="flex:1;border-radius:0"><div class="lbl"><b style="color:var(--text)">Failed Deployments</b></div><div class="val">${r.failed}</div></div></div>
      </div>
      <div class="chart-title" style="margin-top:14px">Total Request Volume ⓘ</div><div id="depVol"></div>
      <div class="split" style="grid-template-columns:1fr 1.2fr;margin-top:14px" id="depErrors"><div class="kt"><div class="chart-title">Change in Errors Before and After Deployment ⓘ</div><div style="font-size:15px;margin:8px 0 4px">Key Takeaways</div><ul>${r.errors.takeaways.map(t => `<li>${t[0]}</li>`).join('')}</ul></div><div id="depErrChart"></div></div>
      <div class="split" style="grid-template-columns:1fr 1.2fr" id="depPerf"><div class="kt"><div class="chart-title">Change in Performance Before and After Deployment ⓘ</div><div style="font-size:15px;margin:8px 0 4px">Key Takeaways</div><ul>${r.perf.takeaways.map(t => `<li>${t[0]}</li>`).join('')}</ul></div><div id="depPerfChart"></div></div>
      ${UI.tabs([{ key: 'errors', label: 'Errors' }, { key: 'ux', label: 'User Experience' }, { key: 'api', label: 'API Performance' }, { key: 'infra', label: 'Infrastructure Performance' }], tab)}
      <div id="depTab"></div></div>`;
    main.querySelector('[data-report]').onchange = (e) => go(org.key, 'deployment', null, { report: e.target.value });
    main.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => go(org.key, 'deployment', null, { report: ri, tab: t.dataset.tab }));
    main.querySelector('[data-generate]').onclick = () => {
      modal(`<div class="modal-head">New Deployment Insights Report</div><div class="modal-body"><div class="field"><label>Report Name</label><input class="text" placeholder="Deployment Insights Report"></div>
        <p><span class="req">*</span> Select a deployment from the last 25 days (up to yesterday)</p>
        <table class="dt"><thead><tr><th></th><th>Date</th><th>Deployment</th></tr></thead><tbody>${dep.deployments.map(d => `<tr><td><input type="radio" name="dep"></td><td>${d[0]}</td><td class="mono">${d[1]}</td></tr>`).join('')}</tbody></table>
        ${UI.info('Wait 24 hours after deployment to generate this report.')}${UI.info('You\'ve used 0 of the maximum 1 report generation per day.')}${UI.info('You\'ve used 0 of the maximum 3 report generations per 7 days.')}</div>
        <div class="modal-foot"><button class="btn" data-close>Cancel</button><button class="btn brand" data-close>Generate Insights Report</button></div>`, { wide: true });
    };
    SC.lineChart(main.querySelector('#depVol'), { x: r.x, series: [{ name: 'Request Volume', values: r.volume }], markers: r.markers, height: 210, ticks: 'days', yLabel: 'Total Request Volume' });
    const col = (good) => (i) => (good[i] ? '#2e844a' : '#c23934');
    const errGood = r.errors.after.map((v, i) => v <= r.errors.before[i]);
    const perfGood = r.perf.after.map((v, i) => v <= r.perf.before[i]);
    SC.barGroups(main.querySelector('#depErrChart'), { categories: r.errors.cats, series: [{ name: 'Before', values: r.errors.before, color: '#c9c9c9' }, { name: 'After', values: r.errors.after, color: col(errGood) }], xLabel: 'Errors', yLabel: 'Count of Errors', height: 170 });
    SC.barGroups(main.querySelector('#depPerfChart'), { categories: r.perf.cats, series: [{ name: 'Before', values: r.perf.before, color: '#c9c9c9' }, { name: 'After', values: r.perf.after, color: col(perfGood) }], xLabel: 'Metrics', yLabel: 'Time in ms', height: 170 });
    const t = main.querySelector('#depTab');
    const numChange = '<label class="check" style="margin:6px 0 10px"><input type="checkbox" checked> Display numerical change from before to after deployment ⓘ</label>';
    const d2 = (v, d) => UI.delta(v, '', true, d);
    const apiCols = ['API Method', 'API Source', '% of Total Runtime', '% of Executions over 5s', '% of Total CPU Time', '% of Total DB Time', 'Avg Runtime (ms)', '# of Executions over 5s'].map((l, k) => ({ label: l, num: k > 1, get: x => k > 1 ? d2(x[k], k > 5 ? 0 : 2) : x[k] }));
    if (tab === 'errors') t.innerHTML = `<div class="section-title" style="margin-top:0">Row Lock Errors</div><div class="kt" id="rlHowTo"><div style="font-size:15px">Takeaways</div><ul><li>The following table represents the reason for increase in the Row Lock Errors.</li><li>Avoiding row locks on the records given below through their entry points may help in reducing database time for transactions on these objects. It may also help in preventing concurrent Apex errors.</li></ul><div style="font-size:15px">How to Fix</div><ul><li>Evaluate the possibility of same record being simultaneously mutated by blocker and waiter entry points.</li><li>Evaluate the possibility of eliminating the relationship between the blocker and waiter objects.</li><li>Evaluate the possibility of removal FOR UPDATE in any of the blocker entry points.</li></ul></div>` + UI.table([{ label: 'Entry Point', key: 0 }, { label: 'Entity', key: 1 }, { label: 'Object Prefix', key: 2 }, { label: 'Count', key: 3, num: true }], r.rowlock);
    else if (tab === 'ux') t.innerHTML = `<div class="section-title" style="margin-top:0">Top Lightning Experience (LEX) Pages and Components</div><ul><li>For these five most dominant Page URLs, reduce their runtime to increase efficiency and improve the user experience.</li></ul><div class="kt"><div style="font-size:15px">Takeaways</div><ul><li>The pages in the table below have their EPT regressed the highest</li></ul><div style="font-size:15px">How to Fix</div><ul><li><b>Evaluate options of Data Retrieval, Data Caching, Lightning Data Service and Cacheable Apex Methods for lightning components and actions used in the last deployment</b></li></ul></div>${numChange}<div id="uxTable">` + UI.table([{ label: 'URL', key: 0 }, { label: 'Count', num: true, get: x => UI.delta(x[2], '', false, 0) }, { label: 'p75 EPT', num: true, get: x => d2(x[3], 1).replace('</span>', ' s</span>') }, { label: 'Avg Runtime', num: true, get: x => d2(x[4], 0).replace('</span>', ' ms</span>') }], r.ux) + '</div>';
    else if (tab === 'api') t.innerHTML = `<div class="section-title" style="margin-top:0">Top SOAP API Requests</div><ul><li>For these five most dominant Apex entry points, reduce their runtime to increase efficiency and improve the user experience.</li></ul>${numChange}` + UI.table(apiCols, r.soap) + `<div class="section-title">Top REST API Requests</div>${numChange}` + UI.table(apiCols, r.rest);
    else t.innerHTML = `<div class="section-title" style="margin-top:0">App CPU and DB CPU</div><ul><li>For these five most dominant Apex entry points, reduce their runtime to increase efficiency and improve the user experience.</li></ul>${numChange}<div id="infraTable">` + UI.table(['Type of Component', 'Entry Point', '% of Total Runtime', '% of Executions over 5s', '% of Total CPU Time', '% of Total DB Time', 'Avg Runtime (ms)', '# of Executions over 5s'].map((l, k) => ({ label: l, num: k > 1, get: x => k > 1 ? d2(x[k], k > 5 ? (k === 6 ? 2 : 0) : 2) : x[k] })), r.infra) + '</div>';
  });

  // ======================================================== GOVERNOR LIMIT INSIGHTS
  // Structure réelle (captures v2-11 à v2-27) : 8 tuiles, puis un panneau repliable par limite
  // (Takeaways · How to Fix → investigation ciblée · graphique 7 j limite + bande de pic · tableaux de la fenêtre de pic).
  // ?open=<nom de limite> : panneau ouvert d'office (captures / étapes) ; sinon celui marqué open, ou le 1er.
  const GOV_LIMITS = { 'API Request Limit': 0, 'Async Apex Execution Limit': 1, 'Bulk API 2.0 Rows Limit': 2, 'Bulk API Batches Limit': 3, 'Concurrent Apex': 4, 'Concurrent API Calls': 5, 'Concurrent UI Requests': 6, 'High Volume Platform Events Published': 7 };
  const GOV_TYPE = { 'Consolidated Report': 'consolidated', 'Apex Summary': 'apex', 'Concurrent Apex': 'concurrency' };
  register('governor', (main, org, st) => {
    const g = org.governor, sel = g.selected || 'safe', P = window.GOV_PANELS[org.key];
    const names = Object.keys(GOV_LIMITS);
    const openName = st.params.open || names.find(n => P.panels[n].open) || names[0];
    main.innerHTML = UI.pageHeader('Governor Limit Insights', '⚙') + `<div class="card">${UI.insightHeader('Governor Limit Insights', g.reports, 0)}
      <div style="font-size:16px;font-weight:700;margin:10px 0 6px">Key Insights</div><ul><li>${g.key}</li></ul>
      <div id="govCards" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:10px 0 14px">${[['critical', 'Critical', 'Breached Governor Limit'], ['major', 'Major', 'Approaching Governor Limit'], ['safe', 'Safe', 'Below Governor Limit']].map(([k, l, cap]) => `<div class="sev ${sel === k ? 'selected' : ''}" style="width:auto;height:auto;padding:12px;${g.counts[k] ? '' : 'opacity:.55'}"><span class="badge b-${k}">${l}</span><div class="n n-${k}">${g.counts[k]}</div><div class="cap">${cap}</div></div>`).join('')}</div>
      <div id="govTiles" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px 18px">${g.tiles.map(t => `<div class="${t[3] === 'major' ? 'gov-major' : ''}"><div style="font-weight:700;margin-bottom:6px">${t[0]}</div><div class="tile ${t[3] === 'major' ? 'orange' : 'green'}" style="border:1px solid ${t[3] === 'major' ? '#f3b860' : '#b9dfb0'}"><div class="lbl">${t[1]}</div><div class="val">${t[2]}</div></div></div>`).join('')}</div>
      <div id="govPanels" style="margin-top:16px">${names.map(n => {
        const tile = g.tiles.find(t => t[0] === n) || [];
        return `<div class="reco gov-panel" data-limit="${n}" id="gp-${GOV_LIMITS[n]}" style="border-color:${tile[3] === 'major' ? '#f3b860' : '#b9dfb0'};padding:0">
          <div class="gp-head" style="display:flex;align-items:center;padding:12px 16px;cursor:pointer"><b style="font-size:15px">${n}</b><span class="spacer"></span><span class="btn" style="height:26px;padding:0 6px">${n === openName ? '⌄' : '›'}</span></div>
          <div class="gp-body" style="display:${n === openName ? 'block' : 'none'};padding:0 16px 14px"></div></div>`;
      }).join('')}</div></div>`;
    wireHeader(main, 'Governor Limit Insights');
    const drawBody = (panelEl) => {
      const n = panelEl.dataset.limit, d = P.panels[n], body = panelEl.querySelector('.gp-body');
      if (body.dataset.done) return; body.dataset.done = '1';
      const tile = g.tiles.find(t => t[0] === n) || [];
      body.innerHTML = `<div class="split"><div><div style="font-weight:700;margin:4px 0 8px">Takeaways</div><ul>${d.takeaways.map(t => `<li>${t}</li>`).join('')}</ul>
          <div style="font-weight:700;margin:12px 0 6px">How to Fix</div><p class="gp-howto">To dig deeper, create a <a data-inv="${GOV_TYPE[d.howTo]}">${d.howTo}</a> investigation for the breached time frame.</p></div>
          <div><div style="font-weight:700">${n.replace(' Limit', '').replace('Execution', 'Executions')}</div><div class="gp-chart"></div></div></div>
        ${d.tables.map(t => `<div class="section-title" style="font-size:14px">${t.title} — ${P.peak}</div>` + UI.table(t.cols.map((c, i) => ({ label: c + ' ⌄', num: i > 0 && /Count|Time|CPU|Invocations|Records|Requests|Scope|Payload|%|Duration/.test(c), key: i })), t.rows)).join('')}`;
      // graphique 7 jours : consommation / limite, bande grise = jour de pic
      const lim = parseFloat(((String(tile[1] || '').match(/of ([\d\s ]+)/) || [])[1] || '50').replace(/[^\d]/g, '')) || 50;   // nombre après « of »
      const x = SCDATA.times(org.key === 'eng' ? '2026-10-24T00:00:00Z' : '2026-11-01T00:00:00Z', 7 * 24, 60);
      const peakDay = Date.parse(org.key === 'eng' ? '2026-10-30T00:00:00Z' : '2026-11-03T00:00:00Z');
      const vals = SCDATA.series(x, 200 + GOV_LIMITS[n], t => lim * (d.base * (0.5 + SCDATA.workday(t)) + (t >= peakDay && t < peakDay + 864e5 ? d.spike * SCDATA.workday(t) : 0)), { noise: 0.15 });
      SC.lineChart(body.querySelector('.gp-chart'), { x, series: [{ name: n, values: vals, color: '#0176d3' }], limit: lim, height: 170, ticks: 'days', band: [peakDay, peakDay + 864e5], xLabel: 'Last 7 Days' });
      body.querySelectorAll('[data-inv]').forEach(a => a.onclick = () => go(org.key, 'org-performance'));
    };
    main.querySelectorAll('.gov-panel').forEach(p => {
      if (p.dataset.limit === openName) drawBody(p);
      p.querySelector('.gp-head').onclick = () => {
        const b = p.querySelector('.gp-body'), open = b.style.display !== 'none';
        b.style.display = open ? 'none' : 'block'; p.querySelector('.gp-head .btn').textContent = open ? '›' : '⌄';
        if (!open) drawBody(p);
      };
    });
  });

  // ======================================================== LIGHTNING EXPERIENCE INSIGHTS
  // Captures v3 : carte avec infobulle (EPT, Page Views, % of Total), pages à fort impact
  // dépliables (page → composants custom → actions Apex, icône ApexGuru), Usage : trends First/Subsequent,
  // carte d'usage, donut navigateurs + tableau, Most Used Pages avec Average DAU.
  // ?drill=<n° de page>&cmp=<n° de composant> : drill-down ouvert d'office (captures).
  register('lex', (main, org, st) => {
    const l = org.lex, tab = st.params.tab || 'perf';
    main.innerHTML = UI.pageHeader('Lightning Experience Insights', '⚙') + `<div class="card">${UI.insightHeader('Lightning Experience Insights', l.reports, 0, {
      intro: `<p style="margin:0 0 10px">Use Lightning Experience Insights to measure and improve the performance of your org for desktop users.</p><p id="p75" style="margin:0 0 12px">We measure performance using Experienced Page Time (EPT). EPT and other metrics are measured at the P75 (75th percentile) metric, which means 75% of all page loads or actions were at this speed or faster. We use this instead of P50 (median) or average, because it provides a better picture of the experience for users who encounter slower performance. Learn more about how performance is measured in <a>Trailhead</a>.</p>`
    })}${UI.tabs([{ key: 'perf', label: 'Performance Insights' }, { key: 'usage', label: 'Usage Insights' }], tab)}<div id="lexBody"></div></div>`;
    wireHeader(main, 'Lightning Experience Insights');
    main.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => go(org.key, 'lex', null, { tab: t.dataset.tab }));
    const b = main.querySelector('#lexBody');
    const kpis = (arr) => `<div class="tiles" id="lexKpis" style="grid-template-columns:repeat(${arr.length},minmax(150px,210px))">${arr.map(k => `<div><div style="font-weight:700;margin-bottom:6px">${k[0]} ⓘ</div><div class="tile"><div class="lbl">Over last 7 days</div><div class="val">${k[1]}</div></div></div>`).join('')}</div>`;
    const tr = l.trends;
    const totalPv = l.pages.reduce((a, p) => a + p[2], 0) / 0.62;
    const regionInfo = (name, ept) => { const pv = name === 'France' ? Math.round(totalPv * 0.86) : Math.round(4000 + ept * 3); return { pv, pct: pv / totalPv * 100, dau: Math.max(1, Math.round(pv / 1100)) }; };
    if (tab === 'perf') {
      b.innerHTML = kpis(l.kpis) + `<div class="kt" id="lexInsights"><h4 style="font-size:16px">Key Insights</h4><ul>${l.insights.map(i => `<li>${i}</li>`).join('')}<ul style="list-style:none;padding-left:14px">${l.apexActions.map((a, i) => `<li>${i === 0 ? '<span class="guru">✦</span> <a>' + a + '</a>' : a}</li>`).join('')}</ul></ul></div>
        <div class="chart-title" style="margin-top:12px">Performance Trends ⓘ</div><div id="lexTrend"></div>
        <div class="split" style="margin-top:12px"><div><div class="chart-title">Performance by Region or Country ⓘ</div><div id="lexMap"></div></div><div><div class="chart-title">Performance by Browser ⓘ</div><div id="lexBr"></div></div></div>
        <div class="chart-title" style="margin-top:16px">High Impact, Slow Performing Pages</div><p class="muted" style="margin:2px 0 10px">We've identified the top 10 areas that offer the biggest opportunities to improve performance. These pages have the highest combination of page views and slow load times.<br>You can drill down to see details for custom components and custom actions on each page. Since you can't optimize standard components or standard actions, we only show you the ones you can change.</p>
        ${UI.info('Apex Guru recommendations are being fetched in the background for all actions.')}
        <div id="lexPages"></div>`;
      const first = SCDATA.series(tr.x, tr.seed, t => 3600 + 3400 * SCDATA.workday(t), { noise: 0.35, spikes: [{ t: tr.spikeAt, w: 40, v: 32000 }] });
      const sub = SCDATA.series(tr.x, tr.seed + 1, t => 900 + 600 * SCDATA.workday(t), { noise: 0.2 });
      SC.lineChart(b.querySelector('#lexTrend'), { x: tr.x, series: [{ name: 'First Page EPT', values: first }, { name: 'Subsequent Page EPT', values: sub }], height: 200, ticks: 'days', yLabel: 'p75 EPT (ms)', fmt: v => F.int(v) + ' ms' });
      SC.worldMap(b.querySelector('#lexMap'), { values: l.regions, tip: (n, v) => { const r = regionInfo(n, v); return `Geography: ${n}<br>EPT: ${F.int(v)} ms<br>Page Views: ${F.int(r.pv)}<br>% of Total Page Views: ${F.dec(r.pct, 0)} %`; } });
      SC.bars(b.querySelector('#lexBr'), { categories: l.browsers.cats, values: l.browsers.ept, yLabel: 'EPT (ms)', xLabel: 'Browser', height: 220 });
      // tableau des pages, dépliable : page → composants → actions
      const D = (window.LEX_DRILL[org.key] || {});
      const openPage = st.params.drill != null ? +st.params.drill : -1, openCmp = st.params.cmp != null ? +st.params.cmp : -1;
      const actCols = ['Action', 'Action Count', 'Box Car Count', 'Cache Eligible', 'Cache Hit Ratio', 'XHR Request Stall Time (ms)', 'Server Time (ms)', 'TTFB (ms)', 'XHR Duration (ms)', 'XHR Response Stall Time (ms)', 'Duration (ms) ↓'];
      const renderPages = (po, co) => {
        let h = `<table class="dt" id="lexPagesTable"><thead><tr><th>Page (URL)</th><th class="num">Page Views ⓘ</th><th class="num">% of Total Page Views ⓘ</th><th class="num">EPT (ms) ⓘ</th></tr></thead><tbody>`;
        l.pages.forEach((r, i) => {
          const cmps = D[r[0]] || [];
          h += `<tr class="lex-row ${i === po ? 'open' : ''}" data-p="${i}"><td>${i === po ? '⌄' : '›'} ${r[0]} <span class="muted">(${cmps.length || r[1]})</span></td><td class="num">${F.int(r[2])}</td><td class="num">${F.dec(r[3], 2)} %</td><td class="num">${r[4] > 2000 ? `<span class="pos">${F.int(r[4])}</span>` : F.int(r[4])}</td></tr>`;
          if (i !== po) return;
          if (!cmps.length) h += `<tr class="lex-cmp"><td colspan="4" class="muted">No custom components or actions on this page.</td></tr>`;
          cmps.forEach((c, j) => {
            h += `<tr class="lex-cmp ${j === co ? 'open' : ''}" data-c="${j}"><td colspan="4">${j === co ? '⌄' : '›'} ${c.cmp} <span class="muted">(${c.actions.length || 1})</span></td></tr>`;
            if (j === co && c.actions.length) h += `<tr class="lex-act" id="lexActions"><td colspan="4">${UI.table(actCols.map((lb, k) => ({ label: lb, num: k > 0, get: a => k === 0 ? (a[11] ? `<span class="guru" title="ApexGuru recommendation">✦</span> <a>${a[0]}</a>` : a[0]) : (typeof a[k] === 'number' ? F.int(a[k]) : a[k]) })), c.actions.slice().sort((x, y) => y[10] - x[10]))}</td></tr>`;
          });
        });
        b.querySelector('#lexPages').innerHTML = h + '</tbody></table>';
        b.querySelectorAll('.lex-row').forEach(tr => tr.onclick = () => { const p = +tr.dataset.p; renderPages(p === po ? -1 : p, -1); });
        b.querySelectorAll('.lex-cmp[data-c]').forEach(tr => tr.onclick = () => { const c = +tr.dataset.c; renderPages(po, c === co ? -1 : c); });
      };
      renderPages(openPage, openCmp);
    } else {
      const u = l.usage;
      const pvTotal = l.browsers.pv.reduce((a, c) => a + c, 0);
      b.innerHTML = UI.info('Lightning Experience Usage Insights is a pilot or beta service that is subject to the Beta Services Terms.', 'beta-bar') + kpis(u.kpis) + `<div class="split"><div><div class="chart-title">Page Views Trends ⓘ</div><div id="pvT"></div></div><div><div class="chart-title">Daily Active Users (DAU) Trends ⓘ</div><div id="dauT"></div></div></div>
        <div class="split"><div id="usageMapBox"><div class="chart-title">Usage by Region or Country ⓘ</div><div id="uMap"></div></div><div id="usageBrBox"><div class="chart-title">Usage by Browser ⓘ</div>
          <div style="display:flex;gap:18px;align-items:flex-start"><div id="uBr"></div>
          <table class="dt" style="width:auto;font-size:12px"><thead><tr><th></th><th class="num">Page Views</th><th class="num">% of Total Page Views</th><th class="num">Average DAU</th></tr></thead><tbody>${l.browsers.cats.map((c, i) => `<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${['#fcc003', '#2bb2b0', '#ff7a00', '#1ab9ff'][i]};margin-right:6px"></span>${c}</td><td class="num">${F.int(l.browsers.pv[i])}</td><td class="num">${F.dec(l.browsers.pv[i] / pvTotal * 100, 1)}%</td><td class="num">${F.int(Math.max(1, l.browsers.pv[i] / 830))}</td></tr>`).join('')}</tbody></table></div></div></div>
        <div class="chart-title" style="margin-top:12px">Most Used Pages ⓘ</div><div id="mostUsed">${UI.table([{ label: 'Page (URL)', key: 0 }, { label: 'Page Views ↓', num: true, get: r => F.int(r[2]) }, { label: '% of Total Page Views', num: true, get: r => F.dec(r[3], 2) + ' %' }, { label: 'Average DAU', num: true, get: r => F.int(Math.max(1, r[2] / 720)) }, { label: 'EPT (ms)', num: true, get: r => F.int(r[4]) }], l.pages.slice().sort((a, c) => c[2] - a[2]))}</div>`;
      const sc = org.key === 'eng' ? 0.45 : 1;
      const pvSub = SCDATA.series(tr.x, tr.seed + 2, t => 25000 * SCDATA.workday(t) * sc);
      const pvFirst = SCDATA.series(tr.x, tr.seed + 3, t => 1300 * SCDATA.workday(t) * sc);
      SC.lineChart(b.querySelector('#pvT'), { x: tr.x, series: [{ name: 'First Page Views', values: pvFirst, color: '#4e79a7' }, { name: 'Subsequent Page Views', values: pvSub, color: '#f28e2b' }], height: 190, ticks: 'days', yLabel: 'Page Views', fmt: v => F.int(v) });
      SC.lineChart(b.querySelector('#dauT'), { x: tr.x, series: [{ name: 'First Page DAU', values: pvSub.map(v => v / 60), color: '#4e79a7' }, { name: 'Subsequent Page DAU', values: pvSub.map(v => v / 24), color: '#f28e2b' }], height: 190, ticks: 'days', yLabel: 'Daily Active Users (DAU)', fmt: v => F.int(v) });
      const usageVals = Object.fromEntries(Object.entries(l.regions).map(([k, ept]) => [k, regionInfo(k, ept).pv]));
      SC.worldMap(b.querySelector('#uMap'), { values: usageVals, scale: 'usage', tip: (n, v) => { const r = regionInfo(n, l.regions[n]); return `Geography: ${n}<br>Page Views: ${F.compact(v)}<br>% of Total Page Views: ${F.dec(r.pct, 2)} %<br>Average DAU: ${F.int(r.dau)}<br>EPT: ${F.int(l.regions[n])} ms`; } });
      SC.donut(b.querySelector('#uBr'), { items: l.browsers.cats.map((c, i) => ({ label: c, value: l.browsers.pv[i], color: ['#fcc003', '#2bb2b0', '#ff7a00', '#1ab9ff'][i] })), size: 170 });
      const lg = b.querySelector('#uBr .legend-list'); if (lg) lg.parentElement.remove();
    }
  });

  // ======================================================== MULTI-FRAMEWORK (BETA)
  register('multiframework', (main) => {
    main.innerHTML = UI.pageHeader('Multi-Framework Insights (Beta)', '⚙') + `<div class="card"><h2 class="card-title" style="font-size:14px">Multi-Framework Insights (Beta)</h2>
      <p>Use Multi-Framework Insights to measure and improve the performance of your most-used Multi-Framework apps.</p>
      <p>The dashboard measures app performance by the 75th percentile page load time (P75). At P75, 75% of page loads are this fast or faster. P75 better reflects the experience of users with slower performance than the median (P50) or average.</p>
      ${UI.info('Multi-Framework Insights is a pilot or beta service that is subject to the Beta Services Terms at <a>Agreements - Salesforce.com</a> or a written Unified Pilot Agreement if executed by Customer, and applicable terms in the <a>Product Terms Directory</a>. Use of this pilot or beta service is at the Customer\'s sole discretion.')}
      <div class="row" style="margin-top:14px"><div class="field"><label>Select Report</label><select class="select" style="min-width:200px"><option>Nov 2, 2026 - Nov 8, 2026</option></select></div><div class="spacer"></div><button class="btn brand">＋ Generate Insight Report</button><button class="btn">⟳ Refresh</button></div>
      <div class="empty-state" id="mfEmpty">${window.APP.cactus()}<h3>No data for this period</h3><p>Check back once your apps have recorded activity.</p></div></div>`;
  });

  // ======================================================== REPORT INSIGHTS
  register('report', (main, org) => {
    const r = org.report;
    main.innerHTML = UI.pageHeader('Report Insights', '⚙') + `<div class="card">${UI.insightHeader('Report Insights', r.reports, 0, { generated: 'as of ' + r.reports[0].split(' - ')[1] })}
      <div class="chart-title" style="font-weight:400;font-size:16px">⏱ Slow Reports by Average Run Time (ms)</div><div id="repDonut" style="justify-content:center;margin:10px 0"></div>
      ${UI.tabs([{ key: 's', label: 'Slow Reports' }], 's')}
      <div id="repList">${r.rows.map((x, i) => `<div class="row" style="padding:10px 6px;border-bottom:1px solid #eee;align-items:center;flex-wrap:nowrap" ${i === 0 ? 'id="rep1946"' : ''}><span style="width:20px">›</span><div style="flex:2"><div class="muted" style="font-size:12px">Report ID</div><a>${x[0]}</a> <span class="muted" style="font-size:12px">— ${x[1]}</span></div><div style="flex:1"><div class="muted" style="font-size:12px">Execution Count</div>${F.compact(x[2])}</div><div style="flex:1"><div class="muted" style="font-size:12px">Average Run Time (ms)</div>${F.dec(x[3], 1)}</div><div style="flex:1"><div class="muted" style="font-size:12px">Total Run Time (ms)</div>${x[4]}</div></div>`).join('')}</div></div>`;
    wireHeader(main, 'Report Insights');
    SC.donut(main.querySelector('#repDonut'), { items: r.rows.slice().sort((a, b) => b[3] - a[3]).map(x => ({ label: x[0], value: x[3] })), fmt: v => F.int(v), size: 240 });
  });

  // ======================================================== SEARCH INSIGHTS
  register('search', (main, org) => {
    const s = org.search;
    const col = (title, n, insight, reco, h2, rows) => `<div><h3 style="font-size:19px;margin:6px 0">${title} ⓘ</h3><h4 style="font-size:16px;margin:12px 0 6px">Key Insights</h4><ul><li>${insight.replace('{n}', `<b class="bad">${n}</b>`)}</li></ul><h4 style="font-size:16px;margin:12px 0 6px">Recommendations</h4><ul><li>${reco}</li></ul>${UI.table([{ label: 'Entity Name', key: 0 }, { label: h2, num: true, get: r => F.int(r[1]) }], rows)}</div>`;
    main.innerHTML = UI.pageHeader('Search Insights', '⚙') + `<div class="card">${UI.insightHeader('Search Insights', ['Nov 2, 2026, 12:00 AM - Nov 8, 2026, 11:59 PM UTC'], 0, { generated: 'on Nov 8, 2026, 11:59 PM UTC' })}
      <div class="split" id="searchCols">${col('Entities Never Queried', s.never.length, 'Salesforce maintains search indexes for these {n} custom objects, even though they haven\'t been used for more than 7 days.', 'Analyze past Search Insights reports to find the most unused entities. Go to these custom objects in Object Manager and disable search.', 'Number of Times Indexed', s.never)}
      ${col('Entities Queried but Never Clicked', s.noclick.length, '{n} custom objects are searched for but never clicked from the search results. Operations related to these objects are slower.', 'Ask your business team if these objects are required to be searchable and consider disabling search in Object Manager.', 'Number of Times Queried', s.noclick)}</div></div>`;
    wireHeader(main, 'Search Insights');
  });
})();

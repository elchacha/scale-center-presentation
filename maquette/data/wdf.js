/* =========================================================================
   Org fictive n°1 — WATT DE FRANCE (WDF) — fil 1 « Le déploiement du mardi »
   Tous les noms et chiffres sont inventés (voir UNIVERS.md).
   ========================================================================= */
(function () {
  const { workday, times, series } = window.SCDATA;
  const D = (s) => Date.parse(s);
  window.ORGS = window.ORGS || {};

  // ---------- Séries de la semaine du déploiement (pas 10 min) ----------
  const xWeek = times('2026-11-01T00:00:00Z', 6 * 144, 10);           // 1 → 6 nov.
  const TUE = D('2026-11-03T14:10:00Z'), FIX = D('2026-11-05T19:30:00Z');
  const volume = series(xWeek, 11, t => 265000 * workday(t), { noise: 0.09 });

  // ---------- Org Performance : 24 h autour du déploiement ----------
  const xDay = times('2026-11-03T06:00:00Z', 144, 10);
  const after = (t) => t >= TUE;
  const op = {
    volumeTotal: series(xDay, 21, t => 262000 * workday(t)),
    ui: series(xDay, 22, t => 236000 * workday(t)),
    rest: series(xDay, 23, t => 9000 * workday(t) + 600),
    soap: series(xDay, 24, t => 6000 * workday(t) + 300),
    report: series(xDay, 25, t => 900 * workday(t)),
    vf: series(xDay, 26, t => 4200 * workday(t)),
    appCpu: series(xDay, 27, t => 21e6 * workday(t) * (after(t) ? 1.24 : 1)),
    dbCpu: series(xDay, 28, t => 7.2e6 * workday(t) * (after(t) ? 1.12 : 1)),
    concApex: series(xDay, 29, t => after(t) ? 2.2 * workday(t) : 0.2 * workday(t), { noise: 0.9, round: true, spikes: [{ t: '2026-11-04T10:40:00Z', w: 30, v: 9 }] }),
    rowlock: series(xDay, 30, t => (after(t) ? 1.1 : 3.4) * workday(t), { noise: 0.9, round: true }),
    cpuTimeout: series(xDay, 31, t => 0.3 * workday(t), { noise: 1, round: true }),
    uiTime: series(xDay, 32, t => (after(t) ? 590 : 505) * (0.4 + workday(t))),
    reportTime: series(xDay, 33, t => 1800 * (0.3 + workday(t)), { spikes: [{ t: '2026-11-03T16:20:00Z', w: 10, v: 96000 }] }),
    soapTime: series(xDay, 34, t => 420 * (0.6 + workday(t))),
    restTime: series(xDay, 35, t => 160 * (0.6 + workday(t))),
    loginsOk: series(xDay, 36, t => 140 * workday(t) + 18, { round: true }),
    loginsKo: series(xDay, 37, t => 1.5 * workday(t), { noise: 1, round: true }),
    syncCallout: series(xDay, 38, t => 80 + 70 * workday(t), { noise: 0.5 }),
    asyncCallout: series(xDay, 39, t => 340 + 40 * workday(t), { noise: 0.1 }),
    calloutErr5xx: series(xDay, 40, t => 25 * workday(t), { noise: 0.6, spikes: [{ t: '2026-11-03T11:30:00Z', w: 20, v: 1900 }] }),
    calloutErr4xx: series(xDay, 41, t => 10 * workday(t), { noise: 0.6 })
  };

  window.ORGS.wdf = {
    key: 'wdf', name: 'Watt De France', short: 'WDF',
    slogan: '« Changeons d\'énergie… mais pas en prod un vendredi »',
    orgId: '00DWD0000000wAtT',

    alerts: {
      email: 'astreinte-salesforce@wattdefrance.example',
      settings: [
        ['Async Apex Executions Limit', 'Background tasks queued for processing reach their limit. Common causes include inefficient Apex or poor API call setup. Unlike synchronous code, these tasks run when resources become available rather than executing immediately.'],
        ['DB CPU Consumption Throttles', 'Database requests execute slower than the threshold, excluding time spent on code compilation or external callouts.'],
        ['Row Lock Timeout Errors', 'Multiple processes attempt to simultaneously update the same record, exceeding the timeout limit. Common causes include parent-child data skew, failing API or Apex triggers, and concurrent Email-to-Case updates.']
      ],
      active: [],
      cleared: [['Row Lock Timeout Errors', 'Nov 2, 2026, 9:40 AM UTC', 'Nov 2, 2026, 11:10 AM UTC', '48 errors / 10 min (threshold 40)']]
    },

    overview: {
      period: 'Tue, 03 Nov 2026, 2:00–3:00 PM UTC', rps: 24,
      details: {
        apex: { counts: { critical: 4, major: 1, minor: 0 }, rows: [
          ['Lightning', 'WDF_ConsoController.getHistorique', 4120, 5120.4, 212, 3410.2, 1410.3, 2980.1, 0, 26],
          ['Batch', 'WDF_AP214_ReleveBatch.execute', 96, 8120.4, 61, 2210.2, 4120.4, 1910.3, 0, 12],
          ['Visualforce', 'VF- /apex/WDF_AP152_EditionFacture', 1210, 1410.2, 18, 310.2, 620.1, 240.3, 0, 14],
          ['Synchronous', 'WDF_CaseBeforeUpdate', 6120, 610.2, 0, 220.4, 210.3, 180.2, 61.1, 9],
          ['Future', 'WDF_AP331_FacturNetWS.envoyerFacture(Id)', 2210, 2120.4, 41, 120.1, 80.3, 60.2, 0, 3]] },
        soql: [['Apex', 'Class: WDF_AP087_FactureService', 'calculer', 140, 41.2, 52.1, 9120, 1204.4, 410], ['Apex', 'Class: WDF_ConsoController', 'getHistorique', 25, 28.3, 11.2, 182300, 24.8, 24], ['Apex', 'Class: WDF_AP214_ReleveBatch', 'execute', 88, 12.4, 0, 96, 1210.3, 2000], ['Apex', 'Package: AlloWatt', '', null, 1.1, 0, 2210, 3.4, 1], ['Apex', 'Class: WDF_Utils', 'getRecordTypes', 1102, 1.0, 0, 61200, 1.1, 18]],
        errors: [['WDF_AP331_FacturNetWS', 64, 'Error Connecting to FacturNet'], ['WDF_CaseBeforeUpdate', 12, 'Argument 1 cannot be null'], ['WDF_ConsoController', 31, 'System.LimitException: Apex CPU time limit exceeded'], ['WDF_CompteurTriggerHandler', 9, 'FIELD_CUSTOM_VALIDATION_EXCEPTION'], ['WDF_WS210_EspaceClient', 4, 'INVALID_EMAIL_ADDRESS']]
      },
      error: { count: 93, type: 'Concurrent Apex Errors', period: 'Wed, 04 Nov 2026, 10:20–11:20 AM UTC', pct: 3900 },
      trend: { x: times('2026-11-02T00:00:00Z', 7 * 24, 60), seed: 51, peak: 1.46e6, peakAt: D('2026-11-03T14:00:00Z') },
      top3: [
        { title: 'Fix the Slow Apex Classes', impact: 'User Experience Time', issue: 'These Apex entry points contribute the most to overall runtime:', items: ['WDF_ConsoController.getHistorique', 'WDF_AP214_ReleveBatch', 'VF- /apex/WDF_AP152_EditionFacture'], fix: 'Reduce the database time associated with these entry points to improve the user experience.' },
        { title: 'Fix the Expensive SOQL Queries', impact: 'Long Running Transactions', issue: 'SOQL queries in these classes are the biggest contributors to DB CPU time:', items: ['Class WDF_AP087_FactureService', 'Class WDF_ConsoController', 'Class WDF_AP214_ReleveBatch'], fix: 'Improve selectivity, filter conditions and indexing, and remove query anti-patterns.' },
        { title: 'Fix the Critical Apex Errors', impact: 'Apex Transactions', issue: 'These Apex errors dominate:', items: ['WDF_AP331_FacturNetWS.envoyerFacture'], fix: 'Depending on the error: data model, formula fields, bulkification, Platform Cache and other anti-patterns.' }
      ]
    },

    orgPerf: {
      range: 'Nov 3, 2026, 6:00 AM - Nov 4, 2026, 6:00 AM UTC', x: xDay,
      tiles: [['Successful Logins', '16,1K'], ['Failed Logins', '71'], ['Concurrent Apex Errors', '31'], ['Concurrent UI Errors', '0'], ['Row Lock Errors', '164'], ['Total Callout Errors', '9,8K']],
      charts: [
        { title: 'Total Execution Errors (errors/10 mins)', sub: 'Total number of execution errors per 10 minutes', yLabel: 'Total Execution Errors', series: [['Apex CPU Timeout Errors', op.cpuTimeout], ['Concurrent Apex Errors', op.concApex], ['Concurrent API Request Errors', op.cpuTimeout.map(v => v * 0)], ['Concurrent UI Errors', op.cpuTimeout.map(v => 0)], ['Connection Pool Errors', op.cpuTimeout.map(v => 0)], ['Rowlock Timeout Errors', op.rowlock]] },
        { title: 'Average Request Time (ms)', sub: 'Average time for the platform to process and send requests per 10 minutes', yLabel: 'Average Request Time (ms)', series: [['Average Apex REST API Request Time', op.restTime.map(v => v * 1.6)], ['Average Apex SOAP API Request Time', op.soapTime], ['Average Report Request Time', op.reportTime], ['Average REST API Request Time', op.restTime], ['Average SOAP API Request Time', op.soapTime.map(v => v * 0.4)], ['Average UI Request Time', op.uiTime], ['Average Visualforce Remoting Request Time', op.uiTime.map(v => v * 0.3)], ['Average Visualforce Request Time', op.uiTime.map(v => v * 0.55)]] },
        { title: 'Total Request Volume (requests/10 mins)', sub: 'Total number of requests broken down by request type per 10 minutes', yLabel: 'Total Request Volume', series: [['Apex REST API Requests', op.rest.map(v => v * 0.4)], ['Apex SOAP API Requests', op.soap], ['Report Requests', op.report], ['REST API Requests', op.rest], ['SOAP API Requests', op.soap.map(v => v * 0.5)], ['Total Requests', op.volumeTotal], ['UI Requests', op.ui], ['Visualforce Remoting Requests', op.vf.map(v => v * 0.2)], ['Visualforce Requests', op.vf]] },
        { title: 'Total CPU Time (ms)', sub: 'Total CPU time spent on user code execution per 10 minutes', yLabel: 'Total CPU Time (ms)', series: [['Total App CPU Time', op.appCpu], ['Total DB CPU Time', op.dbCpu]] },
        { title: 'Total Logins (logins/10 mins)', sub: 'Total number of successful and failed logins per 10 minutes', yLabel: 'Total Logins', series: [['Failed Logins', op.loginsKo], ['Successful Logins', op.loginsOk]] },
        { title: 'Average Callout Time (ms)', sub: 'Average time for platform to perform a callout to an external endpoint per 10 minutes', yLabel: 'Callout Time (ms)', series: [['Async Callout Time (ms)', op.asyncCallout, true], ['Sync Callout Time (ms)', op.syncCallout]] },
        { title: 'Total Callout Errors (errors/10 mins)', sub: 'Total number of errors encountered while making a callout to an external endpoint', yLabel: 'Total Callout Errors', series: [['4XX Async Callout Errors', op.calloutErr4xx.map(v => v * 0.2)], ['4XX Sync Callout Errors', op.calloutErr4xx], ['5XX Async Callout Errors', op.calloutErr5xx.map(v => v * 0.05)], ['5XX Sync Callout Errors', op.calloutErr5xx], ['Other Async Callout Errors', op.calloutErr4xx.map(v => v * 0.1)], ['Other Sync Callout Errors', op.calloutErr4xx.map(v => v * 0.3)]] }
      ]
    },

    analysis: { reports: ['wdf-cons-1'] },

    deployment: {
      deployments: [['Oct 14, 2026, 6:02 PM UTC', '0AfWD000000Oc14'], ['Oct 20, 2026, 9:15 AM UTC', '0AfWD000000Oc20'], ['Oct 27, 2026, 7:48 PM UTC', '0AfWD000000Oc27'], ['Nov 2, 2026, 6:30 PM UTC', '0AfWD000000Mon26'], ['Nov 3, 2026, 2:10 PM UTC', '0AfWD000000Tue26'], ['Nov 4, 2026, 11:05 AM UTC', '0AfWD000000Fai26'], ['Nov 5, 2026, 7:30 PM UTC', '0AfWD000000Fix26']],
      reports: [
        {
          id: '0AfWD000000Tue26', label: '0AfWD000000Tue26 Nov 1, 2026, 12:00 AM - Nov 6, 2026, 11:59 PM UTC', generated: 'on Nov 7, 2026, 9:12 AM UTC',
          successful: 2, failed: 1,
          key: [['Total number of errors decreased <b class="good">22%</b> after deployment.', 1], ['App CPU Time increased <b class="bad">85%</b> after deployment.', 0], ['Infrastructure performance decreased by <b class="bad">45%</b> after deployment.', 0]],
          x: xWeek, volume, markers: [{ x: D('2026-11-02T18:30:00Z'), label: '0AfWD000000Mon26' }, { x: TUE, label: '0AfWD000000Tue26' }, { x: D('2026-11-04T11:05:00Z'), label: '0AfWD000000Fai26', color: '#c23934' }],
          errors: { takeaways: [['Row Lock Timeouts decreased 88% after deployment.', 1], ['Concurrent Apex Errors increased 400% after deployment.', 0], ['Callout Failures decreased 8% after deployment.', 1]], cats: ['Callout Failures', 'Row Lock Timeouts', 'Concurrent Apex Errors', 'Connection Pool Errors'], before: [1180, 412, 25, 3], after: [1086, 50, 125, 3] },
          perf: { takeaways: [['Average SOAP API Request Time decreased 2% after deployment.', 1], ['Average UI Request Time increased 60% after deployment.', 0], ['Average REST API Request Time increased 4% after deployment.', 0], ['App CPU Time increased 85% after deployment.', 0], ['DB CPU Time increased 30% after deployment.', 0]], cats: ['Average SOAP\nAPI Request Time', 'Average UI\nRequest Time', 'Average REST\nAPI Request Time', 'App CPU Time', 'DB CPU Time'], before: [5980, 3020, 3840, 1460, 460], after: [5860, 4830, 3990, 2700, 600] },
          rowlock: [['/aura', 'Compteur__c', 'a1P', 21], ['WDF_AP214_ReleveBatch', 'Compteur__c', 'a1P', 9], ['/aura', 'Case', '500', 6], ['/services/data/v62.0/composite', 'Releve__c', 'a2R', 3]],
          ux: [['/lightning/r/Contrat_Energie__c/&lt;id&gt;/view', 18420, -412, 0.9, 410], ['/lightning/o/Case/list', 9310, -150, 0.0, 20], ['/lightning/r/Case/&lt;id&gt;/view', 64220, -980, 0.1, 30], ['/lightning/r/Compteur__c/&lt;id&gt;/view', 7020, -88, 0.2, 60], ['/one/one.app', 5100, -640, -0.1, -40]],
          soap: [['envoyerFacture', 'WDF_AP331_FacturNetWS', 0.42, 1.1, 0.38, 0, 61, 9], ['majCompteur', 'WDF_AP120_CompteoWS', -0.31, -0.4, -0.2, 0, -28, -4], ['creerIntervention', 'WDF_AP340_InterventionWS', 0.05, 0.0, 0.02, 0, 4, 0]],
          rest: [['GET', '/WDF/v1/releves', 0.21, 0.6, 0.18, 0.1, 22, 2]],
          infra: [['Lightning', 'WDF_ConsoController.getHistorique', 9.36, 14.4, 8.7, 5.1, 1150.2, 640], ['Lightning', 'WDF_ContratController.getResume', 0.08, 0.0, 0.05, 0.02, 6.2, 0], ['Future', 'WDF_AP214_ReleveService.majAsync', 0.11, 0.0, 0.09, 0.14, 4.1, 0], ['Trigger', 'WDF_CompteurTriggerHandler', -0.74, -0.2, -0.61, -0.92, -95.3, -3], ['Other', 'SLA-MilestoneCompleted', -0.02, 0, -0.01, -0.03, -2.4, 0]]
        },
        {
          id: '0AfWD000000Fix26', label: '0AfWD000000Fix26 Nov 3, 2026, 12:00 AM - Nov 8, 2026, 11:59 PM UTC', generated: 'on Nov 9, 2026, 8:47 AM UTC',
          successful: 1, failed: 0,
          key: [['App CPU Time decreased <b class="good">45%</b> after deployment.', 1], ['Average UI Request Time decreased <b class="good">35%</b> after deployment.', 1], ['Total number of errors decreased <b class="good">11%</b> after deployment.', 1]],
          x: times('2026-11-03T00:00:00Z', 6 * 144, 10), volume: series(times('2026-11-03T00:00:00Z', 6 * 144, 10), 12, t => 262000 * workday(t), { noise: 0.09 }), markers: [{ x: FIX, label: '0AfWD000000Fix26' }],
          errors: { takeaways: [['Concurrent Apex Errors decreased 82% after deployment.', 1], ['Callout Failures decreased 3% after deployment.', 1]], cats: ['Callout Failures', 'Row Lock Timeouts', 'Concurrent Apex Errors', 'Connection Pool Errors'], before: [1090, 52, 122, 3], after: [1057, 50, 22, 2] },
          perf: { takeaways: [['App CPU Time decreased 45% after deployment.', 1], ['Average UI Request Time decreased 35% after deployment.', 1], ['DB CPU Time decreased 22% after deployment.', 1]], cats: ['Average SOAP\nAPI Request Time', 'Average UI\nRequest Time', 'Average REST\nAPI Request Time', 'App CPU Time', 'DB CPU Time'], before: [5860, 4830, 3990, 2700, 600], after: [5830, 3140, 3900, 1485, 468] },
          rowlock: [['/aura', 'Compteur__c', 'a1P', 8], ['/aura', 'Case', '500', 5]],
          ux: [['/lightning/r/Contrat_Energie__c/&lt;id&gt;/view', 18810, 390, -0.8, -350], ['/lightning/r/Case/&lt;id&gt;/view', 63900, -320, 0.0, -5], ['/lightning/o/Case/list', 9200, -110, 0.0, 0], ['/lightning/r/Compteur__c/&lt;id&gt;/view', 7110, 90, -0.1, -20], ['/one/one.app', 5050, -50, 0.0, 0]],
          soap: [['envoyerFacture', 'WDF_AP331_FacturNetWS', 0.03, 0.1, 0.02, 0, 3, 0]],
          rest: [['GET', '/WDF/v1/releves', -0.02, 0, -0.01, 0, -2, 0]],
          infra: [['Lightning', 'WDF_ConsoController.getHistorique', -8.58, -13.5, -8.1, -4.8, -1120.4, -610], ['Trigger', 'WDF_CompteurTriggerHandler', -0.03, 0, -0.02, -0.01, -1.2, 0], ['Lightning', 'WDF_ContratController.getResume', 0.01, 0, 0.01, 0, 0.8, 0]]
        }
      ]
    },

    lex: {
      reports: ['Nov 2, 2026 - Nov 8, 2026', 'Oct 26, 2026 - Nov 1, 2026'],
      kpis: [['First Page EPT (ms)', '5 420'], ['Subsequent Page EPT (ms)', '1 180'], ['Total Page Views', '1,1M'], ['First Page Views, % of Total', '5,8%']],
      insights: [
        'Your org has an average of <b>4</b> components per page. This matches our suggested best practice.',
        'Reload pages faster with <a>Secure Browser Caching</a>. The feature is enabled in your org.',
        'Start using Lightning framework (bootstrap) with <a>Lightning CDN</a>. Turn it on to improve first page Experienced Page Time.',
        'Group multiple server-side actions into single network request using <a>Dynamic Boxcar\'ing</a>. This feature is enabled in your org.',
        'Of all Apex actions, <b>0 %</b> are currently served from the cache. Higher cache hit rates reduce server load and improve page load times.',
        'The following Apex actions affect your Experienced Page Time (EPT). Review and optimize these actions to improve page performance.'
      ],
      apexActions: ['c:WDF_ConsoController.getHistorique', 'c:WDF_ContratController.getResume', 'c:WDF_AP152_EditionFacture.genererPdf'],
      trends: { x: times('2026-11-02T00:00:00Z', 7 * 48, 30), seed: 61, spikeAt: '2026-11-03T15:00:00Z' },
      regions: { France: 1150, Morocco: 1720, Tunisia: 1880, Senegal: 2350, Belgium: 1240, Spain: 1460, Portugal: 1510, Madagascar: 3120, Mauritius: 2210, Switzerland: 1190, Canada: 2600 },
      browsers: { cats: ['Chrome', 'Edge', 'Firefox', 'Safari'], ept: [1420, 1610, 1380, 4880], pv: [1004210, 61230, 30310, 9] },
      pages: [['/lightning/page/home', 3, 1210, 0.11, 17320], ['/lightning/r/Contrat_Energie__c/&lt;id&gt;/view', 14, 243100, 22.04, 6380], ['/lightning/r/Case/&lt;id&gt;/view', 19, 401220, 36.37, 1840], ['/lightning/r/Account/&lt;id&gt;/view', 11, 30110, 2.73, 1690], ['/lightning/r/Compteur__c/&lt;id&gt;/view', 9, 70230, 6.37, 1470], ['/lightning/o/Case/list', 4, 51210, 4.64, 980], ['/lightning/r/Facture__c/&lt;id&gt;/view', 8, 46200, 4.19, 930], ['/lightning/o/Intervention__c/list', 5, 22080, 2.0, 870], ['/lightning/r/Intervention__c/&lt;id&gt;/view', 7, 31090, 2.82, 820], ['/lightning/o/Contrat_Energie__c/home', 3, 24400, 2.21, 610]],
      usage: { kpis: [['Average Page Views', '157,6K'], ['Total Page Views', '1,1M'], ['Average DAU', '1,2K']] }
    },

    apexguru: {
      dates: ['4 nov. 2026, 07:10 AM UTC', '7 oct. 2026, 07:02 AM UTC'],
      tabs: { code: 16, soql: 287, expensive: 6, unused: 104, tests: 41, dups: 77 },
      code: {
        counts: { critical: 2, major: 3, minor: 11 },
        critical: [
          { reco: 'Avoid executing SOQL queries inside loops. Query the records once, outside the loop, using a bind variable on the collection of Ids, then build the map using the map constructor.', cls: 'WDF_ConsoController', method: 'getHistorique', entry: 'c:WDF_ConsoController.getHistorique, LWC wdfSuiviConso, VF- /apex/WDF_AP152_EditionFacture',
            current: [[18, 'Map<Id, List<Releve__c>> relevesParCompteur = new Map<Id, List<Releve__c>>();'], '...', [24, 'for (Compteur__c cpt : compteurs) {'], [25, '    List<Releve__c> rels = [SELECT Id, Index__c, Date_Releve__c, Conso_kWh__c'], [26, '                            FROM Releve__c'], [27, '                            WHERE Compteur__c = :cpt.Id'], [28, '                            ORDER BY Date_Releve__c DESC LIMIT 24];'], [29, '    relevesParCompteur.put(cpt.Id, rels);'], [30, '}']],
            recommended: [[24, '// The query was executed once per meter (N+1 pattern). Query all readings once,'], [25, '// filtered on the set of meter Ids, then group them in memory.'], [26, 'Map<Id, List<Releve__c>> relevesParCompteur = new Map<Id, List<Releve__c>>();'], [27, 'for (Releve__c r : [SELECT Id, Compteur__c, Index__c, Date_Releve__c, Conso_kWh__c'], [28, '                   FROM Releve__c'], [29, '                   WHERE Compteur__c IN :new Map<Id, Compteur__c>(compteurs).keySet()'], [30, '                   AND Date_Releve__c = LAST_N_MONTHS:24'], [31, '                   ORDER BY Date_Releve__c DESC]) {'], [32, '    if (!relevesParCompteur.containsKey(r.Compteur__c)) {'], [33, '        relevesParCompteur.put(r.Compteur__c, new List<Releve__c>());'], [34, '    }'], [35, '    relevesParCompteur.get(r.Compteur__c).add(r);'], [36, '}']] },
          { reco: 'To consume less resources, build the map from a list of sObjects using the map constructor. Don\'t manually build a map using a FOR loop and put().', cls: 'WDF_CompteurTriggerHandler', method: 'chargerContrats', entry: 'TRIGGERS, WDF_AP214_ReleveBatch, /services/data/v62.0/composite',
            current: [[41, 'Map<Id, Contrat_Energie__c> contrats = new Map<Id, Contrat_Energie__c>();'], '...', [44, 'for (Contrat_Energie__c c : [SELECT Id, Statut__c, Puissance_kVA__c'], [45, '                              FROM Contrat_Energie__c WHERE Id IN :idsContrat]) {'], [46, '    contrats.put(c.Id, c);'], [47, '}']],
            recommended: [[44, 'Map<Id, Contrat_Energie__c> contrats = new Map<Id, Contrat_Energie__c>(['], [45, '    SELECT Id, Statut__c, Puissance_kVA__c'], [46, '    FROM Contrat_Energie__c WHERE Id IN :idsContrat]);']] }
        ],
        major: [
          { reco: 'Avoid using Schema.getGlobalDescribe() in Apex. This method causes unnecessary overhead, decreases performance, and increases the latency of the associated entry point.', cls: 'WDF_Utils', method: 'getLibelleObjet', entry: 'WDF_ContratController.getResume',
            current: [[212, 'String label = Schema.getGlobalDescribe().get(sObjName).getDescribe().getLabel();']],
            recommended: [[212, 'Schema.DescribeSObjectResult result = null;'], [213, 'try {'], [214, '    List<Schema.DescribeSObjectResult> d = Schema.describeSObjects('], [215, '        new String[]{ sObjName }, SObjectDescribeOptions.DEFERRED);'], [216, '    result = d[0];'], [217, '} catch (InvalidParameterValueException ipve) {'], [218, '    result = null;'], [219, '}'], [220, 'String label = result?.getLabel();']] }
        ],
        minor: [
          { reco: 'To consume less resources, build the map from a list of sObjects using the map constructor. Don\'t manually build a map using a FOR loop and put().', cls: 'WDF_AP402_ExportFactures', method: 'chargerComptes', entry: 'N/A',
            current: [[63, 'Map<Id, Account> comptes = new Map<Id, Account>();'], '...', [65, 'for (Account a : [SELECT Id, Name FROM Account WHERE Id IN :ids]) {'], [66, '    comptes.put(a.Id, a);'], [67, '}']],
            recommended: [[65, 'Map<Id, Account> comptes = new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Id IN :ids]);']] }
        ]
      },
      soql: {
        counts: { critical: 3, major: 96, minor: 188 },
        items: [
          { diag: 'Consider merging multiple SOQL queries on the same sObject into one query to reduce database round trips and improve performance.', type: 'Redundant SOQL', cls: 'WDF_ContratController', method: 'getResume', entry: 'c:WDF_ContratController.getResume',
            current: [[88, 'Contrat_Energie__c c = [SELECT Id, Statut__c FROM Contrat_Energie__c WHERE Id = :recordId];'], '...', [97, 'Contrat_Energie__c c2 = [SELECT Id, Puissance_kVA__c, Option_Tarifaire__c'], [98, '                         FROM Contrat_Energie__c WHERE Id = :recordId];']],
            recommended: [[88, '// Both queries read the same record: merge them into a single query.'], [89, 'Contrat_Energie__c c = [SELECT Id, Statut__c, Puissance_kVA__c, Option_Tarifaire__c'], [90, '                        FROM Contrat_Energie__c WHERE Id = :recordId];']] },
          { diag: 'To minimize query execution time and reduce API consumption, cache this SOQL query using the <a>Salesforce Platform Cache</a>.', type: 'Platform Cache for SOQL Results', cls: 'WDF_Utils', method: 'getRecordTypes', entry: 'TRIGGERS, WDF_CaseBeforeUpdate, WDF_ConsoController.getHistorique, Show more',
            current: [[1102, 'for (RecordType rt : [SELECT Id, DeveloperName, SobjectType FROM RecordType WHERE SobjectType IN :types AND IsActive = true]) {']],
            recommended: [[1102, 'Map<String, Id> rts = (Map<String, Id>) Cache.Org.get(\'local.WDF.recordTypes\');'], [1103, 'if (rts == null) { rts = WDF_Utils.loadRecordTypes(types); Cache.Org.put(\'local.WDF.recordTypes\', rts); }']] }
        ]
      },
      expensive: { critical: ['WDF_ConsoController.getHistorique_rMap$$lId$$cList$$lReleve__c$$r$$r_0List$$lCompteur__c$$r', 'WDF_AP214_ReleveBatch.execute_rvoid_0Database.BatchableContext_1List$$lSObject$$r'], other: ['WDF_AP087_FactureService.calculer_rDecimal_0Id', 'WDF_CaseBeforeUpdate.handle_rvoid_0List$$lCase$$r', 'WDF_Utils.getRecordTypes_rMap$$lString$$cId$$r_0List$$lString$$r', 'WDF_AP331_FacturNetWS.envoyerFacture_rvoid_0Id'] },
      unused: [['WDF_AP402_ExportFactures', [[212, 'exporterCsvV1(List<Facture__c>)', 4210], [388, 'exporterCsvV2(List<Facture__c>)', 4388], [611, 'testDebugTemporaire()', 96]]], ['WDF_Utils', [[44, 'getLibelleObjetOld(String)', 512], [970, 'formaterPDLAncien(String)', 288]]], ['WDF_AP099_MigrationTarif2019', [[12, 'migrer()', 6120], [180, 'rollback()', 2210]]], ['WDF_TriggerHandler', [[14, 'beforeDelete(List<SObject>, Map<Id,SObject>)', 8], [22, 'afterUndelete(List<SObject>, Map<Id,SObject>)', 8]]]],
      tests: {
        counts: { critical: 0, major: 41, minor: 0 },
        items: [
          { diag: 'No code path in the existing tests reaches this line or branch.', type: 'Untested Code Path', cls: 'WDF_ConsoController.cls', method: 'getHistorique', testClass: 'NEW', testMethod: 'getHistorique_CompteurSansReleve_RetourneListeVide',
            current: [[3, 'N/A']],
            recommended: [[1, '@isTest'], [2, 'private class WDF_ConsoController_Test {'], [3, '    /**'], [4, '     * Coverage Status: COMPREHENSIVE'], [5, '     * Logical Branch: meter without any reading'], [6, '     * Description: returns an empty list instead of throwing'], [7, '     */'], [8, '    @isTest'], [9, '    static void getHistorique_CompteurSansReleve_RetourneListeVide() {'], [10, '        Compteur__c cpt = new Compteur__c(PDL__c = \'00000000000042\');'], [11, '        insert cpt;'], [12, '        Test.startTest();'], [13, '        Map<Id, List<Releve__c>> res = WDF_ConsoController.getHistorique(new List<Compteur__c>{ cpt });'], [14, '        Test.stopTest();'], [15, '        System.assertEquals(0, res.get(cpt.Id).size(), \'No reading expected\');'], [16, '    }'], [17, '}']] },
          { diag: 'Salesforce recommends that you use @IsTest in case testMethod is versioned out in the future. See <a>IsTest Annotation</a> in the Apex Developer Guide.', type: 'Deprecated testMethod Keyword', cls: 'WDF_AP087_FactureService_Test', method: 'testCalcul', current: [[31, 'static testMethod void testCalcul() {']], recommended: null }
        ]
      },
      dups: {
        counts: { high: 9, medium: 6, low: 62 }, chars: '312K',
        items: [
          { head: 'WDF_AP401_ExportContrats.cls + 8 more files', badges: ['File', 'Medium Effort', '~ Near Duplicate'], note: '9 similar copies | 38K characters to remove', diag: 'These 9 classes share ~95% of their code but handle different entities. Extract the common logic (~95% of code) into a shared abstract base class; each subclass overrides only the entity-specific parts. Varying identifiers: WDF_AP401_ExportContrats -> WDF_AP402_ExportFactures, WDF_AP403_ExportReleves…', pattern: 'Extract Shared Base Class', members: [['WDF_AP401_ExportContrats.cls', null, 4310], ['WDF_AP402_ExportFactures.cls', null, 4298], ['WDF_AP403_ExportReleves.cls', null, 4301], ['WDF_AP404_ExportInterventions.cls', null, 4280], ['WDF_AP405_ExportCompteurs.cls', null, 4276]] },
          { head: 'WDF_AP120_CompteoWS.cls + 2 more files', badges: ['Method', 'Low Effort', '✓ Exact'], note: '3 identical copies | 22K characters to remove', diag: 'Identical code in 3 places. Extract into a single shared method in a shared utility class and replace all 3 call sites.', pattern: 'Extract Shared Method', members: [['WDF_AP120_CompteoWS.appelerApi', 'Lines 40–410', 11020], ['WDF_AP331_FacturNetWS.appelerApi', 'Lines 52–421', 11020], ['WDF_AP340_InterventionWS.appelerApi', 'Lines 18–387', 11020]] }
        ]
      }
    },

    database: {
      reports: ['Nov 2, 2026, 12:00 AM - Nov 8, 2026, 11:59 PM UTC'],
      top: [[24810, 182300, 'Yes', 'Releve__c', 'WDF_ConsoController.getHistorique', 'SELECT Id, Index__c, Date_Releve__c, Conso_kWh__c FROM Releve__c WHERE Compteur__c = :cpt.Id ORDER BY…'], [11220, 9120, 'No', 'Facture__c, Contrat_Energie__c', 'WDF_AP087_FactureService.calculer', 'SELECT Id, Montant_TTC__c, Contrat__r.Option_Tarifaire__c FROM Facture__c WHERE Statut__c != \'Annulée\' AND…'], [6410, 2210, 'No', 'Case', 'API Call', 'SELECT Id, CaseNumber, Status, Owner.Name, Contrat__r.Name FROM Case WHERE Status = \'Nouveau\' AND…'], [512, 3010, 'No', 'N/A', 'API Call', 'Missing SOQL. Use entry point to identify.'], [4980, 1430, 'No', 'Compteur__c', 'WDF_AP214_ReleveBatch.execute', 'SELECT Id, PDL__c, Dernier_Index__c FROM Compteur__c WHERE Date_Dernier_Releve__c < :seuil…']],
      regressed: { counts: { critical: 1, major: 1, minor: 0 }, rows: [[198220100, 'SELECT Id, Index__c, Date_Releve__c, Conso_kWh__c FROM Releve__c WHERE Compteur__c = :cpt.Id…', 182300, 412.6, 'Avoid executing this query inside a loop. Query once using a bind variable on a collection.'], [8120400, 'SELECT COUNT() FROM CaseHistory WHERE …', 88, 96.1, 'Add a restrictive date filter condition. Adding a date filter can make a query efficient.']] },
      qpa: 'SELECT Id, Index__c FROM Releve__c WHERE Compteur__c = \'a1PWD0000001AbC\' AND Statut__c = \'Validé\'',
      devconsole: { rows: [[24, 'Compteur__c', 'Index', '0,00001', '2 410 220'], [0, '', 'TableScan', '0,92', '2 410 220']], notes: ['Not considering filter for optimization because unindexed. Table: Releve__c Fields: ["Statut__c"]'] }
    },

    governor: {
      reports: ['Nov 2, 2026, 12:00 AM - Nov 8, 2026, 11:59 PM UTC'],
      key: 'Your top consumers this week — <b>Concurrent UI Requests</b>, <b>Async Apex Execution Limit</b>, and <b>API Request Limit</b> — all stayed within their governor limits.',
      counts: { critical: 0, major: 0, safe: 8 },
      tiles: [['API Request Limit', '24 Hour Rolling Governor Limit of 6 200 000', '7,1%'], ['Async Apex Execution Limit', '24 Hour Rolling Governor Limit of 750 000', '22,4%'], ['Bulk API 2.0 Rows Limit', '24 Hour Rolling Governor Limit of 150 000 000', '0,3%'], ['Bulk API Batches Limit', '24 Hour Rolling Governor Limit of 15 000', '0,1%'], ['Concurrent Apex', 'Governor Limit of 50', '14%'], ['Concurrent API Calls', 'Governor Limit of 50', '6%'], ['Concurrent UI Requests', 'Governor Limit of 50', '18%'], ['High Volume Platform Events Published', 'Governor Limit of 250 000', '0,4%']],
      detail: { name: 'API Request Limit', limit: 6.2e6, takeaways: ['Utilization is below 60%. No immediate action needed.', 'APIs Contributing: <b>REST</b> drove the most API requests, at <b>310 220</b> calls.', 'Top API Source URLs: The top source URL <b>Releve__c</b> drove <b>120 410</b> requests.', 'API Top Callers: Top caller <b>Compteo Integration</b> issued <b>118 900</b> requests.'], apis: [['REST', '310 220', '41 220 100', '132,9'], ['SOAP', '96 140', '30 880 400', '321,2'], ['Apex REST', '22 010', '19 310 220', '877,3'], ['Apex SOAP', '61 200', '25 920 000', '423,5']], urls: [['Apex REST', '/WDF/v1/releves', '120 410', '96,4'], ['SOAP API', 'Facture__c', '41 200', '51,2'], ['REST API', 'Compteur__c', '22 300', '38,9']], callers: [['REST', 'Releve__c', '', 'Standard', '118 900', '95,1'], ['SOAP', 'Facture__c', '', 'Standard', '40 220', '50,8']] }
    },

    report: {
      reports: ['Nov 2, 2026, 12:00 AM - Nov 8, 2026, 11:59 PM UTC'],
      rows: [['00OWD000000Kw1946', 'Conso de tout le monde depuis 1946', 13820, 413.9, '5,7M'], ['00OWD000000Rel24h', 'Relevés anormaux 24 h', 380, 1152, '438,1K'], ['00OWD000000FacImp', 'Factures impayées par agence', 1110, 562.1, '599,2K'], ['00OWD000000IntJ1', 'Interventions J+1', 2810, 327.6, '918,2K'], ['00OWD000000CasOld', 'Cases ouverts > 30 jours', 262, 467.4, '122,5K'], ['00OWD000000PDLx', 'PDL sans relevé', 682, 432, '294,6K']]
    },

    search: {
      never: [['WDF_Log_Import__c', 812400], ['WDF_Archive_Releve_2019__c', 433120], ['Parametre_Tarif__c', 188200], ['WDF_Temp_Migration__c', 104300], ['WDF_Histo_Tarif__c', 71220]],
      noclick: [['Releve__c', 24120], ['Intervention__c', 21880], ['Facture__c', 19210], ['Compteur__c', 9430], ['WDF_Agence__c', 2110]]
    }
  };
})();

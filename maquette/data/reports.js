/* =========================================================================
   Rapports Performance Analysis (Consolidated Report = 1 onglet par analyse)
   Tout est fictif. Les rapports lancés pendant la démo réutilisent le
   rapport « modèle » de l'org (template) avec le nom et la fenêtre choisis.
   ========================================================================= */
(function () {
  const { workday, times, series } = window.SCDATA;
  const D = (s) => Date.parse(s);
  const x24eng = times('2026-10-29T12:00:00Z', 144, 10);
  const x24wdf = times('2026-11-03T06:00:00Z', 144, 10);

  window.SC_REPORTS = {
    // ---------------------------------------------------------------- ENG
    'eng-cons-1': {
      org: 'eng', name: 'Fin de mois 30/10', type: 'Consolidated Report', requestor: 'Démo Présentateur',
      requestDate: '10/30/2026 11:42 UTC', start: D('2026-10-30T10:20:00Z'), end: D('2026-10-30T10:50:00Z'), status: 'Completed',
      chart: { x: x24eng, series: [['Average UI Request Time', series(x24eng, 81, t => 470 * (0.4 + workday(t)), { spikes: [{ t: '2026-10-30T10:35:00Z', w: 18, v: 1900 }] })], ['Average REST API Request Time', series(x24eng, 83, t => 190 * (0.6 + workday(t)))], ['Average Report Request Time', series(x24eng, 82, t => 1500 * (0.3 + workday(t)))]] },
      concurrency: { throttle: 'NO', deploy: 'NO', restart: 'NO', apexErr: 37, apiErr: 0, uiErr: 0, users: 29,
        donut: [['Database Time', 612400, '#4e79a7'], ['Apex Execution Time', 88200, '#f28e2b'], ['Workflow Time', 21100, '#e15759'], ['Validation Rule Time', 4300, '#76b7b2']] },
      takeaways: ['Limit the number of fields and records from SOQLs.', 'For these class names, reduce the number of loops or the amount of data executed in loops by the following ways:', ['Use bulkification to execute code outside of loops.', 'Ensure that queries from class names are <a>selective</a> to avoid querying large datasets from entities.', 'Avoid holding record locks (FOR UPDATE) for the whole duration of long transactions.']],
      apex: {
        donut: [['Database Time', 1802400], ['Lock Wait Time', 1210300], ['Apex Execution Time', 702100], ['Callout Time', 310200], ['Workflow Time', 98200], ['Validation Rule Time', 21000]],
        counts: { critical: 3, major: 2, minor: 9 },
        slow: {
          critical: [['Batch', 'ENG_BatchRemboursementMensuel', 212, 9120.4, 188, 1210.2, 6120.8, 980.1, 0, 101], ['Lightning', 'ENG_DemandeController.valider', 1840, 6840.2, 402, 310.4, 5210.3, 240.2, 18.1, 14], ['Lightning', 'ENG_GarantieService.getPlafonds', 3120, 840.6, 12, 120.2, 610.4, 60.3, 0, 6]],
          major: [['Future', 'ENG_ImprimEGWS.envoyerAsync', 410, 5410.2, 61, 40.2, 30.1, 20.4, 0, 3], ['Trigger', 'ENG_DecompteTrigger', 9210, 410.2, 0, 120.4, 260.3, 80.1, 30.2, 5]],
          minor: [['Lightning', 'ENG_AdherentController.getResume', 2210, 320.1, 0, 90.2, 180.4, 40.3, 0, 4], ['Visualforce', 'VF- /apex/ENG_EditionDecompte', 310, 1210.4, 4, 210.3, 520.1, 120.2, 0, 9]]
        },
        errors: [['ENG_DecompteService', 418, 'UNABLE_TO_LOCK_ROW, unable to obtain exclusive access to this record'], ['ENG_BatchRemboursementMensuel', 4, 'System.LimitException: Too many SOQL queries: 101'], ['ENG_ImprimEGWS', 11, 'Read timed out'], ['ENG_DemandeController', 3, 'Argument cannot be null']],
        soql: [['Apex', 'Class: ENG_PrestationSelector', 'getEnAttente', 58, 84.37, 97.2, 1210, 4920.6, 4120], ['Apex', 'Class: ENG_DecompteService', 'genererNumero', 31, 7.42, 21.2, 9210, 210.11, 1], ['Apex', 'Class: ENG_GarantieService', 'getPlafonds', 112, 2.38, 0, 3120, 62.3, 12], ['Apex', 'Class: ENG_BatchRemboursementMensuel', 'execute', 204, 2.05, 0, 212, 840.2, 2000], ['Apex', 'Class: ENG_AdherentSelector', 'getById', 22, 0.58, 0, 2210, 18.4, 1]],
        dml: [['Sequence_Numerotation__c', 'UPDATE', 9210, 30120], ['Decompte__c', 'INSERT', 9210, 1210], ['Demande_Remboursement__c', 'UPDATE', 8840, 980], ['Prestation__c', 'UPDATE', 22100, 610]]
      },
      database: {
        top: [{ v: 224400, cpu: 182300, freq: 1210, entry: 'ENG_PrestationSelector.getEnAttente', soql: 'SELECT Id, Montant__c, Adherent__c FROM Prestation__c WHERE Statut__c = \'En attente\'' }, { v: 168200, cpu: 120100, freq: 9210, entry: 'ENG_DecompteService.genererNumero', soql: 'SELECT Id, Dernier_Numero__c FROM Sequence_Numerotation__c WHERE Name = \'DECOMPTE\' LIMIT 1 FOR UPDATE' }, { v: 98200 }, { v: 81200 }, { v: 62100 }, { v: 51000 }, { v: 44300 }, { v: 31200 }, { v: 22100 }, { v: 18000 }],
        logTypes: [['URI', 3810400], ['Apex Batch', 2410200], ['Async Processing', 610200], ['Apex REST API', 410100], ['Reports', 210300], ['Apex SOAP WS', 98100]],
        entries: [['ENG_BatchRemboursementMensuel', 1810400], ['ENG_DemandeController.valider', 1402300], ['TRIGGERS-01qEG000000Dec01', 610200], ['ENG_GarantieService.getPlafonds', 302100], ['apex-//ENG_AdherentController/ACTION$getResume', 120400]],
        users: [['005EG000000Batch', 1810400], ['005EG000000Gest07', 210300], ['005EG000000Gest12', 198200]],
        dmlTypes: [['UPDATE', 41200], ['INSERT', 18400], ['DELETE', 120]],
        dmlEntity: [['UPDATE-Prestation__c', 22100], ['UPDATE-Sequence_Numerotation__c', 9210], ['INSERT-Decompte__c', 9210], ['UPDATE-Demande_Remboursement__c', 8840]],
        dmlUser: [['UPDATE-b2S-005EG000000Batch', 7120], ['INSERT-b1D-005EG000000Batch', 7100], ['UPDATE-a8D-005EG000000Gest07', 410]]
      },
      failedLogins: [['Failed: Invalid Password', 3], ['Failed: Computer activation required', 1]],
      flows: [['AfterSave Flow Trigger', 'a8D', '301EG000000aB1', '-', '300EG000000x01', 8840, 42, 610, 371, 'No'], ['BeforeSave Flow Trigger', 'b1D', '301EG000000aB2', '-', '300EG000000x02', 9210, 6, 88, 55, 'No'], ['Visual Flow', 'NONE', '301EG000000aB3', '-', '300EG000000x03', 61, 912, 2410, 56, 'No']],
      governor: { x: times('2026-10-30T10:20:00Z', 31, 1), hits: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], contrib: [['Batch Apex ENG_BatchRemboursementMensuel.execute', 'Too many SOQL queries: 101', 4], ['/aura ENG_DemandeController.valider', 'Apex CPU time limit exceeded', 1]] },
      integrations: { api: [['/ENG/v1/tierspay', 'Apex REST', 'POST', 9120, 310, 3.4, 1, 1210, 410, 620, 0], ['/ENG/v1/adherents', 'Apex REST', 'GET', 2210, 0, 0, 12, 140, 60, 40, 0]], callouts: [['"https://api.imprimeg.example/v2/editique/decomptes"', 'POST', '200', 410, 61, 15, 4120, 1210], ['"https://api.imprimeg.example/v2/editique/decomptes"', 'POST', '-1', 11, 11, 100, 10009, -1]] },
      listviews: { lv: [['00BEG000000Lv01', 'Demande_Remboursement__c', 410, 61, 6120, 18200, 2510400], ['00BEG000000Lv02', 'Prestation__c', 210, 40, 5810, 16100, 1220300]], reports: [['00OEG000000FinMois', 'REPORT_RUN_PAGE_DESKTOP', 14, 6, 98200, 141200, 1374800], ['00OEG000000Attente', 'DASHBOARD_COMP_UPDATE - 01ZEG000000Db01', 22, 1, 41200, 52100, 906400]] },
      rowlock: {
        byUser: [['005EG000000Batch', 212], ['005EG000000Gest07', 21], ['005EG000000Gest12', 19], ['005EG000000Gest03', 17], ['005EG000000Gest21', 16], ['005EG000000Gest15', 14], ['005EG000000Gest09', 12], ['Autres (22)', 107]],
        byEntity: [['b2S-Sequence_Numerotation__c', 418]],
        top: [['b2S000000000001', 418]],
        byEntry: [['ENG_BatchRemboursementMensuel.execute (blocker)', 'Sequence_Numerotation__c', 'b2S', 212], ['apex-//ENG_DemandeController/ACTION$valider (waiter)', 'Sequence_Numerotation__c', 'b2S', 206]],
        rows: [['10/30/2026 10:48:12.758', '005EG000000Gest07', '(b2S000000000001)', '/aura'], ['10/30/2026 10:47:55.102', '005EG000000Gest12', '(b2S000000000001)', '/aura'], ['10/30/2026 10:47:51.880', '005EG000000Batch', '(b2S000000000001)', 'BatchApex'], ['10/30/2026 10:46:20.415', '005EG000000Gest03', '(b2S000000000001)', '/aura'], ['10/30/2026 10:45:02.007', '005EG000000Gest21', '(b2S000000000001)', '/aura'], ['10/30/2026 10:44:41.616', '005EG000000Batch', '(b2S000000000001)', 'BatchApex']],
        longest: [['ENG_BatchRemboursementMensuel', 42120, 6120, 0], ['ENG_DemandeController.valider', 18410, 410, 0], ['ENG_ImprimEGWS.envoyerAsync', 11020, 120, 10880], ['ENG_GarantieService.getPlafonds', 6120, 610, 0]]
      },
      platformevents: [['Decompte_Genere__e', 9210, 0, 41]]
    },

    'eng-row-0930': {
      org: 'eng', template: 'eng-cons-1', name: 'Fin de mois 30/09 (row lock)', type: 'Row Lock', requestor: 'Claire Gestion (DSI)',
      requestDate: '09/30/2026 13:05 UTC', start: D('2026-09-30T10:10:00Z'), end: D('2026-09-30T10:40:00Z'), status: 'Completed', tab: 'rowlock'
    },

    // ---------------------------------------------------------------- WDF
    'wdf-cons-1': {
      org: 'wdf', name: 'Pic Concurrent Apex 04/11', type: 'Consolidated Report', requestor: 'Démo Présentateur',
      requestDate: '11/04/2026 13:20 UTC', start: D('2026-11-04T10:30:00Z'), end: D('2026-11-04T11:00:00Z'), status: 'Completed',
      chart: { x: x24wdf, series: [['Average UI Request Time', series(x24wdf, 32, t => 540 * (0.4 + workday(t)))], ['Average REST API Request Time', series(x24wdf, 35, t => 160 * (0.6 + workday(t)))]] },
      concurrency: { throttle: 'NO', deploy: 'YES', restart: 'NO', apexErr: 31, apiErr: 0, uiErr: 0, users: 24,
        donut: [['Database Time', 401200, '#4e79a7'], ['Apex Execution Time', 310400, '#f28e2b'], ['Workflow Time', 12100, '#e15759'], ['Validation Rule Time', 2300, '#76b7b2']] },
      takeaways: ['Limit the number of fields and records from SOQLs.', 'For these class names, reduce the number of loops or the amount of data executed in loops by the following ways:', ['Use bulkification to execute code outside of loops.', 'Ensure that queries from class names are <a>selective</a> to avoid querying large datasets from entities.']],
      apex: {
        donut: [['Database Time', 2410200], ['Apex Execution Time', 1910300], ['Callout Time', 1210100], ['Other Time', 410200], ['Workflow Time', 220100], ['Visualforce Time', 61200], ['Validation Rule Time', 31000]],
        counts: { critical: 2, major: 3, minor: 12 },
        slow: {
          critical: [['Lightning', 'WDF_ConsoController.getHistorique', 4120, 5120.4, 212, 3410.2, 1410.3, 2980.1, 0, 26], ['Batch', 'WDF_AP214_ReleveBatch', 96, 8120.4, 61, 2210.2, 4120.4, 1910.3, 0, 12]],
          major: [['Trigger', 'WDF_CaseBeforeUpdate', 6120, 610.2, 0, 220.4, 210.3, 180.2, 61.1, 9], ['Visualforce', 'VF- /apex/WDF_AP152_EditionFacture', 1210, 1410.2, 18, 310.2, 620.1, 240.3, 0, 14], ['Future', 'WDF_AP331_FacturNetWS.envoyerFacture', 2210, 2120.4, 41, 120.1, 80.3, 60.2, 0, 3]],
          minor: [['Lightning', 'WDF_ContratController.getResume', 9120, 310.2, 0, 120.4, 90.1, 80.2, 0, 4]]
        },
        errors: [['WDF_ConsoController', 31, 'System.LimitException: Apex CPU time limit exceeded'], ['WDF_AP331_FacturNetWS', 22, 'Read timed out'], ['WDF_CaseBeforeUpdate', 4, 'Argument cannot be null']],
        soql: [['Apex', 'Class: WDF_ConsoController', 'getHistorique', 25, 58.31, 41.2, 182300, 24.81, 24], ['Apex', 'Class: WDF_AP087_FactureService', 'calculer', 140, 12.1, 2.1, 9120, 120.4, 410], ['Apex', 'Class: WDF_AP214_ReleveBatch', 'execute', 88, 6.4, 0, 96, 1210.3, 2000], ['Apex', 'Class: WDF_Utils', 'getRecordTypes', 1102, 2.2, 0, 61200, 1.1, 18], ['Package: AlloWatt', '—', 'N/A', null, 1.1, 0, 2210, 3.4, 1]],
        dml: [['Releve__c', 'INSERT', 182400, 1410], ['Case', 'UPDATE', 24120, 932], ['Compteur__c', 'UPDATE', 18200, 410]]
      },
      database: {
        top: [{ v: 248100, cpu: 198200, freq: 182300, entry: 'WDF_ConsoController.getHistorique', soql: 'SELECT Id, Index__c, Date_Releve__c, Conso_kWh__c FROM Releve__c WHERE Compteur__c = :cpt.Id ORDER BY Date_Releve__c DESC LIMIT 24' }, { v: 112200 }, { v: 64100 }, { v: 51200 }, { v: 41200 }, { v: 31000 }, { v: 22100 }],
        logTypes: [['URI', 9810400], ['Async Processing', 1910200], ['Apex SOAP WS', 810200], ['Reports', 610300], ['REST API', 210100]],
        entries: [['WDF_ConsoController.getHistorique', 2410400], ['TRIGGERS-01qWD000000Cas01', 910300], ['WDF_AP214_ReleveBatch', 610200], ['VF- /apex/WDF_AP152_EditionFacture', 210400]],
        users: [['005WD000000Cpt01', 612100], ['005WD000000Sav17', 210300]],
        dmlTypes: [['INSERT', 182400], ['UPDATE', 61200], ['DELETE', 900]],
        dmlEntity: [['INSERT-Releve__c', 182400], ['UPDATE-Case', 24120], ['UPDATE-Compteur__c', 18200]],
        dmlUser: [['INSERT-a2R-005WD000000Cpt01', 180100], ['UPDATE-Case-005WD000000Sav17', 610]]
      },
      failedLogins: [['Failed: InResponseTo Invalid', 2]],
      flows: [['BeforeSave Flow Trigger', '500', '301WD000000aA1', '-', '300WD000000y01', 24120, 90, 710, 2170, 'No'], ['AfterSave Flow Trigger', 'a1P', '301WD000000aA2', '-', '300WD000000y02', 18200, 12, 410, 218, 'No']],
      governor: { x: times('2026-11-04T10:30:00Z', 31, 1), hits: Array.from({ length: 31 }, (_, i) => [3, 9, 10, 17, 24].includes(i) ? 1 : 0), contrib: [['/aura WDF_ConsoController.getHistorique', 'Apex CPU time limit exceeded', 5]] },
      integrations: { api: [['WDF_AP331_FacturNetWS', 'Apex SOAP', 'envoyerFacture', 2210, 41, 1.9, 1, 2120, 610, 0, 0]], callouts: [['"https://facturnet.example/ws/v3/factures"', 'POST', '-1', 22, 22, 100, 10011, -1], ['"https://api.compteo.example/v1/releves"', 'GET', '200', 1210, 12, 1, 820, 8834]] },
      listviews: { lv: [['00BWD000000Lv01', 'Case', 61, 40, 6285, 21561, 537599]], reports: [['00OWD000000Kw1946', 'REPORT_RUN_PAGE_DESKTOP', 410, 210, 21200, 98100, 8692000]] },
      rowlock: { byUser: [['005WD000000Cpt01', 9], ['005WD000000Sav17', 2]], byEntity: [['a1P-Compteur__c', 11]], top: [['a1PWD0000001AbC', 6], ['a1PWD0000001AbD', 5]], byEntry: [['WDF_AP214_ReleveBatch.execute', 'Compteur__c', 'a1P', 9], ['/aura', 'Compteur__c', 'a1P', 2]], rows: [['11/04/2026 10:41:12.101', '005WD000000Cpt01', '(a1PWD0000001AbC)', 'BatchApex']], longest: [['WDF_AP214_ReleveBatch', 22410, 4120, 0], ['WDF_ConsoController.getHistorique', 12820, 9810, 0], ['WDF_AP331_FacturNetWS.envoyerFacture', 10410, 120, 10200]] },
      platformevents: []
    }
  };
})();

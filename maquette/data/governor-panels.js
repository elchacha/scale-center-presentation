/* =========================================================================
   Governor Limit Insights — un panneau repliable par limite (structure réelle,
   captures v2-11 à v2-27). Données 100 % fictives, par org.
   Chaque panneau : takeaways · howTo (investigation ciblée) · chart · tables[].
   ========================================================================= */
(function () {
  const T = (title, cols, rows) => ({ title, cols, rows });
  const below = 'Utilization is below 60%. No immediate action needed.';

  window.GOV_PANELS = {
    wdf: {
      peak: 'Nov 3, 2026, 2:00 PM UTC - Nov 4, 2026, 2:00 PM UTC',
      panels: {
        'API Request Limit': {
          howTo: 'Consolidated Report', unit: 'requests', base: 0.07, spike: 0.02,
          takeaways: [below, 'APIs Contributing: <b>REST</b> drove the most API requests, at <b>310,220</b> calls.', 'Top API Source URLs: The top source URL <b>Releve__c</b> drove <b>120,410</b> requests.', 'API Top Callers: Top caller <b>Compteur__c</b> issued <b>118,900</b> requests.'],
          tables: [
            T('APIs Contributing', ['API Type', 'Request Count', 'Total Request Time (ms)', 'Avg Request Time (ms)'], [['REST', '310 220', '41 220 100', '132,87'], ['SOAP', '96 140', '30 880 400', '321,20'], ['Apex REST', '22 010', '19 310 220', '877,34'], ['Apex SOAP', '61 200', '25 920 000', '423,53']]),
            T('Top API Source URLs', ['API Variant', 'API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', '/WDF/v1/releves', '120 410', '96,42'], ['SOAP API', 'Facture__c', '41 200', '51,20'], ['SOAP API', 'FieldDefinition', '212', '148,10'], ['REST API', 'Compteur__c', '22 300', '38,90']]),
            T('API Top Callers', ['API Type', 'Entity', 'Namespace', 'User Type', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', 'Compteur__c', '', 'Standard', '118 900', '95,10'], ['SOAP', 'Facture__c', '', 'Standard', '40 220', '50,80'], ['SOAP', 'PresenceUserConfigInfo', '', '', '7 410', '7,02']])
          ]
        },
        'Async Apex Execution Limit': {
          howTo: 'Apex Summary', unit: 'executions', base: 0.22, spike: 0.03,
          takeaways: [below, 'Queueable Entry Points: Queueable entry point <b>WDF_AP220_ReleveQueueable</b> ran <b>812</b> times.', 'Batch Entry Points: Batch entry point <b>WDF_AP214_ReleveBatch</b> ran <b>96</b> times.', 'Async Apex Breakdown: <b>Future</b> accounted for the most async Apex requests, at <b>98,410</b>.'],
          tables: [
            T('Future Method Contributors', ['Entry Point', 'Invocations', 'Avg CPU (ms)', 'Max CPU (ms)'], [['WDF_AP331_FacturNetWS.envoyerFacture(Id)', '22 104', '120,40', '980'], ['WDF_AP214_ReleveService.majAsync(Set<Id>)', '18 220', '98,10', '611'], ['WDF_AP120_CompteoWS.majCompteur(Id)', '6 410', '42,30', '201']]),
            T('Queueable Entry Points', ['Entry Point', 'Class ID', 'Invocations', 'Avg CPU (ms)', 'Max CPU (ms)', 'Total CPU (ms)'], [['WDF_AP220_ReleveQueueable', '01pWD0000001QuE', '812', '310,22', '1 204', '251 899'], ['WDF_RetryQueueable', '01pWD0000001ReT', '44', '96,58', '121', '4 249']]),
            T('Batch Entry Points', ['Entry Point', 'Class ID', 'Type', 'Invocations', 'Avg CPU (ms)', 'Max CPU (ms)', 'Avg Batch Scope'], [['WDF_AP214_ReleveBatch', '01pWD0000001BaT', 'Serial Batch', '96', '2 210,40', '7 490', '200'], ['WDF_AP259_PurgeLogs', '01pWD0000001PuR', 'Serial Batch', '41', '24,63', '131', '2 000']]),
            T('Async Apex Breakdown', ['Type', 'Requests', '% of Total'], [['Future', '98 410', '58,20'], ['Lightning', '52 100', '30,81'], ['Serial Batch', '13 220', '7,82'], ['Queueable', '5 102', '3,02'], ['Scheduled', '270', '0,16']])
          ]
        },
        'Bulk API 2.0 Rows Limit': {
          howTo: 'Consolidated Report', unit: 'rows', base: 0.003, spike: 0,
          takeaways: [below, 'Top Bulk API 2.0 Jobs: Job <b>750WD00000DcA01</b> processed the most rows, at <b>512</b>.'],
          tables: [T('Top Bulk API 2.0 Jobs', ['Job ID', 'Object', 'Operation', 'Status', 'Records Processed', 'Records Failed', 'Exec Time (ms)', 'Client', 'Namespace'], [
            ['750WD00000DcA01', 'Account', 'query', 'InProgress', '512', '0', '0', '"Data Cloud Salesforce Connector"', ''],
            ['750WD00000DcO02', 'Contrat_Energie__c', 'query', 'InProgress', '497', '0', '0', '"Data Cloud Salesforce Connector"', ''],
            ['750WD00000DcC03', 'Contact', 'query', 'InProgress', '438', '0', '0', '"Data Cloud Salesforce Connector"', ''],
            ['750WD00000DcA04', 'Account', 'query', 'InProgress', '429', '0', '0', '"Data Cloud Salesforce Connector"', ''],
            ['750WD00000DcR05', 'Releve__c', 'query', 'InProgress', '407', '0', '0', '"Data Cloud Salesforce Connector"', '']])]
        },
        'Bulk API Batches Limit': {
          howTo: 'Consolidated Report', unit: 'batches', base: 0.001, spike: 0,
          takeaways: [below, 'Top Bulk API Jobs: Job <b>750WD00000Dlr01</b> processed the most records, at <b>24,334</b>.'],
          tables: [T('Top Bulk API Jobs', ['Job ID', 'User', 'Connected App', 'Operation', 'Bulk Version', 'Status', 'Records Processed', 'Duration (ms)'], [['750WD00000Dlr01', 'User Name not Available', 'Dataloader Bulk', 'query', 'V1_QUERY', 'success', '24 334', '15 294'], ['750WD00000Dlr02', 'User Name not Available', 'Dataloader Bulk', 'query', 'V1_QUERY', 'success', '12 769', '5 477'], ['750WD00000Dlr03', 'User Name not Available', 'Dataloader Bulk', 'query', 'V1_QUERY', 'success', '12 769', '5 554'], ['750WD00000Dlr04', 'User Name not Available', 'Dataloader Bulk', 'query', 'V1_QUERY', 'success', '7 430', '22 183']])]
        },
        'Concurrent Apex': {
          howTo: 'Concurrent Apex', unit: 'requests', base: 0.14, spike: 0.1,
          takeaways: [below, 'Long Running Apex Entry Points: <b>WDF_ConsoController.getHistorique</b> had the most long-running requests, at <b>212</b>.', 'Permit Holders: <b>apex-//WDF_ConsoController/ACTION$getHistorique</b> held the concurrent Apex permit across <b>412</b> requests.'],
          tables: [
            T('Long Running Apex Entry Points (Concurrent Apex peak hour)', ['Entry Point', 'Request Count', 'Max Apex CPU (ms)', 'Avg Apex CPU (ms)', 'Avg DB Time (ms)', 'Avg VF Time (ms)', 'Limit Failure Count'], [['WDF_ConsoController.getHistorique', '212', '9 810', '3 410', '1 410', '0', '31'], ['WDF_AP214_ReleveBatch', '21', '17 367', '11 010', '36 695', '0', '0'], ['VF- /apex/WDF_AP152_EditionFacture', '4', '5 463', '3 170', '7 907', '101', '0']]),
            T('Top Contributors Holding the Concurrent Apex Permit', ['Entry Point', 'Request Count', 'Limit Failure Count', 'Max Apex CPU (ms)', 'Avg Apex CPU (ms)', 'Avg DB Time (ms)'], [['apex-//WDF_ConsoController/ACTION$getHistorique', '412', '31', '9 810', '3 120', '1 380'], ['TRIGGERS', '7', '0', '7 303', '4 319', '5 241'], ['VF- /apex/WDF_AP152_EditionFacture', '4', '0', '5 463', '3 170', '7 907']])
          ]
        },
        'Concurrent API Calls': {
          howTo: 'Concurrent Apex', unit: 'requests', base: 0.06, spike: 0.03,
          takeaways: [below, 'APIs Contributing (with Source): <b>Releve__c</b> contributed the most concurrent API requests, at <b>18,410</b>.'],
          tables: [T('APIs Contributing to Concurrent API Requests (with Source)', ['API Variant', 'API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', 'Releve__c', '18 410', '96,10'], ['SOAP API', 'Facture__c', '6 120', '50,11'], ['SOAP API', 'PresenceUserConfigInfo', '1 102', '7,11']])]
        },
        'Concurrent UI Requests': {
          howTo: 'Concurrent Apex', unit: 'requests', base: 0.18, spike: 0.05,
          takeaways: [below, 'UI Sources: <b>/aura</b> drove the most concurrent UI requests, at <b>812,410</b>.'],
          tables: [T('UI Requests Contributing to Concurrent UI Requests (with Source)', ['API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['/aura', '812 410', '182,40'], ['/auraCmpDef', '48 210', '52,85'], ['/apexremote', '2 410', '347,46'], ['/apex/WDF_AP152_EditionFacture', '1 210', '1 410,20']])]
        },
        'High Volume Platform Events Published': {
          howTo: 'Consolidated Report', unit: 'events', base: 0.004, spike: 0,
          takeaways: [below, 'Top Event Types: Event type <b>/event/Releve_Recu__e</b> published the most events, at <b>8,420</b>.'],
          tables: [T('Top Event Types', ['Event Type', 'Event Count', 'Avg Payload (bytes)', 'Max Payload (bytes)'], [['/event/Releve_Recu__e', '8 420', '412', '880'], ['/event/ContentDocumentLinkEvent', '2 188', '42,56', '111'], ['/event/FlowExecutionEvent', '856', '270,16', '376']]),
            T('Top Publishers', ['Namespace', 'Client ID', 'Event Count', 'Avg Payload (bytes)'], [['', '', '8 433', '410,63'], ['', '', '1 453', '144,84'], ['', '', '262', '31'], ['', '', '228', '31'], ['', '', '168', '31'], ['', '', '90', '268,82']])]
        }
      }
    },
    eng: {
      peak: 'Oct 30, 2026, 9:00 AM UTC - Oct 30, 2026, 11:00 AM UTC',
      panels: {
        'API Request Limit': {
          howTo: 'Consolidated Report', unit: 'requests', base: 0.18, spike: 0.03,
          takeaways: [below, 'APIs Contributing: <b>Apex REST</b> drove the most API requests, at <b>120,410</b> calls.', 'Top API Source URLs: The top source URL <b>/ENG/v1/tierspay</b> drove <b>91,200</b> requests.', 'API Top Callers: Top caller <b>Demande_Remboursement__c</b> issued <b>88,120</b> requests.'],
          tables: [
            T('APIs Contributing', ['API Type', 'Request Count', 'Total Request Time (ms)', 'Avg Request Time (ms)'], [['Apex REST', '120 410', '145 700 100', '1 210,02'], ['REST', '82 300', '11 410 220', '138,64'], ['SOAP', '21 120', '6 940 100', '328,60']]),
            T('Top API Source URLs', ['API Variant', 'API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', '/ENG/v1/tierspay', '91 200', '1 210,40'], ['Apex REST', '/ENG/v1/adherents', '22 100', '140,22']]),
            T('API Top Callers', ['API Type', 'Entity', 'Namespace', 'User Type', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', 'Demande_Remboursement__c', '', 'Standard', '88 120', '1 180,10'], ['Apex REST', 'Adherent__c', '', 'Standard', '21 900', '139,40']])
          ]
        },
        'Async Apex Execution Limit': {
          howTo: 'Apex Summary', unit: 'executions', base: 0.41, spike: 0.05,
          takeaways: [below, 'Batch Entry Points: Batch entry point <b>ENG_BatchRemboursementMensuel</b> ran <b>212</b> times.', 'Async Apex Breakdown: <b>Serial Batch</b> accounted for the most async Apex requests, at <b>61,200</b>.'],
          tables: [
            T('Future Method Contributors', ['Entry Point', 'Invocations', 'Avg CPU (ms)', 'Max CPU (ms)'], [['ENG_ImprimEGWS.envoyerAsync(Id)', '4 120', '40,20', '311'], ['ENG_AdherentService.majGaranties(Set<Id>)', '1 210', '210,40', '980']]),
            T('Batch Entry Points', ['Entry Point', 'Class ID', 'Type', 'Invocations', 'Avg CPU (ms)', 'Max CPU (ms)', 'Avg Batch Scope'], [['ENG_BatchRemboursementMensuel', '01pEG0000001BaT', 'Serial Batch', '212', '1 210,20', '9 120', '200']]),
            T('Async Apex Breakdown', ['Type', 'Requests', '% of Total'], [['Serial Batch', '61 200', '58,10'], ['Lightning', '31 400', '29,81'], ['Future', '12 410', '11,78'], ['Queueable', '340', '0,32']])
          ]
        },
        'Bulk API 2.0 Rows Limit': { howTo: 'Consolidated Report', unit: 'rows', base: 0.009, spike: 0, takeaways: [below, 'Top Bulk API 2.0 Jobs: Job <b>750EG00000Pre01</b> processed the most rows, at <b>98,200</b>.'], tables: [T('Top Bulk API 2.0 Jobs', ['Job ID', 'Object', 'Operation', 'Status', 'Records Processed', 'Records Failed', 'Exec Time (ms)', 'Client'], [['750EG00000Pre01', 'Prestation__c', 'upsert', 'JobComplete', '98 200', '41', '61 220', 'TiersPay']])] },
        'Bulk API Batches Limit': { howTo: 'Consolidated Report', unit: 'batches', base: 0.002, spike: 0, takeaways: [below, 'Top Bulk API Jobs: Job <b>750EG00000Dlr01</b> processed the most records, at <b>12,100</b>.'], tables: [T('Top Bulk API Jobs', ['Job ID', 'User', 'Connected App', 'Operation', 'Bulk Version', 'Status', 'Records Processed', 'Duration (ms)'], [['750EG00000Dlr01', 'User Name not Available', 'Dataloader Bulk', 'query', 'V1_QUERY', 'success', '12 100', '8 210']])] },
        'Concurrent Apex': {
          howTo: 'Concurrent Apex', unit: 'requests', base: 0.26, spike: 0.52, open: true,
          takeaways: ['Utilization reached <b>78%</b> on <b>Oct 30, 2026</b>. Approaching the governor limit.', 'Long Running Apex Entry Points: <b>ENG_DemandeController.valider</b> had the most long-running requests, at <b>402</b>.', 'Permit Holders: <b>ENG_BatchRemboursementMensuel.execute</b> held the concurrent Apex permit across <b>212</b> requests.'],
          tables: [
            T('Long Running Apex Entry Points (Concurrent Apex peak hour)', ['Entry Point', 'Request Count', 'Max Apex CPU (ms)', 'Avg Apex CPU (ms)', 'Avg DB Time (ms)', 'Avg VF Time (ms)', 'Limit Failure Count'], [['ENG_DemandeController.valider', '402', '6 840', '310', '5 210', '0', '37'], ['ENG_BatchRemboursementMensuel', '188', '9 120', '1 210', '6 120', '0', '4'], ['ENG_ImprimEGWS.envoyerAsync', '61', '5 410', '40', '30', '0', '0']]),
            T('Top Contributors Holding the Concurrent Apex Permit', ['Entry Point', 'Request Count', 'Limit Failure Count', 'Max Apex CPU (ms)', 'Avg Apex CPU (ms)', 'Avg DB Time (ms)'], [['ENG_BatchRemboursementMensuel.execute', '212', '4', '9 120', '1 210', '6 120'], ['apex-//ENG_DemandeController/ACTION$valider', '206', '37', '6 840', '310', '5 210'], ['TRIGGERS', '12', '0', '410', '120', '260']])
          ]
        },
        'Concurrent API Calls': { howTo: 'Concurrent Apex', unit: 'requests', base: 0.12, spike: 0.05, takeaways: [below, 'APIs Contributing (with Source): <b>/ENG/v1/tierspay</b> contributed the most concurrent API requests, at <b>9,120</b>.'], tables: [T('APIs Contributing to Concurrent API Requests (with Source)', ['API Variant', 'API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['Apex REST', '/ENG/v1/tierspay', '9 120', '1 210,40'], ['Apex REST', '/ENG/v1/adherents', '2 210', '140,22']])] },
        'Concurrent UI Requests': { howTo: 'Concurrent Apex', unit: 'requests', base: 0.22, spike: 0.08, takeaways: [below, 'UI Sources: <b>/aura</b> drove the most concurrent UI requests, at <b>402,100</b>.'], tables: [T('UI Requests Contributing to Concurrent UI Requests (with Source)', ['API Source URL', 'Request Count', 'Avg Runtime (ms)'], [['/aura', '402 100', '410,20'], ['/auraCmpDef', '21 200', '52,85'], ['/apex/ENG_EditionDecompte', '310', '1 210,40']])] },
        'High Volume Platform Events Published': { howTo: 'Consolidated Report', unit: 'events', base: 0, spike: 0, takeaways: [below, 'Top Event Types: Event type <b>/event/Decompte_Genere__e</b> published the most events, at <b>9,210</b>.'], tables: [T('Top Event Types', ['Event Type', 'Event Count', 'Avg Payload (bytes)', 'Max Payload (bytes)'], [['/event/Decompte_Genere__e', '9 210', '210', '412']])] }
      }
    }
  };
})();

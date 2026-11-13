/* =========================================================================
   Lightning Experience Insights — drill-down « High Impact, Slow Performing Pages »
   (captures v3-12 à v3-15) : page → composants custom → actions Apex.
   Colonnes réelles : Action · Action Count · Box Car Count · Cache Eligible · Cache Hit Ratio ·
   XHR Request Stall Time · Server Time · TTFB · XHR Duration · XHR Response Stall Time · Duration.
   guru: true = icône ApexGuru (recommandation disponible). Données 100 % fictives.
   ========================================================================= */
window.LEX_DRILL = {
  wdf: {
    '/lightning/r/Contrat_Energie__c/&lt;id&gt;/view': [
      { cmp: 'c:wdfSuiviConso', actions: [
        ['c:WDF_ConsoController.getHistorique', 18210, 1, 'N', 'N/A', 41, 7110, 7240, 7330, 88, 7418, true],
        ['c:WDF_ConsoController.getTarifs', 9120, 1, 'Y', '0 %', 12, 210, 260, 290, 14, 304, false]] },
      { cmp: 'c:wdfContratResume', actions: [
        ['c:WDF_ContratController.getResume', 24310, 1, 'N', 'N/A', 18, 120, 170, 210, 22, 232, false],
        ['c:WDF_Utils.getRecordTypes', 24310, 1, 'Y', '0 %', 9, 38, 85, 213, 117, 309, true]] },
      { cmp: 'lds:pdl', actions: [] },
      { cmp: 'c:wdfFacturesRecentes', actions: [] }
    ],
    '/lightning/page/home': [
      { cmp: 'c:wdfTableauDeBordAgence', actions: [
        ['c:WDF_DashboardController.getIndicateurs', 1210, 1, 'N', 'N/A', 51, 14820, 14910, 15020, 135, 15155, true]] }
    ],
    '/lightning/r/Case/&lt;id&gt;/view': [
      { cmp: 'c:wdfCaseContexte', actions: [
        ['c:WDF_CaseController.getContexteClient', 401220, 2, 'N', 'N/A', 28, 410, 480, 521, 173, 694, false]] },
      { cmp: 'AlloWatt:CtiProxy', actions: [] }
    ]
  },
  eng: {
    '/lightning/r/Demande_Remboursement__c/&lt;id&gt;/view': [
      { cmp: 'c:engValidationDemande', actions: [
        ['c:ENG_DemandeController.valider', 1840, 1, 'N', 'N/A', 48, 1836, 1961, 2067, 42, 2109, true],
        ['c:ENG_GarantieService.getPlafonds', 3120, 1, 'Y', '12 %', 21, 604, 714, 820, 10, 830, false]] },
      { cmp: 'lds:pdl', actions: [] }
    ]
  }
};

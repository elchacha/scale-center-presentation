/* =========================================================================
   Étapes des fils rouges (→ / ← / 1…9 / F) — chaque étape = un écran,
   une zone à mettre sous le projecteur (H) et une popup décalée (G).
   ========================================================================= */
window.STEPS = {
  fil1: [
    { title: 'Activer Scale Center (entracte)', org: 'wdf', page: 'alerts', params: { setup: '1' }, spot: '#enableSc' },
    { title: 'Org Overview : le podium', org: 'wdf', page: 'org-overview', params: { analyzed: '1' }, spot: '#ovTop3', gag: 'overview-top3' },
    { title: 'Deployment Insights : bonne et mauvaise nouvelle', org: 'wdf', page: 'deployment', params: { report: '0' }, spot: '#depKey', gag: 'good-bad' },
    { title: 'Le déploiement en plein pic', org: 'wdf', page: 'deployment', params: { report: '0' }, spot: '#depVol', gag: 'deploy-14h' },
    { title: 'Infrastructure : le coupable', org: 'wdf', page: 'deployment', params: { report: '0', tab: 'infra' }, spot: '#infraTable' },
    { title: 'User Experience : la page Contrat', org: 'wdf', page: 'deployment', params: { report: '0', tab: 'ux' }, spot: '#uxTable', gag: 'contrat-page' },
    { title: 'LEX Insights : pages lentes à fort trafic', org: 'wdf', page: 'lex', spot: '#lexPages', gag: 'p75' },
    { title: 'ApexGuru : le correctif', org: 'wdf', page: 'apexguru', spot: '#agRecos', gag: 'loop-soql' },
    { title: 'ApexGuru : le test généré', org: 'wdf', page: 'apexguru', params: { tab: 'tests' }, spot: '#agBody' },
    { title: 'ApexGuru : la duplication', org: 'wdf', page: 'apexguru', params: { tab: 'dups' }, spot: '#dupChars', gag: 'dup-415k' },
    { title: 'Le hotfix confirmé', org: 'wdf', page: 'deployment', params: { report: '1' }, spot: '#depKey', gag: 'hotfix' }
  ],
  fil2: [
    { title: 'Governor Limit : « Approaching »', org: 'eng', page: 'governor', spot: '.gov-major', gag: 'approaching' },
    { title: 'Alerte Row Lock active', org: 'eng', page: 'alerts', params: { tab: 'history' }, spot: '#activeAlert' },
    { title: 'Org Performance : le pic', org: 'eng', page: 'org-performance', spot: '#opc0', gag: 'drag-me' },
    { title: 'Sélection du pic (filet de sécurité)', org: 'eng', page: 'org-performance', params: { select: '1' }, spot: '#opc0' },
    { title: 'Consolidated : Apex Concurrency', org: 'eng', page: 'performance-analysis', sub: 'eng-cons-1', params: { tab: 'concurrency' }, spot: '#concTiles' },
    { title: 'Row Lock : l\'enregistrement chaud', org: 'eng', page: 'performance-analysis', sub: 'eng-cons-1', params: { tab: 'rowlock' }, spot: '#rlTop', gag: 'hot-record' },
    { title: 'Row Lock : blocker vs waiter', org: 'eng', page: 'performance-analysis', sub: 'eng-cons-1', params: { tab: 'rowlock' }, spot: '#rlEntry' },
    { title: 'Apex Summary : ligne 58', org: 'eng', page: 'performance-analysis', sub: 'eng-cons-1', params: { tab: 'apex' }, spot: '#soqlTable', gag: 'line-58' },
    { title: 'Database Insights : SOQL en régression', org: 'eng', page: 'database', params: { tab: 'regressed' }, spot: '#regTable' },
    { title: 'Query Plan Analyzer vs Dev Console', org: 'eng', page: 'database', params: { tab: 'qpa' }, spot: '#dbBody', gag: 'qpa' },
    { title: 'ApexGuru : sortir du FOR UPDATE', org: 'eng', page: 'apexguru', spot: '#agRecos' }
  ]
};

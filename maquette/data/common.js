/* =========================================================================
   Données communes aux deux orgs fictives
   ========================================================================= */
(function () {
  // Types d'analyse (menu « Start Analysis » et modale « New Analysis »), libellés réels
  window.SC_ANALYSIS_TYPES = [
    { key: 'consolidated', label: 'Consolidated Report', icon: '📈', tip: 'The maximum time range for a consolidated analysis is 30 minutes.' },
    { key: 'apex', label: 'Apex Summary', icon: '>_' },
    { key: 'concurrency', label: 'Concurrent Apex', icon: '⑂' },
    { key: 'database', label: 'Database Performance', icon: '🛢' },
    { key: 'flow', label: 'Flow Performance', icon: '≋' },
    { key: 'governor', label: 'Governor Limits', icon: '⛔' },
    { key: 'listviews', label: 'List Views and Reports', icon: '▤' },
    { key: 'integrations', label: 'Integrations Performance', icon: '⊂⊃' },
    { key: 'platformevents', label: 'Platform Events', icon: '⇄' },
    { key: 'rowlock', label: 'Row Lock', icon: '🔒' }
  ];

  // ---------- Générateurs de séries temporelles (déterministes) ----------
  const H = 36e5;
  /** Profil d'activité d'une journée de bureau (0..1), heures UTC */
  function workday(t, opts) {
    opts = opts || {};
    const d = new Date(t), h = d.getUTCHours() + d.getUTCMinutes() / 60, wd = d.getUTCDay();
    const weekend = wd === 0 || wd === 6;
    let v;
    if (h < 5) v = 0.02;
    else if (h < 7) v = 0.02 + (h - 5) / 2 * 0.25;
    else if (h < 8.5) v = 0.27 + (h - 7) / 1.5 * 0.68;
    else if (h < 11.5) v = 0.95 + 0.05 * Math.sin(h);
    else if (h < 12.5) v = 0.78;                       // pause déjeuner
    else if (h < 15.5) v = 0.92;
    else if (h < 18.5) v = 0.92 - (h - 15.5) / 3 * 0.82;
    else v = 0.1 - (h - 18.5) / 5.5 * 0.08;
    return weekend ? v * (opts.weekend == null ? 0.18 : opts.weekend) : v;
  }
  function times(startISO, n, stepMin) {
    const t0 = Date.parse(startISO);
    return Array.from({ length: n }, (_, i) => t0 + i * stepMin * 60e3);
  }
  /** Série = f(t) * échelle + bruit, avec « pics » ponctuels [{t, w(min), v}] */
  function series(x, seed, fn, opts) {
    opts = opts || {};
    const r = SC.rng(seed);
    return x.map((t) => {
      let v = fn(t) * (1 + (r() - 0.5) * (opts.noise == null ? 0.12 : opts.noise));
      (opts.spikes || []).forEach(s => { const dt = Math.abs(t - Date.parse(s.t)) / 60e3; if (dt <= (s.w || 10)) v += s.v * (1 - dt / ((s.w || 10) + 1)); });
      return Math.max(0, opts.round ? Math.round(v) : v);
    });
  }
  window.SCDATA = { workday, times, series, H };

  // ---------- Popups décalées (humour assumé) ----------
  // ✍️  Ajoutez / réécrivez librement vos propres messages ici : clé → { title, text }.
  window.GAGS = {
    'deploy-14h': { title: '🕑 14:10 UTC, un mardi', text: 'Le déploiement est tombé <b>en plein pic</b> (≈ 265K requêtes / 10 min).<br>Quelqu\'un a dit « c\'est juste un petit composant » ?' },
    'good-bad': { title: '🎭 La bonne et la mauvaise nouvelle', text: 'Erreurs <b>−22 %</b> : on fête.<br>App CPU <b>+85 %</b> : on range le champagne.' },
    'loop-soql': { title: '🔁 Une SOQL dans une boucle', text: 'En 2026. Sur 2,4 millions de relevés.<br>ApexGuru a même proposé le correctif — il ne manque plus qu\'un humain pour cliquer.' },
    'contrat-page': { title: '🐢 La page Contrat', text: '22 % du trafic, <b>+0,9 s</b> par affichage.<br>× 1 200 conseillers × 40 contrats / jour = un café offert à chacun, en temps d\'attente.' },
    'hotfix': { title: '🚒 Le hotfix du jeudi', text: 'App CPU <b>−45 %</b>. La boucle est bouclée (enfin, <i>dé</i>bouclée).' },
    'approaching': { title: '🌡️ « Approaching »', text: 'Concurrent Apex à <b>78 %</b>. Ce n\'est pas encore la panne… c\'est le moment où l\'on peut encore l\'éviter.' },
    'drag-me': { title: '🖱️ Le geste magique', text: 'Cliquez-glissez sur le pic → <b>Start Analysis</b>.<br>Trois clics entre « la prod rame » et « voici la ligne de code ».' },
    'hot-record': { title: '🔥 L\'enregistrement le plus populaire de la mutuelle', text: '<code>b2S000000000001</code> — « Numéro de décompte ».<br>418 personnes ont voulu le modifier en même temps. Il a dit non à 418 personnes.' },
    'line-58': { title: '🎯 Ligne 58', text: '84 % du temps SOQL, 97 % des requêtes > 5 s.<br>Une seule ligne. On a trouvé le coupable, il habite ligne 58.' },
    'qpa': { title: '🔍 Query Plan Analyzer', text: 'Réponse de l\'outil de 2026 : « <i>Use selective queries</i> ».<br>Merci Captain Obvious. La Dev Console de 2013, elle, vous donne le plan, le coût et le champ fautif.' },
    'infra-decreased': { title: '🤔 « Infrastructure performance decreased by 22 % »', text: 'En rouge. Alors que le CPU a <b>baissé</b>.<br>La performance a baissé, ou les temps ont baissé ? Lisez toujours le détail.' },
    'empty-mf': { title: '🌵 Rien à voir ici', text: 'Multi-Framework Insights mesure les applis construites avec d\'autres frameworks que LWC.<br>Pas d\'appli React chez nous ? Pas de données. Le cactus est d\'origine.' },
    'quotas': { title: '🎟️ 1 rapport par jour, 3 par semaine', text: 'Choisissez bien votre déploiement : le quota, lui, ne se redéploie pas.' },
    'dup-415k': { title: '📎 Copier-coller industriel', text: '312 000 caractères dupliqués.<br>C\'est à peu près « Le Petit Prince »… trois fois. En Apex.' },
    'search-never': { title: '🗄️ Indexé 800 000 fois, cherché 0 fois', text: 'Un quick win <b>sans code</b> : décocher « Allow Search » dans Object Manager. Les admins dans la salle peuvent se lever.' },
    'report-1946': { title: '📊 « Conso de tout le monde depuis 1946 »', text: 'Rapide en moyenne, lancé 13 800 fois par semaine.<br>Le rapport le plus cher n\'est pas le plus lent : c\'est le plus aimé.' },
    'overview-top3': { title: '🥉🥈🥇 Le podium', text: 'Pas un rapport de plus : <b>3 coupables nommés</b>, avec la nature du fix. Lundi matin, 9 h, on sait par où commencer.' },
    'p75': { title: '📐 Pourquoi le P75 ?', text: 'La moyenne ment : 10 pages à 1 s et 1 page à 30 s, ça fait « 3,6 s en moyenne » et un utilisateur furieux.<br>Le P75 dit : 3 utilisateurs sur 4 vivent mieux que ce chiffre.' }
  };
})();

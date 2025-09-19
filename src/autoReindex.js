'use strict';

const dbsearch = require.main.require('nodebb-plugin-dbsearch/library');

(async () => {
  try {
    if (dbsearch && typeof dbsearch.reindex === 'function') {
      console.log('[autoReindex] Triggering DBSearch reindex…');
      await dbsearch.reindex();
      console.log('[autoReindex] Done.');
    } else {
      console.warn('[autoReindex] dbsearch.reindex not found');
    }
  } catch (err) {
    console.error('[autoReindex] Failed:', err);
  }
})();

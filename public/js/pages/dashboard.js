'use strict';

import { $ } from '../utils/dom.js';
import { renderGpaTrend } from '../charts/gpaTrend.js';
import { renderGradePie } from '../charts/gradePie.js';

export function initDashboard() {
  const gpaCanvas = $('#gpaChart');
  const creditsCanvas = $('#creditsChart');
  const gradeCanvas = $('#gradeChart');

  // If transcriptData is available (legacy global), use it to feed charts
  if (window.transcriptData && typeof transcriptData.getCompletedTerms === 'function') {
    const terms = transcriptData.getCompletedTerms();
    if (gpaCanvas) renderGpaTrend(gpaCanvas, terms.filter(t => t.termGPA > 0));
    if (creditsCanvas) {
      // For brevity, keep bar chart handled by legacy module if present
      if (window.App && window.App.renderCreditsChart) window.App.renderCreditsChart();
    }
    if (gradeCanvas) {
      const dist = { A:0,B:0,C:0,D:0,F:0 };
      terms.forEach(t => t.courses && t.courses.forEach(c => { const k = c.grade && c.grade[0]; if (dist[k] !== undefined) dist[k]++; }));
      renderGradePie(gradeCanvas, dist);
    }
  }
}



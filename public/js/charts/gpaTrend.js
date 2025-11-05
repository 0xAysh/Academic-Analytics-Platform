'use strict';

/**
 * renderGpaTrend(container: HTMLElement, terms: Array<{ termName: string, termGPA: number }>)
 */
export function renderGpaTrend(container, terms) {
  if (!container || !window.Chart) return;
  const labels = terms.map(t => t.termName);
  const data = terms.map(t => t.termGPA);
  if (!labels.length) return;

  const ctx = container.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'GPA', data, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,.1)', pointBackgroundColor: '#fff', pointBorderColor: '#3B82F6', pointBorderWidth: 2, pointRadius: 5, fill: false, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 4, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } }, interaction: { intersect: false, mode: 'index' } }
  });
}



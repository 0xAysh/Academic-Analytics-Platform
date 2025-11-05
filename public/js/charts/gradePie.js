'use strict';

/**
 * renderGradePie(container: HTMLCanvasElement, dist: {A:number,B:number,C:number,D:number,F:number})
 */
export function renderGradePie(container, dist) {
  if (!container || !window.Chart) return;
  const labels = ['A','B','C','D','F'];
  const colors = ['#10B981','#3B82F6','#F59E0B','#EF4444','#B91C1C'];
  const data = labels.map(l => dist[l] || 0);
  if (!data.reduce((s,v)=>s+v,0)) return;
  const ctx = container.getContext('2d');
  return new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}



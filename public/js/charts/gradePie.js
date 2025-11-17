'use strict';

/**
 * Render grade distribution pie chart
 * @param {HTMLCanvasElement} container - Canvas element to render chart
 * @param {{A:number,B:number,C:number,D:number,F:number}} dist - Grade distribution object
 * @returns {Chart|null} Chart instance or null if unable to render
 */
export function renderGradePie(container, dist) {
  if (!container || !window.Chart) return null;
  
  const labels = ['A', 'B', 'C', 'D', 'F'];
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#B91C1C'];
  const data = labels.map(l => dist[l] || 0);
  const total = data.reduce((s, v) => s + v, 0);
  
  if (total === 0) return null;

  // Calculate percentages for all grades (including 0%)
  const allPercentages = data.map(count => Math.round((count / total) * 100));
  
  // Filter out grades with zero count for chart data; keep order A..F
  const filtered = labels.map((l, i) => ({
    label: l,
    count: data[i],
    color: colors[i]
  })).filter(item => item.count > 0);
  
  const finalLabels = filtered.map(f => f.label);
  const finalCounts = filtered.map(f => f.count);
  const finalColors = filtered.map(f => f.color);

  const ctx = container.getContext('2d');
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: finalLabels,
      datasets: [{
        label: 'Number of Grades',
        data: finalCounts,
        backgroundColor: finalColors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            generateLabels: () => {
              // Show all grades in legend, even if 0%
              return labels.map((label, i) => {
                const percentage = allPercentages[i] || 0;
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: colors[i],
                  hidden: false,
                  index: i
                };
              });
            },
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || '';
              const value = ctx.raw || 0;
              return `${label}: ${value}`;
            }
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          }
        }
      },
      interaction: {
        intersect: true,
        mode: 'point'
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}



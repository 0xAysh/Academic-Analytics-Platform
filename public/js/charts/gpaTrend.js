'use strict';

/**
 * @param {HTMLCanvasElement} container
 * @param {Array<{termName: string, termGPA: number}>} terms
 * @returns {Chart|null}
 */
export function renderGpaTrend(container, terms) {
  if (!container || !window.Chart) return null;
  
  const labels = terms.map(t => t.termName);
  const data = terms.map(t => t.termGPA);
  
  if (!labels.length) return null;

  const verticalGuidePlugin = {
    id: 'verticalGuide',
    afterDraw: (chart) => {
      const activeElements = chart.getActiveElements();
      if (activeElements.length > 0) {
        const ctx = chart.ctx;
        const x = activeElements[0].element.x;
        const yAxis = chart.scales.y;
        
        ctx.save();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, yAxis.top);
        ctx.lineTo(x, yAxis.bottom);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const ctx = container.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'GPA',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3B82F6',
        pointBorderWidth: 2.5,
        pointRadius: 6,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 4,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => `GPA: ${context.raw}`
          }
        },
        legend: {
          display: false
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    },
    plugins: [verticalGuidePlugin]
  });
}

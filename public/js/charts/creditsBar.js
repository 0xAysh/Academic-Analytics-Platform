'use strict';

/**
 * @param {HTMLCanvasElement} container
 * @param {Array<{termName: string, credits: number}>} terms
 * @returns {Chart|null}
 */
export function renderCreditsBar(container, terms) {
  if (!container || !window.Chart) return null;
  
  const labels = terms.map(term => term.termName);
  const creditData = terms.map(term => term.credits);
  
  if (creditData.length === 0) return null;

  const ctx = container.getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Credits',
        data: creditData,
        backgroundColor: '#3B82F6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 20,
          ticks: {
            stepSize: 5
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => `Credits: ${context.raw}`
          }
        },
        legend: {
          display: false
        }
      }
    }
  });
}

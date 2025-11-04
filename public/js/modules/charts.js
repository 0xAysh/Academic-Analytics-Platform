(function() {
  if (!window.App) window.App = {};
  
  let gpaChartInstance = null;
  let creditsChartInstance = null;
  let gradeChartInstance = null;
  
  function renderGPATrendChart() {
    const canvas = document.getElementById('gpaChart');
    if (!canvas) return;
    
    const terms = transcriptData.getCompletedTerms();
    const filteredTerms = terms.filter(term => term.termGPA > 0 && !term.isPlanned);
    const labels = filteredTerms.map(term => term.termName);
    const gpaData = filteredTerms.map(term => term.termGPA);
    
    if (gpaData.length === 0) return;
    
    if (gpaChartInstance) {
      gpaChartInstance.destroy();
    }
    
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
    
    const ctx = canvas.getContext('2d');
    gpaChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'GPA',
          data: gpaData,
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
              label: context => `gpa : ${context.raw}`
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
  
  function renderCreditsChart() {
    const canvas = document.getElementById('creditsChart');
    if (!canvas) return;
    
    const terms = transcriptData.getCompletedTerms();
    const labels = terms.map(term => term.termName);
    const creditData = terms.map(term => term.credits);
    
    if (creditData.length === 0) return;
    
    if (creditsChartInstance) {
      creditsChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    creditsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
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
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `credits: ${context.raw}`
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
  }
  
  function renderGradeDistribution() {
    const canvas = document.getElementById('gradeChart');
    if (!canvas) return;
    
    // Aggregate raw grades into letter buckets (A aggregates A/A-, etc.)
    const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const completedTerms = transcriptData.getCompletedTerms();
    completedTerms.forEach(term => {
      term.courses.forEach(course => {
        if (!course.grade) return;
        const g = course.grade.trim()[0];
        if (buckets[g] !== undefined) buckets[g] += 1;
      });
    });
    const labels = ['A','B','C','D','F'];
    const counts = labels.map(l => buckets[l] || 0);
    const total = counts.reduce((s,v)=>s+v,0);
    if (total === 0) return;
    if (gradeChartInstance) gradeChartInstance.destroy();
    const colors = ['#10B981','#3B82F6','#F59E0B','#EF4444','#B91C1C'];

    // Filter out grades with zero count; keep order A..F
    const filtered = labels.map((l,i)=>({label:l,count:counts[i],color:colors[i]})).filter(item=>item.count>0);
    const finalLabels = filtered.map(f=>f.label);
    const finalCounts = filtered.map(f=>f.count);
    const finalColors = filtered.map(f=>f.color);
    const ctx = canvas.getContext('2d');
    gradeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: finalLabels,
        datasets: [{
          label: 'Number of Grades',
          data: finalCounts,
          backgroundColor: finalColors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `Count: ${ctx.raw}` } }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 2 }, grid: { display: false }, title: { display: true, text: 'Count' } },
          y: { grid: { display: false }, title: { display: true, text: 'Grade' } }
        }
      }
    });
  }
  
  window.App.renderGPATrendChart = renderGPATrendChart;
  window.App.renderCreditsChart = renderCreditsChart;
  window.App.renderGradeDistribution = renderGradeDistribution;
})();

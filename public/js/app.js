document.addEventListener('DOMContentLoaded', function() {
  if (!window.App) return;
  
  if (window.App.loadDashboardMetrics) {
    window.App.loadDashboardMetrics();
  }
  
  setTimeout(() => {
    if (window.App.renderGPATrendChart) window.App.renderGPATrendChart();
    if (window.App.renderCreditsChart) window.App.renderCreditsChart();
    if (window.App.renderCourseBreakdown) window.App.renderCourseBreakdown();
    if (window.App.renderGradeDistribution) window.App.renderGradeDistribution();
    if (window.App.renderStrengthSummary) window.App.renderStrengthSummary();
  }, 100);
  
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.App.renderGPATrendChart) window.App.renderGPATrendChart();
      if (window.App.renderCreditsChart) window.App.renderCreditsChart();
      if (window.App.renderGradeDistribution) window.App.renderGradeDistribution();
    }, 250);
  });
});

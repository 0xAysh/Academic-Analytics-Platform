(function() {
  if (!window.App) window.App = {};
  
  function loadDashboardMetrics() {
    const gpaEl = document.getElementById('overallGPA');
    if (gpaEl) {
      gpaEl.textContent = transcriptData.cumulative.overallGPA.toFixed(2);
    }
    
    const completedTerms = transcriptData.getCompletedTerms();
    const currentGpaEl = document.getElementById('currentSemesterGPA');
    if (completedTerms.length > 0 && currentGpaEl) {
      const currentSemester = completedTerms[completedTerms.length - 1];
      currentGpaEl.textContent = currentSemester.termGPA.toFixed(2);
    }
    
    const creditsEl = document.getElementById('creditsCompleted');
    if (creditsEl) {
      creditsEl.textContent = transcriptData.cumulative.totalEarnedCredits;
    }
    
    const coursesEl = document.getElementById('currentSemesterCourses');
    if (coursesEl) {
      const planned = transcriptData.terms.find(t => t.isPlanned);
      const completed = completedTerms[completedTerms.length - 1];
      coursesEl.textContent = planned ? planned.courses.length : (completed ? completed.courses.length : 0);
    }
  }
  
  window.App.loadDashboardMetrics = loadDashboardMetrics;
})();

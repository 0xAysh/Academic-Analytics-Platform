(function() {
  if (!window.App) window.App = {};
  
  function renderCourseBreakdown() {
    const tbody = document.getElementById('courseTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const completedTerms = transcriptData.getCompletedTerms();
    const courses = [];
    completedTerms.forEach(term => {
      term.courses.forEach(course => {
        courses.push({ ...course, term: term.termName });
      });
    });
    
    const termOrder = completedTerms.map(t => t.termName).reverse();
    courses.sort((a, b) => {
      const termDiff = termOrder.indexOf(b.term) - termOrder.indexOf(a.term);
      if (termDiff !== 0) return termDiff;
      return a.code.localeCompare(b.code);
    });
    
    const utils = window.App && window.App.utils;
    courses.forEach(course => {
      const tr = document.createElement('tr');
      const gpa = (utils && utils.gradeToGPA ? utils.gradeToGPA(course.grade) : 0).toFixed(1);
      const gradeLetter = (course.grade || 'F').trim()[0];
      const getColor = utils && utils.getGradeColor ? utils.getGradeColor : null;
      const color = getColor ? getColor(gradeLetter) : '#2563eb';
      tr.innerHTML = `
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td>${course.units}</td>
        <td><span class="grade-pill" style="color:${color}; border:1px solid ${color}; background: transparent;">${course.grade}</span></td>
        <td>${gpa}</td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  window.App.renderCourseBreakdown = renderCourseBreakdown;
})();

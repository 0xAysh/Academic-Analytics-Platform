(function() {
  if (!window.App) window.App = {};
  
  function renderStrengthSummary() {
    const strongContainer = document.getElementById('strongAreas');
    const improvementContainer = document.getElementById('improvementAreas');
    if (!strongContainer || !improvementContainer) return;
    
    strongContainer.innerHTML = '';
    improvementContainer.innerHTML = '';
    
    const bySubject = {};
    const terms = transcriptData.getCompletedTerms();
    
    terms.forEach(term => {
      term.courses.forEach(course => {
        const subject = course.code.split(' ')[0];
        bySubject[subject] = bySubject[subject] || { points: 0, units: 0 };
        bySubject[subject].points += course.points;
        bySubject[subject].units += course.units;
      });
    });
    
    const performance = Object.keys(bySubject).map(subject => ({
      subject: subject,
      gpa: bySubject[subject].points / bySubject[subject].units,
      percentage: ((bySubject[subject].points / bySubject[subject].units) / 4) * 100
    })).sort((a, b) => b.percentage - a.percentage);
    
    const strong = performance.filter(p => p.percentage >= 85);
    const weak = performance.filter(p => p.percentage < 80);
    
    function renderItem(container, item, type) {
      const div = document.createElement('div');
      div.className = `strength-item strength-item--${type}`;
      div.innerHTML = `
        <div class="strength-item__icon strength-item__icon--${type === 'strong' ? 'check' : 'warning'}">
          ${type === 'strong' ? '✓' : '!'}
        </div>
        <div class="strength-item__info">
          <div class="strength-item__title">${item.subject}</div>
          <div class="strength-item__performance">Performance: ${Math.round(item.percentage)}%</div>
        </div>
      `;
      container.appendChild(div);
    }
    
    if (strong.length > 0) {
      strong.forEach(item => renderItem(strongContainer, item, 'strong'));
    } else {
      strongContainer.innerHTML = '<p style="color: var(--text-secondary);">No strong areas identified</p>';
    }
    
    if (weak.length > 0) {
      weak.forEach(item => renderItem(improvementContainer, item, 'improvement'));
    } else {
      improvementContainer.innerHTML = '<p style="color: var(--text-secondary);">No areas need improvement</p>';
    }
  }
  
  window.App.renderStrengthSummary = renderStrengthSummary;
})();

(function() {
  if (!window.App) window.App = {};
  
  const gradeColors = {
    A: '#10B981', // green
    B: '#3B82F6', // blue
    C: '#F59E0B', // orange
    D: '#EF4444', // red
    F: '#B91C1C'  // dark red
  };

  window.App.utils = {
    gradeToGPA: function(grade) {
      const gradeMap = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
      };
      return gradeMap[grade] ?? 0.0;
    },
    getGradeColor: function(letter) {
      return gradeColors[letter] || '#6b7280';
    },
    gradeColors: gradeColors
  };
})();

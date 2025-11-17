'use strict';

/**
 * Grade color mapping
 */
export const gradeColors = {
  A: '#10B981', // green
  B: '#3B82F6', // blue
  C: '#F59E0B', // orange
  D: '#EF4444', // red
  F: '#B91C1C'  // dark red
};

/**
 * Convert letter grade to GPA value
 * @param {string} grade - Letter grade (e.g., 'A', 'B+', 'C-')
 * @returns {number} GPA value (0.0 to 4.0)
 */
export function gradeToGPA(grade) {
  const gradeMap = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[grade] ?? 0.0;
}

/**
 * Get color for a grade letter
 * @param {string} letter - Grade letter (A, B, C, D, F)
 * @returns {string} Hex color code
 */
export function getGradeColor(letter) {
  return gradeColors[letter] || '#6b7280';
}


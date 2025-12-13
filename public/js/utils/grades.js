'use strict';

export const gradeColors = {
  A: '#10B981',
  B: '#3B82F6',
  C: '#F59E0B',
  D: '#EF4444',
  F: '#B91C1C'
};

/**
 * @param {string} grade
 * @returns {number}
 */
export function gradeToGPA(grade) {
  const gradeMap = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[grade] ?? 0.0;
}

/**
 * @param {string} letter
 * @returns {string}
 */
export function getGradeColor(letter) {
  return gradeColors[letter] || '#6b7280';
}

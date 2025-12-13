'use strict';

function getTermSortValue(termCode) {
  if (!termCode || typeof termCode !== 'string') {
    return 0;
  }
  
  const code = termCode.toUpperCase().trim();
  const seasonMatch = code.match(/^(SP|SU|FA|WI|SPRING|SUMMER|FALL|WINTER)/);
  const yearMatch = code.match(/(\d{4})/);
  
  if (!seasonMatch || !yearMatch) {
    return 0;
  }
  
  const year = parseInt(yearMatch[1], 10);
  const season = seasonMatch[1].substring(0, 2).toUpperCase();
  
  let seasonNum = 0;
  if (season === 'SP') seasonNum = 1;
  else if (season === 'SU') seasonNum = 2;
  else if (season === 'FA') seasonNum = 3;
  else if (season === 'WI') seasonNum = 4;
  else return 0;
  
  return year * 10 + seasonNum;
}

/**
 * @param {Array} terms
 * @returns {Array}
 */
export function sortTermsChronologically(terms) {
  if (!Array.isArray(terms)) {
    return [];
  }
  
  return [...terms].sort((a, b) => {
    const aValue = getTermSortValue(a.term || a.termCode || '');
    const bValue = getTermSortValue(b.term || b.termCode || '');
    return aValue - bValue;
  });
}

/**
 * @param {object} term
 * @returns {boolean}
 */
export function isTermOnGoing(term) {
  if (!term || !term.courses || term.courses.length === 0) {
    return false;
  }
  
  if (term.isPlanned) {
    return false;
  }
  
  const hasCoursesWithoutGrades = term.courses.some(course => 
    !course.grade || course.grade.trim() === '' || course.grade === null
  );
  
  return hasCoursesWithoutGrades;
}

/**
 * @param {object} transcriptData
 * @returns {Array}
 */
export function getActiveTerms(transcriptData) {
  if (!transcriptData || !transcriptData.terms) {
    return [];
  }
  
  return transcriptData.terms.filter(term => {
    if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
      return false;
    }
    
    return term.courses && term.courses.length > 0;
  });
}

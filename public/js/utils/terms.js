'use strict';

/**
 * Term utility functions
 */

/**
 * Parse term code to get sortable date
 * @param {string} termCode - Term code like "SP2024", "FA2024", "SU2024"
 * @returns {number} Sortable number (year * 10 + season: SP=1, SU=2, FA=3)
 */
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
  
  // Map seasons to numbers for sorting: SP=1, SU=2, FA=3, WI=4
  let seasonNum = 0;
  if (season === 'SP') seasonNum = 1;
  else if (season === 'SU') seasonNum = 2;
  else if (season === 'FA') seasonNum = 3;
  else if (season === 'WI') seasonNum = 4;
  else return 0;
  
  // Return year * 10 + season number for proper chronological sorting
  return year * 10 + seasonNum;
}

/**
 * Sort terms chronologically
 * @param {Array} terms - Array of term objects
 * @returns {Array} Sorted array of terms
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
 * Check if a term is on-going (has courses but some/all without grades)
 * @param {object} term - Term object
 * @returns {boolean} True if term is on-going
 */
export function isTermOnGoing(term) {
  if (!term || !term.courses || term.courses.length === 0) {
    return false;
  }
  
  // If term is marked as planned, it's not on-going
  if (term.isPlanned) {
    return false;
  }
  
  // Check if there are courses with no grades
  const hasCoursesWithoutGrades = term.courses.some(course => 
    !course.grade || course.grade.trim() === '' || course.grade === null
  );
  
  // Check if there are courses with grades
  const hasCoursesWithGrades = term.courses.some(course => 
    course.grade && course.grade.trim() !== '' && course.grade !== null
  );
  
  // On-going: has courses, some have grades, some don't (or all don't but term is not planned)
  return hasCoursesWithoutGrades;
}

/**
 * Get all active terms (completed + on-going, excluding only planned)
 * @param {object} transcriptData - Transcript data object
 * @returns {Array} Array of active terms
 */
export function getActiveTerms(transcriptData) {
  if (!transcriptData || !transcriptData.terms) {
    return [];
  }
  
  return transcriptData.terms.filter(term => {
    // Exclude only truly planned terms (no courses or explicitly marked as planned)
    if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
      return false;
    }
    
    // Include all terms that have courses (completed or on-going)
    return term.courses && term.courses.length > 0;
  });
}


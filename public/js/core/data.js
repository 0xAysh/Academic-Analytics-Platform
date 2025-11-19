'use strict';

import { getTranscript } from '../api/transcripts.js';
import { sortTermsChronologically } from '../utils/terms.js';

/**
 * Get transcriptData from global scope or fetch from API
 * Maintains backward compatibility with global window.transcriptData
 */
export function getTranscriptData() {
  if (typeof window !== 'undefined' && window.transcriptData) {
    return window.transcriptData;
  }
  return null;
}

/**
 * Create empty transcript structure with zero/default values
 * This overrides any mock data that might exist
 */
function createEmptyTranscript() {
  return {
    studentInfo: {
      degree: '',
      institution: 'SF State'
    },
    terms: [],
    cumulative: {
      overallGPA: 0,
      combinedGPA: 0,
      totalCredits: 0,
      totalEarnedCredits: 0,
      totalGPAUnits: 0,
      totalPoints: 0,
      totalPlannedCredits: 0
    },
    getCompletedTerms: function() {
      // Return terms that are completed or on-going (exclude only truly planned terms)
      const activeTerms = this.terms.filter(term => {
        // Exclude only truly planned terms (no courses or explicitly marked as planned with no courses)
        if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
          return false;
        }
        
        // Include all terms that have courses (completed or on-going)
        return term.courses && term.courses.length > 0;
      });
      
      // Sort chronologically
      return sortTermsChronologically(activeTerms);
    },
    getCoursesBySubject: function(subjectPrefix) {
      const allCourses = [];
      this.getCompletedTerms().forEach(term => {
        term.courses.forEach(course => {
          if (course.code && course.code.startsWith(subjectPrefix)) {
            allCourses.push({...course, term: term.term, termName: term.termName});
          }
        });
      });
      return allCourses;
    },
    getGPABySubject: function(subjectPrefix) {
      const courses = this.getCoursesBySubject(subjectPrefix);
      if (courses.length === 0) return null;
      
      const totalPoints = courses.reduce((sum, course) => sum + (course.points || 0), 0);
      // Use earnedUnits for GPA calculation, not attempted units
      const totalEarnedUnits = courses.reduce((sum, course) => sum + (course.earnedUnits || 0), 0);
      return totalEarnedUnits > 0 ? (totalPoints / totalEarnedUnits).toFixed(2) : null;
    }
  };
}

/**
 * Add helper methods to transcript object
 */
function addHelperMethods(transcript) {
  transcript.getCompletedTerms = function() {
    // Return terms that are completed (all courses have grades) or on-going (some courses have grades)
    // Exclude only truly planned terms (no courses or explicitly marked as planned with no courses)
    const activeTerms = this.terms.filter(term => {
      // Exclude only truly planned terms (no courses or explicitly marked as planned with no courses)
      if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
        return false;
      }
      
      // Include all terms that have courses (completed or on-going)
      return term.courses && term.courses.length > 0;
    });
    
    // Sort chronologically
    return sortTermsChronologically(activeTerms);
  };
  
  transcript.getCoursesBySubject = function(subjectPrefix) {
    const allCourses = [];
    this.getCompletedTerms().forEach(term => {
      term.courses.forEach(course => {
        if (course.code && course.code.startsWith(subjectPrefix)) {
          allCourses.push({...course, term: term.term, termName: term.termName});
        }
      });
    });
    return allCourses;
  };
  
  transcript.getGPABySubject = function(subjectPrefix) {
    const courses = this.getCoursesBySubject(subjectPrefix);
    if (courses.length === 0) return null;
    
    const totalPoints = courses.reduce((sum, course) => sum + (course.points || 0), 0);
    // Use earnedUnits for GPA calculation, not attempted units
    const totalEarnedUnits = courses.reduce((sum, course) => sum + (course.earnedUnits || 0), 0);
    return totalEarnedUnits > 0 ? (totalPoints / totalEarnedUnits).toFixed(2) : null;
  };
  
  return transcript;
}

/**
 * Load transcript data from API and set it globally
 * This should be called after login
 * If no transcript exists, initializes with empty structure (overrides mock data)
 */
export async function loadTranscriptData() {
  try {
    const transcript = await getTranscript();
    
    let finalTranscript;
    
    if (transcript) {
      // Sort terms chronologically before adding helper methods
      if (transcript.terms && Array.isArray(transcript.terms)) {
        transcript.terms = sortTermsChronologically(transcript.terms);
      }
      
      // Add helper methods to existing transcript
      finalTranscript = addHelperMethods(transcript);
    } else {
      // No transcript in DB - create empty structure to override mock data
      finalTranscript = createEmptyTranscript();
    }
    
    // Set globally (this will override any mock data from data.js)
    if (typeof window !== 'undefined') {
      window.transcriptData = finalTranscript;
    }
    
    return finalTranscript;
  } catch (error) {
    // On error, still initialize empty structure to override mock data
    const emptyTranscript = createEmptyTranscript();
    if (typeof window !== 'undefined') {
      window.transcriptData = emptyTranscript;
    }
    return emptyTranscript;
  }
}


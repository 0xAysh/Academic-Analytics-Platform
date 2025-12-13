'use strict';

import { getTranscript } from '../api/transcripts.js';
import { sortTermsChronologically } from '../utils/terms.js';

/**
 * @returns {object|null}
 */
export function getTranscriptData() {
  if (typeof window !== 'undefined' && window.transcriptData) {
    return window.transcriptData;
  }
  return null;
}

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
      const activeTerms = this.terms.filter(term => {
        if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
          return false;
        }
        
        return term.courses && term.courses.length > 0;
      });
      
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
      const totalEarnedUnits = courses.reduce((sum, course) => sum + (course.earnedUnits || 0), 0);
      return totalEarnedUnits > 0 ? (totalPoints / totalEarnedUnits).toFixed(2) : null;
    }
  };
}

function addHelperMethods(transcript) {
  transcript.getCompletedTerms = function() {
    const activeTerms = this.terms.filter(term => {
      if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
        return false;
      }
      
      return term.courses && term.courses.length > 0;
    });
    
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
    const totalEarnedUnits = courses.reduce((sum, course) => sum + (course.earnedUnits || 0), 0);
    return totalEarnedUnits > 0 ? (totalPoints / totalEarnedUnits).toFixed(2) : null;
  };
  
  return transcript;
}

/**
 * @returns {Promise<object>}
 */
export async function loadTranscriptData() {
  try {
    const transcript = await getTranscript();
    
    let finalTranscript;
    
    if (transcript) {
      if (transcript.terms && Array.isArray(transcript.terms)) {
        transcript.terms = sortTermsChronologically(transcript.terms);
      }
      
      finalTranscript = addHelperMethods(transcript);
    } else {
      finalTranscript = createEmptyTranscript();
    }
    
    if (typeof window !== 'undefined') {
      window.transcriptData = finalTranscript;
    }
    
    return finalTranscript;
  } catch (error) {
    const emptyTranscript = createEmptyTranscript();
    if (typeof window !== 'undefined') {
      window.transcriptData = emptyTranscript;
    }
    return emptyTranscript;
  }
}

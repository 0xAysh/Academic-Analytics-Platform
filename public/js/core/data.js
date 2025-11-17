'use strict';

import { getTranscript } from '../api/transcripts.js';

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
 * Load transcript data from API and set it globally
 * This should be called after login
 */
export async function loadTranscriptData() {
  try {
    const transcript = await getTranscript();
    
    if (transcript) {
      // Add helper methods to match the old structure
      transcript.getCompletedTerms = function() {
        return this.terms.filter(term => !term.isPlanned);
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
        const totalUnits = courses.reduce((sum, course) => sum + (course.units || 0), 0);
        return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null;
      };
      
      // Set globally
      if (typeof window !== 'undefined') {
        window.transcriptData = transcript;
      }
      
      return transcript;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load transcript data:', error);
    return null;
  }
}


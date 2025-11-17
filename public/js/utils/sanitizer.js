'use strict';

/**
 * Remove sensitive information from transcript data
 * @param {object} data - Parsed transcript data
 * @returns {object} Sanitized transcript data
 */
export function sanitizeTranscriptData(data) {
  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone

  // Remove sensitive fields from studentInfo
  if (sanitized.studentInfo) {
    // Remove name, studentId, and other sensitive fields
    delete sanitized.studentInfo.name;
    delete sanitized.studentInfo.studentId;
    delete sanitized.studentInfo.student_id;
    delete sanitized.studentInfo.id;
    delete sanitized.studentInfo.ssn;
    delete sanitized.studentInfo.address;
    delete sanitized.studentInfo.phone;
    delete sanitized.studentInfo.phoneNumber;
    
    // Keep only: degree, institution
    sanitized.studentInfo = {
      degree: sanitized.studentInfo.degree || '',
      institution: 'SF State' // Always SF State
    };
  }

  // Remove any sensitive data from terms
  if (sanitized.terms && Array.isArray(sanitized.terms)) {
    sanitized.terms = sanitized.terms.map(term => {
      const cleanTerm = { ...term };
      // Remove any fields that might contain sensitive info
      delete cleanTerm.studentName;
      delete cleanTerm.studentId;
      delete cleanTerm.id; // We'll let DB assign IDs
      
      // Clean courses
      if (cleanTerm.courses && Array.isArray(cleanTerm.courses)) {
        cleanTerm.courses = cleanTerm.courses.map(course => {
          const cleanCourse = { ...course };
          delete cleanCourse.id; // We'll let DB assign IDs
          return cleanCourse;
        });
      }
      
      return cleanTerm;
    });
  }

  // Remove cumulative if present (will be recalculated)
  delete sanitized.cumulative;

  return sanitized;
}


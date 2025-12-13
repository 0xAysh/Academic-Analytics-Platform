'use strict';

/**
 * @param {object} data
 * @returns {object}
 */
export function sanitizeTranscriptData(data) {
  const sanitized = JSON.parse(JSON.stringify(data));

  if (sanitized.studentInfo) {
    delete sanitized.studentInfo.name;
    delete sanitized.studentInfo.studentId;
    delete sanitized.studentInfo.student_id;
    delete sanitized.studentInfo.id;
    delete sanitized.studentInfo.ssn;
    delete sanitized.studentInfo.address;
    delete sanitized.studentInfo.phone;
    delete sanitized.studentInfo.phoneNumber;
    
    sanitized.studentInfo = {
      degree: sanitized.studentInfo.degree || '',
      institution: 'SF State'
    };
  }

  if (sanitized.terms && Array.isArray(sanitized.terms)) {
    sanitized.terms = sanitized.terms.map(term => {
      const cleanTerm = { ...term };
      delete cleanTerm.studentName;
      delete cleanTerm.studentId;
      delete cleanTerm.id;
      
      if (cleanTerm.courses && Array.isArray(cleanTerm.courses)) {
        cleanTerm.courses = cleanTerm.courses.map(course => {
          const cleanCourse = { ...course };
          delete cleanCourse.id;
          return cleanCourse;
        });
      }
      
      return cleanTerm;
    });
  }

  delete sanitized.cumulative;

  return sanitized;
}

'use strict';

/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * @param {string} password
 * @returns {object}
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }
  
  return { valid: true };
}

/**
 * @param {object} data
 * @returns {object}
 */
function validateTranscriptData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Transcript data must be an object' };
  }
  
  if (data.studentInfo && typeof data.studentInfo !== 'object') {
    return { valid: false, error: 'studentInfo must be an object' };
  }
  
  if (!Array.isArray(data.terms)) {
    return { valid: false, error: 'terms must be an array' };
  }
  
  for (let i = 0; i < data.terms.length; i++) {
    const term = data.terms[i];
    if (!term || typeof term !== 'object') {
      return { valid: false, error: `Term ${i + 1} must be an object` };
    }
    
    if (term.termGPA !== undefined) {
      const gpa = parseFloat(term.termGPA);
      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        return { valid: false, error: `Term ${i + 1}: GPA must be between 0 and 4` };
      }
    }
    
    if (term.courses && !Array.isArray(term.courses)) {
      return { valid: false, error: `Term ${i + 1}: courses must be an array` };
    }
    
    if (term.courses) {
      for (let j = 0; j < term.courses.length; j++) {
        const course = term.courses[j];
        if (!course || typeof course !== 'object') {
          return { valid: false, error: `Term ${i + 1}, Course ${j + 1} must be an object` };
        }
        
        if (course.grade && course.points !== undefined) {
          const points = parseFloat(course.points);
          if (isNaN(points) || points < 0) {
            return { valid: false, error: `Term ${i + 1}, Course ${j + 1}: points must be a non-negative number` };
          }
        }
      }
    }
  }
  
  return { valid: true };
}

/**
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.trim().substring(0, maxLength);
}

module.exports = {
  isValidEmail,
  validatePassword,
  validateTranscriptData,
  sanitizeString
};

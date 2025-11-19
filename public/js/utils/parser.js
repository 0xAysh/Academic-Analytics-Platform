'use strict';

/**
 * Parse transcript file (PDF or text)
 * @param {File} file - File object
 * @returns {Promise<object>} Parsed transcript data
 */
export async function parseTranscript(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return parseText(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or text file.');
  }
}

/**
 * Parse PDF file
 * @param {File} file - PDF file
 * @returns {Promise<object>} Parsed transcript data
 */
async function parsePDF(file) {
  // Check if PDF.js is available (pdfjsLib is the global variable when loaded via CDN)
  if (typeof window === 'undefined' || typeof window.pdfjsLib === 'undefined') {
    throw new Error('PDF.js library is not loaded. Please include PDF.js in your HTML.');
  }
  
  const pdfjsLib = window.pdfjsLib;

  try {
    // Configure worker if not already set
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Extract text from all pages with better line handling
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text extraction - preserve line breaks where possible
      let pageText = '';
      let lastY = null;
      
      for (const item of textContent.items) {
        // If Y position changed significantly, it's likely a new line
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        }
        pageText += item.str + ' ';
        lastY = item.transform[5];
      }
      
      fullText += pageText + '\n';
    }

    return parseTextContent(fullText);
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Parse text file
 * @param {File} file - Text file
 * @returns {Promise<object>} Parsed transcript data
 */
async function parseText(file) {
  try {
    const text = await file.text();
    return parseTextContent(text);
  } catch (error) {
    throw new Error(`Failed to parse text file: ${error.message}`);
  }
}

/**
 * Parse text content into structured transcript data
 * Parses SF State transcript format
 * @param {string} text - Raw text content
 * @returns {object} Parsed transcript data
 */
function parseTextContent(text) {
  // Split by newlines, but also try to split long lines that might contain multiple courses
  let lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // If lines are very long, try to split them further by looking for course patterns
  const expandedLines = [];
  for (const line of lines) {
    // If line is very long and contains course codes, try to split it
    if (line.length > 100 && line.match(/[A-Z]{2,4}\s+\d{3}/g)) {
      // Try to split on course codes (but keep the code with the rest)
      const parts = line.split(/(?=([A-Z]{2,4}\s+\d{3}))/);
      expandedLines.push(...parts.filter(p => p.trim()));
    } else {
      expandedLines.push(line);
    }
  }
  lines = expandedLines;
  
  // Look for degree/major
  let degree = '';
  const degreePatterns = [
    /Plan\s*:\s*([^\n]+?)(?:\s+Session:|$)/i,
    /major[:\s]+([^\n]+)/i, 
    /degree[:\s]+([^\n]+)/i
  ];
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      degree = match[1].trim();
      break;
    }
  }

  const terms = [];
  let currentTerm = null;
  let termPattern = /(SP|FA|SU|WI)(\d{4})/i; // Matches SP2024, FA2024, etc.
  
  // Grade to points mapping
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0, 'W': null, 'I': null, 'P': null, 'NP': null
  };
  
  function calculatePoints(grade, units) {
    const points = gradePoints[grade];
    if (points === null || points === undefined) return 0;
    return points * parseFloat(units || 0);
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for term headers (e.g., "SP2024 Plan : Computer Science Major" or just "SP2024")
    // Make pattern more flexible - term code can be anywhere in the line
    const termMatch = line.match(termPattern);
    if (termMatch) {
      // Save previous term if exists
      if (currentTerm && currentTerm.courses.length > 0) {
        terms.push(currentTerm);
      }
      
      // Create new term
      const termCode = termMatch[0].toUpperCase();
      const termName = getTermName(termCode);
      
      currentTerm = {
        term: termCode,
        termName: termName,
        termGPA: 0,
        credits: 0,
        earnedCredits: 0,
        gpaUnits: 0,
        points: 0,
        isPlanned: false,
        courses: []
      };
      continue;
    }
    
    // Skip header lines
    if (line.match(/Session\s+Course\s+Description/i) || 
        line.match(/Units\s+Earned\s+Grade/i) ||
        line.match(/^Course\s+Description/i)) {
      continue;
    }
    
    // Look for course lines
    // SF State format can have two variations:
    // 1. No space: "HIST  114WORLD HISTORY TO 15003.003.00A12.00"
    // 2. With space: "CSC 215 INTERMED COMPUTER PROGRAMMING 4.00 4.00 A 16.00"
    // Format: CourseCode + CourseName (with or without space) + Units + EarnedUnits + Grade + Points
    // Course name can contain numbers, spaces, hyphens, &, etc.
    // Key: Course name ends when we see pattern: \d+\.\d{2}\s+\d+\.\d{2} or \d+\.\d{2}\d+\.\d{2} (two decimal numbers)
    let courseMatch = null;
    
    // Pattern explanation:
    // 1. Course code: ([A-Z]{2,4}\s+\d{3}) - e.g., "HIST  114" or "AA S  101" or "CSC 215"
    // 2. Course name: ([A-Z][A-Z\s\-0-9&]+) - starts with capital, can contain letters, spaces, hyphens, numbers, &
    //    Use positive lookahead to stop before units pattern
    //    Note: Use greedy + instead of +? because lookahead ensures we stop at the right place
    // 3. Units: (\d+\.\d{2}) - always X.XX format
    // 4. Earned units: (\d+\.\d{2}) - always X.XX format  
    // 5. Grade: ([A-Z\+\-]+) - letters with optional +/-
    // 6. Points: (\d+\.\d{2})? - optional, always X.XX format
    const patterns = [
      // Pattern 1: With space between code and name, with points: "CSC 215 INTERMED COMPUTER PROGRAMMING 4.00 4.00 A 16.00"
      // Match: CODE + spaces + NAME + spaces + UNITS + spaces + EARNED + spaces + GRADE + optional spaces + POINTS
      /^([A-Z]{2,4}\s+\d{3})\s+([A-Z][A-Z\s\-0-9&]+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z\+\-]+)(?:\s+(\d+\.\d{2}))?$/,
      // Pattern 2: With space between code and name, without points: "CSC 215 INTERMED COMPUTER PROGRAMMING 4.00 4.00 A"
      /^([A-Z]{2,4}\s+\d{3})\s+([A-Z][A-Z\s\-0-9&]+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z\+\-]+)$/,
      // Pattern 3: No space between code and name, with points: "HIST  114WORLD HISTORY TO 15003.003.00A12.00"
      /^([A-Z]{2,4}\s+\d{3})([A-Z][A-Z\s\-0-9&]+)(?=\d+\.\d{2}\d+\.\d{2})(\d+\.\d{2})(\d+\.\d{2})([A-Z\+\-]+)(\d+\.\d{2})/,
      // Pattern 4: No space between code and name, without points: "HIST  114WORLD HISTORY TO 15003.003.00A"
      /^([A-Z]{2,4}\s+\d{3})([A-Z][A-Z\s\-0-9&]+)(?=\d+\.\d{2}\d+\.\d{2})(\d+\.\d{2})(\d+\.\d{2})([A-Z\+\-]+)/
    ];
    
    for (const pattern of patterns) {
      courseMatch = line.match(pattern);
      if (courseMatch) break;
    }
    
    if (courseMatch && currentTerm) {
      const code = courseMatch[1].trim();
      let name = courseMatch[2].trim();
      const units = parseFloat(courseMatch[3]);
      const earnedUnits = parseFloat(courseMatch[4]);
      const grade = courseMatch[5].trim();
      const pointsFromPDF = courseMatch[6] ? parseFloat(courseMatch[6]) : null;
      
      // Course name should already be clean due to lookahead, but trim it
      name = name.trim();
      
      // Validate that we have reasonable values
      if (isNaN(units) || isNaN(earnedUnits) || !grade) {
        continue;
      }
      
      // Use points from PDF if available, otherwise calculate
      const points = pointsFromPDF !== null ? pointsFromPDF : calculatePoints(grade, earnedUnits);
      
      const course = {
        code: code,
        name: name,
        units: parseFloat(units.toFixed(2)),
        earnedUnits: parseFloat(earnedUnits.toFixed(2)),
        grade: grade,
        points: parseFloat(points.toFixed(2))
      };
      
      currentTerm.courses.push(course);
      currentTerm.credits += units;
      currentTerm.earnedCredits += earnedUnits;
      currentTerm.points += points;
    }
  }
  
  // Save last term
  if (currentTerm && currentTerm.courses.length > 0) {
    terms.push(currentTerm);
  }
  
  // If no courses were found but we have terms, try searching the full text
  if (terms.length > 0 && terms.every(t => t.courses.length === 0)) {
    // Reset terms but keep the term structure
    const termCodes = terms.map(t => t.term);
    terms = [];
    
    // Search for all course patterns in the full text
    // Handle both formats: with space and without space between code and name
    // Try with space first (more common in PDF.js extraction)
    let fullTextCoursePattern = /([A-Z]{2,4}\s+\d{3})\s+([A-Z][A-Z\s\-0-9&]+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z\+\-]+)(?:\s+(\d+\.\d{2}))?/g;
    let allMatches = Array.from(text.matchAll(fullTextCoursePattern));
    
    // If no matches with space, try without space
    if (allMatches.length === 0) {
      fullTextCoursePattern = /([A-Z]{2,4}\s+\d{3})([A-Z][A-Z\s\-0-9&]+)(?=\d+\.\d{2}\d+\.\d{2})(\d+\.\d{2})(\d+\.\d{2})([A-Z\+\-]+)(\d+\.\d{2})?/g;
      allMatches = Array.from(text.matchAll(fullTextCoursePattern));
    }
    
    // Group courses by term (find which term each course belongs to)
    let currentTermIndex = 0;
    for (const match of allMatches) {
      const code = match[1].trim();
      let name = match[2].trim();
      const units = parseFloat(match[3]);
      const earnedUnits = parseFloat(match[4]);
      const grade = match[5].trim();
      const pointsFromPDF = match[6] ? parseFloat(match[6]) : null;
      
      // Course name should already be clean due to lookahead, but trim it
      name = name.trim();
      
      // Find which term this course belongs to (by position in text)
      const matchPosition = match.index;
      const termPositions = [];
      for (const termCode of termCodes) {
        const termMatch = text.substring(0, matchPosition).lastIndexOf(termCode);
        termPositions.push(termMatch);
      }
      const latestTermIndex = termPositions.indexOf(Math.max(...termPositions));
      
      // Ensure we have a term for this course
      while (terms.length <= latestTermIndex) {
        const termCode = termCodes[terms.length];
        terms.push({
          term: termCode,
          termName: getTermName(termCode),
          termGPA: 0,
          credits: 0,
          earnedCredits: 0,
          gpaUnits: 0,
          points: 0,
          isPlanned: false,
          courses: []
        });
      }
      
      const term = terms[latestTermIndex];
      const points = pointsFromPDF !== null ? pointsFromPDF : calculatePoints(grade, earnedUnits);
      
      term.courses.push({
        code: code,
        name: name,
        units: parseFloat(units.toFixed(2)),
        earnedUnits: parseFloat(earnedUnits.toFixed(2)),
        grade: grade,
        points: parseFloat(points.toFixed(2))
      });
      
      term.credits += units;
      term.earnedCredits += earnedUnits;
      term.points += points;
    }
  }
  
  // Calculate term GPAs and round all values
  terms.forEach(term => {
    if (term.earnedCredits > 0) {
      term.termGPA = parseFloat((term.points / term.earnedCredits).toFixed(2));
      term.gpaUnits = parseFloat(term.earnedCredits.toFixed(2));
    }
    // Round all term values
    term.credits = parseFloat(term.credits.toFixed(2));
    term.earnedCredits = parseFloat(term.earnedCredits.toFixed(2));
    term.points = parseFloat(term.points.toFixed(2));
  });
  
  // Calculate cumulative stats
  // Include completed and on-going terms (terms with courses) for GPA and earned credits
  // Exclude only truly planned terms (no courses)
  const activeTerms = terms.filter(t => {
    // Exclude only truly planned terms (no courses)
    if (t.isPlanned && (!t.courses || t.courses.length === 0)) {
      return false;
    }
    // Include all terms that have courses (completed or on-going)
    return t.courses && t.courses.length > 0;
  });
  
  let totalPoints = 0;
  let totalEarnedCredits = 0;
  let totalCredits = 0;
  let totalPlannedCredits = 0;
  
  // Calculate from active terms (completed and on-going)
  activeTerms.forEach(term => {
    totalPoints += term.points;
    totalEarnedCredits += term.earnedCredits;
    totalCredits += term.credits;
  });
  
  // Calculate planned credits separately (only truly planned terms with no courses)
  terms.forEach(term => {
    if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
      totalPlannedCredits += term.credits;
    }
  });
  
  const overallGPA = totalEarnedCredits > 0 ? totalPoints / totalEarnedCredits : 0;
  
  return {
    studentInfo: {
      degree: degree || 'Computer Science Major',
      institution: 'SF State'
    },
    terms: terms,
    cumulative: {
      overallGPA: parseFloat(overallGPA.toFixed(2)),
      combinedGPA: parseFloat(overallGPA.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      totalEarnedCredits: parseFloat(totalEarnedCredits.toFixed(2)),
      totalGPAUnits: parseFloat(totalEarnedCredits.toFixed(2)),
      totalPoints: parseFloat(totalPoints.toFixed(2)),
      totalPlannedCredits: parseFloat(totalPlannedCredits.toFixed(2))
    }
  };
}

/**
 * Convert term code to term name
 * @param {string} termCode - Term code like "SP2024"
 * @returns {string} Term name like "Spring 2024"
 */
function getTermName(termCode) {
  const match = termCode.match(/(SP|FA|SU|WI)(\d{4})/i);
  if (!match) return termCode;
  
  const season = match[1].toUpperCase();
  const year = match[2];
  
  const seasonNames = {
    'SP': 'Spring',
    'FA': 'Fall',
    'SU': 'Summer',
    'WI': 'Winter'
  };
  
  return `${seasonNames[season] || season} ${year}`;
}

/**
 * Helper function to parse a structured transcript JSON (if user uploads JSON file)
 * @param {string} jsonText - JSON string
 * @returns {object} Parsed transcript data
 */
export function parseJSONTranscript(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    
    // Validate structure
    if (!data.terms || !Array.isArray(data.terms)) {
      throw new Error('Invalid transcript format: missing terms array');
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}


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
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
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
 * This is a basic parser - you may need to customize based on your transcript format
 * @param {string} text - Raw text content
 * @returns {object} Parsed transcript data
 */
function parseTextContent(text) {
  // This is a simplified parser - you'll need to customize based on actual transcript format
  // For now, return a structure that matches the expected format
  
  // Try to extract basic information
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Look for degree/major
  let degree = '';
  const degreePatterns = [/major[:\s]+([^\n]+)/i, /degree[:\s]+([^\n]+)/i];
  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      degree = match[1].trim();
      break;
    }
  }

  // For now, return a basic structure
  // In production, you'd implement more sophisticated parsing
  // This is a placeholder that expects the user to manually enter data or
  // you can enhance this parser based on your specific transcript format
  
  return {
    studentInfo: {
      degree: degree || 'Computer Science Major',
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
    }
  };
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


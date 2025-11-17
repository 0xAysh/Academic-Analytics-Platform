'use strict';

import { $ } from '../utils/dom.js';
import { parseTranscript, parseJSONTranscript } from '../utils/parser.js';
import { sanitizeTranscriptData } from '../utils/sanitizer.js';
import { saveTranscript } from '../api/transcripts.js';

/**
 * Initialize transcript upload handler
 * Parses file client-side, sanitizes data, and sends to API
 */
export function initTranscriptUpload() {
  const input = $('#transcriptFile');
  const nameEl = $('#uploadFileName');
  const uploadBtn = $('#uploadBtn');
  
  if (!input) return;
  
  input.addEventListener('change', async function() {
    const file = input.files && input.files[0];
    if (!file) return;
    
    if (nameEl) {
      nameEl.textContent = file.name;
    }
    
    // Show loading state
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Processing...';
    }
    
    try {
      // Parse the file
      let parsedData;
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        parsedData = parseJSONTranscript(text);
      } else {
        parsedData = await parseTranscript(file);
      }
      
      // Sanitize data (remove sensitive info)
      const sanitizedData = sanitizeTranscriptData(parsedData);
      
      // Send to API
      await saveTranscript(sanitizedData);
      
      // Show success message
      if (nameEl) {
        nameEl.textContent = `${file.name} - Uploaded successfully!`;
      }
      
      // Reload page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading transcript: ${error.message}`);
      
      if (nameEl) {
        nameEl.textContent = 'Upload failed';
      }
    } finally {
      if (uploadBtn) {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
      }
    }
  });
}

/**
 * Initialize empty mode based on transcript data availability
 * Hides data until transcript is uploaded
 */
export function initEmptyMode() {
  function setupEmptyMode() {
    if (typeof window !== 'undefined') {
      if (!window.App) window.App = {};
      
      // Check if transcript data exists and has terms
      const hasData = window.transcriptData && 
                     window.transcriptData.terms && 
                     window.transcriptData.terms.length > 0;
      
      window.App.emptyMode = !hasData;
      
      if (window.transcriptData && typeof window.transcriptData.getCompletedTerms === 'function') {
        if (!window.App._origGetTerms) {
          window.App._origGetTerms = window.transcriptData.getCompletedTerms.bind(window.transcriptData);
        }
        
        if (window.App.emptyMode) {
          window.transcriptData.getCompletedTerms = function() { return []; };
        } else {
          window.transcriptData.getCompletedTerms = window.App._origGetTerms;
        }
      }
    }
  }
  
  // Wait for transcriptData to be available
  if (window.transcriptData) {
    setupEmptyMode();
  } else {
    // Retry after a short delay if data isn't ready yet
    setTimeout(() => {
      if (window.transcriptData) {
        setupEmptyMode();
      }
    }, 100);
  }
}


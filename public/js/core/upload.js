'use strict';

import { $ } from '../utils/dom.js';
import { parseTranscript, parseJSONTranscript } from '../utils/parser.js';
import { sanitizeTranscriptData } from '../utils/sanitizer.js';
import { saveTranscript } from '../api/transcripts.js';
import { showError, showSuccess } from '../utils/notifications.js';
import { getTranscriptData } from './data.js';

/**
 * Initialize transcript upload handler
 * Parses file client-side, sanitizes data, and sends to API
 */
export function initTranscriptUpload() {
  const input = $('#transcriptFile');
  const nameEl = $('#uploadFileName');
  const loadingEl = $('#uploadLoading');
  const loadingTextEl = $('#uploadLoadingText');
  const uploadCard = $('#uploadCard');
  const uploadBtnLabel = $('#uploadBtnLabel');
  const uploadBtnText = $('#uploadBtnText');
  
  if (!input) {
    console.error('Transcript file input not found');
    return;
  }
  
  
  function showLoading(message = 'Processing...') {
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
      loadingEl.classList.add('show-flex');
    }
    if (loadingTextEl) {
      loadingTextEl.textContent = message;
    }
    if (uploadBtnLabel) {
      uploadBtnLabel.style.pointerEvents = 'none';
      uploadBtnLabel.style.opacity = '0.6';
    }
    if (input) {
      input.disabled = true;
    }
  }
  
  function hideLoading() {
    if (loadingEl) {
      loadingEl.classList.add('hidden');
      loadingEl.classList.remove('show-flex');
    }
    if (uploadBtnLabel) {
      uploadBtnLabel.style.pointerEvents = 'auto';
      uploadBtnLabel.style.opacity = '1';
    }
    if (input) {
      input.disabled = false;
    }
  }
  
  input.addEventListener('change', async function(e) {
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    
    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      showError('File size exceeds 10MB limit. Please upload a smaller file.');
      input.value = ''; // Clear the input
      if (nameEl) {
        nameEl.textContent = '';
      }
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/json'];
    const allowedExtensions = ['.pdf', '.txt', '.json'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || 
                        allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      showError('Invalid file type. Please upload a PDF, text, or JSON file.');
      input.value = ''; // Clear the input
      if (nameEl) {
        nameEl.textContent = '';
      }
      return;
    }
    
    // Show file name
    if (nameEl) {
      nameEl.textContent = file.name;
      nameEl.style.color = '#2986ff';
    }
    
    // Show loading UI
    showLoading('Reading file...');
    
    try {
      // Parse the file
      let parsedData;
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        if (loadingTextEl) loadingTextEl.textContent = 'Parsing JSON...';
        const text = await file.text();
        parsedData = parseJSONTranscript(text);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        if (loadingTextEl) loadingTextEl.textContent = 'Extracting text from PDF...';
        parsedData = await parseTranscript(file);
        // PDF parser is basic - warn user if no terms found
        if (!parsedData.terms || parsedData.terms.length === 0) {
          console.warn('PDF parser returned no terms. The parser is basic and may need manual data entry.');
        }
      } else {
        if (loadingTextEl) loadingTextEl.textContent = 'Parsing text file...';
        parsedData = await parseTranscript(file);
      }
      
      // Sanitize data (remove sensitive info)
      if (loadingTextEl) loadingTextEl.textContent = 'Sanitizing data...';
      const sanitizedData = sanitizeTranscriptData(parsedData);
      
      // Send to API (saves to DB)
      if (loadingTextEl) loadingTextEl.textContent = 'Saving to database...';
      await saveTranscript(sanitizedData);
      
      // Show success message
      if (loadingTextEl) loadingTextEl.textContent = 'Upload successful!';
      if (nameEl) {
        nameEl.textContent = `${file.name} - Uploaded successfully!`;
        nameEl.style.color = '#10b981';
      }
      showSuccess('Transcript uploaded successfully!');
      
      // Reload page to fetch fresh data from DB and display it
      setTimeout(() => {
        if (loadingTextEl) loadingTextEl.textContent = 'Reloading page...';
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Don't hide loading immediately - show error in loading UI first
      if (loadingTextEl) {
        loadingTextEl.textContent = `Error: ${error.message}`;
        loadingTextEl.style.color = '#ef4444';
      }
      
      // Wait a moment so user can see the error
      setTimeout(() => {
        hideLoading();
        showError(`Error uploading transcript: ${error.message}. Check the console for more details.`);
        
        if (nameEl) {
          nameEl.textContent = `Upload failed: ${error.message}`;
          nameEl.style.color = '#ef4444';
        }
        
        // Clear the input so user can try again
        input.value = '';
      }, 2000);
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
      
      const transcriptData = getTranscriptData();
      
      // Check if transcript data exists and has terms
      const hasData = transcriptData && 
                     transcriptData.terms && 
                     transcriptData.terms.length > 0;
      
      window.App.emptyMode = !hasData;
      
      if (transcriptData && typeof transcriptData.getCompletedTerms === 'function') {
        if (!window.App._origGetTerms) {
          window.App._origGetTerms = transcriptData.getCompletedTerms.bind(transcriptData);
        }
        
        if (window.App.emptyMode) {
          transcriptData.getCompletedTerms = function() { return []; };
        } else {
          transcriptData.getCompletedTerms = window.App._origGetTerms;
        }
      }
    }
  }
  
  // Wait for transcriptData to be available
  const transcriptData = getTranscriptData();
  if (transcriptData) {
    setupEmptyMode();
  } else {
    // Retry after a short delay if data isn't ready yet
    setTimeout(() => {
      const retryData = getTranscriptData();
      if (retryData) {
        setupEmptyMode();
      }
    }, 100);
  }
}


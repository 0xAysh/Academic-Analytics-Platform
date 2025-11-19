'use strict';

/**
 * Data initialization module
 * This file ensures window.transcriptData is initialized as null
 * Actual data is loaded from API via core/data.js loadTranscriptData()
 * 
 * This file exists for backward compatibility but should not contain mock data.
 * All data should come from the API.
 */

// Initialize as null - will be populated by loadTranscriptData() from API
if (typeof window !== 'undefined') {
  window.transcriptData = null;
}

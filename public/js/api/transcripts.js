'use strict';

import { api } from './api.js';

/**
 * Get user's transcript from API
 * @returns {Promise<object|null>} Transcript object or null if no transcript exists
 * @throws {Error} If API request fails
 */
export async function getTranscript() {
  const response = await api.get('/transcripts');
  // API returns { success: true, data: transcript } or { success: true, data: null }
  return response.data || null; // Returns transcript object or null
}

/**
 * Save transcript (for initial upload)
 * @param {object} transcriptData - Transcript data object with studentInfo, terms, and courses
 * @returns {Promise<object>} Saved transcript object
 * @throws {Error} If save operation fails
 */
export async function saveTranscript(transcriptData) {
  const response = await api.post('/transcripts', transcriptData);
  // API returns { success: true, data: savedTranscript }
  return response.data; // Returns the saved transcript object
}

/**
 * Update transcript (for edit page)
 * @param {object} transcriptData - Transcript data object with studentInfo, terms, and courses
 * @returns {Promise<object>} Updated transcript object
 * @throws {Error} If update operation fails
 */
export async function updateTranscript(transcriptData) {
  const response = await api.put('/transcripts', transcriptData);
  return response.data;
}


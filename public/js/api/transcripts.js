'use strict';

import { api } from './api.js';

/**
 * Get user's transcript
 */
export async function getTranscript() {
  const response = await api.get('/transcripts');
  return response.data; // Returns transcript object or null
}

/**
 * Save transcript (for initial upload)
 */
export async function saveTranscript(transcriptData) {
  const response = await api.post('/transcripts', transcriptData);
  return response.data;
}

/**
 * Update transcript (for edit page)
 */
export async function updateTranscript(transcriptData) {
  const response = await api.put('/transcripts', transcriptData);
  return response.data;
}


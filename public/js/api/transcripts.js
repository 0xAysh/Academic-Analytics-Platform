'use strict';

import { api } from './api.js';

/**
 * @returns {Promise<object|null>}
 */
export async function getTranscript() {
  const response = await api.get('/transcripts');
  return response.data || null;
}

/**
 * @param {object} transcriptData
 * @returns {Promise<object>}
 */
export async function saveTranscript(transcriptData) {
  const response = await api.post('/transcripts', transcriptData);
  return response.data;
}

/**
 * @param {object} transcriptData
 * @returns {Promise<object>}
 */
export async function updateTranscript(transcriptData) {
  const response = await api.put('/transcripts', transcriptData);
  return response.data;
}

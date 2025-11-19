'use strict';

import { initAuthGate } from '../core/auth.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initEditTranscript } from './edit-transcript.js';
import { loadTranscriptData, getTranscriptData } from '../core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize auth gate (redirects if not authenticated)
  if (!initAuthGate()) {
    return; // Stop initialization if redirected
  }

  // Load transcript data from API
  await loadTranscriptData();

  // Initialize navigation (avatar dropdown)
  initAvatarDropdown();

  // Wait for transcriptData to be available
  function waitForData() {
    const transcriptData = getTranscriptData();
    if (transcriptData) {
      initEditTranscript();
    } else {
      // Retry after a short delay if data isn't ready yet
      setTimeout(waitForData, 50);
    }
  }

  // Initialize edit transcript page
  waitForData();
});


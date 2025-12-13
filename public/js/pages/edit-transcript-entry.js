'use strict';

import { initAuthGate } from '../core/auth.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initEditTranscript } from './edit-transcript.js';
import { loadTranscriptData, getTranscriptData } from '../core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!initAuthGate()) {
    return;
  }

  await loadTranscriptData();

  initAvatarDropdown();

  function waitForData() {
    const transcriptData = getTranscriptData();
    if (transcriptData) {
      initEditTranscript();
    } else {
      setTimeout(waitForData, 50);
    }
  }

  waitForData();
});

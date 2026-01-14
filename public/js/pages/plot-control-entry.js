'use strict';

import { requireAuth } from '../api.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initPlotControls } from './plot-control.js';
import { loadTranscriptData } from '../core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) {
    return;
  }

  initAvatarDropdown();

  await loadTranscriptData();

  initPlotControls();
});

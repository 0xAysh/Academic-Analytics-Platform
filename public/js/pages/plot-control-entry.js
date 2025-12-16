'use strict';

import { initAuthGate } from '../core/auth.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initPlotControls } from './plot-control.js';
import { loadTranscriptData } from '../core/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!initAuthGate()) {
    return;
  }

  initAvatarDropdown();

  await loadTranscriptData();

  initPlotControls();
});

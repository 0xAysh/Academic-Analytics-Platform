'use strict';

import { initAuthGate } from '../core/auth.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initPlotControls } from './plot-control.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize auth gate (redirects if not authenticated)
  if (!initAuthGate()) {
    return; // Stop initialization if redirected
  }

  // Initialize navigation (avatar dropdown)
  initAvatarDropdown();

  // Initialize plot controls page
  initPlotControls();
});


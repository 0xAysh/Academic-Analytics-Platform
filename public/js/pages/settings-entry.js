'use strict';

import { requireAuth } from '../api.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initSettings } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) {
    return;
  }

  initAvatarDropdown();

  initSettings();
});

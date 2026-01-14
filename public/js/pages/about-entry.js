'use strict';

import { requireAuth } from '../api.js';
import { initAvatarDropdown } from '../core/nav.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) {
    return;
  }

  initAvatarDropdown();
});

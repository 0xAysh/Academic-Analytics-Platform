'use strict';

import { initAuthGate } from '../core/auth.js';
import { initAvatarDropdown } from '../core/nav.js';
import { initFAQ } from './faq.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!initAuthGate()) {
    return;
  }

  initAvatarDropdown();

  initFAQ();
});

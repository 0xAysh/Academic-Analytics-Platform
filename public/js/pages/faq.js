'use strict';

import { $, $$ } from '../utils/dom.js';

/**
 * Initialize FAQ page with accordion functionality
 */
export function initFAQ() {
  const list = $('#faqList');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.faq__item'));
  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isAnimating = false;

  /**
   * Wait for CSS transition to complete
   */
  function waitForTransition(el, prop = 'height') {
    return new Promise((resolve) => {
      if (prefersReduced) {
        resolve();
        return;
      }
      const done = (e) => {
        if (!e || e.propertyName === prop) {
          el.removeEventListener('transitionend', done);
          resolve();
        }
      };
      // Fallback in case transitionend doesn't fire
      const timer = setTimeout(() => done({ propertyName: prop }), 350);
      el.addEventListener('transitionend', (e) => {
        clearTimeout(timer);
        done(e);
      });
    });
  }

  /**
   * Collapse FAQ item
   */
  async function collapse(item, onDone) {
    const btn = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__ans');
    if (!btn || !panel) return;
    if (btn.getAttribute('aria-expanded') === 'false') {
      if (onDone) onDone();
      return;
    }
    btn.setAttribute('aria-expanded', 'false');
    item.dataset.open = 'false';
    item.classList.remove('open');
    panel.style.height = panel.scrollHeight + 'px';
    panel.getBoundingClientRect();
    panel.style.height = '0';
    panel.style.opacity = '0';
    await waitForTransition(panel);
    if (onDone) onDone();
  }

  /**
   * Expand FAQ item
   */
  async function expand(item) {
    const btn = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__ans');
    if (!btn || !panel) return;
    if (btn.getAttribute('aria-expanded') === 'true') return;
    btn.setAttribute('aria-expanded', 'true');
    item.dataset.open = 'true';
    item.classList.add('open');
    const h = panel.scrollHeight;
    panel.style.height = h + 'px';
    panel.style.opacity = '1';
    await waitForTransition(panel);
    panel.style.height = 'auto';
  }

  /**
   * Toggle FAQ item open/closed
   */
  function openOrToggle(item) {
    if (isAnimating) return;
    const btn = item.querySelector('.faq__btn');
    if (!btn) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    isAnimating = true;
    const after = () => { isAnimating = false; };
    if (expanded) {
      Promise.resolve(collapse(item)).then(after);
    } else {
      // Collapse all other items first, then expand this one
      items.forEach(otherItem => {
        if (otherItem !== item) {
          collapse(otherItem);
        }
      });
      Promise.resolve(expand(item)).then(after);
    }
  }

  // Initialize collapsed state
  items.forEach((item) => {
    const btn = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__ans');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'false');
    panel.style.height = '0';
    panel.style.opacity = '0';
  });

  // Wire events
  items.forEach((item) => {
    const btn = item.querySelector('.faq__btn');
    if (!btn) return;
    btn.addEventListener('click', () => openOrToggle(item));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openOrToggle(item);
      }
    });
  });
}


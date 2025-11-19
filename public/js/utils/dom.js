'use strict';

/**
 * DOM utility functions
 */

/**
 * Query selector - returns first matching element
 * @param {string} sel - CSS selector
 * @param {Document|Element} root - Root element to search from (default: document)
 * @returns {Element|null} First matching element or null
 */
export const $ = (sel, root = document) => root.querySelector(sel);

/**
 * Query selector all - returns all matching elements
 * @param {string} sel - CSS selector
 * @param {Document|Element} root - Root element to search from (default: document)
 * @returns {Array<Element>} Array of matching elements
 */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Add event listener to element
 * @param {Element|null} el - Element to attach listener to
 * @param {string} type - Event type
 * @param {Function} fn - Event handler function
 * @param {object|boolean} opts - Event listener options
 */
export const on = (el, type, fn, opts) => el && el.addEventListener(type, fn, opts);

/**
 * Create DOM element
 * @param {string} tag - HTML tag name
 * @param {object} props - Element properties
 * @param {Array} children - Child elements or text nodes
 * @returns {Element} Created element
 */
export const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  children.flat().forEach(c => node.append(c));
  return node;
};

/**
 * Join class names, filtering out falsy values
 * @param {...string} names - Class names to join
 * @returns {string} Joined class names
 */
export const cls = (...names) => names.filter(Boolean).join(' ');

/**
 * Clamp number between min and max
 * @param {number} n - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in milliseconds (default: 150)
 * @returns {Function} Debounced function
 */
export const debounce = (fn, wait = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};



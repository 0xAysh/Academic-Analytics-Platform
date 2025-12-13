'use strict';

/**
 * @param {string} sel
 * @param {Document|Element} root
 * @returns {Element|null}
 */
export const $ = (sel, root = document) => root.querySelector(sel);

/**
 * @param {string} sel
 * @param {Document|Element} root
 * @returns {Array<Element>}
 */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * @param {Element|null} el
 * @param {string} type
 * @param {Function} fn
 * @param {object|boolean} opts
 */
export const on = (el, type, fn, opts) => el && el.addEventListener(type, fn, opts);

/**
 * @param {string} tag
 * @param {object} props
 * @param {Array} children
 * @returns {Element}
 */
export const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  children.flat().forEach(c => node.append(c));
  return node;
};

/**
 * @param {...string} names
 * @returns {string}
 */
export const cls = (...names) => names.filter(Boolean).join(' ');

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (fn, wait = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

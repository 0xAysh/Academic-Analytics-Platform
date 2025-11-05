'use strict';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const on = (el, type, fn, opts) => el && el.addEventListener(type, fn, opts);
export const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  children.flat().forEach(c => node.append(c));
  return node;
};
export const cls = (...names) => names.filter(Boolean).join(' ');
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const debounce = (fn, wait = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};



'use strict';

export const fmtGpa = (n) => (Number(n) || 0).toFixed(2);
export const percent = (n, total) => {
  if (!total) return '0%';
  return Math.round((n / total) * 100) + '%';
};
export const number = (n) => new Intl.NumberFormat().format(Number(n) || 0);



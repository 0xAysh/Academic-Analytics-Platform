'use strict';

let tip;
export function createTooltip() {
  if (tip) return tip;
  tip = document.createElement('div');
  tip.className = 'tooltip';
  Object.assign(tip.style, { position: 'fixed', zIndex: 9999, pointerEvents: 'none', padding: '6px 8px', background: 'rgba(17,24,39,.9)', color: '#fff', borderRadius: '6px', fontSize: '12px', transform: 'translate(-50%, -120%)', opacity: '0', transition: 'opacity .12s' });
  document.body.appendChild(tip);
  return tip;
}

export function showTooltip(text, x, y) {
  const t = createTooltip();
  t.textContent = text;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  t.style.opacity = '1';
}

export function hideTooltip() {
  if (tip) tip.style.opacity = '0';
}



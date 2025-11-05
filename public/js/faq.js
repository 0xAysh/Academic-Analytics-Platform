(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const list = document.getElementById('faqList');
  const items = Array.from(list ? list.querySelectorAll('.faq__item') : []);
  const searchInput = document.getElementById('faqSearch');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isAnimating = false;

  function waitForTransition(el, prop='height') {
    return new Promise((resolve) => {
      if (prefersReduced) { resolve(); return; }
      const done = (e) => { if (!e || e.propertyName === prop) { el.removeEventListener('transitionend', done); resolve(); } };
      // Fallback in case transitionend doesn't fire
      const timer = setTimeout(() => done({ propertyName: prop }), 350);
      el.addEventListener('transitionend', (e) => { clearTimeout(timer); done(e); });
    });
  }

  async function collapse(item, onDone) {
    const btn = item.querySelector('.faq__btn');
    const panel = item.querySelector('.faq__ans');
    if (!btn || !panel) return;
    if (btn.getAttribute('aria-expanded') === 'false') { if (onDone) onDone(); return; }
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
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrToggle(item); }
    });
  });

  // Live filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      items.forEach((item) => {
        const qEl = item.querySelector('.faq-question');
        const aEl = item.querySelector('.faq__ans');
        const text = ((qEl?.textContent || '') + ' ' + (aEl?.textContent || '')).toLowerCase();
        const match = text.includes(q);
        item.style.display = match ? '' : 'none';
        if (!match) collapse(item);
      });
    });
  }
})();



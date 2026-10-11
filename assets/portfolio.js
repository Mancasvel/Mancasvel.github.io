(() => {
  const root = document.documentElement;
  const spanish = root.lang === 'es';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menu && nav) {
    root.classList.add('enhanced');
    menu.hidden = false;
    const close = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.site-nav')) close(); });
  }

  const themeButton = document.querySelector('.theme-toggle');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : preference.matches;
  const updateTheme = () => {
    if (!themeButton) return;
    themeButton.textContent = dark() ? (spanish ? 'Claro' : 'Light') : (spanish ? 'Oscuro' : 'Dark');
    themeButton.setAttribute('aria-label', spanish ? `Activar tema ${dark() ? 'claro' : 'oscuro'}` : `Use ${dark() ? 'light' : 'dark'} theme`);
  };
  if (themeButton) {
    themeButton.hidden = false;
    updateTheme();
    themeButton.addEventListener('click', () => {
      root.dataset.theme = dark() ? 'light' : 'dark';
      try { localStorage.setItem('manuel-theme', root.dataset.theme); } catch { /* Theme still works without persistence. */ }
      updateTheme();
    });
    preference.addEventListener('change', updateTheme);
  }

  const filters = document.querySelector('.filters');
  const items = [...document.querySelectorAll('.archive-item')];
  const count = document.querySelector('.project-count');
  if (filters && count) {
    filters.hidden = false;
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      items.forEach(item => { item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
      count.textContent = `${items.filter(item => !item.hidden).length} ${count.dataset.noun}`;
    });
  }

  const copyButton = document.querySelector('.copy-email');
  if (copyButton && navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText('mancasvel@icloud.com');
        status.textContent = copyButton.dataset.copied;
      } catch {
        status.textContent = spanish ? 'Selecciona la dirección para copiarla.' : 'Select the address to copy it.';
      }
    });
  }
})();

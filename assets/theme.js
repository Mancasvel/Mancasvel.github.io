// Apply a saved theme before rendering; system preference is the default.
try {
  const theme = localStorage.getItem('manuel-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch { /* A blocked storage API leaves the system preference in place. */ }

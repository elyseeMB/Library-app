import htmx from 'htmx.org';

function highlightNav(): void {
  const { pathname } = window.location;
  document.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === pathname) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

htmx.on('htmx:afterSwap', () => {
  highlightNav();
});

htmx.on('htmx:historyRestore', () => {
  highlightNav();
});

highlightNav();

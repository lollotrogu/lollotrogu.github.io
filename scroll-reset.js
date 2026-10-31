// Disable browser position restoration before the document is rendered.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const navigation = performance.getEntriesByType('navigation')[0];
if (navigation?.type === 'reload') {
  // Remove the previous section anchor so it cannot scroll the new document.
  if (location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  resetScroll();
  window.addEventListener('pageshow', () => {
    resetScroll();
    requestAnimationFrame(resetScroll);
  }, { once: true });
}

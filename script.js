// Robust container pan (attach move/up handlers on container AND document)
(function enableContainerPan() {
  const container = document.querySelector('.items');
  if (!container) return;

  let isDown = false;
  let startPageX = 0;
  let scrollStart = 0;

  function getPageX(e) {
    if (e.touches && e.touches[0]) return e.touches[0].pageX;
    return e.pageX;
  }

  function onPanMove(e) {
    if (!isDown) return;
    const pageX = getPageX(e);
    const delta = pageX - startPageX;
    container.scrollLeft = Math.max(0, scrollStart - delta);
  }

  function onPanEnd() {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
    document.body.classList.remove('no-select');

    // remove any document-level handlers (we keep container handlers)
    document.removeEventListener('mousemove', onPanMove);
    document.removeEventListener('mouseup', onPanEnd);
    document.removeEventListener('touchmove', onPanMove);
    document.removeEventListener('touchend', onPanEnd);
  }

  // Start panning when mousedown/touchstart inside container but not on an .item
  container.addEventListener('mousedown', (e) => {
    if (window.__draggingItem) return;
    if (e.target.closest && e.target.closest('.item')) return;

    isDown = true;
    startPageX = getPageX(e);
    scrollStart = container.scrollLeft;

    container.classList.add('active');
    document.body.classList.add('no-select');

    // Attach listeners to document (for pointer leaving container) and container (for Cypress triggers)
    document.addEventListener('mousemove', onPanMove);
    document.addEventListener('mouseup', onPanEnd);

    // Also handle moves/up on container itself (Cypress triggers events on the element)
    container.addEventListener('mousemove', onPanMove);
    container.addEventListener('mouseup', onPanEnd);

    e.preventDefault();
  });

  // Touch start
  container.addEventListener('touchstart', (e) => {
    if (window.__draggingItem) return;
    if (e.target.closest && e.target.closest('.item')) return;

    isDown = true;
    startPageX = getPageX(e);
    scrollStart = container.scrollLeft;

    container.classList.add('active');
    document.body.classList.add('no-select');

    document.addEventListener('touchmove', onPanMove, { passive: false });
    document.addEventListener('touchend', onPanEnd);

    container.addEventListener('touchmove', onPanMove, { passive: false });
    container.addEventListener('touchend', onPanEnd);

    e.preventDefault();
  });

  // Ensure cleanup if mouse/touch ends outside container
  document.addEventListener('mouseup', onPanEnd);
  document.addEventListener('touchend', onPanEnd);
})();

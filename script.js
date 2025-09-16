// ---- Robust container pan (replace previous pan code with this) ----
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

  // Start panning when mousedown/touchstart inside container but not on an .item
  container.addEventListener('mousedown', (e) => {
    // don't start pan if an item drag is active or the pointer is on an item element
    if (window.__draggingItem) return;
    if (e.target.closest && e.target.closest('.item')) return;

    isDown = true;
    startPageX = getPageX(e);
    scrollStart = container.scrollLeft;

    container.classList.add('active');
    document.body.classList.add('no-select');

    // prevent text selection or undesired native behavior
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const pageX = getPageX(e);
    const delta = pageX - startPageX;
    // subtract delta so dragging left increases scrollLeft (matches typical drag-to-scroll)
    container.scrollLeft = Math.max(0, scrollStart - delta);
  });

  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
    document.body.classList.remove('no-select');
  });

  // Touch equivalents
  container.addEventListener('touchstart', (e) => {
    if (window.__draggingItem) return;
    if (e.target.closest && e.target.closest('.item')) return;
    isDown = true;
    startPageX = getPageX(e);
    scrollStart = container.scrollLeft;
    container.classList.add('active');
    document.body.classList.add('no-select');
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const pageX = getPageX(e);
    const delta = pageX - startPageX;
    container.scrollLeft = Math.max(0, scrollStart - delta);
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
    document.body.classList.remove('no-select');
  });
})();

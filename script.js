// --- Container (grab-to-scroll) pan implementation ---
// Add this after your existing drag code (or at the end of your script)
(function enableContainerPan() {
  const container = document.querySelector('.items');
  if (!container) return;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  function getPageX(e) {
    if (e.touches && e.touches[0]) return e.touches[0].pageX;
    return e.pageX;
  }

  // Start panning: only when the event target is the container itself
  container.addEventListener('mousedown', (e) => {
    // if user started dragging an item (our item-drag sets draggingItem global), don't pan
    if (window.__draggingItem) return;
    if (e.target !== container) return; // only start pan when clicking the container background

    isDown = true;
    container.classList.add('active');
    startX = getPageX(e) - container.offsetLeft;
    scrollStart = container.scrollLeft;
    e.preventDefault();
  });

  // Mouse move -> update scroll
  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = getPageX(e) - container.offsetLeft;
    const walk = x - startX; // positive = moved right, negative = moved left
    // adjust scroll: subtract walk so moving left increases scrollLeft and test passes
    container.scrollLeft = scrollStart - walk;
  });

  // End panning
  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
  });

  // Touch equivalents (passive: false so we can preventDefault)
  container.addEventListener('touchstart', (e) => {
    if (window.__draggingItem) return;
    if (e.target !== container) return;
    isDown = true;
    container.classList.add('active');
    startX = getPageX(e) - container.offsetLeft;
    scrollStart = container.scrollLeft;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = getPageX(e) - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollStart - walk;
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
  });
})();

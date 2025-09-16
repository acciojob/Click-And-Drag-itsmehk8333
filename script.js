// Your code goes here
(function () {
  const container = document.querySelector('.items');
  if (!container) return;

  // Ensure container positioned relative
  const cStyle = window.getComputedStyle(container);
  if (cStyle.position === 'static') container.style.position = 'relative';

  const items = Array.from(container.querySelectorAll('.item'));

  // Globals used by pan logic
  window.__draggingItem = null;

  // Prevent text selection while dragging/panning
  const noSelectStyle = document.createElement('style');
  noSelectStyle.innerHTML = `.no-select { user-select: none !important; -webkit-user-select: none !important; }`;
  document.head.appendChild(noSelectStyle);

  // Helper to get pointer coords
  function getPoint(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  // Clamp helper
  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  // ---------- Item dragging ----------
  let dragging = null;
  let start = { x: 0, y: 0 };
  let origin = { left: 0, top: 0 };
  let wasTransformed = '';

  function startDrag(e, item) {
    e.preventDefault();
    // mark global
    window.__draggingItem = item;
    dragging = item;

    // get rects
    const itemRect = item.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    // compute left/top relative to container content (account for scrollLeft)
    const relLeft = itemRect.left - contRect.left + container.scrollLeft;
    const relTop = itemRect.top - contRect.top + container.scrollTop;

    // preserve and clear transform (so positioning matches visual)
    wasTransformed = item.style.transform || '';
    item.style.transform = 'none';

    // switch to absolute and pin to same visual pos
    item.style.position = 'absolute';
    item.style.left = relLeft + 'px';
    item.style.top  = relTop + 'px';
    item.style.zIndex = 1000;
    item.style.touchAction = 'none';

    // store starting pointers
    const p = getPoint(e);
    start.x = p.x;
    start.y = p.y;
    origin.left = relLeft;
    origin.top = relTop;

    container.classList.add('active');
    document.body.classList.add('no-select');

    // attach move/up to document
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.type === 'touchmove') e.preventDefault();

    const p = getPoint(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;

    // new pos relative to container content
    let newLeft = origin.left + dx + container.scrollLeft;
    let newTop  = origin.top  + dy + container.scrollTop;

    // clamp to container content area
    const itemW = dragging.offsetWidth;
    const itemH = dragging.offsetHeight;
    const maxLeft = Math.max(0, container.clientWidth - itemW);
    const maxTop  = Math.max(0, container.clientHeight - itemH);

    newLeft = clamp(newLeft, 0, maxLeft);
    newTop  = clamp(newTop, 0, maxTop);

    dragging.style.left = `${newLeft}px`;
    dragging.style.top  = `${newTop}px`;
  }

  function onUp() {
    if (!dragging) return;

    // cleanup
    dragging.style.zIndex = '';
    dragging.style.touchAction = '';
    // leave transform as 'none' because item is absolute now (ok)
    dragging = null;
    window.__draggingItem = null;

    container.classList.remove('active');
    document.body.classList.remove('no-select');

    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }

  // wire items
  items.forEach(item => {
    item.addEventListener('mousedown', (e) => startDrag(e, item));
    item.addEventListener('touchstart', (e) => startDrag(e, item), { passive: false });
    // prevent native dragging image/text selection
    item.addEventListener('dragstart', (ev) => ev.preventDefault());
  });

  // ---------- Container pan (grab-to-scroll) ----------
  let isDown = false;
  let panStartX = 0;
  let panScrollStart = 0;

  function pageX(e) {
    if (e.touches && e.touches[0]) return e.touches[0].pageX;
    return e.pageX;
  }

  // Start pan only when target is the container itself (not an item)
  container.addEventListener('mousedown', (e) => {
    if (window.__draggingItem) return; // don't pan while item drag active
    if (e.target !== container) return;
    isDown = true;
    container.classList.add('active');
    panStartX = pageX(e) - container.offsetLeft;
    panScrollStart = container.scrollLeft;
    document.addEventListener('mousemove', panMove);
    document.addEventListener('mouseup', panEnd);
    document.body.classList.add('no-select');
    e.preventDefault();
  });

  function panMove(e) {
    if (!isDown) return;
    const x = pageX(e) - container.offsetLeft;
    const walk = x - panStartX;
    container.scrollLeft = panScrollStart - walk;
  }

  function panEnd() {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
    document.removeEventListener('mousemove', panMove);
    document.removeEventListener('mouseup', panEnd);
    document.body.classList.remove('no-select');
  }

  // touch equivalents
  container.addEventListener('touchstart', (e) => {
    if (window.__draggingItem) return;
    if (e.target !== container) return;
    isDown = true;
    container.classList.add('active');
    panStartX = pageX(e) - container.offsetLeft;
    panScrollStart = container.scrollLeft;
    document.addEventListener('touchmove', panTouchMove, { passive: false });
    document.addEventListener('touchend', panEndTouch);
    document.body.classList.add('no-select');
  }, { passive: false });

  function panTouchMove(e) {
    if (!isDown) return;
    e.preventDefault();
    const x = pageX(e) - container.offsetLeft;
    const walk = x - panStartX;
    container.scrollLeft = panScrollStart - walk;
  }

  function panEndTouch() {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('active');
    document.removeEventListener('touchmove', panTouchMove);
    document.removeEventListener('touchend', panEndTouch);
    document.body.classList.remove('no-select');
  }

})();

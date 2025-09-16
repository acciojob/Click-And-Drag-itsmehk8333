// Your code here.
//Your code goes here 
(function () {
  const container = document.querySelector('.items');
  if (!container) return;

  // ensure container has position: relative so absolutely positioned children are relative to it
  const containerStyle = window.getComputedStyle(container);
  if (containerStyle.position === 'static') {
    container.style.position = 'relative';
  }

  const items = Array.from(container.querySelectorAll('.item'));
  let draggingItem = null;
  let startX = 0;
  let startY = 0;
  let itemStartLeft = 0;
  let itemStartTop = 0;

  // helper to get pointer coordinates (mouse or touch)
  function getPointer(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  // clamp function
  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  function onPointerDown(e, item) {
    e.preventDefault();

    // If already absolute, keep; else set absolute and compute left/top relative to container
    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // convert to coordinates relative to container
    const relLeft = itemRect.left - containerRect.left + container.scrollLeft;
    const relTop = itemRect.top - containerRect.top + container.scrollTop;

    // set styles to absolute positioned at the same visual place
    item.style.position = 'absolute';
    item.style.left = relLeft + 'px';
    item.style.top = relTop + 'px';
    item.style.touchAction = 'none'; // prevent default touch gestures
    item.style.zIndex = 1000; // bring to front while dragging

    // store starting positions
    const p = getPointer(e);
    startX = p.x;
    startY = p.y;
    itemStartLeft = relLeft;
    itemStartTop = relTop;
    draggingItem = item;

    // add active class for visual feedback on container
    container.classList.add('active');

    // prevent text selection during drag
    document.body.classList.add('no-select');

    // attach move/up listeners on document for smooth dragging
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  }

  function onPointerMove(e) {
    if (!draggingItem) return;
    // prevent page scroll on touch while dragging
    if (e.type === 'touchmove') e.preventDefault();

    const p = getPointer(e);
    const dx = p.x - startX;
    const dy = p.y - startY;

    let newLeft = itemStartLeft + dx + container.scrollLeft;
    let newTop = itemStartTop + dy + container.scrollTop;

    // clamp to container bounds
    const containerRect = container.getBoundingClientRect();
    const itemRect = draggingItem.getBoundingClientRect();

    const maxLeft = container.clientWidth - itemRect.width;
    const maxTop = container.clientHeight - itemRect.height;

    // Note: using offsetWidth/offsetHeight guarantees integer px sizes
    const itemW = draggingItem.offsetWidth;
    const itemH = draggingItem.offsetHeight;

    // When container is scrollable horizontally, we should consider scrollLeft
    // But positions are relative to container content area, so clamp using clientWidth and scrollLeft zero base
    newLeft = clamp(newLeft, 0, Math.max(0, container.clientWidth - itemW));
    newTop = clamp(newTop, 0, Math.max(0, container.clientHeight - itemH));

    draggingItem.style.left = `${newLeft}px`;
    draggingItem.style.top = `${newTop}px`;
  }

  function onPointerUp() {
    if (!draggingItem) return;

    // leave item at final left/top (already set)
    draggingItem.style.zIndex = ''; // reset
    draggingItem.style.touchAction = ''; // reset

    // cleanup
    draggingItem = null;
    container.classList.remove('active');
    document.body.classList.remove('no-select');

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  // attach listeners to each item
  items.forEach(item => {
    // mouse
    item.addEventListener('mousedown', (e) => onPointerDown(e, item));
    // touch
    item.addEventListener('touchstart', (e) => onPointerDown(e, item), { passive: false });
    // prevent selecting text inside items while clicking
    item.addEventListener('dragstart', (ev) => ev.preventDefault());
  });

  // optional: stop dragging if user leaves window (safety)
  window.addEventListener('blur', onPointerUp);

  // small helper CSS injection to prevent selection while dragging
  const style = document.createElement('style');
  style.innerHTML = `.no-select { user-select: none !important; -webkit-user-select: none !important; }`;
  document.head.appendChild(style);
})();

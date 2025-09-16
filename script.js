// Your code goes here
(function () {
  const container = document.querySelector('.items');
  if (!container) return;

  // Ensure container is positioned relative so absolutely-positioned children are positioned against it
  const containerStyle = window.getComputedStyle(container);
  if (containerStyle.position === 'static') container.style.position = 'relative';

  const items = Array.from(container.querySelectorAll('.item'));
  let draggingItem = null;
  let startX = 0, startY = 0;
  let itemStartLeft = 0, itemStartTop = 0;
  let prevTransform = '';

  function getPointer(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  function onPointerDown(e, item) {
    e.preventDefault();

    // Get bounding rects
    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Compute current position of item relative to container content area
    // Use offsetLeft/offsetTop where possible (works even if transforms applied),
    // but if offsetLeft doesn't reflect visual position due to inline-block flow we'll fallback to rect math.
    let relLeft = item.offsetLeft;
    let relTop = item.offsetTop;
    // fallback using bounding rect:
    if (typeof relLeft !== 'number' || isNaN(relLeft)) {
      relLeft = itemRect.left - containerRect.left + container.scrollLeft;
    }
    if (typeof relTop !== 'number' || isNaN(relTop)) {
      relTop = itemRect.top - containerRect.top + container.scrollTop;
    }

    // Temporarily remove transform so absolute positioning matches visible location
    prevTransform = item.style.transform || '';
    item.style.transform = 'none';

    // Switch to absolute and pin to the same visual position
    item.style.position = 'absolute';
    item.style.left = relLeft + 'px';
    item.style.top = relTop + 'px';
    item.style.zIndex = 1000;
    item.style.touchAction = 'none';

    // store start pointers
    const p = getPointer(e);
    startX = p.x;
    startY = p.y;
    itemStartLeft = relLeft;
    itemStartTop = relTop;
    draggingItem = item;

    container.classList.add('active');
    document.body.classList.add('no-select');

    // attach listeners on document to smoothly track pointer (not just on item)
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  }

  function onPointerMove(e) {
    if (!draggingItem) return;
    if (e.type === 'touchmove') e.preventDefault();

    const p = getPointer(e);
    const dx = p.x - startX;
    const dy = p.y - startY;

    // desired new position (relative to container content)
    let newLeft = itemStartLeft + dx + container.scrollLeft;
    let newTop = itemStartTop + dy + container.scrollTop;

    // clamp to container inner bounds (respecting padding/scroll visible area)
    const itemW = draggingItem.offsetWidth;
    const itemH = draggingItem.offsetHeight;

    // container.clientWidth/clientHeight reflect inner content width/height excluding scrollbar
    const maxLeft = Math.max(0, container.clientWidth - itemW);
    const maxTop = Math.max(0, container.clientHeight - itemH);

    newLeft = clamp(newLeft, 0, maxLeft);
    newTop = clamp(newTop, 0, maxTop);

    draggingItem.style.left = `${newLeft}px`;
    draggingItem.style.top = `${newTop}px`;
  }

  function onPointerUp() {
    if (!draggingItem) return;

    // restore transform if you want to keep visual style; here we leave transform 'none' because item is now absolute
    // but we still clear zIndex/touchAction
    draggingItem.style.zIndex = '';
    draggingItem.style.touchAction = '';

    // cleanup
    draggingItem = null;
    container.classList.remove('active');
    document.body.classList.remove('no-select');

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  // attach listeners
  items.forEach(item => {
    item.addEventListener('mousedown', (e) => onPointerDown(e, item));
    item.addEventListener('touchstart', (e) => onPointerDown(e, item), { passive: false });
    item.addEventListener('dragstart', (ev) => ev.preventDefault());
  });

  // cancel dragging if window loses focus
  window.addEventListener('blur', onPointerUp);

  // helper CSS to disable selection while dragging
  const style = document.createElement('style');
  style.innerHTML = `
    .no-select { user-select: none !important; -webkit-user-select: none !important; }
  `;
  document.head.appendChild(style);
})();

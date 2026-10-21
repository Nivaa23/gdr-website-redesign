/**
 * React Bits — Circular Gallery Component
 * Official React Bits Circular Gallery / Carousel implementation adapted for GDR client logos
 * Reference: https://reactbits.dev/components/circular-carousel
 * 
 * Features:
 * - 3D Cylindrical Ring arrangement using CSS 3D Transforms (preserve-3d, perspective, rotateY, translateZ)
 * - 16 Client Logos combined into one unified dataset from Government and Private sectors
 * - Drag/touch interaction with momentum inertia physics and pointer capture
 * - Detent spring snapping to nearest card
 * - Click-to-focus: clicking any visible card rotates it smoothly to the front
 * - Keyboard navigation (Left/Right arrow keys)
 * - Mouse wheel interaction
 * - Gentle drift autoplay with instant pause-on-hover for comfortable inspection
 * - Responsive layout adaptation via ResizeObserver (desktop, tablet, mobile)
 * - Object-fit: contain on neutral white card surfaces with balanced padding
 */

export const CLIENT_LOGOS = [
  // Interleaved Government & Private sector clients for balanced visual variety
  {
    src: '/assets/images/client-logos/Government Sector/Indian Railways Logo.png',
    title: 'Indian Railways',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/M3M Logo.png',
    title: 'M3M Group',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/DFCCIL Logo.png',
    title: 'DFCCIL',
    subtitle: 'Dedicated Freight Corridor',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/Clariant Logo.jpg',
    title: 'Clariant Chemicals',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/IIT Mandi Logo.png',
    title: 'IIT Mandi',
    subtitle: 'Indian Institute of Technology',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/L&W Logo.png',
    title: 'L&W Construction',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/AUDA Logo.png',
    title: 'AUDA',
    subtitle: 'Ahmedabad Urban Development Authority',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/Nilamber Logo.png',
    title: 'Nilamber Group',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/IRCON Logo.png',
    title: 'IRCON International',
    subtitle: 'Ministry of Railways',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/SSR Crest Logo.png',
    title: 'SSR Crest',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/MSU Logo.png',
    title: 'MSU Baroda',
    subtitle: 'Maharaja Sayajirao University',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/Sadbhav Engineering Logo.png',
    title: 'Sadbhav Engineering',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/HP Logo.png',
    title: 'Hindustan Petroleum (HPCL)',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/Smart World Developers Logo.png',
    title: 'Smart World Developers',
    sector: 'Private Enterprise'
  },
  {
    src: '/assets/images/client-logos/Government Sector/SMC Logo.png',
    title: 'SMC',
    subtitle: 'Surat Municipal Corporation',
    sector: 'Government Institution'
  },
  {
    src: '/assets/images/client-logos/Private Sector/Keystone Infra Logo.png',
    title: 'Keystone Infra',
    sector: 'Private Enterprise'
  }
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
const TO_RAD = Math.PI / 180;

export function mountCircularGallery(container, options = {}) {
  if (!container) return null;

  const items = options.items && options.items.length ? options.items : CLIENT_LOGOS;
  const count = items.length;
  if (count === 0) return null;

  const step = 360 / count;
  const tilt = options.tilt !== undefined ? options.tilt : -4;
  const perspective = options.perspective || 2400;
  const autoplay = options.autoplay !== undefined ? options.autoplay : true;
  const autoplaySpeed = options.speed || 6; // degrees per second
  const draggable = options.draggable !== undefined ? options.draggable : true;
  const snap = options.snap !== undefined ? options.snap : true;
  const momentum = clamp(options.momentum !== undefined ? options.momentum : 0.65, 0, 1);
  const pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
  const focusOnClick = options.focusOnClick !== undefined ? options.focusOnClick : true;

  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let isReducedMotion = reducedMotionQuery?.matches ?? false;

  // Clear existing container markup
  container.innerHTML = '';
  container.classList.add('circular-gallery-root');

  // DOM Elements
  const root = document.createElement('div');
  root.className = 'circular-gallery';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.setAttribute('aria-label', "Industries We've Worked With Client Logos");
  root.setAttribute('tabindex', '0');

  const view = document.createElement('div');
  view.className = 'circular-gallery__view';

  const stage = document.createElement('div');
  stage.className = 'circular-gallery__stage';

  const camera = document.createElement('div');
  camera.className = 'circular-gallery__camera';

  const ring = document.createElement('div');
  ring.className = 'circular-gallery__ring';

  camera.appendChild(ring);
  stage.appendChild(camera);
  view.appendChild(stage);
  root.appendChild(view);

  // Status indicator pill
  const navWrap = document.createElement('div');
  navWrap.className = 'circular-gallery__nav-wrap';

  const counter = document.createElement('div');
  counter.className = 'circular-gallery__counter';
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');

  const activeNum = document.createElement('span');
  activeNum.className = 'circular-gallery__counter-active';
  activeNum.textContent = '01';

  const divider = document.createElement('span');
  divider.className = 'circular-gallery__counter-div';
  divider.textContent = ' / ';

  const totalNum = document.createElement('span');
  totalNum.className = 'circular-gallery__counter-total';
  totalNum.textContent = String(count).padStart(2, '0');

  counter.appendChild(activeNum);
  counter.appendChild(divider);
  counter.appendChild(totalNum);

  navWrap.appendChild(counter);
  root.appendChild(navWrap);

  container.appendChild(root);

  // Responsive Dimensions
  let cardW = 240;
  let cardH = 135;
  let gap = 32;
  let radius = 680;
  let fit = 1;

  function updateDimensions() {
    const width = container.clientWidth || window.innerWidth;
    if (width <= 640) {
      cardW = 216;
      cardH = 124;
      gap = 22;
    } else if (width <= 992) {
      cardW = 256;
      cardH = 145;
      gap = 32;
    } else {
      cardW = 310;
      cardH = 172;
      gap = 44;
    }

    const pitch = cardW + gap;
    radius = Math.max(pitch / (2 * Math.sin(Math.PI / count)), cardW * 1.8);
  }
  updateDimensions();

  // Create Cards
  const cardElements = items.map((item, index) => {
    const card = document.createElement('div');
    card.className = 'circular-gallery__card';
    card.setAttribute('data-cg-index', String(index));
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${item.title}, ${index + 1} of ${count}`);

    const surface = document.createElement('div');
    surface.className = 'circular-gallery__card-surface';

    const logoWrap = document.createElement('div');
    logoWrap.className = 'circular-gallery__logo-wrap';

    const img = document.createElement('img');
    img.className = 'circular-gallery__logo';
    img.src = item.src;
    img.alt = `${item.title} Logo`;
    img.loading = index < 6 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.draggable = false;

    logoWrap.appendChild(img);
    surface.appendChild(logoWrap);

    // Subtle metadata caption on card
    const nameLabel = document.createElement('span');
    nameLabel.className = 'circular-gallery__card-name';
    nameLabel.textContent = item.title;
    surface.appendChild(nameLabel);

    card.appendChild(surface);
    ring.appendChild(card);
    return card;
  });

  // Animation State
  const state = {
    angle: 0,
    target: 0,
    velocity: 0,
    dir: -1, // default counter-clockwise rotation
    drag: false,
    hover: false,
    press: null,
    pointer: { x: 0, y: 0, inside: false },
    active: 0,
    last: 0,
    holdUntil: 0,
    fit: 1,
    shift: 0
  };

  const SPRING = 110;
  const SETTLE_SPEED = 7;
  let rafId = 0;
  let isVisible = true;

  const nearest = angle => Math.round(angle / step) * step;

  function measure() {
    updateDimensions();
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const isMobile = (container.clientWidth || window.innerWidth) <= 640;
    const availW = rect.width * (isMobile ? 0.96 : 0.92);
    const availH = (rect.height - 52) * 0.94; // leave room for nav controls
    const P = perspective;

    // Project visible front arc points to compute ideal bounding scale
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const corners = [
      [-cardW / 2, -cardH / 2],
      [cardW / 2, -cardH / 2],
      [-cardW / 2, cardH / 2],
      [cardW / 2, cardH / 2]
    ];

    const maxArcAngle = isMobile ? 42 : 55;
    for (let a = -maxArcAngle; a <= maxArcAngle; a += 10) {
      const rad = a * TO_RAD;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      for (const [cx, cy] of corners) {
        // Point in cylindrical space
        const px = cosA * radius + cx * cosA;
        const py = cy;
        const pz = -sinA * radius + cx * sinA;

        // Perspective transform
        const zDist = pz - radius;
        if (zDist < P * 0.9) {
          const k = P / (P - zDist);
          const sx = px * k;
          const sy = py * k;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
      }
    }

    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    fit = Math.min(1.05, availW / spanX, availH / spanY);
    state.fit = fit;
    state.shift = -((minY + maxY) / 2) * fit - 8;

    stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`;
  }

  function render(now) {
    const angle = state.angle;
    const R = radius;

    camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${tilt}deg)`;
    ring.style.transform = `rotateY(${angle}deg)`;

    for (let index = 0; index < count; index++) {
      const card = cardElements[index];
      const base = index * step;
      card.style.transform = `rotateY(${base}deg) translateZ(${R}px)`;

      // Angular distance from camera front (-180 to 180)
      const world = wrap(base + angle);
      const facing = Math.cos(world * TO_RAD); // 1 = front center, 0 = 90 deg sides, -1 = back

      // Only display cards in the front 180-degree visible arc
      if (facing <= 0.04) {
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-front');
        continue;
      }

      card.style.visibility = 'visible';
      card.style.pointerEvents = 'auto';

      const isFront = Math.abs(world) < 22;
      const depthFade = Math.pow((facing + 0.1) / 1.1, 1.25);
      const opacity = clamp(depthFade, 0.2, 1);
      const scale = 0.88 + 0.12 * Math.max(0, facing);

      card.style.opacity = opacity.toFixed(3);
      card.style.setProperty('--cg-scale', scale.toFixed(3));
      card.classList.toggle('is-front', isFront);
    }

    // Active center index
    const activeIndex = ((Math.round(-state.angle / step) % count) + count) % count;
    if (activeIndex !== state.active) {
      state.active = activeIndex;
      activeNum.textContent = String(activeIndex + 1).padStart(2, '0');
    }
  }

  function advance(dt, now) {
    const paused = (pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
    const cruise = autoplay && !isReducedMotion && !paused ? autoplaySpeed * state.dir : 0;
    let busy = state.drag;

    if (state.drag) {
      // Handled in pointer move
    } else if (state.target !== null) {
      // Spring smoothly to target
      let remaining = dt;
      const damping = 2 * Math.sqrt(SPRING);
      while (remaining > 0) {
        const h = Math.min(remaining, 1 / 240);
        const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
        state.velocity += accel * h;
        state.angle += state.velocity * h;
        remaining -= h;
      }
      if (Math.abs(state.target - state.angle) < 0.01 && Math.abs(state.velocity) < 0.04) {
        state.angle = state.target;
        state.velocity = 0;
        state.target = null;
      }
      busy = true;
    } else {
      const tau = 0.16 + momentum * 1.4;
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
      state.angle += state.velocity * dt;
      if (cruise === 0 && snap && Math.abs(state.velocity) < SETTLE_SPEED) {
        state.target = nearest(state.angle);
      }
      busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
    }

    if (now < state.holdUntil) busy = true;
    return busy;
  }

  function frame(now) {
    rafId = 0;
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60;
    state.last = now;

    const busy = advance(dt, now);
    render(now);

    if (busy && isVisible && !document.hidden) {
      rafId = requestAnimationFrame(frame);
    } else {
      state.last = 0;
    }
  }

  function wake() {
    if (!rafId && isVisible && !document.hidden) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function focusIndex(index) {
    let target = -index * step;
    target += 360 * Math.round((state.angle - target) / 360);
    state.target = target;
    state.holdUntil = performance.now() + 2500;
    wake();
  }

  function stepBy(delta) {
    const base = state.target ?? Math.round(state.angle / step) * step;
    state.target = base - delta * step;
    state.holdUntil = performance.now() + 2500;
    wake();
  }

  // Pointer Drag Interaction
  const DRAG_THRESHOLD = 5;

  function onPointerDown(e) {
    if (!draggable || e.button !== 0) return;
    if (e.target.closest('button')) return;

    state.press = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      angle: state.angle,
      moved: false,
      origin: 0,
      samples: [{ time: performance.now(), angle: state.angle }]
    };
  }

  function onPointerMove(e) {
    const press = state.press;
    if (!press || press.id !== e.pointerId) return;

    const dx = e.clientX - press.x;
    const dy = e.clientY - press.y;

    if (!press.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Allow vertical page scroll if user is dragging primarily up/down
      if (Math.abs(dy) > Math.abs(dx) * 1.25 && e.pointerType !== 'mouse') {
        state.press = null;
        return;
      }
      press.moved = true;
      press.origin = dx;
      state.drag = true;
      state.target = null;
      state.velocity = 0;
      root.setAttribute('data-dragging', '');
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
    }

    const perPixel = 180 / (Math.PI * radius * state.fit);
    state.angle = press.angle + (dx - press.origin) * perPixel;

    const now = performance.now();
    press.samples.push({ time: now, angle: state.angle });
    while (press.samples.length > 2 && now - press.samples[0].time > 110) {
      press.samples.shift();
    }
    wake();
  }

  function onPointerUp(e) {
    const press = state.press;
    if (!press || press.id !== e.pointerId) return;
    state.press = null;

    if (!press.moved) {
      // Click event
      const card = e.target.closest?.('[data-cg-index]');
      if (card && focusOnClick) {
        const idx = Number(card.getAttribute('data-cg-index'));
        focusIndex(idx);
      }
      return;
    }

    state.drag = false;
    root.removeAttribute('data-dragging');
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {}

    const first = press.samples[0];
    const last = press.samples[press.samples.length - 1];
    const span = (last.time - first.time) / 1000;
    const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
    state.velocity = velocity;

    if (Math.abs(velocity) > 50) {
      state.dir = Math.sign(velocity);
    }

    if (snap) {
      const tau = 0.16 + momentum * 1.4;
      state.target = Math.round((state.angle + velocity * tau * 0.55) / step) * step;
    }
    wake();
  }

  function onPointerEnter(e) {
    if (e.pointerType === 'mouse') {
      state.hover = true;
      wake();
    }
  }

  function onPointerLeave(e) {
    if (e.pointerType === 'mouse') {
      state.hover = false;
      wake();
    }
  }

  // Keyboard navigation
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusIndex(count - 1);
    }
  }

  // Wheel interaction
  let wheelTimer = 0;
  function onWheel(e) {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (!delta) return;
    e.preventDefault();

    const perPixel = 180 / (Math.PI * radius * state.fit);
    state.target = null;
    state.angle -= delta * perPixel;
    state.velocity = -delta * perPixel * 28;
    state.holdUntil = performance.now() + 1500;

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      if (snap) state.target = nearest(state.angle + state.velocity * 0.1);
      wake();
    }, 140);
    wake();
  }

  // Listeners
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('wheel', onWheel, { passive: false });

  // Observers
  const ro = new ResizeObserver(() => {
    measure();
    wake();
  });
  ro.observe(container);

  const io = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) wake();
    else {
      cancelAnimationFrame(rafId);
      rafId = 0;
      state.last = 0;
    }
  });
  io.observe(container);

  const onMotionChange = e => {
    isReducedMotion = e.matches;
    wake();
  };
  reducedMotionQuery?.addEventListener?.('change', onMotionChange);

  // Initial trigger
  measure();
  render(performance.now());
  wake();

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      reducedMotionQuery?.removeEventListener?.('change', onMotionChange);
      clearTimeout(wheelTimer);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('wheel', onWheel);
      container.innerHTML = '';
    },
    next: () => stepBy(1),
    previous: () => stepBy(-1),
    focus: focusIndex
  };
}

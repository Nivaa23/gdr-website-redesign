/**
 * React Bits Pro — Scroll Stack Component (Modular Vanilla JS Engine)
 * Registry item: @reactbits-starter/scroll-stack-tw
 * 
 * Supports both:
 * 1. Pinned 3D Reveal / Stack / Deck / Flip / Zoom / Fade ScrollStack (`mountRevealScrollStack`)
 *    with exact telemetry props (variant, scrollLength, peek, scaleStep, blur, dim, smooth, depth,
 *    cardWidth, cardHeight, borderRadius, perspective, showProgress, showCounter).
 * 2. Classic sticky slot ScrollStack (`mountScrollStack`) used on subpages.
 */
import './ScrollStack.css';

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const smoothstep = (t) => t * t * (3 - 2 * t);

const buildFilter = (t, dim, blur) => {
  const parts = [];
  if (blur > 0.01) parts.push(`blur(${(t * blur).toFixed(2)}px)`);
  if (dim > 0.001) parts.push(`brightness(${(1 - t * dim).toFixed(3)})`);
  return parts.length ? parts.join(' ') : 'none';
};

const computeCardFrame = (variant, offset, index, cfg) => {
  const baseClip = `inset(0 0 0 0 round ${cfg.radius}px)`;
  const dir = index % 2 === 0 ? 1 : -1;

  if (offset < 0) {
    const a = clamp(offset + 1, 0, 1);
    const s = smoothstep(a);
    switch (variant) {
      case 'fade':
        return {
          transform: `translate3d(0,0,0) scale(${(1.06 - 0.06 * s).toFixed(4)})`,
          opacity: s,
          filter: 'none',
          clip: baseClip
        };
      case 'flip':
        return {
          transform: `translate3d(0,${((1 - s) * 26).toFixed(2)}%,0) rotateX(${(-((1 - s) * 72)).toFixed(2)}deg)`,
          opacity: clamp(1.6 * s, 0, 1),
          filter: 'none',
          clip: baseClip
        };
      case 'zoom':
        return {
          transform: `translate3d(0,0,0) scale(${(0.52 + 0.48 * s).toFixed(4)})`,
          opacity: clamp(1.4 * s, 0, 1),
          filter: cfg.blur > 0.01 ? `blur(${((1 - s) * cfg.blur).toFixed(2)}px)` : 'none',
          clip: baseClip
        };
      case 'reveal':
        return {
          transform: 'translate3d(0,0,0)',
          opacity: 1,
          filter: 'none',
          clip: `inset(${((1 - a) * 100).toFixed(2)}% 0 0 0 round ${cfg.radius}px)`
        };
      case 'deck':
        return {
          transform: `translate3d(0,${((1 - a) * (cfg.enter + 6)).toFixed(2)}%,0) rotate(${((1 - s) * 4 * dir).toFixed(2)}deg)`,
          opacity: 1,
          filter: 'none',
          clip: baseClip
        };
      default:
        return {
          transform: `translate3d(0,${((1 - a) * cfg.enter).toFixed(2)}%,0)`,
          opacity: 1,
          filter: 'none',
          clip: baseClip
        };
    }
  }

  const s = smoothstep(clamp(offset, 0, 1));
  switch (variant) {
    case 'fade':
      return {
        transform: `translate3d(0,0,0) scale(${(1 - 0.06 * s).toFixed(4)})`,
        opacity: 1 - s,
        filter: buildFilter(s, cfg.dim, cfg.blur),
        clip: baseClip
      };
    case 'flip':
      return {
        transform: `translate3d(0,${(-(26 * s)).toFixed(2)}%,0) rotateX(${(72 * s).toFixed(2)}deg)`,
        opacity: 1 - s,
        filter: buildFilter(s, cfg.dim, 0),
        clip: baseClip
      };
    case 'zoom':
      return {
        transform: `translate3d(0,0,0) scale(${(1 + 0.42 * s).toFixed(4)})`,
        opacity: 1 - s,
        filter: cfg.blur > 0.01 ? `blur(${(s * cfg.blur * 1.4).toFixed(2)}px)` : 'none',
        clip: baseClip
      };
    case 'reveal':
      return {
        transform: `translate3d(0,${(-offset * cfg.peek * 0.5).toFixed(2)}px,0) scale(${(1 - offset * cfg.scaleStep * 0.7).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
    case 'deck':
      return {
        transform: `translate3d(0,${(-offset * cfg.peek * 0.75).toFixed(2)}px,0) rotate(${(4.5 * offset * dir).toFixed(2)}deg) scale(${(1 - offset * cfg.scaleStep * 0.85).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
    default:
      return {
        transform: `translate3d(0,${(-offset * cfg.peek).toFixed(2)}px,0) scale(${(1 - offset * cfg.scaleStep).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
  }
};

export function mountRevealScrollStack(sectionElement, options = {}) {
  if (!sectionElement) return null;

  const cards = Array.from(sectionElement.querySelectorAll('[data-reveal-stack-card]'));
  if (!cards.length) return null;

  const variant = options.variant || 'reveal';
  const scrollLength = typeof options.scrollLength === 'string' ? parseFloat(options.scrollLength) || 1.0 : (options.scrollLength ?? 1.0);
  const peek = typeof options.peek === 'string' ? parseFloat(options.peek) || 26 : (options.peek ?? 26);
  const scaleStep = options.scaleStep ?? 0.07;
  const blur = typeof options.blur === 'string' ? parseFloat(options.blur) || 4.0 : (options.blur ?? 4.0);
  const dim = options.dim ?? 0.28;
  const smooth = options.smooth ?? 0.16;
  const depth = options.depth ?? 3;
  const cardWidth = typeof options.cardWidth === 'string' ? parseFloat(options.cardWidth) || 880 : (options.cardWidth ?? 880);
  const cardHeight = options.cardHeight ?? 0.68;
  const borderRadius = typeof options.borderRadius === 'string' ? parseFloat(options.borderRadius) || 22 : (options.borderRadius ?? 22);
  const perspective = typeof options.perspective === 'string' ? parseFloat(options.perspective) || 1400 : (options.perspective ?? 1400);

  const total = cards.length;
  const totalHeightVh = 100 + Math.max(0, total - 1) * Math.max(0.2, scrollLength) * 100;
  sectionElement.style.height = `${totalHeightVh}vh`;

  const stickyViewport = sectionElement.querySelector('[data-reveal-stack-viewport]');
  if (stickyViewport) {
    stickyViewport.style.perspective = `${Math.max(200, perspective)}px`;
  }

  const stage = sectionElement.querySelector('[data-reveal-stack-stage]');
  if (stage) {
    stage.style.maxWidth = `${Math.max(200, cardWidth)}px`;
    stage.style.height = `${100 * clamp(cardHeight, 0.2, 0.95)}vh`;
  }

  const progressBar = sectionElement.querySelector('[data-reveal-stack-progress]');
  const counterEl = sectionElement.querySelector('[data-reveal-stack-counter]');

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cfg = {
    peek: Math.max(0, peek),
    scaleStep: clamp(scaleStep, 0, 0.4),
    blur: motionQuery.matches ? 0 : Math.max(0, blur),
    dim: clamp(dim, 0, 1),
    radius: Math.max(0, borderRadius),
    enter: ((1 + 1 / clamp(cardHeight, 0.2, 0.95)) / 2) * 100 + 3
  };

  let currentPos = 0;
  let lastTime = 0;
  let rafId = 0;
  let isRunning = false;
  let activeIdx = -1;

  const measureScroll = () => {
    const vh = window.innerHeight || 0;
    const rect = sectionElement.getBoundingClientRect();
    const scrollable = rect.height - vh;
    return scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1) * (total - 1);
  };

  const renderPosition = (pos) => {
    const maxDepth = Math.max(1, Math.round(depth));
    for (let i = 0; i < total; i += 1) {
      const node = cards[i];
      if (!node) continue;
      const offset = pos - i;
      if (offset < -1.0005 || offset > maxDepth) {
        if (node.style.visibility !== 'hidden') {
          node.style.visibility = 'hidden';
          node.style.pointerEvents = 'none';
        }
        continue;
      }
      if (node.style.visibility === 'hidden') {
        node.style.visibility = '';
      }
      node.style.pointerEvents = Math.abs(offset) < 0.5 ? 'auto' : 'none';
      const frame = computeCardFrame(variant, offset, i, cfg);
      node.style.transform = frame.transform;
      node.style.opacity = frame.opacity.toFixed(4);
      node.style.filter = frame.filter;
      node.style.clipPath = frame.clip;
    }

    if (progressBar && total > 1) {
      const p = clamp(pos / (total - 1), 0, 1);
      progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
    }

    const idx = clamp(Math.round(pos), 0, total - 1);
    if (idx !== activeIdx) {
      activeIdx = idx;
      if (counterEl) {
        counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      }
      options.onIndexChange?.(idx);
    }
  };

  const tick = (now) => {
    const prev = lastTime || now;
    const dt = Math.min(0.05, Math.max(0, (now - prev) / 1000));
    lastTime = now;
    const damping = motionQuery.matches ? 0 : clamp(smooth, 0, 0.95);
    const target = measureScroll();
    const next = currentPos + (target - currentPos) * (damping > 0 ? 1 - Math.pow(1 - damping, 60 * dt) : 1);
    currentPos = next;
    renderPosition(next);

    if (Math.abs(target - next) > 4e-4) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      currentPos = target;
      renderPosition(target);
      isRunning = false;
    }
  };

  const schedule = () => {
    if (!isRunning) {
      isRunning = true;
      lastTime = 0;
      rafId = window.requestAnimationFrame(tick);
    }
  };

  currentPos = measureScroll();
  renderPosition(currentPos);

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  const ro = new ResizeObserver(schedule);
  ro.observe(sectionElement);

  return {
    update: schedule,
    destroy: () => {
      window.cancelAnimationFrame(rafId);
      isRunning = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    }
  };
}

const resolveOffset = (value, size) => {
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
  return parseFloat(text) || 0;
};

const toLength = value => (typeof value === 'number' ? `${value}px` : value);

export function mountScrollStack(rootElement, options = {}) {
  if (!rootElement) return null;

  const inner = rootElement.querySelector('.scroll-stack__inner');
  if (!inner) return null;

  const slots = Array.from(inner.querySelectorAll('[data-stack-slot]'));
  if (!slots.length) return null;

  const settings = {
    itemDistance: options.itemDistance !== undefined ? options.itemDistance : 80,
    itemStackDistance: options.itemStackDistance !== undefined ? options.itemStackDistance : 26,
    stackPosition: options.stackPosition || '15%',
    itemScale: options.itemScale !== undefined ? options.itemScale : 0.035,
    baseScale: options.baseScale !== undefined ? options.baseScale : 0.88,
    dimAmount: options.dimAmount !== undefined ? options.dimAmount : 0.18,
    blurAmount: options.blurAmount || 0,
    tiltAmount: options.tiltAmount || 0,
    rotationAmount: options.rotationAmount || 0,
    useWindowScroll: options.useWindowScroll !== undefined ? options.useWindowScroll : true,
    onStackComplete: options.onStackComplete || null
  };

  const windowed = settings.useWindowScroll;
  const target = windowed ? window : rootElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  let frame = 0;
  let complete = false;

  slots.forEach((slot, index) => {
    slot.style.position = 'sticky';
    slot.style.top = `calc(${toLength(settings.stackPosition)} + ${index * settings.itemStackDistance}px)`;
    slot.style.marginBottom = `${(slots.length - 1 - index) * settings.itemStackDistance}px`;
    slot.style.zIndex = `${index + 1}`;
  });

  const write = (key, value, apply) => {
    if (cache.get(key) === value) return false;
    cache.set(key, value);
    apply(value);
    return true;
  };

  const update = () => {
    frame = 0;
    if (motion.matches) return;

    const viewHeight = windowed ? window.innerHeight : rootElement.clientHeight;
    const viewTop = windowed ? 0 : rootElement.getBoundingClientRect().top + rootElement.clientTop;
    const stackTop = resolveOffset(settings.stackPosition, viewHeight);
    const offset = settings.itemStackDistance;
    const heights = slots.map(slot => slot.offsetHeight);
    const tops = slots.map(slot => slot.getBoundingClientRect().top);

    const depths = slots.map(() => 0);
    let lastCover = 0;

    for (let j = 1; j < slots.length; j++) {
      const pinBefore = viewTop + stackTop + (j - 1) * offset;
      const start = pinBefore + heights[j - 1];
      const span = Math.max(1, start - pinBefore - offset);
      const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
      for (let i = 0; i < j; i++) {
        depths[i] += cover;
      }
      lastCover = cover;
    }

    const dimStep = Math.min(Math.max(settings.dimAmount, 0), 1);

    slots.forEach((slot, i) => {
      const card = slot.firstElementChild;
      if (!card) return;

      const depth = depths[i];
      const lean = Math.min(depth, 1);
      const scale = Math.max(Math.min(settings.baseScale, 1), 1 - depth * settings.itemScale);
      const tilt = -lean * settings.tiltAmount;
      const turn = lean * settings.rotationAmount * (i % 2 ? -1 : 1);
      const blur = depth * settings.blurAmount;
      const dim = 1 - Math.pow(1 - dimStep, depth);

      const transform = depth < 0.0005
        ? ''
        : `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      write(`transform${i}`, transform, val => {
        card.style.transform = val;
      });
      write(`filter${i}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '', val => {
        card.style.filter = val;
      });
      write(`dim${i}`, dim.toFixed(3), val => {
        card.style.setProperty('--scroll-stack-dim', val);
      });
    });

    const isDone = slots.length > 1 && lastCover >= 0.999;
    if (isDone !== complete) {
      complete = isDone;
      if (isDone) settings.onStackComplete?.();
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const observer = new ResizeObserver(schedule);
  observer.observe(rootElement);
  observer.observe(inner);

  target.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  schedule();

  return {
    update: schedule,
    destroy: () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };
}

export default mountScrollStack;

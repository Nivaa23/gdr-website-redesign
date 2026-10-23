/**
 * React Bits Pro — Scroll Stack Component (Modular Vanilla JS Engine)
 * Registry item: @reactbits-starter/scroll-stack-tw
 * 
 * Drives scroll-synchronized stacking, perspective depth scaling, and progressive dimming
 * for vertically stacked card layouts.
 */
import './ScrollStack.css';

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

  const readScroll = () => (windowed ? window.scrollY : rootElement.scrollTop);

  // Position slots with sticky offsets
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

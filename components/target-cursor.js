/**
 * React Bits — TargetCursor Component
 * Official JavaScript implementation for Geo Designs & Research website
 * 
 * Features:
 * - Reticle cursor whose corner brackets snap around target elements (.cursor-target)
 * - Corner bracket positioning, target-locking spring animation, and corner radius matching
 * - Pointer tracking, click compression feedback, and fine-pointer detection
 * - Continuous roaming spin rotation with target-locking settling
 * - Background-aware color switching (#497E5E on light, #FFFFFF on dark)
 * - Reduced-motion handling and normal blend mode
 * - Clean cleanup on destroy
 */
import './TargetCursor.css';

const CORNER_ANGLES = [0, 90, 180, 270];
const QUARTER = Math.PI / 2;

const spring = (state, goal, stiffness, damping, dt) => {
  const steps = 2;
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;
    state.x += state.v * h;
  }
};

const resolveElement = value => (value && 'current' in value ? value.current : value) || null;

let cachedSection = null;
let cachedIsDark = false;

/**
 * Resolves the surrounding structural section or major landmark container for an element,
 * bypassing individual interactive components (buttons, links, cards, images, badges)
 * so their local background colors do not distort the section-level cursor color.
 */
function getSurroundingSection(el) {
  if (!el || el === document.body || el === document.documentElement) return document.body;

  // 1. Explicit sub-sections with their own dedicated background within a larger container
  const subSection = el.closest('.top-bar, .mega-menu');
  if (subSection) return subSection;

  // 2. Surrounding structural section or semantic landmark container
  const section = el.closest('section, footer, header, main, [role="region"], [role="banner"], [role="contentinfo"], dialog');
  if (section) return section;

  return document.body;
}

/**
 * Determines whether the effective background of a section is dark (<128 luminance) or light.
 * Accounts for transparent nested wrappers by ascending towards the document root.
 */
function computeSectionIsDark(sectionEl) {
  if (!sectionEl || sectionEl === document.documentElement) return false;

  // Fast-path known dark containers / dark theme indicators
  if (sectionEl.matches('.top-bar, .hero-section, .journey-section, .site-footer, [data-theme="dark"], .theme-dark, .dark-theme, .is-dark')) {
    return true;
  }

  // Fast-path known light containers / light theme indicators
  if (sectionEl.matches('.site-header, .mega-menu, [data-theme="light"], .theme-light, .light-theme')) {
    return false;
  }

  // Walk up from sectionEl to resolve effective background color through transparent wrappers
  let curr = sectionEl;
  let depth = 0;
  while (curr && curr !== document.documentElement && depth < 8) {
    depth++;
    const style = window.getComputedStyle(curr);
    const bg = style.backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        if (a >= 0.5) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          return lum < 128;
        }
      }
    }
    curr = curr.parentElement;
  }

  return false;
}

/**
 * Inspects whether the surrounding section beneath the pointer is dark or light.
 * Uses section caching to avoid redundant computed style evaluations on pointer move.
 */
function isDarkUnderPointer(node, x, y) {
  const el = node || (typeof document !== 'undefined' ? document.elementFromPoint(x, y) : null);
  if (!el || el === document.documentElement) return false;

  const section = getSurroundingSection(el);
  if (section === cachedSection) {
    return cachedIsDark;
  }

  cachedSection = section;
  cachedIsDark = computeSectionIsDark(section);
  return cachedIsDark;
}

export function mountTargetCursor(options = {}) {
  const defaults = {
    targetSelector: '.cursor-target',
    cursorColor: '#497E5E',
    lightCursorColor: '#497E5E',
    darkCursorColor: '#FFFFFF',
    cursorColorOnTarget: null,
    spinDuration: 1.2,
    hoverDuration: 0.16,
    parallaxOn: false,
    hideDefaultCursor: true,
    size: 24,
    cornerSize: 8,
    thickness: 2,
    padding: 4,
    matchRadius: true,
    dotSize: 3,
    blendMode: 'normal',
    showLabel: false,
    clickEffect: true,
    container: null
  };

  const settings = {
    ...defaults,
    ...options,
    hoverDuration: Math.max(0.05, options.hoverDuration ?? defaults.hoverDuration),
    size: Math.max(4, options.size ?? defaults.size),
    cornerSize: Math.max(2, options.cornerSize ?? defaults.cornerSize),
    thickness: Math.max(0.5, options.thickness ?? defaults.thickness),
    dotSize: Math.max(0, options.dotSize ?? defaults.dotSize)
  };

  if (typeof window === 'undefined') return null;

  // Only enable on devices with hover and a fine pointer (mouse/trackball/pen)
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches) return null;

  // Create DOM elements
  const root = document.createElement('div');
  root.className = 'target-cursor';
  root.style.mixBlendMode = settings.blendMode || 'normal';
  root.style.opacity = '0';
  root.style.setProperty('--target-cursor-color', settings.lightCursorColor || settings.cursorColor || '#497E5E');
  root.setAttribute('aria-hidden', 'true');

  const cornerElements = CORNER_ANGLES.map(() => {
    const el = document.createElement('span');
    el.className = 'target-cursor__corner';
    root.appendChild(el);
    return el;
  });

  const dot = document.createElement('span');
  dot.className = 'target-cursor__dot';
  root.appendChild(dot);

  const label = document.createElement('span');
  label.className = 'target-cursor__label';
  root.appendChild(label);

  document.body.appendChild(root);

  // Injected style element to dynamically hide native cursor when pointer is inside
  const style = document.createElement('style');
  document.head.appendChild(style);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };
  const centerX = { x: 0, v: 0 };
  const centerY = { x: 0, v: 0 };
  const halfW = { x: 0, v: 0 };
  const halfH = { x: 0, v: 0 };
  const radius = { x: 0, v: 0 };
  const turn = { x: 0, v: 0 };
  const lock = { x: 0, v: 0 };
  const press = { x: 0, v: 0 };
  const presence = { x: 0, v: 0 };
  let currentIsDark = false;
  let target = null;
  let targetRadius = 0;
  let quarter = 0;
  let spinSpeed = 0;
  let raf = 0;
  let last = 0;
  let lastLabel = '';
  let lastColor = '';
  let lastScope = null;

  const scopeOf = () => resolveElement(settings.container);

  const hideCursor = () => {
    const scope = scopeOf();
    if (scope !== lastScope) {
      lastScope?.removeAttribute('data-target-cursor-scope');
      scope?.setAttribute('data-target-cursor-scope', '');
      lastScope = scope;
    }
    const selector = scope ? '[data-target-cursor-scope]' : 'html';
    const rule =
      settings.hideDefaultCursor && pointer.inside ? `${selector}, ${selector} * { cursor: none !important; }` : '';
    if (style.textContent !== rule) style.textContent = rule;
  };

  const findTarget = (x, y, element) => {
    const node = element || document.elementFromPoint(x, y);
    const found = node?.closest?.(settings.targetSelector) || null;
    const scope = scopeOf();
    if (found && scope && !scope.contains(found)) return null;
    return found;
  };

  const lockOn = next => {
    if (next === target) return;
    target = next;
    if (target) {
      const angle = turn.x;
      quarter = Math.round(angle / QUARTER);
      const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
      targetRadius = corner;
      spinSpeed = 0;
    }
  };

  const frame = now => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;

    if (target && !target.isConnected) lockOn(null);
    const rect = target ? target.getBoundingClientRect() : null;
    const locked = !!rect && pointer.inside;
    const snapW = 4.6 / settings.hoverDuration;
    const snapK = snapW * snapW;
    const snapC = 2 * 0.62 * snapW;

    spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);
    spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);
    spring(press, pointer.pressed && settings.clickEffect ? 1 : 0, 900, 40, dt);

    let goalX = pointer.x;
    let goalY = pointer.y;
    let goalW = settings.size / 2;
    let goalH = settings.size / 2;
    let goalR = Math.min(2, settings.cornerSize / 4);
    if (locked) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const lean = settings.parallaxOn ? 0.08 : 0;
      goalX = cx + (pointer.x - cx) * lean;
      goalY = cy + (pointer.y - cy) * lean;
      const odd = Math.abs(quarter) % 2 === 1;
      const w = rect.width / 2 + settings.padding;
      const h = rect.height / 2 + settings.padding;
      goalW = odd ? h : w;
      goalH = odd ? w : h;
      goalR = settings.matchRadius ? Math.min(targetRadius + Math.max(0, settings.padding), settings.cornerSize) : 0;
    }

    if (!pointer.inside && presence.x < 0.01) pointer.seen = false;
    if (!pointer.seen) {
      centerX.x = goalX;
      centerY.x = goalY;
      halfW.x = goalW;
      halfH.x = goalH;
      pointer.seen = pointer.inside;
    }

    const follow = locked ? snapK : 2200;
    const followC = locked ? snapC : 2 * Math.sqrt(2200);
    spring(centerX, goalX, follow, followC, dt);
    spring(centerY, goalY, follow, followC, dt);
    spring(halfW, goalW, snapK, snapC, dt);
    spring(halfH, goalH, snapK, snapC, dt);
    spring(radius, goalR, snapK, 2 * snapW, dt);

    if (locked) {
      spring(turn, quarter * QUARTER, snapK, snapC, dt);
    } else {
      const speed = settings.spinDuration > 0 && !reduce ? (Math.PI * 2) / settings.spinDuration : 0;
      spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));
      turn.v = spinSpeed;
      turn.x += spinSpeed * dt;
    }

    const squeeze = 1 - press.x * 0.14;
    const cos = Math.cos(turn.x);
    const sin = Math.sin(turn.x);
    const w = Math.max(0, halfW.x) * squeeze;
    const h = Math.max(0, halfH.x) * squeeze;
    const local = [
      [-w, -h],
      [w, -h],
      [w, h],
      [-w, h]
    ];
    const r = Math.max(0, Math.min(radius.x, settings.cornerSize));
    const degrees = (turn.x * 180) / Math.PI;
    let left = Infinity;
    let top = Infinity;
    cornerElements.forEach((corner, i) => {
      if (!corner) return;
      const [lx, ly] = local[i];
      const x = centerX.x + lx * cos - ly * sin;
      const y = centerY.x + lx * sin + ly * cos;
      left = Math.min(left, x);
      top = Math.min(top, y);
      corner.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)`;
      corner.style.width = `${settings.cornerSize}px`;
      corner.style.height = `${settings.cornerSize}px`;
      corner.style.borderWidth = `${settings.thickness}px 0 0 ${settings.thickness}px`;
      corner.style.borderTopLeftRadius = `${r.toFixed(2)}px`;
    });

    if (dot) {
      const dotScale = 1 - press.x * 0.35;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) scale(${dotScale.toFixed(3)})`;
      dot.style.width = `${settings.dotSize}px`;
      dot.style.height = `${settings.dotSize}px`;
    }

    if (label) {
      const text = settings.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';
      if (text && text !== lastLabel) label.textContent = text;
      if (text) lastLabel = text;
      const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;
      label.style.transform = `translate3d(${left.toFixed(2)}px, ${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(${((1 - shown) * 4).toFixed(2)}px)`;
      label.style.opacity = shown.toFixed(3);
    }

    // Background-aware color selection: exact lightColor on light surfaces, exact darkColor on dark surfaces
    const baseColor = currentIsDark ? (settings.darkCursorColor || '#FFFFFF') : (settings.lightCursorColor || settings.cursorColor || '#497E5E');
    const mix = settings.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;
    const color = mix ? `color-mix(in oklab, ${settings.cursorColorOnTarget} ${mix}%, ${baseColor})` : baseColor;
    if (color !== lastColor) {
      root.style.setProperty('--target-cursor-color', color);
      lastColor = color;
    }
    root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);

    const resting =
      !pointer.inside &&
      presence.x < 0.002 &&
      Math.abs(presence.v) < 0.002 &&
      Math.abs(lock.x) < 0.002 &&
      Math.abs(press.x) < 0.002;
    const spinning = pointer.inside && !locked && spinSpeed > 0.0001;
    const moving =
      Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||
      Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||
      Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;
    if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);
    else last = 0;
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const insideScope = (x, y, element) => {
    const scope = scopeOf();
    if (!scope) return true;
    if (element && scope.contains(element)) return true;
    const box = scope.getBoundingClientRect();
    return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  };

  const onPointerMove = event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    currentIsDark = isDarkUnderPointer(event.target, pointer.x, pointer.y);
    const inside = insideScope(pointer.x, pointer.y, event.target);
    if (inside !== pointer.inside) {
      pointer.inside = inside;
      hideCursor();
    }
    lockOn(inside ? findTarget(pointer.x, pointer.y, event.target) : null);
    wake();
  };

  const onPointerDown = event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    pointer.pressed = true;
    wake();
  };

  const onPointerUp = () => {
    pointer.pressed = false;
    wake();
  };

  const onLeave = () => {
    pointer.inside = false;
    pointer.pressed = false;
    lockOn(null);
    hideCursor();
    wake();
  };

  const onScroll = () => {
    if (!pointer.inside) return;
    const node = document.elementFromPoint(pointer.x, pointer.y);
    currentIsDark = isDarkUnderPointer(node, pointer.x, pointer.y);
    lockOn(findTarget(pointer.x, pointer.y, node));
    wake();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);

  return {
    destroy: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll, { capture: true });
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      lastScope?.removeAttribute('data-target-cursor-scope');
      cachedSection = null;
      cachedIsDark = false;
      style.remove();
      root.remove();
    }
  };
}

export default mountTargetCursor;

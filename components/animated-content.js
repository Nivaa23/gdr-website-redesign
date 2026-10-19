/**
 * React Bits — AnimatedContent Component (Vanilla JS Core & Module)
 * Scroll-triggered reveal animations with blur, vertical movement, opacity, and stagger
 *
 * Configurable options:
 * - distance: 40 (pixels)
 * - direction: 'vertical' | 'horizontal' (default 'vertical')
 * - duration: 1.0 (seconds)
 * - delay: 0 (seconds)
 * - stagger: 0.08 (seconds)
 * - blur: 12 (px)
 * - scale: 1
 * - initialOpacity: 0
 * - threshold: 0.1
 * - once: true (default for website to prevent distracting repeat replays)
 * - ease: 'cubic-bezier(0.165, 0.84, 0.44, 1)' (power3.out)
 */
import './AnimatedContent.css';

export function mountAnimatedContent(element, options = {}) {
  if (!element) return null;

  const distance = options.distance !== undefined ? options.distance : 40;
  const duration = options.duration !== undefined ? options.duration : 1.0;
  const delay = options.delay !== undefined ? options.delay : 0;
  const stagger = options.stagger !== undefined ? options.stagger : 0.08;
  const blur = options.blur !== undefined ? options.blur : 12;
  const scale = options.scale !== undefined ? options.scale : 1;
  const threshold = options.threshold !== undefined ? options.threshold : 0.1;
  const ease = options.ease || 'cubic-bezier(0.165, 0.84, 0.44, 1)';
  const once = options.once !== undefined ? options.once : true;

  // Set CSS custom properties on container
  element.style.setProperty('--ac-distance', `${distance}px`);
  element.style.setProperty('--ac-duration', `${duration}s`);
  element.style.setProperty('--ac-blur', `${blur}px`);
  element.style.setProperty('--ac-scale', `${scale}`);
  element.style.setProperty('--ac-ease', ease);

  // Check reduced motion preference (WCAG 2.3.3)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    element.classList.add('is-revealed');
    const items = element.querySelectorAll('.animated-content-item');
    items.forEach(it => it.classList.add('is-revealed'));
    return {
      destroy: () => {}
    };
  }

  // Find direct/scoped items to animate for this container
  const allItems = Array.from(element.querySelectorAll('.animated-content-item'));
  const items = allItems.filter(item => item.closest('.animated-content') === element);
  const isStaggerContainer = items.length > 0;

  if (isStaggerContainer) {
    element.setAttribute('data-stagger-container', 'true');
    items.forEach((item, idx) => {
      const itemDelay = delay + (idx * stagger);
      item.style.setProperty('--ac-delay', `${itemDelay.toFixed(3)}s`);
      item.style.setProperty('--ac-distance', `${distance}px`);
      item.style.setProperty('--ac-duration', `${duration}s`);
      item.style.setProperty('--ac-blur', `${blur}px`);
      item.style.setProperty('--ac-scale', `${scale}`);
      item.style.setProperty('--ac-ease', ease);
    });
  } else {
    element.style.setProperty('--ac-delay', `${delay}s`);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (isStaggerContainer) {
          element.classList.add('is-revealed');
          items.forEach(it => it.classList.add('is-revealed'));
        } else {
          element.classList.add('is-revealed');
        }

        if (once) {
          observer.unobserve(entry.target);
        }
      } else if (!once) {
        if (isStaggerContainer) {
          element.classList.remove('is-revealed');
          items.forEach(it => it.classList.remove('is-revealed'));
        } else {
          element.classList.remove('is-revealed');
        }
      }
    });
  }, {
    threshold: threshold,
    rootMargin: '0px 0px -20px 0px'
  });

  observer.observe(element);

  return {
    destroy: () => {
      observer.disconnect();
    }
  };
}

export function initAnimatedContent(options = {}) {
  const elements = Array.from(document.querySelectorAll('[data-animated-content], .animated-content'));
  const instances = elements.map(el => {
    const elOptions = { ...options };
    if (el.hasAttribute('data-ac-delay')) {
      elOptions.delay = parseFloat(el.getAttribute('data-ac-delay'));
    }
    if (el.hasAttribute('data-ac-stagger')) {
      elOptions.stagger = parseFloat(el.getAttribute('data-ac-stagger'));
    }
    if (el.hasAttribute('data-ac-distance')) {
      elOptions.distance = parseFloat(el.getAttribute('data-ac-distance'));
    }
    return mountAnimatedContent(el, elOptions);
  });

  return {
    destroy: () => {
      instances.forEach(inst => inst && inst.destroy && inst.destroy());
    }
  };
}

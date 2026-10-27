/**
 * GEO DESIGNS & RESEARCH — CINEMATIC SCROLLING ENGINE
 * 
 * Inspired by:
 * 1. Hubtown Limited: Fluid inertia scrolling, section-by-section narrative,
 *    coordinated foreground/background movement, elegant easing.
 * 2. Shader Development Studio: Layered depth, subtle parallax, perspective reveals.
 * 
 * Two Distinct Modes:
 * - Mode A: Complete cinematic storytelling on the homepage (/index.html)
 * - Mode B: Refined, natural smooth document scrolling on all other pages
 */
import './CinematicScroll.css';

export function initCinematicScroll(options = {}) {
  // Check if reduced motion is requested by user (WCAG 2.3.3)
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    return {
      destroy: () => {},
      scrollTo: (target) => {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) el.scrollIntoView({ behavior: 'auto' });
      }
    };
  }

  // Detect whether current page is Homepage (Mode A) or Subpage (Mode B)
  const isHomepage = !!(
    document.querySelector('.hero-section') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/index.html') ||
    window.location.pathname.endsWith('/')
  );

  if (isHomepage) {
    document.body.classList.add('is-homepage');
  }

  // Ease tuning: Mode A gets deliberate, cinematic glide (0.082); Mode B gets responsive crispness (0.13)
  const ease = isHomepage ? 0.082 : 0.13;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let currentY = window.scrollY;
  let targetY = currentY;
  let rafId = 0;
  let isScrolling = false;

  const getMaxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  // --------------------------------------------------------------------------
  // 1. Fluid Inertia Animation Loop (Desktop)
  // --------------------------------------------------------------------------
  function updateScroll() {
    const maxScroll = getMaxScroll();
    targetY = Math.max(0, Math.min(targetY, maxScroll));

    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.4) {
      currentY += diff * ease;
      window.scrollTo(0, Math.round(currentY));
      
      if (isHomepage) {
        updateHomepageParallax(currentY);
      }
      
      rafId = requestAnimationFrame(updateScroll);
    } else {
      currentY = targetY;
      window.scrollTo(0, Math.round(currentY));
      
      if (isHomepage) {
        updateHomepageParallax(currentY);
      }
      
      isScrolling = false;
      rafId = 0;
    }
  }

  function startScroll() {
    if (!isScrolling) {
      isScrolling = true;
      rafId = requestAnimationFrame(updateScroll);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Wheel Event Normalization & Interception (Desktop only)
  // --------------------------------------------------------------------------
  function onWheel(e) {
    // Never hijack horizontal or modifier keys (zoom, ctrl, etc.)
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    e.preventDefault();

    let delta = e.deltaY;
    // Normalize delta modes (lines vs pixels vs pages)
    if (e.deltaMode === 1) delta *= 38;
    else if (e.deltaMode === 2) delta *= window.innerHeight;

    // Dampen large mouse wheel notches while preserving trackpad nuance
    if (Math.abs(delta) > 100) {
      delta = Math.sign(delta) * (100 + Math.pow(Math.abs(delta) - 100, 0.72));
    }

    const maxScroll = getMaxScroll();
    targetY = Math.max(0, Math.min(targetY + delta, maxScroll));
    startScroll();
  }

  // --------------------------------------------------------------------------
  // 3. Resync with native events (Drag scrollbar, window resize, touch)
  // --------------------------------------------------------------------------
  function onNativeScroll() {
    if (!isScrolling) {
      currentY = window.scrollY;
      targetY = currentY;
      if (isHomepage) {
        updateHomepageParallax(currentY);
      }
    }
  }

  function onResize() {
    currentY = window.scrollY;
    targetY = Math.min(targetY, getMaxScroll());
  }

  // --------------------------------------------------------------------------
  // 4. Keyboard Navigation Smooth Support
  // --------------------------------------------------------------------------
  function onKeyDown(e) {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    let delta = 0;
    switch (e.key) {
      case 'ArrowDown':
        delta = 90;
        break;
      case 'ArrowUp':
        delta = -90;
        break;
      case 'PageDown':
      case ' ':
        if (e.key === ' ' && e.shiftKey) delta = -window.innerHeight * 0.85;
        else delta = window.innerHeight * 0.85;
        break;
      case 'PageUp':
        delta = -window.innerHeight * 0.85;
        break;
      case 'Home':
        targetY = 0;
        startScroll();
        e.preventDefault();
        return;
      case 'End':
        targetY = getMaxScroll();
        startScroll();
        e.preventDefault();
        return;
      default:
        return;
    }

    if (delta !== 0) {
      e.preventDefault();
      targetY = Math.max(0, Math.min(targetY + delta, getMaxScroll()));
      startScroll();
    }
  }

  // --------------------------------------------------------------------------
  // 5. Smooth Anchor Links
  // --------------------------------------------------------------------------
  function onAnchorClick(e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const hash = href.slice(hashIndex);
    const path = href.slice(0, hashIndex);

    // If link points to another page, let browser handle navigation naturally
    if (path && path !== window.location.pathname && path !== window.location.pathname.replace(/^\//, '')) {
      return;
    }

    const targetEl = document.querySelector(hash);
    if (!targetEl) return;

    e.preventDefault();
    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight + 10 : 84;
    const elementTop = targetEl.getBoundingClientRect().top + window.scrollY;
    
    targetY = Math.max(0, Math.min(elementTop - headerOffset, getMaxScroll()));
    startScroll();

    // Update history hash without jump
    if (history.pushState) {
      history.pushState(null, '', hash);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Mode A: Homepage Parallax, Depth & Ambient Chapter Triggers
  // --------------------------------------------------------------------------
  const directorImage = isHomepage ? document.getElementById('about-director-image') : null;
  const networksSection = isHomepage ? document.getElementById('our-networks') : null;
  const heroDepthCarousel = isHomepage ? document.getElementById('hero-depth-carousel') : null;

  function updateHomepageParallax(scrollY) {
    // Parallax on About Company Director Photo (Shader-inspired subtle depth)
    if (directorImage) {
      const rect = directorImage.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (rect.top - window.innerHeight * 0.5) * 0.055;
        directorImage.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    }

    // Parallax on Hero Carousel
    if (heroDepthCarousel && scrollY < window.innerHeight) {
      const heroOffset = scrollY * 0.12;
      heroDepthCarousel.style.transform = `translate3d(0, ${heroOffset.toFixed(1)}px, 0)`;
    }

    // Network Map Pins Ambient Activation
    if (networksSection) {
      const netRect = networksSection.getBoundingClientRect();
      if (netRect.top < window.innerHeight * 0.75 && netRect.bottom > window.innerHeight * 0.25) {
        if (!networksSection.classList.contains('is-in-view')) {
          networksSection.classList.add('is-in-view');
        }
      } else {
        if (networksSection.classList.contains('is-in-view')) {
          networksSection.classList.remove('is-in-view');
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Mount Listeners
  // --------------------------------------------------------------------------
  // On desktop non-touch devices, enable the smooth inertia wheel interception
  if (!isTouchDevice) {
    document.documentElement.classList.add('has-smooth-scroll');
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
  }

  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('click', onAnchorClick);

  // Initial parallax pass
  if (isHomepage) {
    updateHomepageParallax(window.scrollY);
  }

  return {
    destroy: () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('has-smooth-scroll');
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('click', onAnchorClick);
    },
    scrollTo: (target, customOptions = {}) => {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      const header = document.querySelector('.site-header');
      const headerOffset = customOptions.offset || (header ? header.offsetHeight + 10 : 84);
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      targetY = Math.max(0, Math.min(elementTop - headerOffset, getMaxScroll()));
      startScroll();
    }
  };
}

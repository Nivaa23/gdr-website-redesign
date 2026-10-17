/**
 * GEO DESIGNS & RESEARCH — CORPORATE REDESIGN
 * Phase 01: Navigation, Mega-Menu, Mobile Drawer, and Hero Carousel Controller
 */

import { mountConcaveCarousel, JOURNEY_MILESTONES } from '../components/concave-carousel.js';
import { mountTargetCursor } from '../components/target-cursor.js';

document.addEventListener('DOMContentLoaded', () => {
  initTargetCursor();
  initNavigation();
  initExpertiseMegaMenu();
  initMobileNavigation();
  initHeroCarousel();
  initJourneyTimeline();
  initFooterYear();
  initWordmarkCursorEffect();
  initGlobeSegmentEffect();
  initOurNetworksInteraction();
});

/* --------------------------------------------------------------------------
   0. React Bits TargetCursor Integration
   Restrained, precise engineering reticle with difference blend mode
   -------------------------------------------------------------------------- */
function initTargetCursor() {
  mountTargetCursor({
    targetSelector: '.cursor-target',
    cursorColor: '#497E5E',
    spinDuration: 0,
    hoverDuration: 0.16,
    parallaxOn: false,
    hideDefaultCursor: true,
    size: 24,
    cornerSize: 8,
    thickness: 2,
    padding: 4,
    matchRadius: true,
    dotSize: 3,
    blendMode: 'difference',
    showLabel: false,
    clickEffect: true
  });
}

/* --------------------------------------------------------------------------
   1. Primary Navigation & Phase 02 Interaction Handling
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');

  // Subtle header shadow elevation on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   2. Expertise Accessible Mega-Menu
   10 Categories & 70 Sub-Services
   -------------------------------------------------------------------------- */
function initExpertiseMegaMenu() {
  const menuButton = document.getElementById('expertise-menu-button');
  const megaMenu = document.getElementById('expertise-mega-menu');
  const navItem = document.getElementById('expertise-nav-item');
  const categoryTabs = Array.from(document.querySelectorAll('.category-tab'));
  const servicePanels = Array.from(document.querySelectorAll('.service-panel'));

  if (!menuButton || !megaMenu) return;

  let isOpen = false;
  let closeTimeout = null;

  function openMenu() {
    clearTimeout(closeTimeout);
    isOpen = true;
    megaMenu.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    isOpen = false;
    megaMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }

  // Toggle on button click
  menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Desktop hover intent
  navItem.addEventListener('mouseenter', () => {
    if (window.innerWidth > 992) {
      openMenu();
    }
  });

  navItem.addEventListener('mouseleave', () => {
    if (window.innerWidth > 992) {
      closeTimeout = setTimeout(() => {
        closeMenu();
      }, 250);
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !navItem.contains(e.target)) {
      closeMenu();
    }
  });

  // Keyboard navigation & accessibility (Escape, Arrow keys)
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === 'Escape') {
      closeMenu();
      menuButton.focus();
    }
  });

  // Tab switching inside mega-menu
  function activateCategory(targetCategory) {
    categoryTabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-category') === targetCategory;
      tab.classList.toggle('is-active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    servicePanels.forEach(panel => {
      const isTarget = panel.id === `panel-${targetCategory}`;
      panel.classList.toggle('is-active', isTarget);
      panel.hidden = !isTarget;
    });
  }

  categoryTabs.forEach((tab, index) => {
    // Switch on click
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-category');
      activateCategory(cat);
    });

    // Switch on hover for seamless desktop exploration
    tab.addEventListener('mouseenter', () => {
      const cat = tab.getAttribute('data-category');
      activateCategory(cat);
    });

    // Keyboard Arrow navigation through category tabs
    tab.addEventListener('keydown', (e) => {
      let nextIndex = index;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (index + 1) % categoryTabs.length;
        categoryTabs[nextIndex].focus();
        activateCategory(categoryTabs[nextIndex].getAttribute('data-category'));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (index - 1 + categoryTabs.length) % categoryTabs.length;
        categoryTabs[nextIndex].focus();
        activateCategory(categoryTabs[nextIndex].getAttribute('data-category'));
      }
    });
  });

  // Allow other components (like hero buttons) to open a specific category
  window.openExpertiseCategory = (categoryKey) => {
    openMenu();
    activateCategory(categoryKey);
    megaMenu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer & Accordion
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const expertiseToggle = document.getElementById('mobile-expertise-toggle');
  const expertiseContent = document.getElementById('mobile-expertise-content');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    drawer.hidden = isExpanded;
  });

  if (expertiseToggle && expertiseContent) {
    expertiseToggle.addEventListener('click', () => {
      const isExpanded = expertiseToggle.getAttribute('aria-expanded') === 'true';
      expertiseToggle.setAttribute('aria-expanded', !isExpanded);
      expertiseContent.hidden = isExpanded;
    });
  }
}

/* --------------------------------------------------------------------------
   4. Homepage Hero Section Carousel Controller
   Automatic rotation, synchronized image & text, WCAG pause, keyboard & swipe
   -------------------------------------------------------------------------- */
function initHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const counterCurrent = document.getElementById('hero-counter-current');
  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const pauseBtn = document.getElementById('hero-pause-btn');
  const progressFill = document.getElementById('hero-progress-fill');

  if (!carousel || slides.length === 0) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  const slideDuration = 6000; // 6 seconds per slide
  let intervalId = null;
  let isPaused = false;
  let progressStart = 0;
  let progressRaf = null;

  // Respect user reduced-motion preference (WCAG 2.3.3)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    isPaused = true;
    updatePauseButtonUI(true);
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove('is-active');
    slides[currentIndex].setAttribute('aria-hidden', 'true');
    dots[currentIndex].classList.remove('is-active');
    dots[currentIndex].setAttribute('aria-selected', 'false');

    currentIndex = (index + totalSlides) % totalSlides;

    slides[currentIndex].classList.add('is-active');
    slides[currentIndex].removeAttribute('aria-hidden');
    dots[currentIndex].classList.add('is-active');
    dots[currentIndex].setAttribute('aria-selected', 'true');

    if (counterCurrent) {
      counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    resetProgressBar();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function resetProgressBar() {
    if (prefersReducedMotion || !progressFill) return;
    cancelAnimationFrame(progressRaf);
    progressFill.style.width = '0%';
    progressStart = performance.now();

    function updateProgress(now) {
      if (isPaused) {
        progressRaf = requestAnimationFrame(updateProgress);
        return;
      }
      const elapsed = now - progressStart;
      const pct = Math.min(100, (elapsed / slideDuration) * 100);
      progressFill.style.width = `${pct}%`;

      if (elapsed < slideDuration) {
        progressRaf = requestAnimationFrame(updateProgress);
      }
    }
    progressRaf = requestAnimationFrame(updateProgress);
  }

  function startAutoRotation() {
    if (prefersReducedMotion || isPaused) return;
    clearInterval(intervalId);
    intervalId = setInterval(nextSlide, slideDuration);
    resetProgressBar();
  }

  function pauseAutoRotation() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function updatePauseButtonUI(paused) {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', paused ? 'Resume automatic slide rotation' : 'Pause automatic slide rotation');
    const pauseIcon = pauseBtn.querySelector('.icon-pause');
    const playIcon = pauseBtn.querySelector('.icon-play');
    if (pauseIcon && playIcon) {
      pauseIcon.hidden = paused;
      playIcon.hidden = !paused;
    }
  }

  // Play / Pause Toggle
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      updatePauseButtonUI(isPaused);
      if (isPaused) {
        pauseAutoRotation();
      } else {
        startAutoRotation();
      }
    });
  }

  // Arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      if (!isPaused) startAutoRotation();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      if (!isPaused) startAutoRotation();
    });
  }

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide-to'), 10);
      goToSlide(slideIndex);
      if (!isPaused) startAutoRotation();
    });
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', () => {
    if (!isPaused) pauseAutoRotation();
  });

  carousel.addEventListener('mouseleave', () => {
    if (!isPaused) startAutoRotation();
  });

  // Keyboard navigation when hero section is interacted with
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        if (!isPaused) startAutoRotation();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        if (!isPaused) startAutoRotation();
      }
    });
  }

  // Touch Swipe for Mobile / Tablet Devices
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      if (!isPaused) startAutoRotation();
    }
  }

  // Hero Secondary Capability Buttons (Connect to Expertise Tabs)
  const secondaryButtons = document.querySelectorAll('[data-target-tab]');
  secondaryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-target-tab');
      if (window.openExpertiseCategory) {
        window.openExpertiseCategory(targetCat);
      }
    });
  });

  // Initialize first slide and start rotation
  goToSlide(0);
  if (!isPaused) {
    startAutoRotation();
  }
}

/* --------------------------------------------------------------------------
   5. Our Journey — Official React Bits Pro Concave Carousel Integration
   Curved gallery wall with large readable cards, mandatory 18px gap & continuous autoplay
   -------------------------------------------------------------------------- */
function initJourneyTimeline() {
  const container = document.getElementById('journey-concave-container');
  if (!container) return;

  const carousel = mountConcaveCarousel(container, {
    items: JOURNEY_MILESTONES,
    startIndex: 0,
    aspect: 880 / 740,    // 1.189 Aspect ratio matching enlarged 880x740 card canvas
    size: 0.77,           // Substantially enlarged cards (77% of available stage height)
    curvature: 0.44,      // Smooth concave cylinder curvature highlighting active card
    distance: 4.1,        // Optimal camera perspective for 3 prominent desktop cards
    tilt: 0,
    gap: 18,              // MANDATORY card gap: exactly 18px
    radius: 20,           // Smooth rounded card corners
    reflection: 0.08,
    dim: 0.16,
    autoplay: "drift",    // Continuous looping drift autoplay
    speed: 0.12,
    snap: true,
    inertia: 0.5,
    pauseOnHover: true,
    draggable: true,
    wheel: false,         // Preserve vertical page scrolling
    captions: false,      // Redundant caption removed
    controls: true,       // Lower < 01 / 14 > controls retained
    backgroundColor: "transparent"
  });

  // Ensure textures are redrawn once web fonts finish loading
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      carousel?.sync();
    });
  }
}

/* --------------------------------------------------------------------------
   6. Dynamic Footer Copyright Year
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------------------------------
   7. Footer Wordmark Localized Cursor-Driven White Fill
   Reveals white fill ONLY within pointer proximity via dynamic SVG radial mask
   Smooth lerp tracking creates fluid travel across letter strokes
   -------------------------------------------------------------------------- */
function initWordmarkCursorEffect() {
  const panel = document.getElementById('footer-wordmark-panel');
  const svg = document.getElementById('wordmark-svg');
  const spotlight = document.getElementById('wordmark-spotlight');

  if (!panel || !svg || !spotlight) return;

  // Respect system reduced-motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let isHovered = false;
  let targetX = -500;
  let targetY = -500;
  let currentX = -500;
  let currentY = -500;
  let targetRadius = 0;
  let currentRadius = 0;
  let animId = null;

  function toSvgCoords(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  function updateLoop() {
    // Smooth fluid interpolation
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    currentRadius += (targetRadius - currentRadius) * 0.15;

    spotlight.setAttribute('cx', currentX.toFixed(2));
    spotlight.setAttribute('cy', currentY.toFixed(2));
    spotlight.setAttribute('r', Math.max(0, currentRadius).toFixed(2));

    // Continue loop while hovered or while radius is still dissipating
    if (isHovered || currentRadius > 0.5) {
      animId = requestAnimationFrame(updateLoop);
    } else {
      spotlight.setAttribute('r', '0');
      animId = null;
    }
  }

  function startLoop() {
    if (!animId) {
      animId = requestAnimationFrame(updateLoop);
    }
  }

  // Pointer interactions strictly isolated to wordmark panel
  panel.addEventListener('pointerenter', (e) => {
    isHovered = true;
    const coords = toSvgCoords(e.clientX, e.clientY);
    targetX = coords.x;
    targetY = coords.y;
    if (currentRadius <= 0.5) {
      currentX = coords.x;
      currentY = coords.y;
    }
    targetRadius = 140; // Localized reveal radius in SVG units
    startLoop();
  });

  panel.addEventListener('pointermove', (e) => {
    if (!isHovered) {
      isHovered = true;
      targetRadius = 140;
    }
    const coords = toSvgCoords(e.clientX, e.clientY);
    targetX = coords.x;
    targetY = coords.y;
    startLoop();
  });

  panel.addEventListener('pointerleave', () => {
    isHovered = false;
    targetRadius = 0;
    startLoop();
  });

  // Accessible keyboard focus behavior
  panel.addEventListener('focus', () => {
    isHovered = true;
    targetX = 660; // Center coordinate
    targetY = 140;
    targetRadius = 240;
    startLoop();
  });

  panel.addEventListener('blur', () => {
    isHovered = false;
    targetRadius = 0;
    startLoop();
  });
}

/* --------------------------------------------------------------------------
   8. Footer 3D Globe Geometrically Accurate Segment Interaction
   Independently activates ONLY the specific visible geometric surface under cursor
   Preserves crisp facet boundaries and Geo brand colors
   -------------------------------------------------------------------------- */
function initGlobeSegmentEffect() {
  const container = document.getElementById('footer-globe-container');
  const svg = document.getElementById('footer-globe-svg');

  if (!container || !svg) return;

  const facets = Array.from(svg.querySelectorAll('.globe-facet'));
  let activeFacet = null;

  function setActiveFacet(newFacet) {
    if (activeFacet === newFacet) return;
    if (activeFacet) {
      activeFacet.classList.remove('is-active');
    }
    activeFacet = newFacet;
    if (activeFacet) {
      activeFacet.classList.add('is-active');
    }
  }

  // Pointer interactions strictly isolated to globe container
  container.addEventListener('pointermove', (e) => {
    const target = e.target.closest('.globe-facet');
    if (target) {
      setActiveFacet(target);
    } else {
      setActiveFacet(null);
    }
  });

  container.addEventListener('pointerleave', () => {
    setActiveFacet(null);
  });

  container.addEventListener('pointerup', () => {
    setTimeout(() => {
      setActiveFacet(null);
    }, 450);
  });

  // Accessible keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (facets.length === 0) return;
    let currentIndex = facets.indexOf(activeFacet);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % facets.length;
      setActiveFacet(facets[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + facets.length) % facets.length;
      setActiveFacet(facets[prevIndex]);
    } else if (e.key === 'Escape') {
      setActiveFacet(null);
    }
  });

  container.addEventListener('blur', () => {
    setActiveFacet(null);
  });
}

/* --------------------------------------------------------------------------
   8. Our Networks Synchronized Map & Category Interaction
   Synchronized hover & focus between network categories and colored pins
   -------------------------------------------------------------------------- */
function initOurNetworksInteraction() {
  const section = document.getElementById('our-networks');
  if (!section) return;

  const categoryCards = Array.from(section.querySelectorAll('.network-service-card'));
  const pins = Array.from(section.querySelectorAll('.network-pin'));

  const heading = document.getElementById('networks-heading');
  const mapFrame = document.getElementById('network-map-frame');
  const mapCol = section.querySelector('.network-map-col');

  // Exact desktop alignment between section heading and map container
  function syncMapAlignment() {
    if (!heading || !mapFrame || !mapCol) return;
    if (window.innerWidth <= 600) {
      mapFrame.style.marginLeft = '0px';
      return;
    }
    const headingRect = heading.getBoundingClientRect();
    const mapColRect = mapCol.getBoundingClientRect();
    const offset = Math.max(0, Math.round(headingRect.left - mapColRect.left));
    mapFrame.style.marginLeft = `${offset}px`;
  }
  syncMapAlignment();
  window.addEventListener('resize', syncMapAlignment);

  function setActiveCategory(cat) {
    if (cat) {
      section.dataset.activeCategory = cat;
    } else {
      delete section.dataset.activeCategory;
    }
  }

  // Pointer & Focus interactions for the Category Cards
  categoryCards.forEach((card) => {
    const category = card.dataset.category;
    if (!category) return;

    card.addEventListener('pointerenter', () => {
      setActiveCategory(category);
    });

    card.addEventListener('pointerleave', () => {
      setActiveCategory(null);
    });

    card.addEventListener('focus', () => {
      setActiveCategory(category);
    });

    card.addEventListener('blur', (e) => {
      const nextCard = e.relatedTarget && e.relatedTarget.closest('.network-service-card');
      if (!nextCard) {
        setActiveCategory(null);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setActiveCategory(null);
        card.blur();
      }
    });
  });

  // Direct map pin hovering interaction
  pins.forEach((pin) => {
    const category = pin.dataset.category;
    if (!category) return;

    pin.addEventListener('pointerenter', () => {
      setActiveCategory(category);
    });

    pin.addEventListener('pointerleave', () => {
      setActiveCategory(null);
    });
  });
}




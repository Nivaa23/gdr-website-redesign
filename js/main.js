/**
 * GEO DESIGNS & RESEARCH — CORPORATE REDESIGN
 * Phase 01: Navigation, Mega-Menu, Mobile Drawer, and Hero Carousel Controller
 */

import { mountConcaveCarousel, JOURNEY_MILESTONES } from '../components/concave-carousel.js';
import { mountDepthCarousel } from '../components/depth-carousel.js';
import { initAnimatedContent } from '../components/animated-content.js';
import { initNavigation14 } from '../components/navigation-14.js';
import { mountCircularGallery, CLIENT_LOGOS } from '../components/circular-gallery.js';
import { mountScrollStack } from '../components/scroll-stack.js';
import { initCinematicScroll } from '../components/cinematic-scroll.js';
import { initWebglScrollytelling } from '../components/webgl-scrollytelling.js';
import heroInfrastructureBridge from '../assets/images/hero-infrastructure-bridge.jpg';
import heroArchitectureComplex from '../assets/images/hero-architecture-complex.jpg';
import heroLabTesting from '../assets/images/hero-lab-testing.jpg';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation14();
  initMobileNavigation();
  initCinematicScroll();
  initWebglScrollytelling();
  initHeroCarousel();
  initBridgeScrollStack();
  initJourneyTimeline();
  initFooterYear();
  initWordmarkCursorEffect();
  initGlobeSegmentEffect();
  initOurNetworksInteraction();
  initClientCircularGallery();
  initAnimatedContent({
    distance: 40,
    duration: 1.0,
    blur: 12,
    stagger: 0.08,
    threshold: 0.1,
    once: true
  });
});

function initBridgeScrollStack() {
  // Shared React Bits Pro Scroll Stack mount (Bridge projects + Commerce services)
  ['bridge-scroll-stack', 'commerce-scroll-stack'].forEach((id) => {
    const stackRoot = document.getElementById(id);
    if (!stackRoot) return;
    mountScrollStack(stackRoot, {
      useWindowScroll: true,
      itemDistance: 80,
      itemStackDistance: 24,
      stackPosition: '14%',
      itemScale: 0.035,
      baseScale: 0.9,
      dimAmount: 0.16
    });
  });
}

/* --------------------------------------------------------------------------
   1 & 2. React Bits Pro Navigation 14 (Mega Panel Navigation with Featured Card)
   Registry Item: @reactbits-pro/navigation-14
   Provides accessible mega-panel interactions, scroll elevation, keyboard controls,
   and featured card layout. Integrated via components/navigation-14.js.
   -------------------------------------------------------------------------- */
function initNavigation() {
  return initNavigation14();
}

function initExpertiseMegaMenu() {
  return initNavigation14();
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
   4. Homepage Hero Section — DepthCarousel Controller
   50/50 split with 3D DepthCarousel, continuous autoplay loop & synchronized text
   -------------------------------------------------------------------------- */
const HERO_SLIDES = [
  {
    image: heroInfrastructureBridge,
    alt: 'Major cable-stayed infrastructure bridge and roadway engineering project',
    title: 'PMC & Infrastructure Engineering'
  },
  {
    image: heroArchitectureComplex,
    alt: 'State-of-the-art corporate and institutional architectural engineering complex',
    title: 'Architecture, Structure & BIM Services'
  },
  {
    image: heroLabTesting,
    alt: 'Civil engineers performing precision compressive core testing in an advanced testing laboratory',
    title: 'Testing Laboratories & Field Investigation'
  }
];

function initHeroCarousel() {
  const container = document.getElementById('hero-depth-carousel');
  const slideContents = Array.from(document.querySelectorAll('.hero-slide-content'));

  if (!container || slideContents.length === 0) return;

  function alignCarouselWithText() {
    const stage = document.querySelector('.depth-carousel__stage');
    if (!stage) return;

    if (window.innerWidth <= 992) {
      stage.style.marginTop = '';
      stage.style.height = '';
      return;
    }

    const activeSlide = document.querySelector('.hero-slide-content.is-active');
    if (!activeSlide) return;

    const heading = activeSlide.querySelector('.hero-slide__title');
    const actionGroup = activeSlide.querySelector('.hero-slide__action-group');
    if (!heading || !actionGroup) return;

    const slideRect = activeSlide.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const actionRect = actionGroup.getBoundingClientRect();

    const topOffset = Math.round(headingRect.top - slideRect.top);
    const targetHeight = Math.round(actionRect.bottom - headingRect.top);

    if (targetHeight > 0) {
      stage.style.marginTop = `${topOffset}px`;
      stage.style.height = `${targetHeight}px`;
    }
  }

  function syncActiveSlide(index) {
    slideContents.forEach((slide, idx) => {
      const isActive = idx === index;
      slide.classList.toggle('is-active', isActive);
      if (isActive) {
        slide.removeAttribute('aria-hidden');
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Match top of heading and bottom of CTA buttons precisely
    requestAnimationFrame(alignCarouselWithText);
  }

  // Mount DepthCarousel with scaled configuration for prominent cards
  const carousel = mountDepthCarousel(container, {
    items: HERO_SLIDES,
    depth: 210,
    spread: 65,
    tilt: 18,
    tiltDirection: 'right',
    perspective: 1400,
    visibleCards: 4,
    falloff: 0.2,
    blur: 6,
    autoplay: true,
    loop: true,
    onChange: (index) => {
      syncActiveSlide(index);
    }
  });

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

  // Keyboard navigation for hero accessibility
  const heroSection = document.getElementById('hero-section');
  if (heroSection && carousel) {
    heroSection.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        carousel.previous();
      } else if (e.key === 'ArrowRight') {
        carousel.next();
      }
    });
  }

  // Responsive and font-loading alignment triggers
  window.addEventListener('resize', alignCarouselWithText);
  window.addEventListener('load', alignCarouselWithText);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignCarouselWithText);
  }
  if (window.ResizeObserver) {
    const heroContentCol = document.querySelector('.hero-content-col');
    if (heroContentCol) {
      const ro = new ResizeObserver(() => {
        alignCarouselWithText();
      });
      ro.observe(heroContentCol);
    }
  }

  // Initial synchronization and vertical alignment
  syncActiveSlide(0);
  requestAnimationFrame(alignCarouselWithText);
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

/* --------------------------------------------------------------------------
   9. Industries We've Worked With — React Bits Circular Gallery Integration
   Official React Bits Circular Gallery / Carousel adapted for GDR Client Logos
   -------------------------------------------------------------------------- */
function initClientCircularGallery() {
  const container = document.getElementById('circular-gallery-container');
  if (!container) return;

  mountCircularGallery(container, {
    items: CLIENT_LOGOS,
    tilt: -4,
    perspective: 2400,
    autoplay: true,
    speed: 5.5,
    pauseOnHover: true,
    focusOnClick: true,
    draggable: true,
    snap: true,
    momentum: 0.65
  });
}





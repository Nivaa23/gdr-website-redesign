/**
 * GEO DESIGNS & RESEARCH — CORPORATE REDESIGN
 * Phase 01: Navigation, Mega-Menu, Mobile Drawer, and Hero Carousel Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initExpertiseMegaMenu();
  initMobileNavigation();
  initHeroCarousel();
  initJourneyTimeline();
});

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
   5. Our Journey Timeline Navigation
   Smooth horizontal scrolling via Prev / Next buttons and keyboard
   -------------------------------------------------------------------------- */
function initJourneyTimeline() {
  const wrapper = document.getElementById('journey-timeline-wrapper');
  const prevBtn = document.getElementById('journey-prev-btn');
  const nextBtn = document.getElementById('journey-next-btn');

  if (!wrapper || !prevBtn || !nextBtn) return;

  const scrollAmount = 352; // card width (320px) + gap (32px)

  prevBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Keyboard navigation
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  });
}



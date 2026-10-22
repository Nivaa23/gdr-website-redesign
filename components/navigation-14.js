/**
 * React Bits Pro — Navigation 14 (Mega Panel Navigation with a Featured Card)
 * Registry item: @reactbits-pro/navigation-14
 * 
 * Modular Vanilla JS engine providing accessible mega-panel interactions,
 * keyboard controls, responsive state management, and featured card animations.
 */
import './Navigation14.css';

export const EXPERTISE_SERVICES = {
  'pmc': {
    title: 'Project Management Consultancy (PMC)',
    division: 'Division 01 — Infrastructure & Civil',
    desc: 'Comprehensive project management, site supervision, quality assurance, safety audits, and contract administration complying with IRC, IS, and MoRTH standards.',
    image: '/assets/images/hero-infrastructure-bridge.jpg',
    url: '#card-pmc',
    urlAbout: '/index.html#card-pmc'
  },
  'hydro': {
    title: 'Hydro & Highway DPR',
    division: 'Division 01 — Infrastructure & Civil',
    desc: 'Alignment surveys, hydrological studies, traffic investigations, pavement design, and Detailed Project Reports (DPR) for highways, expressways, and water infrastructure.',
    image: '/assets/images/expertise-hydro-highway.svg',
    url: '#card-hydro-highway-dpr',
    urlAbout: '/index.html#card-hydro-highway-dpr'
  },
  'bridge': {
    title: 'Bridge Engineering',
    division: 'Division 01 — Infrastructure & Civil',
    desc: 'Structural analysis, detailed design, health assessment, rehabilitation, and seismic design for river bridges, flyovers, grade separators, and ROBs.',
    image: '/assets/images/hero-infrastructure-bridge.jpg',
    url: '#card-bridge-engineering',
    urlAbout: '/index.html#card-bridge-engineering'
  },
  'structure': {
    title: 'Structural Engineering',
    division: 'Division 01 — Infrastructure & Civil',
    desc: 'Advanced structural design and finite element analysis for heavy industrial plants, commercial towers, institutional complexes, and civic structures.',
    image: '/assets/images/expertise-structure.svg',
    url: '#card-structure',
    urlAbout: '/index.html#card-structure'
  },
  'survey': {
    title: 'Survey & Geomatics',
    division: 'Division 01 — Infrastructure & Civil',
    desc: 'High-precision geodetic surveys using DGPS, airborne & terrestrial LiDAR, bathymetric mapping, drone photogrammetry, and Geographic Information System (GIS) development.',
    image: '/assets/images/expertise-survey.svg',
    url: '#card-survey',
    urlAbout: '/index.html#card-survey'
  },
  'architecture': {
    title: 'Architecture & Master Planning',
    division: 'Division 02 — Design & Technology',
    desc: 'Holistic architectural design, institutional master planning, urban regeneration, landscape architecture, and transit-oriented development.',
    image: '/assets/images/hero-architecture-complex.jpg',
    url: '/architecture.html',
    urlAbout: '/architecture.html'
  },
  'bim': {
    title: 'BIM Modeling & Auditing',
    division: 'Division 02 — Design & Technology',
    desc: 'Multi-disciplinary 3D-7D Building Information Modelling, automated clash detection, quantity takeoff, construction simulation (4D/5D), and BIM model auditing.',
    image: '/assets/images/expertise-bim.svg',
    url: '#card-bim',
    urlAbout: '/index.html#card-bim'
  },
  'mepf': {
    title: 'MEPF Engineering',
    division: 'Division 02 — Design & Technology',
    desc: 'Integrated mechanical, electrical, plumbing, fire protection, and building automation design prioritizing energy efficiency, life safety, and operational reliability.',
    image: '/assets/images/expertise-mepf.svg',
    url: '#card-mepf',
    urlAbout: '/index.html#card-mepf'
  },
  'sustainability': {
    title: 'Environmentally Sustainable Solutions',
    division: 'Division 02 — Design & Technology',
    desc: 'Environmental Impact Assessment (EIA), green building certification advisory (GRIHA, LEED, IGBC), energy performance simulations, and environmental compliance audits.',
    image: '/assets/images/expertise-green-building.svg',
    url: '#card-green-building',
    urlAbout: '/index.html#card-green-building'
  },
  'lab': {
    title: 'Laboratory & Material Testing',
    division: 'Division 03 — Testing & Contracts',
    desc: 'NABL ISO/IEC 17025 accredited physical and chemical testing for soil, aggregates, cement, concrete, steel, bitumen, Non-Destructive Testing (NDT), and geotechnical studies.',
    image: '/assets/images/hero-lab-testing.jpg',
    url: '#card-lab-testing',
    urlAbout: '/index.html#card-lab-testing'
  },
  'commerce': {
    title: 'Commerce & Contract Management',
    division: 'Division 03 — Testing & Contracts',
    desc: 'Pre- and post-contract management, Bill of Quantities (BoQ) preparation, detailed cost estimation, rate analysis, tender documentation, and FIDIC contract advisory.',
    image: '/assets/images/expertise-commerce-contract.svg',
    url: '#card-commerce-contract',
    urlAbout: '/index.html#card-commerce-contract'
  }
};

export function mountNavigation14(headerElement, options = {}) {
  if (!headerElement) return null;

  const trigger = headerElement.querySelector('#expertise-menu-button, [data-nav14-trigger]');
  const megaPanel = headerElement.querySelector('#nav14-mega-panel, [data-nav14-panel]');
  const navItem = trigger ? trigger.closest('.nav14-item, .nav-item') : null;
  const mobileToggle = headerElement.querySelector('#mobile-menu-toggle, .mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  let isOpen = false;
  let closeTimer = null;

  function openPanel() {
    clearTimeout(closeTimer);
    isOpen = true;
    if (megaPanel) {
      megaPanel.hidden = false;
    }
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function closePanel() {
    clearTimeout(closeTimer);
    isOpen = false;
    if (megaPanel) {
      megaPanel.hidden = true;
    }
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  // 1. Scroll Shadow
  const handleScroll = () => {
    if (window.scrollY > 20) {
      headerElement.classList.add('is-scrolled');
    } else {
      headerElement.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Trigger click
  const handleTriggerClick = (e) => {
    e.stopPropagation();
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  };
  if (trigger) {
    trigger.addEventListener('click', handleTriggerClick);
  }

  // 3. Desktop Hover Intent
  const handleMouseEnter = () => {
    if (window.innerWidth > 992) {
      openPanel();
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 992) {
      closeTimer = setTimeout(() => {
        closePanel();
      }, 250);
    }
  };

  if (navItem) {
    navItem.addEventListener('mouseenter', handleMouseEnter);
    navItem.addEventListener('mouseleave', handleMouseLeave);
  }

  // 4. Click outside
  const handleClickOutside = (e) => {
    if (isOpen && navItem && !navItem.contains(e.target)) {
      closePanel();
    }
  };
  document.addEventListener('click', handleClickOutside);

  // 5. Keyboard Navigation (Escape & Arrow Keys)
  const handleKeyDown = (e) => {
    if (isOpen && e.key === 'Escape') {
      closePanel();
      if (trigger) trigger.focus();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // 6. Service Selection & Right Panel Details Interaction
  const menuCards = megaPanel ? Array.from(megaPanel.querySelectorAll('.nav14-menu-card')) : [];
  const featuredCard = megaPanel ? megaPanel.querySelector('.nav14-featured-card') : null;
  const featuredTag = featuredCard ? featuredCard.querySelector('.nav14-featured-card__tag') : null;
  const featuredTitle = featuredCard ? featuredCard.querySelector('.nav14-featured-card__title') : null;
  const featuredDesc = featuredCard ? featuredCard.querySelector('.nav14-featured-card__desc') : null;
  const featuredImg = featuredCard ? featuredCard.querySelector('.nav14-featured-card__img') : null;
  const featuredAction = featuredCard ? featuredCard.querySelector('.nav14-featured-card__action') : null;

  function selectService(categoryKey, cardEl) {
    const service = EXPERTISE_SERVICES[categoryKey];
    if (!service || !featuredCard) return;

    menuCards.forEach(c => c.classList.remove('is-selected'));
    if (cardEl) cardEl.classList.add('is-selected');

    if (featuredTitle) featuredTitle.textContent = service.title;
    if (featuredTag) featuredTag.textContent = service.division;
    if (featuredDesc) featuredDesc.textContent = service.desc;
    if (featuredImg) {
      featuredImg.src = service.image;
      featuredImg.alt = service.title;
    }
    if (featuredAction) {
      const isSubpage = window.location.pathname.includes('about') || window.location.pathname.includes('architecture');
      featuredAction.href = isSubpage ? service.urlAbout : service.url;
      featuredAction.setAttribute('aria-label', `Explore ${service.title} Capabilities`);
    }
  }

  // Bind service selection on click and hover
  menuCards.forEach(card => {
    const categoryKey = card.getAttribute('data-category');

    card.addEventListener('mouseenter', () => {
      selectService(categoryKey, card);
    });
    card.addEventListener('focus', () => {
      selectService(categoryKey, card);
    });

    card.addEventListener('click', (e) => {
      const isAlreadySelected = card.classList.contains('is-selected');
      selectService(categoryKey, card);
      if (isAlreadySelected) {
        closePanel();
      } else {
        // Prevent immediate navigation so the user can inspect details in the right panel
        e.preventDefault();
      }
    });
  });

  // Featured card action link navigates and closes panel
  if (featuredAction) {
    featuredAction.addEventListener('click', () => {
      closePanel();
    });
  }

  // Other footer links inside mega panel close on click
  const footerLinks = megaPanel ? Array.from(megaPanel.querySelectorAll('.nav14-panel-footer a')) : [];
  footerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closePanel();
    });
  });

  // 7. Mobile Drawer Integration
  const handleMobileToggle = () => {
    if (!mobileToggle || !mobileDrawer) return;
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileDrawer.hidden = isExpanded;
  };
  if (mobileToggle && !mobileToggle.dataset.boundNav14) {
    mobileToggle.dataset.boundNav14 = 'true';
    mobileToggle.addEventListener('click', handleMobileToggle);
  }

  // 8. Backward-compatible global helper for section shortcuts
  window.openExpertiseCategory = (categoryKey) => {
    openPanel();
    if (categoryKey) {
      const targetCard = (megaPanel && megaPanel.querySelector(`[data-category="${categoryKey}"]`)) ||
                         document.getElementById(`card-${categoryKey}`) || 
                         document.getElementById(`category-${categoryKey}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (typeof targetCard.focus === 'function') targetCard.focus();
      }
    }
  };

  return {
    open: openPanel,
    close: closePanel,
    destroy: () => {
      window.removeEventListener('scroll', handleScroll);
      if (trigger) trigger.removeEventListener('click', handleTriggerClick);
      if (navItem) {
        navItem.removeEventListener('mouseenter', handleMouseEnter);
        navItem.removeEventListener('mouseleave', handleMouseLeave);
      }
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (mobileToggle) mobileToggle.removeEventListener('click', handleMobileToggle);
    }
  };
}

export function initNavigation14(options = {}) {
  const header = document.getElementById('site-header') || document.querySelector('.nav14-header, .site-header');
  return mountNavigation14(header, options);
}

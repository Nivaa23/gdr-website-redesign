/**
 * React Bits Pro — Navigation 14 (Mega Panel Navigation with a Featured Card)
 * Registry item: @reactbits-pro/navigation-14
 * 
 * Modular Vanilla JS engine providing accessible mega-panel interactions,
 * keyboard controls, responsive state management, and featured card animations.
 */
import './Navigation14.css';

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

  // 6. Close mega panel when a menu link is clicked
  const menuLinks = megaPanel ? Array.from(megaPanel.querySelectorAll('a')) : [];
  menuLinks.forEach(link => {
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

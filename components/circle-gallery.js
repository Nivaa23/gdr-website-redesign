/**
 * React Bits Pro — Circle Gallery Component (Modular Vanilla JS Engine)
 * Registry item: @reactbits-starter/circle-gallery-tw
 * 
 * Strict Configuration:
 *   Circle Radius: 23%
 *   Item Width: 200px
 *   Item Height: 250px
 *   Item Scale: 0.85
 *   Border Radius: 16px
 *   Throw Resistance: 0.35
 *   Animation Duration: 0.9s
 *   Auto Spin: 10°/s
 *   Enable Drag: Enabled
 *   Show Numbers: Enabled
 */
import './CircleGallery.css';

export const BIM_PROJECTS = [
  // 1. Former Featured Projects
  {
    id: 1,
    number: '01',
    title: 'Thel Sena Bhawan',
    category: 'DEFENCE // HEADQUARTERS',
    location: 'NEW DELHI',
    image: '/assets/images/architecture/Administration/PMC%20SERVICE%20FOR%20CHETAK%20COMMANDO%20CENTER%20AT%20MAGODI,GANDHINAGAR.png',
    alt: 'Thel Sena Bhawan Defence Headquarters complex model'
  },
  {
    id: 2,
    number: '02',
    title: 'Tirupati Railway Station',
    category: 'RAILWAYS // TRANSIT HUB',
    location: 'TIRUPATI',
    image: '/assets/images/architecture/Auditorium/PROVISION%20OF%20DEFICIENT%20AUDITORIUM%20AT%20VISHAKHAPATANAM.jpg',
    alt: 'Tirupati Railway Station Redevelopment BIM Coordination'
  },
  {
    id: 3,
    number: '03',
    title: 'Smart World One DXP',
    category: 'COMMERCIAL // HIGH-RISE',
    location: 'GURUGRAM',
    image: '/assets/images/architecture/Residential/CONSTRUCTION%20OF%20CRITICAL%20REQUIREMENT%20DWELLING%20UNIT%20OUTSIDE%20MAP%20AT%20INS%20MANDOVI-TYPE%205%20G+10.jpg',
    alt: 'Smart World One DXP High-Rise Residential BIM Model'
  },
  {
    id: 4,
    number: '04',
    title: 'Married Accommodation',
    category: 'RESIDENTIAL // G+30 TOWERS',
    location: 'TROMBAY, MUMBAI',
    image: '/assets/images/architecture/Residential/MARRIED%20ACCOMMODATION%20(464%20DUS)%20(G+30)%20AT%20TROMBAY%20,%20MUMBAI.jpg',
    alt: 'Married Accommodation (464 DUs) (G+30) Trombay Mumbai'
  },
  {
    id: 5,
    number: '05',
    title: 'School of Artillery',
    category: 'MILITARY // TRAINING COMPLEX',
    location: 'MHOW',
    image: '/assets/images/architecture/Institute%20Buildings/AUGMENTATION%20OF%20TRG%20INFRASTRUCTURE%20IN%20HIGHER%20COMMAND%20WING%20IN%20AWC%20MHOW_NALANDA.jpg',
    alt: 'School of Artillery Institutional Training Infrastructure'
  },
  // 2. Former BIM Portfolio Projects
  {
    id: 6,
    number: '06',
    title: 'Single Living Accn At Ins Hamla-navy Mumbai',
    category: 'DEFENCE ACCOMMODATION',
    location: 'MUMBAI • NAVAL BASE',
    image: '/assets/images/architecture/Residential/RECONSTRUCTION%20OF%20IN%20LIVING%20OFFICERS%20SERVANTS%20QUARTERS%20AT%20INHS%20ASVINI.(G+19).jpg',
    alt: 'Single Living Accn At Ins Hamla-navy Mumbai BIM Coordination'
  },
  {
    id: 7,
    number: '07',
    title: 'Construction Of 30 Bedded Hospital At Naval Station, Karanja',
    category: 'HEALTHCARE FACILITY',
    location: 'KARANJA • NAVAL STATION',
    image: '/assets/images/architecture/Hospitals/30%20BEDDED%20HOSPITAL%20AT%20NAVAL%20STATION%20KARANJA.jpg',
    alt: 'Construction Of 30 Bedded Hospital At Naval Station, Karanja'
  },
  {
    id: 8,
    number: '08',
    title: 'Married Accn (G+26) For Defence Civilians At NCHC Powai, Mumbai',
    category: 'HIGH-RISE RESIDENTIAL',
    location: 'POWAI, MUMBAI • NCHC',
    image: '/assets/images/architecture/Residential/MARRIED%20ACCN%20(G+26)%20FOR%20DEFENCE%20CIVILIANS%20AT%20NCHC%20POWAI,%20MUMBAI.jpg',
    alt: 'Married Accn (G+26) For Defence Civilians At NCHC Powai, Mumbai'
  },
  {
    id: 9,
    number: '09',
    title: 'Chennai Metro Station, Varinder Construction Limited',
    category: 'TRANSIT • METRO',
    location: 'CHENNAI • VARINDER CONST.',
    image: '/assets/images/architecture/Hangars/CONSTRUCTION%20OF%20ATC%20TOWER%20ALONG%20WITH%20ALLIED%20WORKS%20SERVICES%20AT%20AF%20STN%20KALAIKUNDA.jpg',
    alt: 'Chennai Metro Station Varinder Construction Limited Transit BIM'
  },
  {
    id: 10,
    number: '10',
    title: 'Queen Spadina Station, Ontario South Line, Canada, Canada',
    category: 'INTERNATIONAL TRANSIT',
    location: 'ONTARIO, CANADA • SOUTH LINE',
    image: '/assets/images/hero-infrastructure-bridge.jpg',
    alt: 'Queen Spadina Station, Ontario South Line, Canada Transit BIM Model'
  },
  {
    id: 11,
    number: '11',
    title: 'Formulation Plant At Vadodara',
    category: 'INDUSTRIAL • PHARMA',
    location: 'VADODARA, GUJARAT',
    image: '/assets/images/architecture/Institute%20Buildings/FIELD%20INSTRUMENT%20GROUP%20AT%20FIT%20EME%20SECTION%20BARODA.jpg',
    alt: 'Formulation Plant At Vadodara Industrial MEP BIM Model'
  }
];

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const normalizeDeg = deg => ((((deg % 360) + 540) % 360) - 180);
const TO_RAD = Math.PI / 180;

/**
 * Mounts the React Bits Pro Circle Gallery into a container element.
 * 
 * @param {HTMLElement} container 
 * @param {Object} options 
 * @returns {Object|null} controller handle
 */
export function mountCircleGallery(container, options = {}) {
  if (!container) return null;

  const items = options.items && options.items.length ? options.items : BIM_PROJECTS;
  const count = items.length;
  if (count === 0) return null;

  // React Bits Pro: @reactbits-starter/circle-gallery-tw configuration
  const settings = {
    // Circle Radius: radiusPercent = 23%
    radiusPercent: typeof options.radiusPercent === 'number' 
      ? options.radiusPercent 
      : (typeof options.radius === 'number' || typeof options.circleRadius === 'number' ? null : 23),
    radius: typeof options.radius === 'number' 
      ? options.radius 
      : (typeof options.circleRadius === 'number' 
          ? options.circleRadius 
          : null),
    // Item Width: 200px
    itemWidth: typeof options.itemWidth === 'number' ? options.itemWidth : (parseFloat(options.itemWidth) || 200),
    // Item Height: 250px
    itemHeight: typeof options.itemHeight === 'number' ? options.itemHeight : (parseFloat(options.itemHeight) || 250),
    // Item Scale: 0.85
    itemScale: typeof options.itemScale === 'number' ? options.itemScale : (parseFloat(options.itemScale) || 0.85),
    // Border Radius: 16px
    borderRadius: typeof options.borderRadius === 'number' ? options.borderRadius : (parseFloat(options.borderRadius) || 16),
    // Throw Resistance: 0.35
    throwResistance: typeof options.throwResistance === 'number' ? options.throwResistance : (parseFloat(options.throwResistance) || 0.35),
    // Animation Duration: 0.9s
    animationDuration: typeof options.animationDuration === 'number' ? options.animationDuration : (parseFloat(options.animationDuration) || 0.9),
    // Auto Spin: 10°/s
    autoSpin: typeof options.autoSpin === 'number' ? options.autoSpin : (parseFloat(options.autoSpin) || 10),
    // Enable Drag: Enabled
    enableDrag: options.enableDrag !== undefined ? !!options.enableDrag : true,
    // Show Numbers: Enabled
    showNumbers: options.showNumbers !== undefined ? !!options.showNumbers : true,
    onItemClick: options.onItemClick || null
  };

  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let isReducedMotion = reducedMotionQuery?.matches ?? false;

  // Clear previous markup inside container
  container.innerHTML = '';
  container.classList.add('circle-gallery-root');

  // Create DOM structure
  const root = document.createElement('div');
  root.className = 'circle-gallery';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Our Projects Circular Gallery');
  root.setAttribute('tabindex', '0');

  const stage = document.createElement('div');
  stage.className = 'circle-gallery__stage';

  const orbitRing = document.createElement('div');
  orbitRing.className = 'circle-gallery__orbit-ring';

  root.appendChild(orbitRing);
  root.appendChild(stage);
  container.appendChild(root);

  // Create Item Elements
  const step = 360 / count;
  const itemElements = items.map((project, index) => {
    const item = document.createElement('div');
    item.className = 'circle-gallery__item cursor-target';
    item.setAttribute('data-index', String(index));
    item.setAttribute('role', 'group');
    item.setAttribute('aria-roledescription', 'slide');
    item.setAttribute('aria-label', `${project.number || index + 1} of ${count}: ${project.title}`);

    const card = document.createElement('div');
    card.className = 'circle-gallery__card';
    card.style.borderRadius = `${settings.borderRadius}px`;

    // Number Badge (Show Numbers: Enabled)
    if (settings.showNumbers) {
      const numBadge = document.createElement('div');
      numBadge.className = 'circle-gallery__number';
      numBadge.textContent = project.number || String(index + 1).padStart(2, '0');
      card.appendChild(numBadge);
    }

    // Top Category / Sector Badge
    if (project.category) {
      const catBadge = document.createElement('div');
      catBadge.className = 'circle-gallery__badge';
      catBadge.textContent = project.category.split('//')[0].trim();
      card.appendChild(catBadge);
    }

    // Project Image
    const img = document.createElement('img');
    img.className = 'circle-gallery__img';
    img.src = project.image;
    img.alt = project.alt || project.title;
    img.loading = index < 4 ? 'eager' : 'lazy';
    img.draggable = false;
    card.appendChild(img);

    // Dark Gradient Overlay
    const overlay = document.createElement('div');
    overlay.className = 'circle-gallery__overlay';
    card.appendChild(overlay);

    // Text Details Panel
    const details = document.createElement('div');
    details.className = 'circle-gallery__details';

    if (project.category) {
      const cat = document.createElement('span');
      cat.className = 'circle-gallery__category';
      cat.textContent = project.category;
      details.appendChild(cat);
    }

    const title = document.createElement('h3');
    title.className = 'circle-gallery__title';
    title.textContent = project.title;
    details.appendChild(title);

    if (project.location) {
      const loc = document.createElement('span');
      loc.className = 'circle-gallery__location';
      loc.textContent = project.location;
      details.appendChild(loc);
    }

    card.appendChild(details);
    item.appendChild(card);
    stage.appendChild(item);

    return {
      element: item,
      card,
      baseAngle: index * step,
      data: project
    };
  });


  // Runtime Geometry & Physics State
  let currentAngle = 0;
  let targetAngle = null;
  let animStartTime = 0;
  let animStartAngle = 0;
  let animDurationMs = settings.animationDuration * 1000;

  let velocity = 0;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let rafId = null;

  // Viewport / Radius calculation: Circle Radius (radiusPercent = 23%)
  let calculatedRadius = 280;

  const updateRadius = () => {
    const containerW = container.clientWidth || window.innerWidth;
    const containerH = container.clientHeight || 800;

    // React Bits Pro: radius is calculated from radiusPercent (e.g. 23%)
    let targetRadius = settings.radiusPercent != null
      ? (containerW * (settings.radiusPercent / 100))
      : (settings.radius || 280);

    // Keep all cards fully within visible frame at all viewport sizes
    const effectiveCardH = settings.itemHeight * settings.itemScale;
    const maxVerticalRadius = Math.max(120, (containerH - effectiveCardH - 40) / 2);

    const effectiveCardW = Math.max(settings.itemWidth, settings.itemHeight) * settings.itemScale;
    const maxHorizontalRadius = Math.max(120, (containerW - effectiveCardW - 32) / 2);

    calculatedRadius = Math.min(targetRadius, maxVerticalRadius, maxHorizontalRadius);

    orbitRing.style.width = `${calculatedRadius * 2}px`;
    orbitRing.style.height = `${calculatedRadius * 2}px`;
  };

  updateRadius();

  // Position all cards along the circle
  const render = () => {
    const activeRadius = calculatedRadius;

    itemElements.forEach((item, index) => {
      // Calculate angular position around the circle
      const cardAngle = currentAngle + item.baseAngle;
      const normalized = normalizeDeg(cardAngle); // -180 to +180
      const rad = cardAngle * TO_RAD;

      // Polar Coordinates (origin at stage center)
      const x = Math.round(activeRadius * Math.sin(rad) * 100) / 100;
      const y = Math.round(-activeRadius * Math.cos(rad) * 100) / 100;

      // Focus calculations
      const distFromTop = Math.abs(normalized); // 0 at top, 180 at bottom
      const focus = 1 - Math.min(distFromTop / 180, 1); // 1.0 at top, 0.0 at bottom

      // Card orientation: each card follows its angular orientation around the circle
      // Text, images, and card content rotate together with their card
      const rotation = cardAngle;
      const zIndex = Math.round(10 + focus * 80);

      item.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${settings.itemScale})`;
      item.element.style.zIndex = String(zIndex);
      item.element.style.opacity = '1';

      const isTop = distFromTop < (step / 2);
      item.element.classList.toggle('is-active', isTop);
    });
  };

  // Main Animation Tick
  let prevTimestamp = performance.now();

  const tick = (now) => {
    const dt = Math.min((now - prevTimestamp) / 1000, 0.1);
    prevTimestamp = now;

    if (targetAngle !== null) {
      // Programmatic 0.9s ease animation to focus card
      const elapsed = now - animStartTime;
      const progress = Math.min(elapsed / animDurationMs, 1);
      // Smooth cubic bezier easing
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      currentAngle = animStartAngle + (targetAngle - animStartAngle) * ease;

      if (progress >= 1) {
        currentAngle = targetAngle;
        targetAngle = null;
        velocity = 0;
      }
    } else if (isDragging) {
      // Velocity tracked during pointer move
    } else {
      // Inertia throw physics (throwResistance: 0.35)
      if (Math.abs(velocity) > 0.05) {
        currentAngle += velocity * dt * 60;
        // Apply friction
        const friction = Math.pow(1 - settings.throwResistance, dt * 10);
        velocity *= friction;
      } else {
        velocity = 0;
        // Auto Spin: 10°/s continuous rotation when idle
        if (!isReducedMotion) {
          currentAngle += settings.autoSpin * dt;
        }
      }
    }

    render();
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  // ------------------------------------------------------------------------
  // Drag & Throw Interactivity (Enable Drag: Enabled)
  // ------------------------------------------------------------------------
  const onPointerDown = (e) => {
    if (!settings.enableDrag) return;
    isDragging = true;
    hasMoved = false;
    targetAngle = null;
    velocity = 0;

    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();

    root.classList.add('is-dragging');
    root.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (totalDist > 4) hasMoved = true;

    const now = performance.now();
    const dt = Math.max((now - lastTime) / 1000, 0.001);

    // Compute angular delta based on stage center
    const rect = root.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angle1 = Math.atan2(lastY - cy, lastX - cx) * (180 / Math.PI);
    const angle2 = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    let deltaAngle = normalizeDeg(angle2 - angle1);

    // Combine angular drag with horizontal drag component for intuitive flicking
    const swipeDelta = (dx / (calculatedRadius || 260)) * (180 / Math.PI) * 0.45;
    const combinedDelta = Math.abs(deltaAngle) > 0.05 ? deltaAngle : swipeDelta;

    currentAngle += combinedDelta;
    velocity = combinedDelta / (dt * 60);

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    root.classList.remove('is-dragging');
    try {
      root.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  root.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });


  // ------------------------------------------------------------------------
  // Click-to-Focus Card (Animation Duration: 0.9s)
  // ------------------------------------------------------------------------
  itemElements.forEach((item, index) => {
    item.card.addEventListener('click', (e) => {
      if (hasMoved) return; // Ignore drag release clicks

      // Smoothly rotate clicked item to top focus position
      const currentNorm = normalizeDeg(currentAngle + item.baseAngle);
      targetAngle = currentAngle - currentNorm;
      animStartTime = performance.now();
      animStartAngle = currentAngle;
      animDurationMs = settings.animationDuration * 1000;

      settings.onItemClick?.(item.data, index);
    });
  });

  // Resize Observer & Window Resize Listener
  const onResize = () => {
    updateRadius();
    render();
  };

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Accessibility & Keyboard support
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      velocity = -6;
      targetAngle = null;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      velocity = 6;
      targetAngle = null;
    }
  });

  return {
    destroy: () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      root.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);
    },
    rotateTo: (index) => {
      if (index >= 0 && index < itemElements.length) {
        const item = itemElements[index];
        const currentNorm = normalizeDeg(currentAngle + item.baseAngle);
        targetAngle = currentAngle - currentNorm;
        animStartTime = performance.now();
        animStartAngle = currentAngle;
        animDurationMs = settings.animationDuration * 1000;
      }
    }
  };
}

export default mountCircleGallery;

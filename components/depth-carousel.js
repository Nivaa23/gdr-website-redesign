/**
 * DepthCarousel Component (Vanilla JS & Component Core)
 * 3D Depth Card Carousel with Perspective, Tilt, Stacking, and Dot Navigation
 *
 * Configurable props:
 * - depth (default 220)
 * - spread (default 90)
 * - tilt (default 22)
 * - tiltDirection ('right' | 'left', default 'right')
 * - perspective (default 1400)
 * - visibleCards (default 4)
 * - falloff (default 0.2)
 * - blur (default 6)
 * - autoplay (default true)
 * - autoplayInterval (default 5500)
 * - loop (default true)
 * - onChange (callback on slide change)
 */

export function mountDepthCarousel(container, options = {}) {
  if (!container) return null;

  const items = options.items || [];
  if (items.length === 0) return null;

  const depth = options.depth !== undefined ? options.depth : 220;
  const spread = options.spread !== undefined ? options.spread : 90;
  const tilt = options.tilt !== undefined ? options.tilt : 22;
  const tiltDirection = options.tiltDirection || 'right';
  const perspective = options.perspective !== undefined ? options.perspective : 1400;
  const visibleCards = options.visibleCards !== undefined ? options.visibleCards : 4;
  const falloff = options.falloff !== undefined ? options.falloff : 0.2;
  const blur = options.blur !== undefined ? options.blur : 6;
  const autoplay = options.autoplay !== undefined ? options.autoplay : true;
  const autoplayInterval = options.autoplayInterval || 5500;
  const loop = options.loop !== undefined ? options.loop : true;
  const onChange = typeof options.onChange === 'function' ? options.onChange : null;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isHovered = false;

  // Clear existing content
  container.innerHTML = '';
  container.classList.add('depth-carousel-root');

  // Create carousel stage wrapper
  const stage = document.createElement('div');
  stage.className = 'depth-carousel__stage';
  stage.style.perspective = `${perspective}px`;

  // Create card elements
  const cardElements = items.map((item, idx) => {
    const card = document.createElement('div');
    card.className = 'depth-carousel__card cursor-target';
    card.setAttribute('data-card-index', String(idx));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', item.alt || item.title || `Slide ${idx + 1}`);

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.alt || item.title || '';
    img.className = 'depth-carousel__img';
    img.loading = idx === 0 ? 'eager' : 'lazy';

    // Soft depth overlay gradient
    const overlay = document.createElement('div');
    overlay.className = 'depth-carousel__card-overlay';

    card.appendChild(img);
    card.appendChild(overlay);
    stage.appendChild(card);

    card.addEventListener('click', () => {
      if (currentIndex !== idx) {
        goTo(idx);
      }
    });

    return card;
  });

  // Create built-in dot indicators container
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'depth-carousel__dots';
  dotsContainer.setAttribute('role', 'tablist');
  dotsContainer.setAttribute('aria-label', 'Carousel slide indicator');

  const dotElements = items.map((item, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `depth-carousel__dot cursor-target ${idx === 0 ? 'is-active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    dot.setAttribute('data-index', String(idx));
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}: ${item.title || ''}`);

    dot.addEventListener('click', () => {
      goTo(idx);
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  container.appendChild(stage);
  container.appendChild(dotsContainer);

  // Pause on pointer enter
  container.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoplay();
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoplay();
  });

  function updateCardTransforms() {
    const count = items.length;
    const dirSign = tiltDirection === 'left' ? -1 : 1;

    cardElements.forEach((card, idx) => {
      let offset = (idx - currentIndex) % count;
      if (offset < 0) offset += count;

      if (offset === 0) {
        // Active Front Card
        card.style.transform = `translate3d(0px, 0px, 0px) rotateY(0deg)`;
        card.style.opacity = '1';
        card.style.filter = 'blur(0px)';
        card.style.zIndex = '10';
        card.style.pointerEvents = 'auto';
        card.classList.add('is-active');
      } else if (offset > 0 && offset < visibleCards) {
        // Stacking Cards Receding in Depth
        const xOffset = dirSign * offset * spread;
        const zOffset = -offset * depth;
        const yRot = dirSign * -tilt;
        const op = Math.max(0, 1 - offset * falloff);
        const bl = offset * blur;

        card.style.transform = `translate3d(${xOffset}px, 0px, ${zOffset}px) rotateY(${yRot}deg)`;
        card.style.opacity = String(op);
        card.style.filter = `blur(${bl}px)`;
        card.style.zIndex = String(10 - offset);
        card.style.pointerEvents = 'auto';
        card.classList.remove('is-active');
      } else {
        // Hidden / overflow cards
        card.style.transform = `translate3d(${dirSign * 300}px, 0px, -${depth * 2.5}px) rotateY(${dirSign * -tilt}deg)`;
        card.style.opacity = '0';
        card.style.filter = `blur(${blur * 2}px)`;
        card.style.zIndex = '1';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-active');
      }
    });

    // Update dot indicators
    dotElements.forEach((dot, idx) => {
      const isActive = (idx === currentIndex);
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function goTo(index) {
    const count = items.length;
    currentIndex = ((index % count) + count) % count;
    updateCardTransforms();

    if (onChange) {
      onChange(currentIndex, items[currentIndex]);
    }

    resetAutoplay();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function previous() {
    goTo(currentIndex - 1);
  }

  function startAutoplay() {
    if (!autoplay || isHovered) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      next();
    }, autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    if (!isHovered && autoplay) {
      startAutoplay();
    }
  }

  // Initial render
  updateCardTransforms();
  startAutoplay();

  return {
    goTo,
    next,
    previous,
    pause: stopAutoplay,
    resume: startAutoplay,
    getCurrentIndex: () => currentIndex,
    destroy: () => {
      stopAutoplay();
      container.innerHTML = '';
    }
  };
}

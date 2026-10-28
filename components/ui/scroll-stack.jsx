import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const smoothstep = (t) => t * t * (3 - 2 * t);

const buildFilter = (t, dim, blur) => {
  const parts = [];
  if (blur > 0.01) parts.push(`blur(${(t * blur).toFixed(2)}px)`);
  if (dim > 0.001) parts.push(`brightness(${(1 - t * dim).toFixed(3)})`);
  return parts.length ? parts.join(' ') : 'none';
};

const computeCardFrame = (variant, offset, index, cfg) => {
  const baseClip = `inset(0 0 0 0 round ${cfg.radius}px)`;
  const dir = index % 2 === 0 ? 1 : -1;

  if (offset < 0) {
    const a = clamp(offset + 1, 0, 1);
    const s = smoothstep(a);
    switch (variant) {
      case 'fade':
        return {
          transform: `translate3d(0,0,0) scale(${(1.06 - 0.06 * s).toFixed(4)})`,
          opacity: s,
          filter: 'none',
          clip: baseClip
        };
      case 'flip':
        return {
          transform: `translate3d(0,${((1 - s) * 26).toFixed(2)}%,0) rotateX(${(-((1 - s) * 72)).toFixed(2)}deg)`,
          opacity: clamp(1.6 * s, 0, 1),
          filter: 'none',
          clip: baseClip
        };
      case 'zoom':
        return {
          transform: `translate3d(0,0,0) scale(${(0.52 + 0.48 * s).toFixed(4)})`,
          opacity: clamp(1.4 * s, 0, 1),
          filter: cfg.blur > 0.01 ? `blur(${((1 - s) * cfg.blur).toFixed(2)}px)` : 'none',
          clip: baseClip
        };
      case 'reveal':
        return {
          transform: 'translate3d(0,0,0)',
          opacity: 1,
          filter: 'none',
          clip: `inset(${((1 - a) * 100).toFixed(2)}% 0 0 0 round ${cfg.radius}px)`
        };
      case 'deck':
        return {
          transform: `translate3d(0,${((1 - a) * (cfg.enter + 6)).toFixed(2)}%,0) rotate(${((1 - s) * 4 * dir).toFixed(2)}deg)`,
          opacity: 1,
          filter: 'none',
          clip: baseClip
        };
      default:
        return {
          transform: `translate3d(0,${((1 - a) * cfg.enter).toFixed(2)}%,0)`,
          opacity: 1,
          filter: 'none',
          clip: baseClip
        };
    }
  }

  const s = smoothstep(clamp(offset, 0, 1));
  switch (variant) {
    case 'fade':
      return {
        transform: `translate3d(0,0,0) scale(${(1 - 0.06 * s).toFixed(4)})`,
        opacity: 1 - s,
        filter: buildFilter(s, cfg.dim, cfg.blur),
        clip: baseClip
      };
    case 'flip':
      return {
        transform: `translate3d(0,${(-(26 * s)).toFixed(2)}%,0) rotateX(${(72 * s).toFixed(2)}deg)`,
        opacity: 1 - s,
        filter: buildFilter(s, cfg.dim, 0),
        clip: baseClip
      };
    case 'zoom':
      return {
        transform: `translate3d(0,0,0) scale(${(1 + 0.42 * s).toFixed(4)})`,
        opacity: 1 - s,
        filter: cfg.blur > 0.01 ? `blur(${(s * cfg.blur * 1.4).toFixed(2)}px)` : 'none',
        clip: baseClip
      };
    case 'reveal':
      return {
        transform: `translate3d(0,${(-offset * cfg.peek * 0.5).toFixed(2)}px,0) scale(${(1 - offset * cfg.scaleStep * 0.7).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
    case 'deck':
      return {
        transform: `translate3d(0,${(-offset * cfg.peek * 0.75).toFixed(2)}px,0) rotate(${(4.5 * offset * dir).toFixed(2)}deg) scale(${(1 - offset * cfg.scaleStep * 0.85).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
    default:
      return {
        transform: `translate3d(0,${(-offset * cfg.peek).toFixed(2)}px,0) scale(${(1 - offset * cfg.scaleStep).toFixed(4)})`,
        opacity: 1,
        filter: buildFilter(offset, cfg.dim, cfg.blur),
        clip: baseClip
      };
  }
};

export function ScrollStack({
  items = [],
  children,
  variant = 'reveal',
  scrollLength = 1.0,
  peek = 26,
  scaleStep = 0.07,
  blur = 4.0,
  dim = 0.28,
  smooth = 0.16,
  depth = 3,
  cardWidth = 880,
  cardHeight = 0.68,
  borderRadius = 22,
  perspective = 1400,
  showProgress = true,
  showCounter = true,
  onIndexChange,
  className = ''
}) {
  const numScrollLength = typeof scrollLength === 'string' ? parseFloat(scrollLength) || 1 : scrollLength;
  const numPeek = typeof peek === 'string' ? parseFloat(peek) || 26 : peek;
  const numBlur = typeof blur === 'string' ? parseFloat(blur) || 4 : blur;
  const numCardWidth = typeof cardWidth === 'string' ? parseFloat(cardWidth) || 880 : cardWidth;
  const numBorderRadius = typeof borderRadius === 'string' ? parseFloat(borderRadius) || 22 : borderRadius;
  const numPerspective = typeof perspective === 'string' ? parseFloat(perspective) || 1400 : perspective;

  const childNodes = useMemo(
    () => React.Children.toArray(children).filter((c) => React.isValidElement(c)),
    [children]
  );
  const cards = childNodes.length > 0 ? childNodes : items;
  const total = cards.length;

  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(null);
  const currentPosRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const activeIdxRef = useRef(-1);
  const onIndexChangeRef = useRef(onIndexChange);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const cfg = useMemo(
    () => ({
      peek: Math.max(0, numPeek),
      scaleStep: clamp(scaleStep, 0, 0.4),
      blur: reducedMotion ? 0 : Math.max(0, numBlur),
      dim: clamp(dim, 0, 1),
      radius: Math.max(0, numBorderRadius),
      enter: ((1 + 1 / clamp(cardHeight, 0.2, 0.95)) / 2) * 100 + 3
    }),
    [numPeek, scaleStep, numBlur, dim, numBorderRadius, reducedMotion, cardHeight]
  );

  const renderPosition = useCallback(
    (pos) => {
      const maxDepth = Math.max(1, Math.round(depth));
      for (let i = 0; i < total; i += 1) {
        const node = cardRefs.current[i];
        if (!node) continue;
        const offset = pos - i;
        if (offset < -1.0005 || offset > maxDepth) {
          if (node.style.visibility !== 'hidden') node.style.visibility = 'hidden';
          continue;
        }
        if (node.style.visibility === 'hidden') node.style.visibility = '';
        const frame = computeCardFrame(variant, offset, i, cfg);
        node.style.transform = frame.transform;
        node.style.opacity = frame.opacity.toFixed(4);
        node.style.filter = frame.filter;
        node.style.clipPath = frame.clip;
      }

      if (progressRef.current && total > 1) {
        const p = clamp(pos / (total - 1), 0, 1);
        progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      const idx = clamp(Math.round(pos), 0, total - 1);
      if (idx !== activeIdxRef.current) {
        activeIdxRef.current = idx;
        setActiveIndex(idx);
        onIndexChangeRef.current?.(idx);
      }
    },
    [total, depth, cfg, variant]
  );

  const measureScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el || total < 1) return 0;
    const vh = window.innerHeight || 0;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - vh;
    return scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1) * (total - 1);
  }, [total]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const damping = reducedMotion ? 0 : clamp(smooth, 0, 0.95);

    const tick = (now) => {
      const prev = lastTimeRef.current || now;
      const dt = Math.min(0.05, Math.max(0, (now - prev) / 1000));
      lastTimeRef.current = now;
      const target = measureScroll();
      const curr = currentPosRef.current;
      const next = curr + (target - curr) * (damping > 0 ? 1 - Math.pow(1 - damping, 60 * dt) : 1);
      currentPosRef.current = next;
      renderPosition(next);

      if (Math.abs(target - next) > 4e-4) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        currentPosRef.current = target;
        renderPosition(target);
        runningRef.current = false;
      }
    };

    const schedule = () => {
      if (!runningRef.current) {
        runningRef.current = true;
        lastTimeRef.current = 0;
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    currentPosRef.current = measureScroll();
    renderPosition(currentPosRef.current);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [measureScroll, renderPosition, smooth, reducedMotion]);

  const totalHeightVh = 100 + Math.max(0, total - 1) * Math.max(0.2, numScrollLength) * 100;

  return (
    <section
      ref={sectionRef}
      aria-label="Scrolling card stack"
      className={`relative w-full ${className}`.trim()}
      style={{ height: `${totalHeightVh}vh` }}
    >
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-4 sm:px-8"
        style={{ perspective: `${Math.max(200, numPerspective)}px` }}
      >
        <div
          className="relative w-full"
          style={{
            maxWidth: `${Math.max(200, numCardWidth)}px`,
            height: `${100 * clamp(cardHeight, 0.2, 0.95)}vh`
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform,opacity]"
              style={{ zIndex: i }}
            >
              {React.isValidElement(card) ? (
                card
              ) : (
                <div className="w-full h-full flex flex-col md:flex-row bg-white border border-slate-200/90 shadow-xl rounded-[22px] overflow-hidden">
                  {/* Left Column: Image Media (48% Width) */}
                  <div className="relative w-full md:w-[48%] h-56 md:h-full bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 pointer-events-none border-r border-slate-200/60"></div>
                  </div>

                  {/* Right Column: Text & Telemetry Content (52% Width, Vertically Centered) */}
                  <div className="w-full md:w-[52%] p-8 sm:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                        {card.division}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                        {card.spec}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-3 text-left">
                      {card.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed text-left border-l-2 border-[#0284C7] pl-3 mb-6">
                      {card.description}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={card.link}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shadow-sky-500/20 active:scale-[0.98]"
                      >
                        <span>Explore Discipline</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>

                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {String(i + 1).padStart(2, '0')} // {String(total).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {(showProgress || showCounter) && total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-4 px-6 sm:bottom-8">
            {showProgress && (
              <span className="relative h-px w-28 overflow-hidden bg-slate-900/20 sm:w-44">
                <span
                  ref={progressRef}
                  className="absolute inset-0 origin-left bg-[#0284C7]"
                  style={{ transform: 'scaleX(0)' }}
                />
              </span>
            )}
            {showCounter && (
              <span className="text-[11px] font-mono font-medium tabular-nums tracking-widest text-slate-500">
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export const engineeringDisciplines = [
  // --- DIVISION 01: INFRASTRUCTURE & CIVIL ENGINEERING ---
  {
    division: 'Division 01: Infrastructure & Civil Engineering',
    title: 'Bridge Engineering',
    spec: 'IRC : 78-2014 • MoRTH',
    description:
      'River bridges, grade separators, flyovers, Railway Over Bridges (ROB), structural audits, non-destructive health monitoring, and rehabilitation schemes.',
    image: '/assets/images/hero-infrastructure-bridge.jpg',
    link: '/bridge.html'
  },
  {
    division: 'Division 01: Infrastructure & Civil Engineering',
    title: 'Hydro & Highway DPR',
    spec: 'IRC : SP : 84 / 87',
    description:
      'Highway and expressway route alignment studies, hydrological catchment modeling, pavement condition surveys, and comprehensive Detailed Project Reports (DPR).',
    image: '/assets/images/service-hydro-highway.jpg',
    link: '/hydro.html'
  },
  {
    division: 'Division 01: Infrastructure & Civil Engineering',
    title: 'Project Management Consultancy (PMC)',
    spec: 'MoRTH • FIDIC QA',
    description:
      'Independent engineer services, full-time construction supervision, site quality surveillance, contractor milestone verification, and progress reporting.',
    image: '/assets/images/service-pmc-supervision.jpg',
    link: '/pmc.html'
  },

  // --- DIVISION 02: BUILDING DESIGN & TECHNOLOGY ---
  {
    division: 'Division 02: Building Design & Technology',
    title: 'Architecture & Master Planning',
    spec: 'NBC 2016 Compliant',
    description:
      'Comprehensive institutional and commercial campus planning, integrated spatial flow, functional programming, and statutory compliance.',
    image: '/assets/images/hero-architecture-complex.jpg',
    link: '/architecture.html'
  },
  {
    division: 'Division 02: Building Design & Technology',
    title: 'Structural Engineering',
    spec: 'IS 456 • IS 1893',
    description:
      'Advanced seismic analysis, heavy industrial foundation systems, post-tensioned slab designs, and multi-storey commercial frames.',
    image: '/assets/images/service-structural-framing.jpg',
    link: '/structure.html'
  },
  {
    division: 'Division 02: Building Design & Technology',
    title: 'MEPF Engineering',
    spec: 'NFPA • NBC Norms',
    description:
      'Integrated mechanical HVAC, electrical distribution networks, public health engineering, and automated fire protection design.',
    image: '/assets/images/service-mepf-systems.jpg',
    link: '/mepf.html'
  },
  {
    division: 'Division 02: Building Design & Technology',
    title: 'BIM Modeling & Auditing',
    spec: 'ISO 19650 Standards',
    description:
      '3D to 7D Building Information Modeling, spatial clash detection, automated bill of quantities (BOQ), and facility lifecycle management.',
    image: '/assets/images/service-bim-modeling.jpg',
    link: '/bim.html'
  },
  {
    division: 'Division 02: Building Design & Technology',
    title: 'Environmentally Sustainable Solutions',
    spec: 'GRIHA • LEED Systems',
    description:
      'Passive building orientation, solar lifecycle studies, rainwater harvesting, net-zero waste planning, and environmental impact assessments.',
    image: '/assets/images/service-sustainability.jpg',
    link: '/sustainability.html'
  },
  {
    division: 'Division 02: Building Design & Technology',
    title: 'Commerce & Contract Management',
    spec: 'FIDIC / EPC Frameworks',
    description:
      'Preparation of item rate and EPC tender documents, techno-commercial evaluations, arbitration support, and variation auditing.',
    image: '/assets/images/service-commerce-contracts.jpg',
    link: '/commerce.html'
  },

  // --- DIVISION 03: TESTING & GEOMATICS ---
  {
    division: 'Division 03: Testing & Geomatics',
    title: 'Laboratory & Material Testing',
    spec: 'NABL ISO/IEC 17025',
    description:
      'Comprehensive testing of soil, rock, concrete, bitumen, steel, and water in fully accredited physical, chemical, and NDT laboratories.',
    image: '/assets/images/hero-lab-testing.jpg',
    link: '/lab.html'
  },
  {
    division: 'Division 03: Testing & Geomatics',
    title: 'Survey & Geomatics',
    spec: 'DGPS • LiDAR • Drone',
    description:
      'High-precision topographic mapping, drone photogrammetry, hydrographic surveys, and GIS-integrated ground alignment models.',
    image: '/assets/images/service-survey-geomatics.jpg',
    link: '/survey.html'
  }
];

export default ScrollStack;


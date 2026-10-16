/**
 * React Bits Pro — Concave Carousel Component
 * Official Concave Carousel integration for Geo Designs & Research website
 * 
 * Features:
 * - 3D Curved Concave Gallery Wall bending around viewer using Three.js & WebGL
 * - Mandatory 18px card gap (gap = 18)
 * - Large, prominent card dimensions targeting three clearly visible cards on desktop
 * - 14 Verified Historical Company Milestones (1991 - 2021) in full detail
 * - High-DPI canvas texture rendering with crisp typography (Hanken Grotesk + Geist Mono)
 * - Continuous looping drift autoplay with pause-on-hover & smooth resumption
 * - Dragging with pointer capture, inertia physics, detent snap, and keyboard controls
 * - Lower milestone counter (< 01 / 14 >) without redundant caption text
 * - Responsive layout adaptation across desktop, tablet, and mobile
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 14 Verified Company Milestones (1991 - 2021)
// ---------------------------------------------------------------------------
export const JOURNEY_MILESTONES = [
  {
    year: "1991",
    tagline: "Journey Commenced • Bombay Shopping Center",
    desc: "Journey commenced as Geotech Consultants with a 400 sqft office at Bombay Shopping Center, Vadodara.",
    sections: [
      {
        label: "SERVICES PROVIDED:",
        items: [
          "Structure Design",
          "Material Testing"
        ]
      }
    ]
  },
  {
    year: "2000",
    tagline: "Geo Test House Established • Subhanpura",
    desc: "Established Geo Test House with an enhanced 1500 sqft office and laboratory at Panchratna Building, Subhanpura, Vadodara.",
    sections: [
      {
        label: "SERVICES PROVIDED:",
        items: [
          "Structure Design",
          "Dedicated Field Testing and Laboratory Testing Facilities for Civil Engineering Materials"
        ]
      },
      {
        label: "ADDED:",
        items: [
          "Branch Office and Laboratory at Bhuj"
        ]
      }
    ]
  },
  {
    year: "2005",
    tagline: "Expanded Testing Facilities • 8000 sqft",
    desc: "Shifted to a newly constructed building with 8000 sqft office and testing facilities.",
    sections: [
      {
        label: "SERVICES PROVIDED:",
        items: [
          "Structure Design",
          "Field Testing and Laboratory Testing Facilities enhanced with independent laboratories for testing"
        ]
      },
      {
        label: "ADDED:",
        items: [
          "Field Topographic Survey Facilities"
        ]
      }
    ]
  },
  {
    year: "2007",
    tagline: "Company Incorporated • Geo Designs & Research",
    desc: "Established the new company, Geo Designs & Research Pvt. Ltd.",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Third Party Inspection (TPI)",
          "Project Management Consultancy (PMC) Services"
        ]
      }
    ]
  },
  {
    year: "2009",
    tagline: "International Expansion • Dubai Laboratory",
    desc: "Established the new Metcon Testing Laboratory at Dubai.",
    sections: []
  },
  {
    year: "2010",
    tagline: "NABL ISO-17025 & ISO-9001 Accreditations",
    desc: "Qualified for the prestigious NABL ISO-17025 Accreditation Certificate for Laboratory Testing and ISO-9001 Certificate for Quality Management Services (QMS).",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Branch Office and Laboratory at Bharuch"
        ]
      }
    ]
  },
  {
    year: "2012",
    tagline: "Overseas Consultancy & Regional Expansion",
    desc: "Provided consultancy services for establishment of a Material Testing Laboratory facility at Riyadh, Saudi Arabia.",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Branch Office and Laboratory at Gandhinagar",
          "Branch Office and Laboratory at Junagadh"
        ]
      }
    ]
  },
  {
    year: "2013",
    tagline: "High-Rise Analysis • Baku, Azerbaijan",
    desc: "Successfully completed structural analysis for \"BLACK SEA MALL WITH 60 STOREY HOTEL\" on the client's requirement at Baku, Azerbaijan.",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Scope for NABL ISO-17025 accredited tests increased to 237"
        ]
      }
    ]
  },
  {
    year: "2014",
    tagline: "Gujarat Regional Branch Offices Added",
    desc: "",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Branch Office at Navsari",
          "Branch Office at Anand",
          "Branch Office at Godhra"
        ]
      }
    ]
  },
  {
    year: "2015",
    tagline: "Campus Expansion • 16000 sqft at Vadodara",
    desc: "Enhanced office and laboratory area from 8000 sqft to 16000 sqft at Vadodara.",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Environment Lab",
          "NDT Lab",
          "Architectural Design",
          "Quantity Survey and Costing",
          "Infrastructure Design (Roads and Bridges) with DPR (Detailed Project Reports) Services"
        ]
      }
    ]
  },
  {
    year: "2017",
    tagline: "Office & Laboratory Expansion • 24000 sqft",
    desc: "Enhanced office and laboratory area from 16000 sqft to 24000 sqft at Vadodara.",
    sections: []
  },
  {
    year: "2018",
    tagline: "Corporate Merger & NABL Scope Expansion",
    desc: "Merging of Geo Test House with Geo Designs & Research Pvt. Ltd.",
    sections: [
      {
        label: "ADDED:",
        items: [
          "Scope for NABL ISO-17025 accredited tests increased to 457"
        ]
      }
    ]
  },
  {
    year: "2020",
    tagline: "Advanced Infrastructure Survey Technologies",
    desc: "",
    sections: [
      {
        label: "ADDED:",
        items: [
          "MEPF Services",
          "GREEN Building Services",
          "BIM (Building Information & Modelling) Services"
        ]
      },
      {
        label: "PROCURED:",
        items: [
          "FWD (Falling Weight Deflectometer)",
          "NSV (Network Survey Vehicle) for supporting infrastructure projects"
        ]
      }
    ]
  },
  {
    year: "2021",
    tagline: "Gandhinagar Liaison Office & Training Academy",
    desc: "Rented a dedicated 2000 sqft office for liaising and coordination at Gandhinagar.",
    sections: [
      {
        label: "COMMENCING:",
        items: [
          "Classroom training for GREEN Buildings and BIM for students, freshers, and industry professionals."
        ]
      }
    ]
  }
];

// Helper to wrap text cleanly within a max pixel width in canvas
function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Creates high-resolution milestone card canvas texture
 * 880x740 reference resolution (aspect ~1.189) at 2x device scale for razor-sharp typography
 * Responsively scales font hierarchy for desktop, tablet, and mobile with generous clearance
 */
export function createMilestoneCardCanvas(milestone, index, total = 14, viewportWidth = 1440) {
  const canvas = document.createElement('canvas');
  const width = 880;
  const height = 740;
  const dpr = 2;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Responsive scale factor for canvas typography based on viewport
  // Desktop (>= 1024px): 1.0 (Full enlarged scale)
  // Tablet (768px - 1023px): 0.90
  // Mobile (< 768px): 0.82
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const typoScale = isMobile ? 0.82 : (isTablet ? 0.90 : 1.0);

  // Card Background: Rich elevated dark slate surface
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1d252c');
  bgGrad.addColorStop(0.35, '#161d23');
  bgGrad.addColorStop(1, '#0f1418');

  drawRoundedRect(ctx, 4, 4, width - 8, height - 8, 22);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Distinct border with Geo muted-green tint
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle technical drafting cross mark at top-left
  ctx.strokeStyle = 'rgba(73, 126, 94, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 28);
  ctx.lineTo(48, 46);
  ctx.moveTo(39, 37);
  ctx.lineTo(57, 37);
  ctx.stroke();

  // Geo Green Drafting Accent Pill
  ctx.fillStyle = '#497E5E';
  drawRoundedRect(ctx, 68, 34, 40, 6, 3);
  ctx.fill();

  // Header Badge (Milestone index / total) — subtle secondary detail in Geist Mono
  const indexFontSize = Math.round(14 * typoScale);
  ctx.font = `700 ${indexFontSize}px "Geist Mono", monospace`;
  ctx.fillStyle = '#9fd2b2';
  ctx.textAlign = 'right';
  ctx.fillText(`MILESTONE ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, width - 48, 41);

  // 1. Prominent Milestone Year Heading
  // Substantially enlarged font size (104px desktop) with vibrant green accent
  const yearFontSize = Math.round(104 * typoScale);
  ctx.textAlign = 'left';
  ctx.font = `800 ${yearFontSize}px "Hanken Grotesk", sans-serif`;
  ctx.fillStyle = '#68b284';
  const yearY = Math.round(36 + yearFontSize * 0.94);
  ctx.fillText(milestone.year, 48, yearY);

  // Technical divider line beneath year
  const dividerY = yearY + 18;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, dividerY);
  ctx.lineTo(width - 48, dividerY);
  ctx.stroke();

  let curY = dividerY + Math.round(38 * typoScale);
  const contentWidth = width - 96;

  // 2. Milestone Description
  // Noticeably larger font size (28px desktop) and line height (40px) for effortless readability
  if (milestone.desc) {
    const descFontSize = Math.round(28 * typoScale);
    const descLineHeight = Math.round(40 * typoScale);
    ctx.font = `500 ${descFontSize}px "Hanken Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    const descLines = wrapCanvasText(ctx, milestone.desc, contentWidth);
    for (const line of descLines) {
      ctx.fillText(line, 48, curY);
      curY += descLineHeight;
    }
    curY += Math.round(18 * typoScale);
  }

  // 3. Sub-sections (Services Provided, Added, Procured, Commencing)
  if (milestone.sections && milestone.sections.length > 0) {
    const labelFontSize = Math.round(18 * typoScale);
    const itemFontSize = Math.round(24 * typoScale);
    const itemLineHeight = Math.round(35 * typoScale);
    const itemGap = Math.round(12 * typoScale);

    for (const sec of milestone.sections) {
      curY += Math.round(6 * typoScale);

      // Category Label (Geist Mono exclusively for labels, green treatment)
      ctx.font = `700 ${labelFontSize}px "Geist Mono", monospace`;
      ctx.fillStyle = '#9fd2b2';
      ctx.fillText(sec.label, 48, curY);
      curY += Math.round(30 * typoScale);

      // Bullet-point content in Hanken Grotesk with comfortable line height
      ctx.font = `500 ${itemFontSize}px "Hanken Grotesk", sans-serif`;

      for (const item of sec.items) {
        const itemLines = wrapCanvasText(ctx, item, contentWidth - 40);

        // Green Bullet Point Dot
        ctx.fillStyle = '#68b284';
        ctx.beginPath();
        ctx.arc(58, curY - Math.round(7 * typoScale), 4, 0, Math.PI * 2);
        ctx.fill();

        // Text item lines
        ctx.fillStyle = '#E6EDF2';
        for (let l = 0; l < itemLines.length; l++) {
          ctx.fillText(itemLines[l], 76, curY);
          curY += itemLineHeight;
        }
        curY += itemGap;
      }
      curY += Math.round(10 * typoScale);
    }
  }

  // 4. Subtle brand drafting watermark / metadata footer in Geist Mono
  const footerFontSize = Math.round(12 * typoScale);
  ctx.font = `600 ${footerFontSize}px "Geist Mono", monospace`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.textAlign = 'right';
  ctx.fillText('GEO DESIGNS & RESEARCH', width - 48, height - 26);

  ctx.textAlign = 'left';
  ctx.fillText('EST. 1991 • VADODARA', 48, height - 26);

  return canvas;
}

// ---------------------------------------------------------------------------
// Official Shaders from React Bits Pro Concave Carousel
// ---------------------------------------------------------------------------
const VERTEX_SHADER = `
uniform float uCenter;
uniform float uWidth;
uniform float uK;
uniform float uFloor;
uniform float uMirror;
varying vec2 vUv;
varying float vLift;

void main() {
  vUv = uv;
  float s = uCenter + (uv.x - 0.5) * uWidth;
  float y = uv.y - 0.5;
  float x = s;
  float z = 0.0;
  if (uK > 1e-5) {
    float a = s * uK;
    float h = sin(a * 0.5);
    x = sin(a) / uK;
    z = 2.0 * h * h / uK;
  }
  vLift = y - uFloor;
  if (uMirror > 0.5) y = 2.0 * uFloor - y;
  gl_Position = projectionMatrix * viewMatrix * vec4(x, y, z, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uWidth;
uniform float uRadius;
uniform float uLoaded;
uniform float uAlpha;
uniform float uMirror;
uniform float uReflect;
uniform float uDim;
uniform float uHover;
uniform vec2 uResolution;
uniform vec3 uPlaceholder;
varying vec2 vUv;
varying float vLift;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 size = vec2(uWidth, 1.0);
  vec2 p = (vUv - 0.5) * size;
  float lift = max(vLift, 0.0);
  float mirror = step(0.5, uMirror);
  float soft = 1.0 + mirror * lift * 26.0;
  float d = roundBox(p, size * 0.5, min(uRadius, 0.5 * min(size.x, size.y)));
  float aa = max(fwidth(d), 1e-5) * 0.7 * soft;
  float mask = 1.0 - smoothstep(-aa, aa, d);

  float fade = mix(1.0, uReflect * pow(1.0 - clamp(lift / 0.62, 0.0, 1.0), 2.2), mirror);
  float edge = abs(gl_FragCoord.x / uResolution.x * 2.0 - 1.0);
  float vignette = 1.0 - uDim * smoothstep(0.18, 1.05, edge) * (1.0 - 0.85 * uHover);
  float alpha = mask * fade * vignette * uAlpha;
  if (alpha < 0.002) discard;

  float panelAspect = size.x / size.y;
  vec2 uv = vUv - 0.5;
  if (panelAspect > uImageAspect) {
    uv.y *= panelAspect / uImageAspect;
  } else {
    uv.x *= uImageAspect / panelAspect;
  }
  uv += 0.5;

  vec4 tex = texture2D(uImage, uv);
  vec3 rgb = mix(uPlaceholder, tex.rgb, uLoaded);
  alpha *= mix(0.08, 1.0, uLoaded);
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`;

// Math clamps & utils
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const ARC_ANGLE = 52 * Math.PI / 180;
const TWO_PI = 2 * Math.PI;

/**
 * Mounts the official React Bits Pro Concave Carousel
 * Configured with mandatory 18px gap (gap: 18), large readable cards, and continuous drift autoplay
 */
export function mountConcaveCarousel(container, options = {}) {
  if (!container) return null;

  const defaults = {
    items: JOURNEY_MILESTONES,
    startIndex: 0,
    aspect: 880 / 740,   // ~1.189 aspect ratio matching enlarged 880x740 card canvas
    size: 0.77,          // Substantially enlarged cards (77% of available stage height)
    curvature: 0.44,     // Concave curvature highlighting active card and adjacent cards
    distance: 4.1,       // Optimal camera perspective for 3 prominent desktop cards
    tilt: 0,
    gap: 18,             // MANDATORY card gap: exactly 18px
    radius: 20,          // Smooth rounded card corners
    reflection: 0.08,
    dim: 0.16,           // Subtle dimming so neighboring cards are crisp & legible
    autoplay: "drift",   // Smooth, continuous automatic drift movement
    speed: 0.12,         // Smooth drift speed
    interval: 4.0,
    snap: true,
    inertia: 0.5,
    pauseOnHover: true,  // Pause on hover, resume on leave
    draggable: true,
    wheel: false,        // Keep vertical page scrolling natural & untouched
    captions: false,     // Redundant text caption removed per requirement 3
    controls: true,      // Lower < 01 / 14 > controls retained
    backgroundColor: "transparent",
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    onIndexChange: null,
    onSelect: null
  };

  const config = { ...defaults, ...options };
  const items = config.items || JOURNEY_MILESTONES;
  const numItems = Math.max(items.length, 1);

  // Setup DOM elements inside container
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.minHeight = '580px';
  container.style.overflow = 'hidden';
  container.style.userSelect = 'none';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('aria-label', 'Our Journey Milestones Concave Carousel. Drag, or use navigation arrows and keyboard to turn the curved gallery.');
  container.tabIndex = 0;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  // Optional captions container (only rendered if config.captions is true)
  let labelsContainer = null;
  let labelNodes = [];
  if (config.captions) {
    labelsContainer = document.createElement('div');
    labelsContainer.style.position = 'absolute';
    labelsContainer.style.inset = '0';
    labelsContainer.style.overflow = 'hidden';
    labelsContainer.style.pointerEvents = 'none';
    container.appendChild(labelsContainer);

    labelNodes = Array.from({ length: 5 }, () => {
      const el = document.createElement('div');
      el.setAttribute('aria-hidden', 'true');
      el.style.position = 'absolute';
      el.style.left = '0';
      el.style.top = '0';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.gap = '4px';
      el.style.textAlign = 'center';
      el.style.whiteSpace = 'nowrap';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.willChange = 'transform, opacity';

      const title = document.createElement('span');
      title.style.fontFamily = 'var(--font-heading, "Hanken Grotesk", sans-serif)';
      title.style.fontSize = '18px';
      title.style.fontWeight = '700';
      title.style.color = '#62a37c';

      const subtitle = document.createElement('span');
      subtitle.style.fontFamily = 'var(--font-mono, "Geist Mono", monospace)';
      subtitle.style.fontSize = '12px';
      subtitle.style.fontWeight = '500';
      subtitle.style.color = '#a3c4b0';

      el.appendChild(title);
      el.appendChild(subtitle);
      labelsContainer.appendChild(el);

      return { node: el, title, subtitle, index: NaN, opacity: -1, x: NaN, y: NaN };
    });
  }

  // Controls UI (Prev/Next buttons & counter < 01 / 14 >)
  let controlsEl = null;
  let counterCurrentEl = null;
  let counterTotalEl = null;

  if (config.controls) {
    controlsEl = document.createElement('div');
    controlsEl.style.position = 'absolute';
    controlsEl.style.left = '0';
    controlsEl.style.right = '0';
    controlsEl.style.bottom = '20px';
    controlsEl.style.display = 'flex';
    controlsEl.style.justifyContent = 'center';
    controlsEl.style.alignItems = 'center';
    controlsEl.style.gap = '18px';
    controlsEl.style.pointerEvents = 'none';
    controlsEl.style.fontSize = '13px';
    controlsEl.style.fontFamily = 'var(--font-mono, "Geist Mono", monospace)';
    controlsEl.style.fontVariantNumeric = 'tabular-nums';
    controlsEl.style.color = 'var(--color-white, #FFFFFF)';
    controlsEl.style.zIndex = '10';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous milestone');
    prevBtn.style.width = '38px';
    prevBtn.style.height = '38px';
    prevBtn.style.display = 'grid';
    prevBtn.style.placeItems = 'center';
    prevBtn.style.borderRadius = '999px';
    prevBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    prevBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    prevBtn.style.color = 'inherit';
    prevBtn.style.cursor = 'pointer';
    prevBtn.style.pointerEvents = 'auto';
    prevBtn.style.transition = 'all 160ms ease';
    prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
    prevBtn.addEventListener('mouseenter', () => { prevBtn.style.background = '#497E5E'; prevBtn.style.borderColor = '#497E5E'; });
    prevBtn.addEventListener('mouseleave', () => { prevBtn.style.background = 'rgba(255, 255, 255, 0.08)'; prevBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)'; });

    const counterSpan = document.createElement('span');
    counterSpan.style.minWidth = '64px';
    counterSpan.style.textAlign = 'center';
    counterSpan.style.letterSpacing = '0.04em';

    counterCurrentEl = document.createElement('span');
    counterCurrentEl.style.color = '#62a37c';
    counterCurrentEl.style.fontWeight = '700';
    counterCurrentEl.textContent = '01';

    const counterSep = document.createElement('span');
    counterSep.style.opacity = '0.4';
    counterSep.textContent = ' / ';

    counterTotalEl = document.createElement('span');
    counterTotalEl.style.opacity = '0.6';
    counterTotalEl.textContent = String(numItems).padStart(2, '0');

    counterSpan.append(counterCurrentEl, counterSep, counterTotalEl);

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next milestone');
    nextBtn.style.width = '38px';
    nextBtn.style.height = '38px';
    nextBtn.style.display = 'grid';
    nextBtn.style.placeItems = 'center';
    nextBtn.style.borderRadius = '999px';
    nextBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    nextBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    nextBtn.style.color = 'inherit';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.pointerEvents = 'auto';
    nextBtn.style.transition = 'all 160ms ease';
    nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
    nextBtn.addEventListener('mouseenter', () => { nextBtn.style.background = '#497E5E'; nextBtn.style.borderColor = '#497E5E'; });
    nextBtn.addEventListener('mouseleave', () => { nextBtn.style.background = 'rgba(255, 255, 255, 0.08)'; nextBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)'; });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      step(-1);
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      step(1);
    });

    controlsEl.append(prevBtn, counterSpan, nextBtn);
    container.appendChild(controlsEl);
  }

  // Three.js WebGL Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.error('Concave Carousel WebGL initialization failed:', err);
    return null;
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 400);
  const planeGeom = new THREE.PlaneGeometry(1, 1, 72, 1);
  const dummyTex = new THREE.DataTexture(new Uint8Array([20, 26, 30, 255]), 1, 1);
  dummyTex.needsUpdate = true;

  const resolution = new THREE.Vector2(1, 1);
  const placeholderColor = new THREE.Color(0.08, 0.1, 0.12);
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const createMaterial = (isMirror) => new THREE.ShaderMaterial({
    uniforms: {
      uImage: { value: dummyTex },
      uImageAspect: { value: config.aspect || (880 / 740) },
      uCenter: { value: 0 },
      uWidth: { value: config.aspect || (880 / 740) },
      uK: { value: 0.3 },
      uFloor: { value: -0.535 },
      uMirror: { value: isMirror ? 1.0 : 0.0 },
      uRadius: { value: 0.04 },
      uLoaded: { value: 0 },
      uAlpha: { value: 1 },
      uReflect: { value: 0.08 },
      uDim: { value: 0.16 },
      uHover: { value: 0 },
      uResolution: { value: resolution },
      uPlaceholder: { value: placeholderColor }
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  // Mesh pool: 28 panels (main mesh + floor reflection mirror)
  const panels = Array.from({ length: 28 }, () => {
    const mirror = new THREE.Mesh(planeGeom, createMaterial(true));
    const mesh = new THREE.Mesh(planeGeom, createMaterial(false));
    mirror.frustumCulled = false;
    mesh.frustumCulled = false;
    mirror.visible = false;
    mesh.visible = false;
    mirror.renderOrder = 0;
    mesh.renderOrder = 1;
    scene.add(mirror);
    scene.add(mesh);
    return { mesh, mirror };
  });

  // Layout parameters
  let viewWidth = Math.round(container.clientWidth) || (typeof window !== 'undefined' ? window.innerWidth : 1440);
  let viewHeight = Math.round(container.clientHeight) || 760;
  let currentDpr = 1;
  let isReady = false;

  let currentPos = config.startIndex || 0;
  let targetPos = null;
  let velocity = 0;
  let dragVelocity = 0;
  let driftFactor = 1.0;
  let isPointerOver = false;
  let lastTime = 0;
  let animFrameId = 0;
  let isDestroyed = false;
  let isReducedMotion = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  let hoveredIndex = null;
  const hoverStates = new Map();
  let activeIndex = config.startIndex || 0;

  // Pre-generate milestone card canvas textures (880x740)
  const textures = items.map((milestone, idx) => {
    const c = createMilestoneCardCanvas(milestone, idx, numItems, viewWidth);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = maxAnisotropy;
    return {
      canvas: c,
      texture: tex,
      aspect: 880 / 740,
      ready: true,
      uploaded: true,
      fade: 1
    };
  });

  const layout = {
    labelGap: 24,
    controlsTop: 24,
    unit: 1,
    pitch: 1.25,
    width: 1.189,
    k: 0.3,
    distance: 4.1,
    lift: 0,
    radius: 0.04
  };

  const modIndex = (idx) => ((idx % numItems) + numItems) % numItems;

  const updateSize = () => {
    const w = Math.round(container.clientWidth);
    const h = Math.round(container.clientHeight);
    if (w < 2 || h < 2) {
      isReady = false;
      return false;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, config.dpr);
    if (!isReady || w !== viewWidth || h !== viewHeight || dpr !== currentDpr) {
      isReady = true;
      viewWidth = w;
      viewHeight = h;
      currentDpr = dpr;
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(viewWidth, viewHeight, false);
      resolution.set(viewWidth * currentDpr, viewHeight * currentDpr);
      return true;
    }
    return false;
  };

  const updateCameraAndLayout = () => {
    // Balanced vertical spacing: reserve clean space for lower controls
    const totalBottom = config.controls ? 56 : 0;
    const availableHeight = Math.max(viewHeight - totalBottom, 0.7 * viewHeight);
    const cardAspect = clamp(config.aspect, 0.4, 3.5);
    let cardSize = clamp(config.size, 0.15, 0.95) * availableHeight;
    const dist = clamp(config.distance, 0.9, 12);
    const fovLimit = Math.tan(62 * Math.PI / 180);

    if (viewWidth / cardSize / 2 / dist > fovLimit) {
      cardSize = viewWidth / 2 / dist / fovLimit;
    }

    // Responsive adaptation: preserve large commanding card dimensions on desktop,
    // and adapt card size smoothly on mobile/tablet to maintain comfortable framing
    const maxCardWidth = Math.min(viewWidth * 0.86, availableHeight * cardAspect * 0.92);
    if (cardSize * cardAspect > maxCardWidth) {
      cardSize = maxCardWidth / cardAspect;
    }

    // MANDATORY CARD SPACING: exactly 18px (config.gap = 18)
    const gapNormalized = Math.max(0, config.gap) / cardSize;
    layout.unit = cardSize;
    layout.width = cardAspect;
    layout.pitch = cardAspect + gapNormalized;
    layout.k = clamp(config.curvature, 0, 1) * ARC_ANGLE / layout.pitch;
    layout.distance = dist;
    layout.radius = Math.max(0, config.radius) / cardSize;

    const tiltRad = clamp(config.tilt, -30, 30) * Math.PI / 180;
    camera.fov = 2 * Math.atan(viewHeight / 2 / cardSize / dist) * 180 / Math.PI;
    camera.aspect = viewWidth / viewHeight;
    camera.near = Math.max(0.01, 0.02 * dist);
    camera.far = dist + 200;
    camera.position.set(0, Math.tan(tiltRad) * dist, dist);
    camera.lookAt(0, 0, 0);
    camera.clearViewOffset();
    camera.updateMatrixWorld();

    const topY = projectToScreenY(0, 0.5);
    const bottomY = projectToScreenY(0, -0.5);
    const targetCenterY = totalBottom > 0 ? bottomY + totalBottom : bottomY;
    layout.lift = clamp((topY - (viewHeight - targetCenterY)) / 2, -(0.25 * viewHeight), 0.25 * viewHeight);

    camera.setViewOffset(viewWidth, viewHeight, 0, layout.lift, viewWidth, viewHeight);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };

  const tempVec = new THREE.Vector3();
  const getCylinderPos = (s, y, target) => {
    const k = layout.k;
    if (k > 1e-5) {
      const a = s * k;
      const h = Math.sin(a / 2);
      target.set(Math.sin(a) / k, y, 2 * h * h / k);
    } else {
      target.set(s, y, 0);
    }
    return target;
  };

  const projectToScreenX = (s) => {
    getCylinderPos(s, 0, tempVec).project(camera);
    return tempVec.z > 1 ? NaN : tempVec.x;
  };

  const projectToScreenY = (s, y) => {
    getCylinderPos(s, y, tempVec).project(camera);
    return (1 - tempVec.y) / 2 * viewHeight;
  };

  const isArcVisible = (s) => {
    const k = layout.k;
    if (k <= 1e-5) return true;
    const r = 1 / k;
    return r + (layout.distance - r) * Math.cos(s * k) > 0.02 * r;
  };

  // Raycasting for interaction with cylinder
  const raycaster = new THREE.Raycaster();
  const pointerVec = new THREE.Vector2();

  const screenToCylinder = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    const nx = (clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1;
    const ny = 1 - (clientY - rect.top) / Math.max(rect.height, 1) * 2;
    pointerVec.set(nx, ny);
    raycaster.setFromCamera(pointerVec, camera);

    const origin = raycaster.ray.origin;
    const dir = raycaster.ray.direction;
    const k = layout.k;

    if (k <= 1e-5) {
      if (Math.abs(dir.z) < 1e-6) return null;
      const t = -origin.z / dir.z;
      return t <= 0 ? null : { s: origin.x + t * dir.x, y: origin.y + t * dir.y };
    }

    const r = 1 / k;
    const ox = origin.x;
    const oz = origin.z - r;
    const a = dir.x * dir.x + dir.z * dir.z;
    if (a < 1e-9) return null;

    const b = 2 * (ox * dir.x + oz * dir.z);
    const c = ox * ox + oz * oz - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;

    const t = (-b + Math.sqrt(disc)) / (2 * a);
    if (t <= 0) return null;

    const hitX = origin.x + t * dir.x;
    const hitZ = origin.z + t * dir.z;
    return {
      s: Math.atan2(hitX, r - hitZ) * r,
      y: origin.y + t * dir.y
    };
  };

  const getCardIndexAtPoint = (clientX, clientY) => {
    const hit = screenToCylinder(clientX, clientY);
    if (!hit) return null;
    const idx = Math.round(hit.s / layout.pitch + currentPos);
    if (Math.abs(hit.s - (idx - currentPos) * layout.pitch) > layout.width / 2 || Math.abs(hit.y) > 0.5 || !isArcVisible(hit.s)) {
      return null;
    }
    return idx;
  };

  const requestRender = () => {
    if (!animFrameId && !isDestroyed) {
      animFrameId = requestAnimationFrame(renderLoop);
    }
  };

  // Step carousel by delta panels (+1 / -1)
  const step = (delta) => {
    targetPos = Math.round(targetPos ?? currentPos) + delta;
    requestRender();
  };

  const goTo = (index) => {
    const rounded = Math.round(targetPos ?? currentPos);
    const diff = ((index - modIndex(rounded)) % numItems + numItems + Math.floor(numItems / 2)) % numItems - Math.floor(numItems / 2);
    targetPos = rounded + diff;
    requestRender();
  };

  // Main Render Loop with continuous drift autoplay
  function renderLoop(timestamp) {
    animFrameId = 0;
    if (isDestroyed) return;

    if (!isReady) {
      if (!updateSize()) return;
      updateCameraAndLayout();
    }

    const dt = lastTime && timestamp - lastTime < 100 ? Math.min(Math.max((timestamp - lastTime) / 1000, 0), 0.05) : 1 / 60;
    lastTime = timestamp;

    let needsAnotherPass = false;

    // Autoplay drift handling: smoothly pause on hover, resume on leave
    const isPaused = config.paused || isReducedMotion || pointerState !== null;
    const isHovering = config.pauseOnHover && isPointerOver;
    const isDrifting = config.autoplay === "drift" && !isPaused && !isHovering;
    const targetDrift = isDrifting ? 1 : 0;

    driftFactor += (targetDrift - driftFactor) * (1 - Math.exp(-dt / (targetDrift > driftFactor ? 0.8 : 0.25)));
    if (Math.abs(driftFactor - targetDrift) < 0.001) {
      driftFactor = targetDrift;
    }

    if (pointerState && pointerState.moved) {
      needsAnotherPass = true;
    } else if (targetPos !== null) {
      // Spring settling physics toward targetPos (e.g. from user navigation or drag release)
      const springFreq = isReducedMotion ? 0.08 : 0.85;
      const omega = TWO_PI / Math.max(springFreq, 0.02);
      const substeps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const subDt = dt / substeps;
      let pos = currentPos;
      let vel = velocity;

      for (let i = 0; i < substeps; i++) {
        vel += (omega * omega * (targetPos - pos) - 1.64 * omega * vel) * subDt;
        pos += vel * subDt;
      }
      currentPos = pos;
      velocity = vel;

      if (Math.abs(currentPos - targetPos) < 1e-4 && Math.abs(velocity) < 1e-4) {
        currentPos = targetPos;
        velocity = 0;
        targetPos = null; // Release targetPos so drift resumes smoothly
      }
      needsAnotherPass = true;
    } else {
      // Continuous drift movement + drag inertia decay
      const damping = clamp(config.inertia, 0, 1);
      if (Math.abs(dragVelocity *= Math.exp(-dt / (0.25 + 1.6 * damping))) < 1e-4) {
        dragVelocity = 0;
      }
      const driftVel = config.speed * driftFactor;
      velocity = driftVel + dragVelocity;
      currentPos += velocity * dt;

      if (driftFactor > 0.001 || Math.abs(dragVelocity) > 0.001) {
        needsAnotherPass = true;
      }
    }

    // Seamless cyclic wrapping across all 14 milestones
    if (currentPos >= numItems * 20) {
      currentPos = currentPos % numItems;
      if (targetPos !== null) targetPos = targetPos % numItems;
    } else if (currentPos < 0) {
      currentPos = (currentPos % numItems) + numItems * 20;
      if (targetPos !== null) targetPos = (targetPos % numItems) + numItems * 20;
    }

    const curActive = modIndex(Math.round(currentPos));
    if (curActive !== activeIndex) {
      activeIndex = curActive;
      if (counterCurrentEl) {
        counterCurrentEl.textContent = String(activeIndex + 1).padStart(2, '0');
      }
      if (config.onIndexChange) {
        config.onIndexChange(activeIndex);
      }
    }

    updateSize();
    updateCameraAndLayout();

    const roundedPos = Math.round(currentPos);
    let panelSlot = 0;
    const maxHalf = 14;

    for (let e = -maxHalf; e < maxHalf && panelSlot < 28; e++) {
      const itemIdx = roundedPos + e;
      const s = (itemIdx - currentPos) * layout.pitch;

      if ((layout.k > 1e-5 && Math.abs(s * layout.k) > 0.98 * Math.PI) || !isArcVisible(s)) {
        continue;
      }

      const leftX = projectToScreenX(s - layout.width / 2);
      const rightX = projectToScreenX(s + layout.width / 2);

      if (Number.isNaN(projectToScreenX(s)) || Number.isNaN(leftX) || Number.isNaN(rightX) || Math.max(leftX, rightX) < -1.15 || Math.min(leftX, rightX) > 1.15) {
        continue;
      }

      const panel = panels[panelSlot++];
      const texData = textures[modIndex(itemIdx)];
      let hoverVal = hoverStates.get(itemIdx) || 0;
      const isCardHovered = (hoveredIndex === itemIdx);
      const targetHover = isCardHovered ? 1 : 0;

      if (Math.abs(hoverVal += (targetHover - hoverVal) * (1 - Math.exp(-dt / 0.18)) - targetHover) > 0.001) {
        needsAnotherPass = true;
      } else {
        hoverVal = targetHover;
      }
      hoverStates.set(itemIdx, hoverVal);

      for (const mesh of [panel.mesh, panel.mirror]) {
        const isMirror = (mesh === panel.mirror);
        mesh.visible = !isMirror || config.reflection > 0.001;
        const u = mesh.material.uniforms;
        u.uCenter.value = s;
        u.uWidth.value = layout.width;
        u.uK.value = layout.k;
        u.uRadius.value = layout.radius;
        u.uAlpha.value = 1.0;
        u.uReflect.value = config.reflection;
        u.uDim.value = config.dim;
        u.uHover.value = hoverVal;

        if (texData) {
          u.uImage.value = texData.texture;
          u.uImageAspect.value = texData.aspect;
          u.uLoaded.value = 1.0;
        }
      }
    }

    // Hide unused panels in pool
    for (let i = panelSlot; i < 28; i++) {
      panels[i].mesh.visible = false;
      panels[i].mirror.visible = false;
    }

    // Optional floating captions (only rendered if config.captions is enabled)
    if (config.captions && labelNodes.length > 0) {
      for (let e = -2; e <= 2; e++) {
        const itemIdx = roundedPos + e;
        const nodeObj = labelNodes[(itemIdx % 5 + 5) % 5];
        const s = (itemIdx - currentPos) * layout.pitch;
        let opacity = 0;

        if (isArcVisible(s)) {
          if (nodeObj.index !== itemIdx) {
            nodeObj.index = itemIdx;
            const data = items[modIndex(itemIdx)];
            nodeObj.title.textContent = data ? data.year : '';
            nodeObj.subtitle.textContent = data ? data.tagline : '';
          }

          const distCenter = Math.abs(itemIdx - currentPos);
          const t = clamp((distCenter - 0.45) / 0.4, 0, 1);
          opacity = 1 - t * t * (3 - 2 * t);

          getCylinderPos(s, -0.5, tempVec).project(camera);
          const screenX = (tempVec.x + 1) / 2 * viewWidth;
          const screenY = (1 - tempVec.y) / 2 * viewHeight + layout.labelGap;

          if (Number.isNaN(nodeObj.x) || Math.abs(screenX - nodeObj.x) > 0.05 || Math.abs(screenY - nodeObj.y) > 0.05) {
            nodeObj.x = screenX;
            nodeObj.y = screenY;
            nodeObj.node.style.transform = `translate(${screenX.toFixed(2)}px, ${screenY.toFixed(2)}px) translateX(-50%)`;
          }
        }

        if (Math.abs(opacity - nodeObj.opacity) > 0.002) {
          nodeObj.opacity = opacity;
          nodeObj.node.style.opacity = opacity.toFixed(3);
        }
      }
    }

    renderer.render(scene, camera);

    if (needsAnotherPass || pointerState) {
      requestRender();
    }
  }

  // -------------------------------------------------------------------------
  // Pointer & Drag Interaction (Exact React Bits Pro interaction model)
  // -------------------------------------------------------------------------
  let pointerState = null;
  let hasDragged = false;

  const onPointerDown = (e) => {
    if (!e.isPrimary || e.button > 0 || !config.draggable) return;
    const hit = screenToCylinder(e.clientX, e.clientY);
    pointerState = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      grab: hit ? hit.s : 0,
      origin: currentPos,
      moved: false,
      samples: [{ t: performance.now(), p: currentPos }]
    };
    hasDragged = false;
    requestRender();
  };

  const onPointerMove = (e) => {
    if (e.pointerType !== 'touch' && !pointerState) {
      const hitIdx = getCardIndexAtPoint(e.clientX, e.clientY);
      if (hitIdx !== hoveredIndex) {
        hoveredIndex = hitIdx;
        container.style.cursor = hitIdx !== null ? 'pointer' : (config.draggable ? 'grab' : '');
        requestRender();
      }
    }

    if (pointerState && pointerState.id === e.pointerId) {
      if (!pointerState.moved && Math.hypot(e.clientX - pointerState.x, e.clientY - pointerState.y) > 6) {
        pointerState.moved = true;
        hoveredIndex = null;
        targetPos = null;
        velocity = 0;
        dragVelocity = 0;
        container.style.cursor = 'grabbing';
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }

      if (pointerState.moved) {
        const hit = screenToCylinder(e.clientX, e.clientY);
        if (hit) {
          currentPos = pointerState.origin + (pointerState.grab - hit.s) / layout.pitch;
          const t = performance.now();
          pointerState.samples.push({ t, p: currentPos });
          while (pointerState.samples.length > 2 && t - pointerState.samples[0].t > 110) {
            pointerState.samples.shift();
          }
        }
      }
      requestRender();
    }
  };

  const onPointerUp = (e) => {
    if (!pointerState || pointerState.id !== e.pointerId) return;
    const st = pointerState;
    pointerState = null;

    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (st.moved) {
      hasDragged = true;
      const t = performance.now();
      const recent = st.samples.filter(s => t - s.t < 110);
      let vel = 0;

      if (recent.length > 1 && t - recent[recent.length - 1].t < 60) {
        const dt = Math.max((recent[recent.length - 1].t - recent[0].t) / 1000, 1 / 120);
        vel = (recent[recent.length - 1].p - recent[0].p) / dt;
      }

      vel = isReducedMotion ? 0 : clamp(vel, -14, 14);
      dragVelocity = vel;
      const inertiaFactor = clamp(config.inertia, 0, 1);
      targetPos = config.snap ? Math.round(currentPos + vel * (0.14 + 0.46 * inertiaFactor)) : null;
      container.style.cursor = config.draggable ? 'grab' : '';
    }
    requestRender();
  };

  const onClick = (e) => {
    if (hasDragged) {
      hasDragged = false;
      return;
    }
    const clickedIdx = getCardIndexAtPoint(e.clientX, e.clientY);
    if (clickedIdx !== null) {
      const activeRounded = Math.round(targetPos ?? currentPos);
      if (clickedIdx === activeRounded && Math.abs(currentPos - activeRounded) < 0.2) {
        if (config.onSelect) {
          config.onSelect(items[modIndex(clickedIdx)], modIndex(clickedIdx));
        }
      } else {
        targetPos = clickedIdx;
        requestRender();
      }
    }
  };

  const onPointerLeave = (e) => {
    if (!pointerState || pointerState.id !== e.pointerId) {
      hoveredIndex = null;
      container.style.cursor = '';
      requestRender();
    }
  };

  // Hover detection for pause-on-hover & smooth resumption
  const onContainerMouseEnter = () => {
    isPointerOver = true;
  };

  const onContainerMouseLeave = () => {
    isPointerOver = false;
    requestRender();
  };

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(numItems - 1);
    }
  };

  // Event bindings
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('click', onClick);

  container.addEventListener('pointerenter', onContainerMouseEnter);
  container.addEventListener('pointerleave', onContainerMouseLeave);
  container.addEventListener('keydown', onKeyDown);

  const refreshTextures = () => {
    const curW = viewWidth || window.innerWidth;
    textures.forEach((t, idx) => {
      const milestone = items[idx];
      const newCanvas = createMilestoneCardCanvas(milestone, idx, numItems, curW);
      t.canvas = newCanvas;
      t.texture.image = newCanvas;
      t.texture.needsUpdate = true;
    });
  };

  let currentBreakpoint = (viewWidth || window.innerWidth) < 768 ? 'mobile' : ((viewWidth || window.innerWidth) < 1024 ? 'tablet' : 'desktop');

  const resizeObserver = new ResizeObserver(() => {
    if (updateSize()) {
      const nextBreakpoint = viewWidth < 768 ? 'mobile' : (viewWidth < 1024 ? 'tablet' : 'desktop');
      if (nextBreakpoint !== currentBreakpoint) {
        currentBreakpoint = nextBreakpoint;
        refreshTextures();
      }
      updateCameraAndLayout();
      requestRender();
    }
  });
  resizeObserver.observe(container);

  // Initial draw & start render loop
  updateSize();
  updateCameraAndLayout();
  requestRender();

  // Public controller interface
  return {
    next: () => step(1),
    previous: () => step(-1),
    goTo: (idx) => goTo(idx),
    sync: () => {
      refreshTextures();
      updateSize();
      updateCameraAndLayout();
      requestRender();
    },
    destroy: () => {
      isDestroyed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onClick);
      container.removeEventListener('pointerenter', onContainerMouseEnter);
      container.removeEventListener('pointerleave', onContainerMouseLeave);
      container.removeEventListener('keydown', onKeyDown);

      textures.forEach(t => t.texture.dispose());
      panels.forEach(p => {
        p.mesh.material.dispose();
        p.mirror.material.dispose();
      });
      dummyTex.dispose();
      planeGeom.dispose();
      renderer.dispose();
      canvas.remove();
      if (labelsContainer) labelsContainer.remove();
      if (controlsEl) controlsEl.remove();
    }
  };
}

export default mountConcaveCarousel;

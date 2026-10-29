/**
 * GEO DESIGNS & RESEARCH — WEBGL 3D SCROLLYTELLING ENGINE (LIGHT THEME ARCHITECTURE)
 * 
 * Hubtown-inspired camera rail flight through dynamic architectural infrastructure topography:
 * - Clean Architectural Clay DEM terrain with Blueprint Slate contours (#94A3B8)
 * - Engineering Cobalt (#0284C7) & Precision Teal (#0D9488) highway vector splines
 * - Architectural clay & CAD wireframe volumetric engineering nodes
 * - Continuous background canvas pinned fixed behind frosted glass grounded stages
 * - Interactive Waypoint 05 sector filtering (TPQA, Design, Survey, Geotech)
 * - Automatic Curtain Footer measurement and synchronization
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Application } from '@splinetool/runtime';
import './WebglScrollytelling.css';

let activeWaypointIndex = 0;

export function initWebglScrollytelling() {
  let canvas = document.getElementById('gdr-webgl-canvas');
  const canvasContainer = document.getElementById('webgl-canvas-container');
  if (!canvas && canvasContainer) {
    canvas = document.createElement('canvas');
    canvas.id = 'gdr-webgl-canvas';
    canvas.className = 'gdr-webgl-canvas w-full h-full block';
    canvas.setAttribute('aria-hidden', 'true');
    canvasContainer.appendChild(canvas);
  }
  const track = document.getElementById('hero-stage') || document.getElementById('scroll-stage-track') || document.getElementById('gdr-scrolly-track');
  if (!canvas || !track) return null;

  // Reduced motion preference check
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  // --------------------------------------------------------------------------
  // 1. Scene, Camera, Light-Theme Fog & High-Performance Renderer Setup
  // --------------------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF8FAFC);
  scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0075);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Neutral HDRI Studio Environment for Architectural Glass & Satin Titanium
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const neutralStudioEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = neutralStudioEnv;

  // --------------------------------------------------------------------------
  // 2. High-Contrast Architectural Light-Theme Lighting Rig
  // --------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(40, 80, 30); // Pronounced raking light across the landscape
  scene.add(dirLight);

  const keyLight = new THREE.DirectionalLight(0x0284C7, 0.85);
  keyLight.position.set(-35, 50, 35);
  scene.add(keyLight);

  // Dynamic Camera Beacon Light (Engineering Cobalt #0284C7)
  const beaconLight = new THREE.PointLight(0x0284C7, 1.4, 75);
  scene.add(beaconLight);

  // --------------------------------------------------------------------------
  // 3. Smooth, Non-Intersecting Architectural Flyby Camera Path & Look-At Spline
  // --------------------------------------------------------------------------
  const BRIDGE_DECK_Y = 14.5; // Exact top-of-deck elevation of Waypoint 02 bridge monument
  const BRIDGE_Z = -80.0;     // Z-position of the central bridge pylon

  const flybyCameraPoints = [
    // Waypoint 01: Elevated 3/4 Perspective framing the Foundation Core
    new THREE.Vector3(14.0, 15.0, 70.0),

    // Transition 01 -> 02: Sweeping smoothly toward the bridge approach
    new THREE.Vector3(10.0, 16.5, 30.0),
    new THREE.Vector3(6.0, 17.5, -5.0),

    // Waypoint 02: Infrastructure Bridge (Glide over deck with clear side offset, avoiding cables & pylon)
    new THREE.Vector3(4.5, 17.0, -45.0),
    new THREE.Vector3(3.0, 16.8, -80.0),

    // Transition 02 -> 03: Curved Arc to bypass BIM towers without colliding through them
    new THREE.Vector3(-4.0, 17.5, -115.0),

    // Waypoint 03: Design & BIM Towers (Lateral offset to the right/front, framing towers at X: -10 to -14)
    new THREE.Vector3(0.0, 18.0, -145.0),  // Stays clear of tower bounding box
    new THREE.Vector3(3.5, 18.5, -170.0),  // Smooth wide turn around the building mass

    // Waypoint 04: Testing & Labs (Hovering perspective overlooking the geodetic cluster)
    new THREE.Vector3(8.0, 19.0, -210.0),
    new THREE.Vector3(6.0, 19.0, -230.0),

    // Waypoint 05: Elevated National Horizon Overview (Stays well above floor, never submerges)
    new THREE.Vector3(0.0, 24.0, -290.0),
    new THREE.Vector3(0.0, 22.0, -325.0)  // Terminal point: Elevated, horizontal overview
  ];

  const cameraFlybyCurve = new THREE.CatmullRomCurve3(flybyCameraPoints, false, 'centripetal', 0.5);
  const cameraSpline = cameraFlybyCurve;

  // Camera Target/Look-At Spline (Smoothly leads ahead of the camera across the horizon without snapping)
  const lookAtPoints = [
    new THREE.Vector3(0.0, 2.0, 15.0),      // Looking at Foundation Core
    new THREE.Vector3(-1.0, 10.0, -40.0),   // Looking up at Bridge Pylon
    new THREE.Vector3(-2.0, 12.0, -85.0),   // Crossing Bridge Deck
    new THREE.Vector3(-8.0, 14.0, -145.0),  // Looking directly at BIM Towers from the side
    new THREE.Vector3(0.0, 6.0, -220.0),    // Looking at Testing Labs
    new THREE.Vector3(0.0, 10.0, -360.0),   // Looking across Footprint Horizon
    new THREE.Vector3(0.0, 14.0, -400.0)    // Terminal: Looking up towards distant horizon
  ];

  const cameraLookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, 'centripetal', 0.5);

  // Reusable Terrain Surface Elevation Function
  function getTerrainElevation(x, z) {
    let y = Math.sin(x * 0.032) * Math.cos(z * 0.022) * 9.5
          + Math.sin(x * 0.075 + 1.2) * Math.sin(z * 0.05) * 5.0
          + Math.cos(x * 0.018 - z * 0.016) * 6.5;

    const distFromCorridor = Math.abs(x + Math.sin(z * 0.02) * 26);
    if (distFromCorridor < 42) {
      y *= (distFromCorridor / 42);
    }
    return y - 2.0 - 6.0; // Account for terrain mesh translation
  }

  // --------------------------------------------------------------------------
  // 4. High-Contrast Topographic Architectural Terrain & Isoline Shader
  // --------------------------------------------------------------------------
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'Architectural_Terrain_Group';

  const terrainGeo = new THREE.PlaneGeometry(380, 560, 180, 260);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, -6, -180);

  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    // Multilayer procedural terrain height function with pronounced relief
    let y = Math.sin(x * 0.032) * Math.cos(z * 0.022) * 9.5
          + Math.sin(x * 0.075 + 1.2) * Math.sin(z * 0.05) * 5.0
          + Math.cos(x * 0.018 - z * 0.016) * 6.5;

    // Transport corridor / valley easement
    const distFromCorridor = Math.abs(x + Math.sin(z * 0.02) * 26);
    if (distFromCorridor < 42) {
      y *= (distFromCorridor / 42);
    }

    posAttr.setY(i, y - 2.0);
  }
  terrainGeo.computeVertexNormals();

  // Topographic Architectural Terrain Shader Material (Zero Visible Triangles)
  const terrainShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColorValley: { value: new THREE.Color(0xDCE4EC) },   // Visible cool architectural slate in low points
      uColorPeak:   { value: new THREE.Color(0xFFFFFF) },   // Pure crisp alabaster at ridge heights
      uLineColor:   { value: new THREE.Color(0x64748B) },   // Slate-500 for contour rings
      uLineSpacing: { value: 3.5 },                         // Vertical interval between contour steps
      uLineWidth:   { value: 0.08 },                        // Crisp isoline stroke width
      uLightPos:    { value: new THREE.Vector3(50, 100, 50) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorValley;
      uniform vec3 uColorPeak;
      uniform vec3 uLineColor;
      uniform float uLineSpacing;
      uniform float uLineWidth;
      uniform vec3 uLightPos;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        // 1. Elevation Gradient (maps height to distinct tone difference)
        float heightFactor = clamp((vWorldPosition.y + 15.0) / 35.0, 0.0, 1.0);
        vec3 surfaceColor = mix(uColorValley, uColorPeak, heightFactor);

        // 2. Smooth Topographic Survey Isolines (Zero triangular artifacts)
        float coord = vWorldPosition.y / uLineSpacing;
        float lineDist = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
        float isoline = 1.0 - clamp(lineDist / (uLineWidth * 10.0), 0.0, 1.0);

        // 3. Directional Architectural Raking Light (Casts soft shading into slopes)
        vec3 lightDir = normalize(uLightPos - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.45 + 0.55;

        // Combine Surface + Contours + Shading
        vec3 finalColor = mix(surfaceColor * diffuse, uLineColor, isoline * 0.35);

        // Atmospheric Edge Dissolve into horizon
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = clamp((depth - 60.0) / 120.0, 0.0, 0.85);
        finalColor = mix(finalColor, vec3(1.0), fogFactor);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: false
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainShaderMaterial);
  terrainMesh.material.needsUpdate = true;
  terrainGroup.add(terrainMesh);

  scene.add(terrainGroup);

  // --------------------------------------------------------------------------
  // 5. Road Pipe Mesh Removed (Unobstructed Topographic Terrain Contours)
  // --------------------------------------------------------------------------
  let roadTubeMesh = null;
  if (roadTubeMesh) {
    scene.remove(roadTubeMesh);
    if (roadTubeMesh.geometry) roadTubeMesh.geometry.dispose();
    if (roadTubeMesh.material) roadTubeMesh.material.dispose();
    roadTubeMesh = null;
  }

  // --------------------------------------------------------------------------
  // 6. Volumetric Structural Engineering Nodes (Clay + CAD Vectors)
  // --------------------------------------------------------------------------

  // NODE 1 (Waypoint 01): Multidisciplinary Architectural 3D Core ("Engineering_Core")
  const coreNodeGroup = new THREE.Group();
  coreNodeGroup.name = 'Engineering_Core';
  coreNodeGroup.position.set(0, 5.2, 0);

  // 1A. Outer Kinetic Cage: Geodesic Icosahedron Space-Frame Truss in Deep Gunmetal / Dark Titanium (#0F172A / #1E293B)
  const outerKineticCage = new THREE.Group();
  outerKineticCage.name = 'Outer_Kinetic_Cage';

  const titaniumStrutMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    emissive: 0x0F172A,
    emissiveIntensity: 0.15,
    roughness: 0.35,
    metalness: 0.85,
    envMapIntensity: 0.3
  });

  const cageTemplateGeo = new THREE.IcosahedronGeometry(3.6, 1);
  const cageEdgesGeo = new THREE.EdgesGeometry(cageTemplateGeo, 1);
  const edgePositions = cageEdgesGeo.attributes.position;
  const strutUp = new THREE.Vector3(0, 1, 0);
  const uniqueVertexKeys = new Set();

  for (let i = 0; i < edgePositions.count; i += 2) {
    const vStart = new THREE.Vector3().fromBufferAttribute(edgePositions, i);
    const vEnd = new THREE.Vector3().fromBufferAttribute(edgePositions, i + 1);
    const dir = new THREE.Vector3().subVectors(vEnd, vStart);
    const len = dir.length();

    const strutGeo = new THREE.CylinderGeometry(0.075, 0.075, len, 8);
    const strutMesh = new THREE.Mesh(strutGeo, titaniumStrutMat);
    strutMesh.position.copy(vStart).add(vEnd).multiplyScalar(0.5);
    strutMesh.quaternion.setFromUnitVectors(strutUp, dir.normalize());
    outerKineticCage.add(strutMesh);

    [vStart, vEnd].forEach((v) => {
      const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      if (!uniqueVertexKeys.has(key)) {
        uniqueVertexKeys.add(key);
        const jointMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), titaniumStrutMat);
        jointMesh.position.copy(v);
        outerKineticCage.add(jointMesh);
      }
    });
  }
  coreNodeGroup.add(outerKineticCage);

  // 1B. Internal Core Anchor: Rich High-Density Sapphire / Cobalt Blue (#0284C7 / #0369A1) Faceted Crystal
  const internalCoreAnchor = new THREE.Group();
  internalCoreAnchor.name = 'Internal_Core_Anchor';

  const coreInnerGeo = new THREE.IcosahedronGeometry(2.15, 0);
  const coreGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284C7,
    transmission: 0.65,
    opacity: 0.88,
    transparent: true,
    roughness: 0.15,
    metalness: 0.12,
    ior: 1.52,
    thickness: 2.8,
    attenuationColor: new THREE.Color(0x0369A1),
    attenuationDistance: 1.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.45,
    flatShading: true
  });
  const coreInnerMesh = new THREE.Mesh(coreInnerGeo, coreGlassMat);
  internalCoreAnchor.add(coreInnerMesh);

  // Inner Deep Sapphire Nucleus & High-Contrast Facet Edges
  const coreNucleusMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.15, 0),
    new THREE.MeshStandardMaterial({
      color: 0x0369A1,
      emissive: 0x0284C7,
      emissiveIntensity: 0.45,
      roughness: 0.18,
      metalness: 0.75,
      envMapIntensity: 0.4,
      flatShading: true
    })
  );
  internalCoreAnchor.add(coreNucleusMesh);

  const coreFacetLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreInnerGeo),
    new THREE.LineBasicMaterial({
      color: 0x0369A1,
      transparent: true,
      opacity: 0.95
    })
  );
  internalCoreAnchor.add(coreFacetLines);
  coreNodeGroup.add(internalCoreAnchor);

  // 1C. CAD Orbit Rings: Bold Architectural Vector Datum Lines (#0284C7, 100% Opacity, 1.5x Tube Radius)
  const datumRingsGroup = new THREE.Group();
  datumRingsGroup.name = 'CAD_Orbit_Rings';

  const datumRingMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x0284C7,
    emissiveIntensity: 0.28,
    roughness: 0.25,
    metalness: 0.5,
    envMapIntensity: 0.35,
    transparent: false,
    opacity: 1.0
  });

  // Primary Datum Ring (Tilted X: 25°, Z: -15°, 1.5x+ thickness: 0.068)
  const ringGimbalA = new THREE.Group();
  ringGimbalA.rotation.x = THREE.MathUtils.degToRad(25);
  ringGimbalA.rotation.z = THREE.MathUtils.degToRad(-15);
  const ringGeo = new THREE.TorusGeometry(5.0, 0.068, 16, 100);
  const ringMesh = new THREE.Mesh(ringGeo, datumRingMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringGimbalA.add(ringMesh);

  // Waypoint Nodes along Primary Datum Ring
  for (let n = 0; n < 4; n++) {
    const angle = (n * Math.PI) / 2;
    const nodeDot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), datumRingMat);
    nodeDot.position.set(Math.cos(angle) * 5.0, 0, Math.sin(angle) * 5.0);
    ringGimbalA.add(nodeDot);
  }
  datumRingsGroup.add(ringGimbalA);

  // Secondary Concentric LiDAR Scan Plane Ring (Counter-tilted, 1.5x+ thickness: 0.052)
  const ringGimbalB = new THREE.Group();
  ringGimbalB.rotation.x = THREE.MathUtils.degToRad(-25);
  ringGimbalB.rotation.z = THREE.MathUtils.degToRad(15);
  const ringGeoB = new THREE.TorusGeometry(5.65, 0.052, 16, 100);
  const ringMeshB = new THREE.Mesh(ringGeoB, datumRingMat);
  ringMeshB.rotation.x = Math.PI / 2;
  ringGimbalB.add(ringMeshB);

  for (let n = 0; n < 6; n++) {
    const angle = (n * Math.PI) / 3;
    const nodeDot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), datumRingMat);
    nodeDot.position.set(Math.cos(angle) * 5.65, 0, Math.sin(angle) * 5.65);
    ringGimbalB.add(nodeDot);
  }
  datumRingsGroup.add(ringGimbalB);

  coreNodeGroup.add(datumRingsGroup);
  scene.add(coreNodeGroup);

  // Cursor Proximity / Magnetic Tilt + Interactive Drag-to-Rotate, Spring Return & Hover Dynamics
  const corePointerState = {
    targetTiltX: 0,
    targetTiltZ: 0,
    currentTiltX: 0,
    currentTiltZ: 0,
    targetRingScale: 1.0,
    currentRingScale: 1.0,
    targetScale: 1.0,
    currentScale: 1.0,
    targetRingEmissive: 0.28,
    currentRingEmissive: 0.28
  };
  const MAX_MAGNETIC_TILT_RAD = THREE.MathUtils.degToRad(5);

  // Interactive Drag & Elastic Spring Return State
  const interactiveCanvas = document.getElementById('spline-hero-core') || renderer.domElement;
  const baseRotation = { x: 0, y: 0, z: 0 };
  const baseScale = { x: 1, y: 1, z: 1 };
  const dragRotation = { x: 0, y: 0 };
  let isDragging = false;
  let isScrollActive = false;
  let scrollIdleTimer = null;
  let previousMousePosition = { x: 0, y: 0 };
  let dragVelocity = { x: 0, y: 0 };
  let springTween = null;

  // Native GSAP-equivalent elastic.out(1, 0.45) easing function
  function easeElasticOut(t, amplitude = 1, period = 0.45) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / Math.max(1, amplitude));
    return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
  }

  if (interactiveCanvas && coreNodeGroup) {
    interactiveCanvas.style.cursor = 'grab';

    // --- 1. HOVER EFFECTS ---
    interactiveCanvas.addEventListener('mouseenter', () => {
      if (isDragging || activeWaypointIndex !== 0) return;
      corePointerState.targetScale = baseScale.x * 1.06;
      corePointerState.targetRingEmissive = 0.65;
      corePointerState.targetRingScale = 1.06;

      if (window.gsap) {
        window.gsap.to(coreNodeGroup.scale, {
          x: baseScale.x * 1.06,
          y: baseScale.y * 1.06,
          z: baseScale.z * 1.06,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    interactiveCanvas.addEventListener('mouseleave', () => {
      if (isDragging) return;
      interactiveCanvas.style.cursor = 'grab';
      corePointerState.targetScale = baseScale.x;
      corePointerState.targetRingEmissive = 0.28;
      corePointerState.targetRingScale = 1.0;

      if (window.gsap) {
        window.gsap.to(coreNodeGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });

    // --- 2. DRAG START ---
    const onPointerDown = (e) => {
      if (isScrollActive || !e || activeWaypointIndex !== 0) return;
      isDragging = true;
      interactiveCanvas.style.cursor = 'grabbing';
      corePointerState.targetScale = baseScale.x * 1.06;
      corePointerState.targetRingEmissive = 0.75;

      // Kill any active return tween so drag begins instantly
      if (springTween) {
        if (typeof springTween.kill === 'function') springTween.kill();
        springTween = null;
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // --- 3. DRAG MOVE (ROTATIONAL ORBIT) ---
    const onPointerMove = (e) => {
      if (!e) return;

      if (!isDragging) {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        const dist = Math.hypot(nx, ny);
        corePointerState.targetTiltZ = -nx * MAX_MAGNETIC_TILT_RAD;
        corePointerState.targetTiltX = ny * MAX_MAGNETIC_TILT_RAD;
        if (dist < 0.75) {
          corePointerState.targetRingScale = 1.06;
        }
        return;
      }

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      dragVelocity = { x: deltaX, y: deltaY };

      // Sensitivity factor for natural feel
      const rotationSensitivity = 0.006;

      dragRotation.y += deltaX * rotationSensitivity;
      dragRotation.x += deltaY * rotationSensitivity;

      // Constrain pitch to avoid disorientation
      dragRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, dragRotation.x));

      if (splineCoreObject) {
        splineCoreObject.rotation.y += deltaX * rotationSensitivity;
        splineCoreObject.rotation.x = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, splineCoreObject.rotation.x + deltaY * rotationSensitivity)
        );
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // --- 4. SPRING-BACK RETURN ON RELEASE ---
    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      interactiveCanvas.style.cursor = 'grab';
      corePointerState.targetScale = baseScale.x;
      corePointerState.targetRingEmissive = 0.28;

      if (window.gsap) {
        springTween = window.gsap.to(dragRotation, {
          x: baseRotation.x,
          y: baseRotation.y,
          duration: 1.4,
          ease: 'elastic.out(1, 0.45)',
          onComplete: () => {
            springTween = null;
          }
        });

        window.gsap.to(coreNodeGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.4,
          ease: 'power2.out'
        });
      } else {
        // Native 1.4s elastic.out(1, 0.45) spring tween
        springTween = {
          startX: dragRotation.x,
          startY: dragRotation.y,
          startTime: performance.now(),
          durationMs: 1400,
          kill() {
            springTween = null;
          }
        };
      }
    };

    // Bind mouse & touch events
    interactiveCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    // Touch support
    interactiveCanvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // --- 5. SCROLL SYNCHRONIZATION OVERRIDE ---
    window.addEventListener('scroll', () => {
      isScrollActive = true;
      if (isDragging) {
        onPointerUp(); // Cancel drag immediately if user scrolls
      }
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        isScrollActive = false;
      }, 140);
    }, { passive: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-stage',
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive && isDragging) {
            onPointerUp();
          }
        }
      });
    }
  }

  // Optional Spline Runtime Integration for #waypoint-01-3d-target
  let splineApp = null;
  let splineCoreObject = null;
  const waypoint01Anchor = document.querySelector('#waypoint-01-3d-target');
  const configuredSplineScene = (waypoint01Anchor && waypoint01Anchor.getAttribute('data-spline-scene')) || window.GDR_SPLINE_CORE_SCENE;

  function mountSplineCoreScene(sceneUrl) {
    if (!waypoint01Anchor || !sceneUrl) return;
    waypoint01Anchor.innerHTML = '<canvas id="spline-hero-core" class="w-full h-full block"></canvas>';
    const splineCanvas = document.getElementById('spline-hero-core');
    if (!splineCanvas) return;

    splineApp = new Application(splineCanvas);
    splineApp.load(sceneUrl)
      .then(() => {
        splineCoreObject = splineApp.findObjectByName('Engineering_Core');
        coreNodeGroup.visible = false;
        console.log('Spline Architectural Core initialized successfully at Waypoint 01.');
      })
      .catch((err) => {
        coreNodeGroup.visible = true;
        console.error('Failed to load Spline core:', err);
      });
  }

  if (configuredSplineScene) {
    mountSplineCoreScene(configuredSplineScene);
  }
  window.loadWaypoint01SplineScene = mountSplineCoreScene;

  // --------------------------------------------------------------------------
  // NODE 2 (Waypoint 02): Architectural Cable-Stayed Bridge & Flyover Viaduct Monument ("Bridge_Pylon_Group")
  // Synchronized with BRIDGE_DECK_Y = 14.5 & BRIDGE_Z = -80.0
  // --------------------------------------------------------------------------
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'Bridge_Pylon_Group';
  bridgeGroup.position.set(-4.5, 0, BRIDGE_Z);
  bridgeGroup.rotation.y = 0; // Positioned on left-center with clear side offset from flyby camera

  // 2A. Light Architectural CAD Palette Materials
  // Smooth architectural cast concrete / fair-faced limestone (Roughness: 0.65, Metalness: 0.05, #E2E8F0 to #CBD5E1)
  const concretePylonMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    roughness: 0.65,
    metalness: 0.05,
    envMapIntensity: 0.35
  });
  const concretePierMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    roughness: 0.65,
    metalness: 0.05,
    envMapIntensity: 0.3
  });
  const chamferEdgeMat = new THREE.LineBasicMaterial({
    color: 0x64748B,
    transparent: true,
    opacity: 0.42
  });

  // Matte dark asphalt slate roadway (#1E293B, Roughness: 0.8)
  const asphaltDeckMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.8,
    metalness: 0.05,
    envMapIntensity: 0.2
  });
  const bearingPedestalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.4
  });

  // High-tensile structural steel stay cables (Metalness: 0.9, Roughness: 0.2, #64748B)
  const stayCableMat = new THREE.MeshStandardMaterial({
    color: 0x64748B,
    emissive: 0x0284C7,
    emissiveIntensity: 0.08,
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 0.55
  });

  // Precision Cobalt Blue #0284C7 anodized cable anchor nodes, saddle caps & centerline
  const cobaltAccentMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x0284C7,
    emissiveIntensity: 0.32,
    roughness: 0.22,
    metalness: 0.75,
    envMapIntensity: 0.45
  });

  // Helper to attach crisp beveled architectural edge creases (no triangle diagonals)
  function addBevelEdges(mesh, geo, thresholdAngle = 25) {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, thresholdAngle),
      chamferEdgeMat
    );
    mesh.add(edges);
  }

  // 2B. Central Pylon (A-Frame / Diamond Tower with Beveled Chamfers, Deck at Y = 14.5)
  const pylonTowerGroup = new THREE.Group();
  pylonTowerGroup.name = 'Central_Diamond_Pylon';

  // Stepped Octagonal Pile Cap Foundation Plinth
  const pileCapGeo = new THREE.CylinderGeometry(7.6, 8.4, 1.5, 8);
  const pileCapMesh = new THREE.Mesh(pileCapGeo, concretePierMat);
  pileCapMesh.position.set(0, 0.75, 0);
  addBevelEdges(pileCapMesh, pileCapGeo);
  pylonTowerGroup.add(pileCapMesh);

  // Lower Diamond Tower Legs (Foundation to Deck Cross-Beam at Y = 12.1)
  const lowerLegGeo = new THREE.CylinderGeometry(1.18, 1.55, 11.8, 8);
  [-1, 1].forEach((side) => {
    const lowerLeg = new THREE.Mesh(lowerLegGeo, concretePierMat);
    lowerLeg.position.set(side * 5.2, 6.3, 0);
    lowerLeg.rotation.z = side * 0.08;
    addBevelEdges(lowerLeg, lowerLegGeo);
    pylonTowerGroup.add(lowerLeg);
  });

  // Main Post-Tensioned Transverse Cross-Beam (Supporting Viaduct Deck at Y = 14.5)
  const crossBeamGeo = new THREE.BoxGeometry(13.8, 1.4, 3.4);
  const crossBeamMesh = new THREE.Mesh(crossBeamGeo, concretePierMat);
  crossBeamMesh.position.set(0, BRIDGE_DECK_Y - 2.4, 0);
  addBevelEdges(crossBeamMesh, crossBeamGeo);
  pylonTowerGroup.add(crossBeamMesh);

  // Elastomeric Bearing Pedestals on Main Cross-Beam
  [-2.6, 2.6].forEach((bx) => {
    const bearingGeo = new THREE.BoxGeometry(1.3, 0.36, 1.8);
    const bearingMesh = new THREE.Mesh(bearingGeo, bearingPedestalMat);
    bearingMesh.position.set(bx, BRIDGE_DECK_Y - 1.55, 0);
    pylonTowerGroup.add(bearingMesh);
  });

  // Upper Converging A-Frame Tapered Concrete Pylon Legs (Rising above Y = 14.5 Deck)
  const upperLegHeight = 34.0;
  const upperLegGeo = new THREE.CylinderGeometry(0.64, 1.25, upperLegHeight, 8);
  [-1, 1].forEach((side) => {
    const upperLeg = new THREE.Mesh(upperLegGeo, concretePylonMat);
    upperLeg.position.set(side * 3.15, BRIDGE_DECK_Y + 14.2, 0);
    upperLeg.rotation.z = side * 0.15; // Converges inward toward saddle apex
    addBevelEdges(upperLeg, upperLegGeo);
    pylonTowerGroup.add(upperLeg);
  });

  // Upper Portal Strut / Cross-Tie Beam (High enough above deck for unobstructed camera drive-through)
  const upperStrutGeo = new THREE.BoxGeometry(4.6, 1.1, 2.1);
  const upperStrutMesh = new THREE.Mesh(upperStrutGeo, concretePierMat);
  upperStrutMesh.position.set(0, BRIDGE_DECK_Y + 19.5, 0);
  addBevelEdges(upperStrutMesh, upperStrutGeo);
  pylonTowerGroup.add(upperStrutMesh);

  // Pylon Saddle Head & Cobalt Anodized Crown
  const saddleBoxGeo = new THREE.BoxGeometry(2.35, 6.8, 2.65);
  const saddleBoxMesh = new THREE.Mesh(saddleBoxGeo, concretePylonMat);
  saddleBoxMesh.position.set(0, BRIDGE_DECK_Y + 30.2, 0);
  addBevelEdges(saddleBoxMesh, saddleBoxGeo);
  pylonTowerGroup.add(saddleBoxMesh);

  const saddleCapGeo = new THREE.BoxGeometry(2.6, 0.75, 2.9);
  const saddleCapMesh = new THREE.Mesh(saddleCapGeo, cobaltAccentMat);
  saddleCapMesh.position.set(0, BRIDGE_DECK_Y + 33.9, 0);
  pylonTowerGroup.add(saddleCapMesh);

  // Twin Cobalt Anodized Saddle Side Strips
  [-1.22, 1.22].forEach((sx) => {
    const stripGeo = new THREE.BoxGeometry(0.14, 5.6, 2.7);
    const stripMesh = new THREE.Mesh(stripGeo, cobaltAccentMat);
    stripMesh.position.set(sx, BRIDGE_DECK_Y + 30.0, 0);
    pylonTowerGroup.add(stripMesh);
  });

  bridgeGroup.add(pylonTowerGroup);

  // 2C. Segmental Viaduct Box-Girder Deck & Approach Pier Caps (Flush at Y = BRIDGE_DECK_Y = 14.5)
  const viaductDeckGroup = new THREE.Group();
  viaductDeckGroup.name = 'Segmental_Viaduct_Deck';
  // Main flat cable-stayed deck span covers Z = BRIDGE_Z + 18 (-62) to BRIDGE_Z - 26 (-106)
  const deckSpanLength = 44;
  const deckCenterZ = -4.0;

  // Precast Segmental Box-Girder Soffit Spine
  const soffitGeo = new THREE.BoxGeometry(6.2, 1.15, deckSpanLength);
  const soffitMesh = new THREE.Mesh(soffitGeo, concretePierMat);
  soffitMesh.position.set(0, BRIDGE_DECK_Y - 1.05, deckCenterZ);
  addBevelEdges(soffitMesh, soffitGeo);
  viaductDeckGroup.add(soffitMesh);

  // Cantilevered Upper Deck Wings
  const wingSlabGeo = new THREE.BoxGeometry(9.2, 0.42, deckSpanLength);
  const wingSlabMesh = new THREE.Mesh(wingSlabGeo, concretePylonMat);
  wingSlabMesh.position.set(0, BRIDGE_DECK_Y - 0.35, deckCenterZ);
  addBevelEdges(wingSlabMesh, wingSlabGeo);
  viaductDeckGroup.add(wingSlabMesh);

  // Transverse Segmental Match-Cast Ribs along Soffit
  for (let sz = -24; sz <= 16; sz += 5) {
    const ribGeo = new THREE.BoxGeometry(8.6, 0.32, 0.28);
    const ribMesh = new THREE.Mesh(ribGeo, concretePierMat);
    ribMesh.position.set(0, BRIDGE_DECK_Y - 0.68, sz);
    viaductDeckGroup.add(ribMesh);
  }

  // Matte Dark Asphalt Slate Roadway Surface (#1E293B, Roughness: 0.8, Top at exact BRIDGE_DECK_Y = 14.5)
  const roadwayGeo = new THREE.BoxGeometry(7.8, 0.16, deckSpanLength);
  const roadwayMesh = new THREE.Mesh(roadwayGeo, asphaltDeckMat);
  roadwayMesh.position.set(0, BRIDGE_DECK_Y - 0.08, deckCenterZ);
  viaductDeckGroup.add(roadwayMesh);

  // Clean Cobalt Blue Centerline Stroke (#0284C7) + Edge Parapets
  const centerlineGeo = new THREE.BoxGeometry(0.24, 0.06, deckSpanLength);
  const centerlineMesh = new THREE.Mesh(centerlineGeo, cobaltAccentMat);
  centerlineMesh.position.set(0, BRIDGE_DECK_Y + 0.03, deckCenterZ);
  viaductDeckGroup.add(centerlineMesh);

  [-4.35, 4.35].forEach((px) => {
    const parapetGeo = new THREE.BoxGeometry(0.42, 0.65, deckSpanLength);
    const parapetMesh = new THREE.Mesh(parapetGeo, concretePylonMat);
    parapetMesh.position.set(px, BRIDGE_DECK_Y + 0.18, deckCenterZ);
    addBevelEdges(parapetMesh, parapetGeo);
    viaductDeckGroup.add(parapetMesh);
  });

  // Flanking Tapered Structural Pier Shafts, Hammerhead Pier Caps & Elastomeric Bearings
  [-22, 15].forEach((pz) => {
    const pierShaftGeo = new THREE.CylinderGeometry(0.95, 1.38, 12.0, 8);
    const pierShaft = new THREE.Mesh(pierShaftGeo, concretePierMat);
    pierShaft.position.set(0, 6.0, pz);
    addBevelEdges(pierShaft, pierShaftGeo);
    viaductDeckGroup.add(pierShaft);

    const pierCapGeo = new THREE.BoxGeometry(7.4, 0.95, 2.2);
    const pierCap = new THREE.Mesh(pierCapGeo, concretePylonMat);
    pierCap.position.set(0, BRIDGE_DECK_Y - 2.35, pz);
    addBevelEdges(pierCap, pierCapGeo);
    viaductDeckGroup.add(pierCap);

    [-2.1, 2.1].forEach((bx) => {
      const pedGeo = new THREE.BoxGeometry(1.1, 0.32, 1.3);
      const pedMesh = new THREE.Mesh(pedGeo, bearingPedestalMat);
      pedMesh.position.set(bx, BRIDGE_DECK_Y - 1.72, pz);
      viaductDeckGroup.add(pedMesh);
    });
  });

  bridgeGroup.add(viaductDeckGroup);

  // 2D. Stay-Cable Arrays (Dual-Plane Semi-Harp Fan System) & Cobalt Anchor Nodes
  const stayCablesGroup = new THREE.Group();
  stayCablesGroup.name = 'Stay_Cable_Arrays';
  const cableUpVec = new THREE.Vector3(0, 1, 0);
  const cableAnchorNodes = [];

  [-1, 1].forEach((planeSide) => {
    const deckAnchorX = planeSide * 4.35;
    const saddleAnchorX = planeSide * 1.18;

    [-1, 1].forEach((spanDir) => {
      for (let i = 0; i < 6; i++) {
        const saddleY = BRIDGE_DECK_Y + 21.5 + i * 1.7;
        const saddleZ = spanDir * (0.4 + i * 0.12);
        const deckZ = spanDir === 1
          ? (4.0 + i * 2.2)   // Fore span (up to +15)
          : (-4.5 - i * 3.5); // Aft span (down to -22)
        const deckY = BRIDGE_DECK_Y + 0.22;

        const vStart = new THREE.Vector3(saddleAnchorX, saddleY, saddleZ);
        const vEnd = new THREE.Vector3(deckAnchorX, deckY, deckZ);
        const cableVec = new THREE.Vector3().subVectors(vEnd, vStart);
        const cableLen = cableVec.length();

        // High-tensile cylindrical stay cable
        const cableGeo = new THREE.CylinderGeometry(0.042, 0.042, cableLen, 6);
        const cableMesh = new THREE.Mesh(cableGeo, stayCableMat);
        cableMesh.position.copy(vStart).add(vEnd).multiplyScalar(0.5);
        cableMesh.quaternion.setFromUnitVectors(cableUpVec, cableVec.clone().normalize());
        stayCablesGroup.add(cableMesh);

        // Precision Cobalt Blue #0284C7 Anodized Deck Anchor Cap
        const deckAnchorGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.48, 8);
        const deckAnchor = new THREE.Mesh(deckAnchorGeo, cobaltAccentMat);
        deckAnchor.position.copy(vEnd);
        deckAnchor.quaternion.setFromUnitVectors(cableUpVec, cableVec.clone().normalize());
        stayCablesGroup.add(deckAnchor);
        cableAnchorNodes.push(deckAnchor);

        // Precision Cobalt Blue #0284C7 Saddle Socket Node
        const saddleNode = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), cobaltAccentMat);
        saddleNode.position.copy(vStart);
        stayCablesGroup.add(saddleNode);
      }
    });
  });

  bridgeGroup.add(stayCablesGroup);

  // 2E. CAD Construction Datum / Alignment Ring (Grounding Tower into Topographic Terrain)
  const bridgeDatumGroup = new THREE.Group();
  bridgeDatumGroup.name = 'CAD_Construction_Datum';
  bridgeDatumGroup.position.set(0, 0.35, 0);

  const bridgeDatumMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x0284C7,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.6
  });

  // Outer & Inner Coordinate Datum Rings
  const outerDatumGeo = new THREE.TorusGeometry(11.5, 0.08, 12, 72);
  const outerDatumMesh = new THREE.Mesh(outerDatumGeo, bridgeDatumMat);
  outerDatumMesh.rotation.x = Math.PI / 2;
  bridgeDatumGroup.add(outerDatumMesh);

  const innerDatumGeo = new THREE.TorusGeometry(9.2, 0.055, 10, 64);
  const innerDatumMesh = new THREE.Mesh(innerDatumGeo, bridgeDatumMat);
  innerDatumMesh.rotation.x = Math.PI / 2;
  bridgeDatumGroup.add(innerDatumMesh);

  // Coordinate Crosshair Ticks & Survey Nodes
  for (let d = 0; d < 8; d++) {
    const angle = (d * Math.PI) / 4;
    const tickGeo = new THREE.BoxGeometry(0.14, 0.08, 1.8);
    const tickMesh = new THREE.Mesh(tickGeo, bridgeDatumMat);
    tickMesh.position.set(Math.cos(angle) * 11.5, 0, Math.sin(angle) * 11.5);
    tickMesh.rotation.y = -angle;
    bridgeDatumGroup.add(tickMesh);
  }

  bridgeGroup.add(bridgeDatumGroup);
  scene.add(bridgeGroup);

  // --------------------------------------------------------------------------
  // Waypoint 02 Spline Runtime Container & Interactive Drag-to-Rotate / Spring Return Controller
  // --------------------------------------------------------------------------
  const bridgeInteractionState = {
    baseRotation: { x: bridgeGroup.rotation.x, y: bridgeGroup.rotation.y, z: bridgeGroup.rotation.z },
    baseScale: { x: bridgeGroup.scale.x, y: bridgeGroup.scale.y, z: bridgeGroup.scale.z },
    targetScale: 1.0,
    currentScale: 1.0,
    targetCableEmissive: 0.08,
    currentCableEmissive: 0.08,
    isDragging: false,
    springTween: null
  };

  function initBridgeInteractions(targetCanvas, splineBridgeApp) {
    const bridgeModel = (splineBridgeApp && typeof splineBridgeApp.findObjectByName === 'function')
      ? (splineBridgeApp.findObjectByName('Bridge_Pylon_Group') || bridgeGroup)
      : bridgeGroup;
    if (!bridgeModel || !targetCanvas) return;

    const baseRotation = { x: bridgeModel.rotation.x, y: bridgeModel.rotation.y, z: bridgeModel.rotation.z };
    const baseScale = { x: bridgeModel.scale.x, y: bridgeModel.scale.y, z: bridgeModel.scale.z };

    let isBridgeDragging = false;
    let prevPos = { x: 0, y: 0 };
    let bridgeSpringTween = null;

    targetCanvas.style.cursor = 'grab';

    const isWaypoint02Active = () => activeWaypointIndex === 1 || targetCanvas.id === 'spline-infrastructure-bridge';

    // Hover Dynamics (1.04x Scale + Stay-Cable Cobalt Highlight Intensification)
    targetCanvas.addEventListener('mouseenter', () => {
      if (isBridgeDragging || !isWaypoint02Active()) return;
      bridgeInteractionState.targetScale = 1.04;
      bridgeInteractionState.targetCableEmissive = 0.42;

      if (window.gsap) {
        window.gsap.to(bridgeModel.scale, {
          x: baseScale.x * 1.04,
          y: baseScale.y * 1.04,
          z: baseScale.z * 1.04,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    targetCanvas.addEventListener('mouseleave', () => {
      if (isBridgeDragging) return;
      targetCanvas.style.cursor = 'grab';
      bridgeInteractionState.targetScale = 1.0;
      bridgeInteractionState.targetCableEmissive = 0.08;

      if (window.gsap) {
        window.gsap.to(bridgeModel.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    // Pointer Down (Drag Start)
    const onPointerDown = (e) => {
      if (isScrollActive || !e || !isWaypoint02Active()) return;
      isBridgeDragging = true;
      bridgeInteractionState.isDragging = true;
      targetCanvas.style.cursor = 'grabbing';
      bridgeInteractionState.targetScale = 1.04;
      bridgeInteractionState.targetCableEmissive = 0.52;

      if (bridgeSpringTween) {
        if (typeof bridgeSpringTween.kill === 'function') bridgeSpringTween.kill();
        bridgeSpringTween = null;
      }
      bridgeInteractionState.springTween = null;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Move (Rotational Inspection with Pitch Constraints)
    const onPointerMove = (e) => {
      if (!isBridgeDragging || !e) return;
      const deltaX = e.clientX - prevPos.x;
      const deltaY = e.clientY - prevPos.y;

      const sensitivity = 0.005;
      bridgeModel.rotation.y += deltaX * sensitivity;
      bridgeModel.rotation.x += deltaY * sensitivity;

      // Pitch constraints to preserve architectural horizon
      bridgeModel.rotation.x = Math.max(-0.4, Math.min(0.4, bridgeModel.rotation.x));

      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Up (Elastic Return to Canonical Rest: duration 1.3s, elastic.out(1, 0.5))
    const onPointerUp = () => {
      if (!isBridgeDragging) return;
      isBridgeDragging = false;
      bridgeInteractionState.isDragging = false;
      targetCanvas.style.cursor = 'grab';
      bridgeInteractionState.targetScale = 1.0;
      bridgeInteractionState.targetCableEmissive = 0.08;

      if (window.gsap) {
        bridgeSpringTween = window.gsap.to(bridgeModel.rotation, {
          x: baseRotation.x,
          y: baseRotation.y,
          z: baseRotation.z,
          duration: 1.3,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => { bridgeSpringTween = null; }
        });

        window.gsap.to(bridgeModel.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.35,
          ease: 'power2.out'
        });
      } else {
        bridgeInteractionState.springTween = {
          model: bridgeModel,
          startX: bridgeModel.rotation.x,
          startY: bridgeModel.rotation.y,
          startZ: bridgeModel.rotation.z,
          targetX: baseRotation.x,
          targetY: baseRotation.y,
          targetZ: baseRotation.z,
          startTime: performance.now(),
          durationMs: 1300
        };
      }
    };

    targetCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    // Touch Support
    targetCanvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Scroll Sync: Disengage manual drag if user scrolls through waypoint
    window.addEventListener('scroll', () => {
      if (isBridgeDragging) onPointerUp();
    }, { passive: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-scrollytelling, #hero-stage',
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive && isBridgeDragging) onPointerUp();
        }
      });
    }
  }

  // Bind Bridge Interactions to primary interactive canvas
  initBridgeInteractions(interactiveCanvas, null);

  // Target Waypoint 02 Bridge Container (#waypoint-02-3d-target) for optional external Spline scene
  const bridgeAnchor = document.querySelector('#waypoint-02-3d-target');
  const configuredSplineBridgeScene = (bridgeAnchor && bridgeAnchor.getAttribute('data-spline-scene')) || window.GDR_SPLINE_BRIDGE_SCENE;

  function mountSplineBridgeScene(sceneUrl) {
    if (!bridgeAnchor || !sceneUrl) return;
    bridgeAnchor.innerHTML = '<canvas id="spline-infrastructure-bridge" class="w-full h-full block"></canvas>';
    const bridgeCanvas = document.getElementById('spline-infrastructure-bridge');
    if (!bridgeCanvas) return;

    const splineBridge = new Application(bridgeCanvas);
    splineBridge.load(sceneUrl)
      .then(() => {
        bridgeGroup.visible = false;
        console.log('Spline Infrastructure Bridge initialized at Waypoint 02.');
        initBridgeInteractions(bridgeCanvas, splineBridge);
      })
      .catch((err) => {
        bridgeGroup.visible = true;
        console.error('Failed loading bridge asset:', err);
      });
  }

  if (configuredSplineBridgeScene) {
    mountSplineBridgeScene(configuredSplineBridgeScene);
  }
  window.loadWaypoint02SplineScene = mountSplineBridgeScene;

  // --------------------------------------------------------------------------
  // NODE 3 (Waypoint 03): Architectural BIM Digital Twin Tower Complex ("BIM_Tower_Group")
  // LOD 500 BIM, clash detection, MEPF coordination, structural glazing & diagrid
  // Positioned at X: -14, Z: -150 with full lateral clearance from flyby camera
  // --------------------------------------------------------------------------
  const bimGroup = new THREE.Group();
  bimGroup.name = 'BIM_Tower_Group';
  bimGroup.position.set(-14, 2, -150);

  // 3A. Light Architectural Studio CAD Materials
  // Translucent architectural glass (Transmission: 0.88, Roughness: 0.12, IOR: 1.50, tint: #E0F2FE)
  const bimGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xE0F2FE,
    transmission: 0.88,
    roughness: 0.12,
    ior: 1.50,
    transparent: true,
    opacity: 0.95,
    envMapIntensity: 0.85,
    depthWrite: false
  });

  // Structural Floor Plates & Diagrid (Matte architectural concrete / chalk stone, #E2E8F0 to #CBD5E1)
  const bimConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    roughness: 0.6,
    metalness: 0.1,
    envMapIntensity: 0.35
  });

  const bimCoreMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    roughness: 0.65,
    metalness: 0.12,
    envMapIntensity: 0.3
  });

  // Exoskeleton Mullions & Framing (Precision satin dark titanium, #1E293B, Roughness: 0.3, Metalness: 0.85)
  const bimTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.3,
    metalness: 0.85,
    envMapIntensity: 0.45
  });

  // MEPF / Clash Detection Scanning Accents (#0284C7, low emission Glow: 0.25)
  const bimCobaltScanMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x0284C7,
    emissiveIntensity: 0.28,
    roughness: 0.2,
    metalness: 0.6,
    envMapIntensity: 0.4
  });

  const bimMepLineMat = new THREE.LineBasicMaterial({
    color: 0x0284C7,
    transparent: true,
    opacity: 0.88
  });

  // 3B. Primary Tower: Asymmetrical Faceted Skyscraper with Cutaway / Digital Twin Reveal
  const primaryTowerGroup = new THREE.Group();
  primaryTowerGroup.name = 'Primary_BIM_Tower';
  primaryTowerGroup.position.set(0, 0, 0);

  // Concrete Foundation Podium
  const podiumGeo = new THREE.BoxGeometry(11.2, 1.2, 11.2);
  const podiumMesh = new THREE.Mesh(podiumGeo, bimConcreteMat);
  podiumMesh.position.set(0, 0.6, 0);
  addBevelEdges(podiumMesh, podiumGeo);
  primaryTowerGroup.add(podiumMesh);

  // Central MEPF / Elevator Shear Core
  const coreHeight = 32.0;
  const coreGeo = new THREE.BoxGeometry(3.2, coreHeight, 3.2);
  const coreMesh = new THREE.Mesh(coreGeo, bimCoreMat);
  coreMesh.position.set(0, coreHeight / 2 + 1.2, 0);
  addBevelEdges(coreMesh, coreGeo);
  primaryTowerGroup.add(coreMesh);

  // 4 Internal Structural Concrete Columns Grid spanning full tower height
  [-3.2, 3.2].forEach((cx) => {
    [-3.2, 3.2].forEach((cz) => {
      const colGeo = new THREE.CylinderGeometry(0.18, 0.18, coreHeight, 8);
      const colMesh = new THREE.Mesh(colGeo, bimConcreteMat);
      colMesh.position.set(cx, coreHeight / 2 + 1.2, cz);
      primaryTowerGroup.add(colMesh);
    });
  });

  // 14 Structural Floor Plates (Spaced every 2.2 units)
  const floorPlates = [];
  for (let f = 0; f < 14; f++) {
    const floorY = 2.2 + f * 2.2;
    const floorGeo = new THREE.BoxGeometry(8.8, 0.28, 8.8);
    const floorMesh = new THREE.Mesh(floorGeo, bimConcreteMat);
    floorMesh.position.set(0, floorY, 0);
    addBevelEdges(floorMesh, floorGeo);
    primaryTowerGroup.add(floorMesh);
    floorPlates.push(floorMesh);

    // MEPF Horizontal Ductwork & Conduit Runs on exposed floors
    if (f % 2 === 1) {
      const ductPoints = [
        new THREE.Vector3(-3.2, floorY + 0.35, -3.2),
        new THREE.Vector3(0, floorY + 0.35, -1.8),
        new THREE.Vector3(3.2, floorY + 0.35, 1.8),
        new THREE.Vector3(3.2, floorY + 0.35, 3.2)
      ];
      const ductGeo = new THREE.BufferGeometry().setFromPoints(ductPoints);
      const ductLine = new THREE.Line(ductGeo, bimMepLineMat);
      primaryTowerGroup.add(ductLine);
    }
  }

  // Front/Right Half: Architectural Glass Curtain Wall Facade with Titanium Mullions
  // Front Facade Glass (z = +4.45)
  const frontGlassGeo = new THREE.PlaneGeometry(8.8, coreHeight);
  const frontGlassMesh = new THREE.Mesh(frontGlassGeo, bimGlassMat);
  frontGlassMesh.position.set(0, coreHeight / 2 + 1.2, 4.45);
  primaryTowerGroup.add(frontGlassMesh);

  // Right Flank Glass (x = +4.45)
  const rightGlassGeo = new THREE.PlaneGeometry(8.8, coreHeight);
  rightGlassGeo.rotateY(Math.PI / 2);
  const rightGlassMesh = new THREE.Mesh(rightGlassGeo, bimGlassMat);
  rightGlassMesh.position.set(4.45, coreHeight / 2 + 1.2, 0);
  primaryTowerGroup.add(rightGlassMesh);

  // Precision Satin Titanium Mullions Grid (Vertical & Horizontal Floor Spandrels)
  for (let mx = -4.4; mx <= 4.4; mx += 2.2) {
    const mullionGeo = new THREE.BoxGeometry(0.08, coreHeight, 0.12);
    const mullion = new THREE.Mesh(mullionGeo, bimTitaniumMat);
    mullion.position.set(mx, coreHeight / 2 + 1.2, 4.48);
    primaryTowerGroup.add(mullion);
  }
  for (let mz = -4.4; mz <= 4.4; mz += 2.2) {
    const mullionGeo = new THREE.BoxGeometry(0.12, coreHeight, 0.08);
    const mullion = new THREE.Mesh(mullionGeo, bimTitaniumMat);
    mullion.position.set(4.48, coreHeight / 2 + 1.2, mz);
    primaryTowerGroup.add(mullion);
  }

  // Spandrel Glass Bands
  for (let f = 0; f < 14; f++) {
    const spandrelY = 2.2 + f * 2.2;
    const spandrelGeo = new THREE.BoxGeometry(8.84, 0.35, 0.08);
    const spandrel = new THREE.Mesh(spandrelGeo, bimTitaniumMat);
    spandrel.position.set(0, spandrelY, 4.46);
    primaryTowerGroup.add(spandrel);

    const spandrelSideGeo = new THREE.BoxGeometry(0.08, 0.35, 8.84);
    const spandrelSide = new THREE.Mesh(spandrelSideGeo, bimTitaniumMat);
    spandrelSide.position.set(4.46, spandrelY, 0);
    primaryTowerGroup.add(spandrelSide);
  }

  // Crown: Sloped Architectural Roof Parapet & Cobalt Rooftop Beacon
  const crownGeo = new THREE.BoxGeometry(8.4, 2.8, 8.4);
  const crownMesh = new THREE.Mesh(crownGeo, bimTitaniumMat);
  crownMesh.position.set(0, coreHeight + 2.4, 0);
  addBevelEdges(crownMesh, crownGeo);
  primaryTowerGroup.add(crownMesh);

  const crownBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), bimCobaltScanMat);
  crownBeacon.position.set(0, coreHeight + 4.2, 0);
  primaryTowerGroup.add(crownBeacon);

  bimGroup.add(primaryTowerGroup);

  // 3C. Secondary Companion Tower: Stepped Corporate Annex with Diagrid Exoskeleton
  const companionTowerGroup = new THREE.Group();
  companionTowerGroup.name = 'Companion_Diagrid_Tower';
  companionTowerGroup.position.set(-8.8, 0, -4.5);

  // Lower Section (y = 0 to 14, 5 floors)
  const lowerSecGeo = new THREE.BoxGeometry(7.2, 13.5, 7.2);
  const lowerSecMesh = new THREE.Mesh(lowerSecGeo, bimConcreteMat);
  lowerSecMesh.position.set(0, 6.75, 0);
  addBevelEdges(lowerSecMesh, lowerSecGeo);
  companionTowerGroup.add(lowerSecMesh);

  // Upper Stepped Section (y = 13.5 to 22, 4 floors)
  const upperSecGeo = new THREE.BoxGeometry(5.4, 8.5, 5.4);
  const upperSecMesh = new THREE.Mesh(upperSecGeo, bimConcreteMat);
  upperSecMesh.position.set(0.6, 17.75, 0.6);
  addBevelEdges(upperSecMesh, upperSecGeo);
  companionTowerGroup.add(upperSecMesh);

  // Diagrid Exoskeleton: Satin Dark Titanium Structural Bracing Framing the Facade
  const diagridUpVec = new THREE.Vector3(0, 1, 0);
  const diagridPoints = [
    // Front face diagonal pairs
    [new THREE.Vector3(-3.6, 0.5, 3.65), new THREE.Vector3(0, 6.75, 3.65)],
    [new THREE.Vector3(0, 6.75, 3.65), new THREE.Vector3(3.6, 13.5, 3.65)],
    [new THREE.Vector3(3.6, 0.5, 3.65), new THREE.Vector3(0, 6.75, 3.65)],
    [new THREE.Vector3(0, 6.75, 3.65), new THREE.Vector3(-3.6, 13.5, 3.65)],
    // Right side diagonal pairs
    [new THREE.Vector3(3.65, 0.5, -3.6), new THREE.Vector3(3.65, 6.75, 0)],
    [new THREE.Vector3(3.65, 6.75, 0), new THREE.Vector3(3.65, 13.5, 3.6)],
    [new THREE.Vector3(3.65, 0.5, 3.6), new THREE.Vector3(3.65, 6.75, 0)],
    [new THREE.Vector3(3.65, 6.75, 0), new THREE.Vector3(3.65, 13.5, -3.6)]
  ];

  diagridPoints.forEach(([pStart, pEnd]) => {
    const dirVec = new THREE.Vector3().subVectors(pEnd, pStart);
    const strutLen = dirVec.length();
    const strutGeo = new THREE.CylinderGeometry(0.08, 0.08, strutLen, 6);
    const strutMesh = new THREE.Mesh(strutGeo, bimTitaniumMat);
    strutMesh.position.copy(pStart).add(pEnd).multiplyScalar(0.5);
    strutMesh.quaternion.setFromUnitVectors(diagridUpVec, dirVec.clone().normalize());
    companionTowerGroup.add(strutMesh);
  });

  bimGroup.add(companionTowerGroup);

  // 3D. BIM Coordination / Clash Ring: Floating Horizontal Laser Slice Plane (#0284C7)
  const clashScanRingGroup = new THREE.Group();
  clashScanRingGroup.name = 'BIM_Clash_Scan_Ring';
  clashScanRingGroup.position.set(0, 16.0, 0);

  // Outer & Inner Clash Datum Rings
  const clashRingGeo = new THREE.TorusGeometry(7.2, 0.065, 10, 64);
  const clashRingMesh = new THREE.Mesh(clashRingGeo, bimCobaltScanMat);
  clashRingMesh.rotation.x = Math.PI / 2;
  clashScanRingGroup.add(clashRingMesh);

  const innerClashRingGeo = new THREE.TorusGeometry(6.2, 0.045, 8, 48);
  const innerClashRingMesh = new THREE.Mesh(innerClashRingGeo, bimCobaltScanMat);
  innerClashRingMesh.rotation.x = Math.PI / 2;
  clashScanRingGroup.add(innerClashRingMesh);

  // Translucent Horizontal Laser Scanning Slice Plane
  const laserSliceGeo = new THREE.PlaneGeometry(12.5, 12.5);
  const laserSliceMat = new THREE.MeshBasicMaterial({
    color: 0x0284C7,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const laserSliceMesh = new THREE.Mesh(laserSliceGeo, laserSliceMat);
  laserSliceMesh.rotation.x = -Math.PI / 2;
  clashScanRingGroup.add(laserSliceMesh);

  // 4 Corner Telemetry Crosshairs & Coordinate Blips
  for (let c = 0; c < 4; c++) {
    const angle = (c * Math.PI) / 2 + Math.PI / 4;
    const cornerDot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), bimCobaltScanMat);
    cornerDot.position.set(Math.cos(angle) * 7.2, 0, Math.sin(angle) * 7.2);
    clashScanRingGroup.add(cornerDot);
  }

  bimGroup.add(clashScanRingGroup);
  scene.add(bimGroup);

  // --------------------------------------------------------------------------
  // Waypoint 03 Interactive Drag-to-Rotate, Hover & Spring-Back Controller
  // --------------------------------------------------------------------------
  const bimInteractionState = {
    baseRotation: { x: bimGroup.rotation.x, y: bimGroup.rotation.y, z: bimGroup.rotation.z },
    baseScale: { x: bimGroup.scale.x, y: bimGroup.scale.y, z: bimGroup.scale.z },
    targetScale: 1.0,
    currentScale: 1.0,
    targetGlassTransmission: 0.88,
    currentGlassTransmission: 0.88,
    targetCobaltEmissive: 0.28,
    currentCobaltEmissive: 0.28,
    isDragging: false,
    springTween: null
  };

  function initBIMInteractions(targetCanvas, splineBIMApp) {
    const towerGroup = (splineBIMApp && typeof splineBIMApp.findObjectByName === 'function')
      ? (splineBIMApp.findObjectByName('BIM_Tower_Group') || bimGroup)
      : bimGroup;
    if (!towerGroup || !targetCanvas) return;

    const baseRotation = { x: towerGroup.rotation.x, y: towerGroup.rotation.y, z: towerGroup.rotation.z };
    const baseScale = { x: towerGroup.scale.x, y: towerGroup.scale.y, z: towerGroup.scale.z };

    let isBIMDragging = false;
    let prevPos = { x: 0, y: 0 };
    let bimSpringTween = null;

    targetCanvas.style.cursor = 'grab';

    const isWaypoint03Active = () => activeWaypointIndex === 2 || targetCanvas.id === 'spline-bim-tower';

    // Hover Dynamics (1.04x Scale + Clearer Glass Transmission 0.94 + Brighter Cobalt Scan)
    targetCanvas.addEventListener('mouseenter', () => {
      if (isBIMDragging || !isWaypoint03Active()) return;
      bimInteractionState.targetScale = 1.04;
      bimInteractionState.targetGlassTransmission = 0.94;
      bimInteractionState.targetCobaltEmissive = 0.65;

      if (window.gsap) {
        window.gsap.to(towerGroup.scale, {
          x: baseScale.x * 1.04,
          y: baseScale.y * 1.04,
          z: baseScale.z * 1.04,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    targetCanvas.addEventListener('mouseleave', () => {
      if (isBIMDragging) return;
      targetCanvas.style.cursor = 'grab';
      bimInteractionState.targetScale = 1.0;
      bimInteractionState.targetGlassTransmission = 0.88;
      bimInteractionState.targetCobaltEmissive = 0.28;

      if (window.gsap) {
        window.gsap.to(towerGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    // Pointer Down (Drag Start)
    const onPointerDown = (e) => {
      if (isScrollActive || !e || !isWaypoint03Active()) return;
      isBIMDragging = true;
      bimInteractionState.isDragging = true;
      targetCanvas.style.cursor = 'grabbing';
      bimInteractionState.targetScale = 1.04;
      bimInteractionState.targetGlassTransmission = 0.94;
      bimInteractionState.targetCobaltEmissive = 0.75;

      if (bimSpringTween) {
        if (typeof bimSpringTween.kill === 'function') bimSpringTween.kill();
        bimSpringTween = null;
      }
      bimInteractionState.springTween = null;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Move (Rotational Inspection with Architectural Pitch Constraints)
    const onPointerMove = (e) => {
      if (!isBIMDragging || !e) return;
      const deltaX = e.clientX - prevPos.x;
      const deltaY = e.clientY - prevPos.y;

      const sensitivity = 0.005;
      towerGroup.rotation.y += deltaX * sensitivity;
      towerGroup.rotation.x += deltaY * sensitivity;

      // Constrain pitch to preserve architectural perspective [-0.35, 0.35]
      towerGroup.rotation.x = Math.max(-0.35, Math.min(0.35, towerGroup.rotation.x));

      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Up (Elastic Return to Canonical Rest: duration 1.3s, elastic.out(1, 0.5))
    const onPointerUp = () => {
      if (!isBIMDragging) return;
      isBIMDragging = false;
      bimInteractionState.isDragging = false;
      targetCanvas.style.cursor = 'grab';
      bimInteractionState.targetScale = 1.0;
      bimInteractionState.targetGlassTransmission = 0.88;
      bimInteractionState.targetCobaltEmissive = 0.28;

      if (window.gsap) {
        bimSpringTween = window.gsap.to(towerGroup.rotation, {
          x: baseRotation.x,
          y: baseRotation.y,
          z: baseRotation.z,
          duration: 1.3,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => { bimSpringTween = null; }
        });

        window.gsap.to(towerGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.35,
          ease: 'power2.out'
        });
      } else {
        bimInteractionState.springTween = {
          model: towerGroup,
          startX: towerGroup.rotation.x,
          startY: towerGroup.rotation.y,
          startZ: towerGroup.rotation.z,
          targetX: baseRotation.x,
          targetY: baseRotation.y,
          targetZ: baseRotation.z,
          startTime: performance.now(),
          durationMs: 1300
        };
      }
    };

    targetCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    // Touch Support
    targetCanvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Scroll Sync: Disengage manual drag when scrolling past waypoint
    window.addEventListener('scroll', () => {
      if (isBIMDragging) onPointerUp();
    }, { passive: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-scrollytelling, #hero-stage',
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive && isBIMDragging) onPointerUp();
        }
      });
    }
  }

  // Bind BIM Interactions to primary interactive canvas
  initBIMInteractions(interactiveCanvas, null);

  // Target Waypoint 03 BIM Target Container (#waypoint-03-3d-target) for Spline runtime
  const bimAnchor = document.querySelector('#waypoint-03-3d-target');
  const configuredSplineBIMScene = (bimAnchor && bimAnchor.getAttribute('data-spline-scene')) || window.GDR_SPLINE_BIM_SCENE;

  function mountSplineBIMScene(sceneUrl) {
    if (!bimAnchor || !sceneUrl) return;
    bimAnchor.innerHTML = '<canvas id="spline-bim-tower" class="w-full h-full block"></canvas>';
    const bimCanvas = document.getElementById('spline-bim-tower');
    if (!bimCanvas) return;

    const splineBIM = new Application(bimCanvas);
    splineBIM.load(sceneUrl)
      .then(() => {
        bimGroup.visible = false;
        console.log('Spline BIM Digital Twin Tower initialized at Waypoint 03.');
        initBIMInteractions(bimCanvas, splineBIM);
      })
      .catch((err) => {
        bimGroup.visible = true;
        console.error('Failed loading BIM asset:', err);
      });
  }

  if (configuredSplineBIMScene) {
    mountSplineBIMScene(configuredSplineBIMScene);
  }
  window.loadWaypoint03SplineScene = mountSplineBIMScene;

  // --------------------------------------------------------------------------
  // NODE 4 (Waypoint 04): Interactive 3D NDT Material Testing Crystal Core ("Testing_Core_Group")
  // Ultrasonic Pulse Velocity testing, geotechnical core sample rigor & digital transducers
  // --------------------------------------------------------------------------
  const testNodeGroup = new THREE.Group();
  testNodeGroup.name = 'Testing_Core_Group';
  testNodeGroup.position.set(-4, 8.5, -235);

  // 4A. Light Architectural Studio CAD Materials
  // High-refraction architectural crystal core (Transmission: 0.82, Roughness: 0.12, IOR: 1.54, deep cobalt #0284C7)
  const crystalCoreMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284C7,
    transmission: 0.82,
    roughness: 0.12,
    ior: 1.54,
    transparent: true,
    opacity: 0.95,
    envMapIntensity: 0.95,
    depthWrite: false
  });

  // Ultrasonic Stress Pulse Rim (High-contrast electric cyan/cobalt stroke #00B4D8, Glow: 0.8)
  const pulseRimMat = new THREE.MeshStandardMaterial({
    color: 0x00B4D8,
    emissive: 0x00B4D8,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
    envMapIntensity: 0.6
  });

  // Sensor Particle Micro-Nodes (Semi-reflective slate cubes, #334155, Roughness: 0.3, Metalness: 0.7)
  const sensorParticleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.7,
    envMapIntensity: 0.6
  });

  // Calibration Rig Brackets & Frame (Matte dark titanium #1E293B & dark slate #0F172A)
  const datumCageMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.35,
    metalness: 0.85
  });

  const calibrationBracketMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.5,
    metalness: 0.4
  });

  const internalFractureMat = new THREE.LineBasicMaterial({
    color: 0x00B4D8,
    transparent: true,
    opacity: 0.85
  });

  // 4B. Internal Test Specimen: Precision Faceted Crystal Core Drill Sample
  const crystalCoreAssembly = new THREE.Group();
  crystalCoreAssembly.name = 'Specimen_Crystal_Core';

  // Faceted Rock Core Specimen
  const coreDrillGeo = new THREE.CylinderGeometry(1.65, 1.65, 3.8, 14, 2);
  const coreDrillMesh = new THREE.Mesh(coreDrillGeo, crystalCoreMat);
  crystalCoreAssembly.add(coreDrillMesh);

  // Precision Crystalline Fracture Edges
  const coreFractureGeo = new THREE.EdgesGeometry(coreDrillGeo);
  const coreFractureLines = new THREE.LineSegments(coreFractureGeo, internalFractureMat);
  crystalCoreAssembly.add(coreFractureLines);

  // Central Octahedral Stress Nucleus
  const nucleusGeo = new THREE.OctahedronGeometry(1.1, 1);
  const nucleusMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x0284C7,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.75
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  crystalCoreAssembly.add(nucleusMesh);

  testNodeGroup.add(crystalCoreAssembly);

  // 4C. Ultrasonic Stress Rings (Dual Crackling Resonance Rims with Jagged Micro-Displacement)
  const ultrasonicRingsGroup = new THREE.Group();
  ultrasonicRingsGroup.name = 'Ultrasonic_Resonance_Rims';

  function buildCracklingRingGeo(radius, segments = 56, noiseAmp = 0.16, freq = 8) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = radius + (Math.sin(theta * freq) * 0.65 + Math.cos(theta * freq * 2.2) * 0.35) * noiseAmp;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    const ringCurve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(ringCurve, 84, 0.054, 6, true);
  }

  // Resonance Ring A (Offset Axis X: 20°, Y: 45°)
  const ringA = new THREE.Group();
  ringA.rotation.x = THREE.MathUtils.degToRad(20);
  ringA.rotation.y = THREE.MathUtils.degToRad(45);
  const ringAGeo = buildCracklingRingGeo(3.35, 56, 0.16, 7);
  const ringAMesh = new THREE.Mesh(ringAGeo, pulseRimMat);
  ringA.add(ringAMesh);
  ultrasonicRingsGroup.add(ringA);

  // Resonance Ring B (Offset Axis X: -25°, Z: 35°)
  const ringB = new THREE.Group();
  ringB.rotation.x = THREE.MathUtils.degToRad(-25);
  ringB.rotation.z = THREE.MathUtils.degToRad(35);
  const ringBGeo = buildCracklingRingGeo(3.85, 60, 0.19, 9);
  const ringBMesh = new THREE.Mesh(ringBGeo, pulseRimMat);
  ringB.add(ringBMesh);
  ultrasonicRingsGroup.add(ringB);

  testNodeGroup.add(ultrasonicRingsGroup);

  // 4D. Sensor Point Cloud: ~60 Floating Cubic Micro-Nodes (InstancedMesh for 60fps)
  const SENSOR_COUNT = 60;
  const sensorGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const sensorInstancedMesh = new THREE.InstancedMesh(sensorGeo, sensorParticleMat, SENSOR_COUNT);
  sensorInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const sensorParticleData = [];
  const dummyMatrix = new THREE.Matrix4();
  const dummyPos = new THREE.Vector3();
  const dummyRot = new THREE.Euler();
  const dummyQuat = new THREE.Quaternion();
  const dummyScale = new THREE.Vector3(1, 1, 1);

  for (let s = 0; s < SENSOR_COUNT; s++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 3.8 + Math.random() * 1.5;

    const basePos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) * 0.75, // Ellipsoidal compression
      r * Math.cos(phi)
    );

    sensorParticleData.push({
      basePos,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.8,
      rotSpeed: (Math.random() - 0.5) * 1.5
    });

    dummyPos.copy(basePos);
    dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
    sensorInstancedMesh.setMatrixAt(s, dummyMatrix);
  }
  sensorInstancedMesh.instanceMatrix.needsUpdate = true;
  testNodeGroup.add(sensorInstancedMesh);

  // 4E. External Calibration Rig: Minimal Cubic Datum Cage with Corner Brackets
  const calibrationRigGroup = new THREE.Group();
  calibrationRigGroup.name = 'Calibration_Rig';

  // Razor-Thin Cubic Datum Struts (7.6 x 7.6 x 7.6)
  const cageBoxGeo = new THREE.BoxGeometry(7.6, 7.6, 7.6);
  const cageEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(cageBoxGeo),
    new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.65 })
  );
  calibrationRigGroup.add(cageEdges);

  // 8 Precision Corner Calibration Brackets in Dark Titanium (#1E293B)
  const bracketSize = 0.55;
  const bracketThick = 0.12;
  [-3.8, 3.8].forEach((bx) => {
    [-3.8, 3.8].forEach((by) => {
      [-3.8, 3.8].forEach((bz) => {
        const cornerNode = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.32, 0.32),
          datumCageMat
        );
        cornerNode.position.set(bx, by, bz);
        calibrationRigGroup.add(cornerNode);

        // Axis alignment ticks
        const tickGeo = new THREE.BoxGeometry(bracketSize, bracketThick, bracketThick);
        const tickMesh = new THREE.Mesh(tickGeo, calibrationBracketMat);
        tickMesh.position.set(bx - Math.sign(bx) * (bracketSize / 2), by, bz);
        calibrationRigGroup.add(tickMesh);
      });
    });
  });

  // Datum Foundation Plinth Plate
  const plinthGeo = new THREE.BoxGeometry(8.4, 0.4, 8.4);
  const plinthMesh = new THREE.Mesh(plinthGeo, calibrationBracketMat);
  plinthMesh.position.set(0, -3.95, 0);
  addBevelEdges(plinthMesh, plinthGeo);
  calibrationRigGroup.add(plinthMesh);

  testNodeGroup.add(calibrationRigGroup);
  scene.add(testNodeGroup);

  // --------------------------------------------------------------------------
  // Waypoint 04 Interactive Drag-to-Rotate, Hover & Spring-Back Controller
  // --------------------------------------------------------------------------
  const labsInteractionState = {
    baseRotation: { x: testNodeGroup.rotation.x, y: testNodeGroup.rotation.y, z: testNodeGroup.rotation.z },
    baseScale: { x: testNodeGroup.scale.x, y: testNodeGroup.scale.y, z: testNodeGroup.scale.z },
    targetScale: 1.0,
    currentScale: 1.0,
    targetRimEmissive: 0.8,
    currentRimEmissive: 0.8,
    isDragging: false,
    springTween: null
  };

  function initLabsInteractions(targetCanvas, splineLabsApp) {
    const coreGroup = (splineLabsApp && typeof splineLabsApp.findObjectByName === 'function')
      ? (splineLabsApp.findObjectByName('Testing_Core_Group') || testNodeGroup)
      : testNodeGroup;
    if (!coreGroup || !targetCanvas) return;

    const baseRotation = { x: coreGroup.rotation.x, y: coreGroup.rotation.y, z: coreGroup.rotation.z };
    const baseScale = { x: coreGroup.scale.x, y: coreGroup.scale.y, z: coreGroup.scale.z };

    let isLabsDragging = false;
    let prevPos = { x: 0, y: 0 };
    let labsSpringTween = null;

    targetCanvas.style.cursor = 'grab';

    const isWaypoint04Active = () => activeWaypointIndex === 3 || targetCanvas.id === 'spline-testing-core';

    // Hover Dynamics (1.05x Scale + Rim Luminescence Boost up to 1.2)
    targetCanvas.addEventListener('mouseenter', () => {
      if (isLabsDragging || !isWaypoint04Active()) return;
      labsInteractionState.targetScale = 1.05;
      labsInteractionState.targetRimEmissive = 1.2;

      if (window.gsap) {
        window.gsap.to(coreGroup.scale, {
          x: baseScale.x * 1.05,
          y: baseScale.y * 1.05,
          z: baseScale.z * 1.05,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
    });

    targetCanvas.addEventListener('mouseleave', () => {
      if (isLabsDragging) return;
      targetCanvas.style.cursor = 'grab';
      labsInteractionState.targetScale = 1.0;
      labsInteractionState.targetRimEmissive = 0.8;

      if (window.gsap) {
        window.gsap.to(coreGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    // Pointer Down (Drag Start)
    const onPointerDown = (e) => {
      if (isScrollActive || !e || !isWaypoint04Active()) return;
      isLabsDragging = true;
      labsInteractionState.isDragging = true;
      targetCanvas.style.cursor = 'grabbing';
      labsInteractionState.targetScale = 1.05;
      labsInteractionState.targetRimEmissive = 1.25;

      if (labsSpringTween) {
        if (typeof labsSpringTween.kill === 'function') labsSpringTween.kill();
        labsSpringTween = null;
      }
      labsInteractionState.springTween = null;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Move (Rotational Inspection with Stability Pitch Constraints [-0.45, 0.45])
    const onPointerMove = (e) => {
      if (!isLabsDragging || !e) return;
      const deltaX = e.clientX - prevPos.x;
      const deltaY = e.clientY - prevPos.y;

      const sensitivity = 0.005;
      coreGroup.rotation.y += deltaX * sensitivity;
      coreGroup.rotation.x += deltaY * sensitivity;

      // Constrain pitch to preserve camera stability
      coreGroup.rotation.x = Math.max(-0.45, Math.min(0.45, coreGroup.rotation.x));

      prevPos = { x: e.clientX, y: e.clientY };
    };

    // Pointer Up (Elastic Return to Canonical Rest: duration 1.3s, elastic.out(1, 0.5))
    const onPointerUp = () => {
      if (!isLabsDragging) return;
      isLabsDragging = false;
      labsInteractionState.isDragging = false;
      targetCanvas.style.cursor = 'grab';
      labsInteractionState.targetScale = 1.0;
      labsInteractionState.targetRimEmissive = 0.8;

      if (window.gsap) {
        labsSpringTween = window.gsap.to(coreGroup.rotation, {
          x: baseRotation.x,
          y: baseRotation.y,
          z: baseRotation.z,
          duration: 1.3,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => { labsSpringTween = null; }
        });

        window.gsap.to(coreGroup.scale, {
          x: baseScale.x,
          y: baseScale.y,
          z: baseScale.z,
          duration: 0.35,
          ease: 'power2.out'
        });
      } else {
        labsInteractionState.springTween = {
          model: coreGroup,
          startX: coreGroup.rotation.x,
          startY: coreGroup.rotation.y,
          startZ: coreGroup.rotation.z,
          targetX: baseRotation.x,
          targetY: baseRotation.y,
          targetZ: baseRotation.z,
          startTime: performance.now(),
          durationMs: 1300
        };
      }
    };

    targetCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    // Touch Support
    targetCanvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Scroll Sync: Disengage manual drag when scrolling past waypoint
    window.addEventListener('scroll', () => {
      if (isLabsDragging) onPointerUp();
    }, { passive: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-scrollytelling, #hero-stage',
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive && isLabsDragging) onPointerUp();
        }
      });
    }
  }

  // Bind Labs Interactions to primary interactive canvas
  initLabsInteractions(interactiveCanvas, null);

  // Target Waypoint 04 Anchor (#waypoint-04-3d-target) for Spline runtime
  const labsAnchor = document.querySelector('#waypoint-04-3d-target');
  const configuredSplineLabsScene = (labsAnchor && labsAnchor.getAttribute('data-spline-scene')) || window.GDR_SPLINE_LABS_SCENE;

  function mountSplineLabsScene(sceneUrl) {
    if (!labsAnchor || !sceneUrl) return;
    labsAnchor.innerHTML = '<canvas id="spline-testing-core" class="w-full h-full block"></canvas>';
    const labsCanvas = document.getElementById('spline-testing-core');
    if (!labsCanvas) return;

    const splineLabs = new Application(labsCanvas);
    splineLabs.load(sceneUrl)
      .then(() => {
        testNodeGroup.visible = false;
        console.log('Spline NDT Testing Core initialized at Waypoint 04.');
        initLabsInteractions(labsCanvas, splineLabs);
      })
      .catch((err) => {
        testNodeGroup.visible = true;
        console.error('Failed loading testing core asset:', err);
      });
  }

  if (configuredSplineLabsScene) {
    mountSplineLabsScene(configuredSplineLabsScene);
  }
  window.loadWaypoint04SplineScene = mountSplineLabsScene;

  // --------------------------------------------------------------------------
  // NODE 5 (Waypoint 05): Geographic Survey Pins & Geodetic Network Field
  // Replaces vertical hanging stalks with precision grounded survey pins (1,200+ national project footprints)
  // --------------------------------------------------------------------------
  const surveyPinsGroup = new THREE.Group();
  surveyPinsGroup.name = 'Survey_Pins_Cluster';
  const networkGroup = surveyPinsGroup;

  // Pin Geometry Specifications (Upright, anchored to actual terrain elevation)
  const pinGeometry = new THREE.CylinderGeometry(0.08, 0.08, 4.0, 16);
  const beaconHeadGeometry = new THREE.SphereGeometry(0.35, 16, 16);
  const groundRingGeometry = new THREE.RingGeometry(0.4, 0.7, 32);

  const pinStemMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark slate
    metalness: 0.8,
    roughness: 0.2
  });

  // Categorized Regional Projects across India (High-Contrast Architectural CAD Palette)
  const SECTOR_COLORS = {
    tpqa: 0x0284C7,     // Cobalt: TPQA, PMC, IE Jobs
    design: 0x0D9488,   // Teal: Design & DPR Jobs
    survey: 0xD97706,   // Amber: Field Survey
    geotech: 0x7C3AED   // Violet: Geotech Investigation
  };

  // 18 Strategic Ground Nodes mapped to actual terrain coordinates
  const nodeCoordinates = [
    // TPQA & PMC Infrastructure Corridors
    { x: -14, z: -270, sector: 'tpqa', label: 'Vadodara Central HQ' },
    { x: -8, z: -285, sector: 'tpqa', label: 'Bharuch Corridor PMC' },
    { x: 2, z: -265, sector: 'tpqa', label: 'Gandhinagar Institutional' },
    { x: 10, z: -290, sector: 'tpqa', label: 'Junagadh Expressway QA' },
    { x: -4, z: -310, sector: 'tpqa', label: 'Ahmedabad Ring Road PMC' },
    // Highway Design & DPR Alignments
    { x: 6, z: -320, sector: 'design', label: 'Navsari Highway DPR' },
    { x: -18, z: -330, sector: 'design', label: 'Surat Express Alignment' },
    { x: 12, z: -340, sector: 'design', label: 'Rajkot Corridor DPR' },
    { x: 0, z: -350, sector: 'design', label: 'Ahmedabad Metro Alignment' },
    { x: -10, z: -360, sector: 'design', label: 'Vapi Industrial Highway' },
    // Precision Geomatics, LiDAR & Drone Surveys
    { x: -22, z: -280, sector: 'survey', label: 'Bhuj Port Bathymetry' },
    { x: 16, z: -275, sector: 'survey', label: 'Jaisalmer Solar LiDAR' },
    { x: -6, z: -335, sector: 'survey', label: 'Narmada Canal Survey' },
    { x: 18, z: -315, sector: 'survey', label: 'Kutch Coastal Survey' },
    // Geotechnical Deep Exploration
    { x: -2, z: -295, sector: 'geotech', label: 'Anand Foundation Exploration' },
    { x: 8, z: -305, sector: 'geotech', label: 'Somnath Marine Drilling' },
    { x: -16, z: -345, sector: 'geotech', label: 'Godhra Dam Subsurface' },
    { x: 14, z: -355, sector: 'geotech', label: 'Dahej Industrial Geotech' }
  ];

  const networkMarkers = [];
  const geodeticVertices = [];

  nodeCoordinates.forEach((item, i) => {
    const colorHex = SECTOR_COLORS[item.sector] || 0x0284C7;
    const pin = new THREE.Group();

    // Sample terrain elevation so pins are firmly anchored to the ground
    const groundY = typeof getTerrainElevation === 'function' ? getTerrainElevation(item.x, item.z) : 0.5;

    // Upright Stem rising upwards from ground surface
    const stem = new THREE.Mesh(pinGeometry, pinStemMaterial);
    stem.position.y = 2.0;

    // Cobalt / Sector Beacon Node on top
    const headMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95
    });
    const head = new THREE.Mesh(beaconHeadGeometry, headMat);
    head.position.y = 4.0;

    // Ground Radar Wave Ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(groundRingGeometry, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    const baseScale = 1.0 + (i % 3) * 0.35;
    ring.scale.setScalar(baseScale);

    pin.add(stem);
    pin.add(head);
    pin.add(ring);
    pin.position.set(item.x, groundY, item.z);

    surveyPinsGroup.add(pin);

    // Save geodetic head world position for interconnected datum network lines
    geodeticVertices.push(new THREE.Vector3(item.x, groundY + 4.0, item.z));

    networkMarkers.push({
      sector: item.sector,
      pin,
      stem,
      head,
      ring,
      baseColor: colorHex,
      baseScale,
      baseY: groundY
    });
  });

  // Interconnected Geodetic Datum Network Lines
  const geodeticLinePoints = [];
  for (let i = 0; i < geodeticVertices.length; i++) {
    for (let j = i + 1; j < geodeticVertices.length; j++) {
      const dist = geodeticVertices[i].distanceTo(geodeticVertices[j]);
      if (dist < 32) {
        geodeticLinePoints.push(geodeticVertices[i], geodeticVertices[j]);
      }
    }
  }
  if (geodeticLinePoints.length > 0) {
    const geodeticGeo = new THREE.BufferGeometry().setFromPoints(geodeticLinePoints);
    const geodeticMat = new THREE.LineBasicMaterial({
      color: 0x0284C7,
      transparent: true,
      opacity: 0.25
    });
    const geodeticLines = new THREE.LineSegments(geodeticGeo, geodeticMat);
    surveyPinsGroup.add(geodeticLines);
  }

  scene.add(surveyPinsGroup);

  // --------------------------------------------------------------------------
  // 7. Pacing & Waypoint Mapping across 500vh Virtual Track
  // --------------------------------------------------------------------------
  const waypoints = Array.from(document.querySelectorAll('.gdr-waypoint-card, [data-wp-card]'));
  const trackerItems = Array.from(document.querySelectorAll('[data-waypoint], .gdr-tracker-item'));
  const trackerProgressLine = document.querySelector('.gdr-tracker-progress-line');
  const scrollPrompt = document.querySelector('.gdr-scroll-prompt');
  const hudCoordText = document.getElementById('hud-telemetry') || document.getElementById('gdr-hud-coords') || document.querySelector('.font-mono.text-slate-600');

  // Stabilized Contiguous Waypoint Transition Thresholds (Zero Dead-Zone Gaps)
  const WAYPOINT_THRESHOLDS = [
    { index: 0, min: 0.00, max: 0.20, start: 0.00, end: 0.20, targetProgress: 0.05, label: 'FOUNDATION & SCALE' },
    { index: 1, min: 0.20, max: 0.40, start: 0.20, end: 0.40, targetProgress: 0.30, label: 'CIVIL & INFRASTRUCTURE' },
    { index: 2, min: 0.40, max: 0.60, start: 0.40, end: 0.60, targetProgress: 0.50, label: 'DESIGN & 7D BIM' },
    { index: 3, min: 0.60, max: 0.80, start: 0.60, end: 0.80, targetProgress: 0.70, label: 'TESTING & COMMERCE' },
    { index: 4, min: 0.80, max: 1.01, start: 0.80, end: 1.01, targetProgress: 0.92, label: 'NATIONAL FOOTPRINT' }
  ];
  const WAYPOINT_RANGES = WAYPOINT_THRESHOLDS;

  let rawScrollProgress = 0;
  let smoothedProgress = 0;
  activeWaypointIndex = 0;
  const startTime = performance.now();
  let currentActiveSector = 'all';

  function calculateScrollProgress() {
    const scrollY = window.scrollY;
    const trackRect = track.getBoundingClientRect();
    const trackTop = scrollY + trackRect.top;
    const trackHeight = track.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - window.innerHeight);
    const progress = (scrollY - trackTop) / maxScroll;
    return Math.max(0, Math.min(1, progress));
  }

  // Left-Rail Waypoint Tracker Click Handler
  trackerItems.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wpIdxAttr = btn.getAttribute('data-waypoint') ?? btn.getAttribute('data-wp');
      const targetIdx = wpIdxAttr !== null ? parseInt(wpIdxAttr, 10) : idx;
      const wp = WAYPOINT_RANGES[targetIdx];
      if (!wp) return;
      const trackRect = track.getBoundingClientRect();
      const trackTop = window.scrollY + trackRect.top;
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      const targetScrollY = trackTop + (wp.targetProgress * maxScroll);
      updateWaypointIndicators(targetIdx);
      window.scrollTo({
        top: Math.round(targetScrollY),
        behavior: 'smooth'
      });
    });
  });

  // Waypoint 01 CTA [Explore Capabilities ↓]
  const exploreCapabilitiesBtn = document.getElementById('btn-explore-capabilities') || document.querySelector('a[href="#expertise"]');
  if (exploreCapabilitiesBtn) {
    exploreCapabilitiesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const wp = WAYPOINT_RANGES[1]; // Waypoint 02
      const trackRect = track.getBoundingClientRect();
      const trackTop = window.scrollY + trackRect.top;
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: Math.round(trackTop + (wp.targetProgress * maxScroll)),
        behavior: 'smooth'
      });
    });
  }

  // Waypoint 05 CTA [Submit Tender Inquiry / RFP] -> routes to executive CTA banner
  const tenderInquiryBtn = document.getElementById('btn-submit-tender');
  if (tenderInquiryBtn) {
    tenderInquiryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ctaBanner = document.getElementById('tender-cta-banner') || document.getElementById('tender-portal');
      if (ctaBanner) {
        ctaBanner.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/contact-us.html';
      }
    });
  }

  // Interactive Sector Filter Buttons in Waypoint 05
  const sectorFilterButtons = Array.from(document.querySelectorAll('.network-filter-btn'));
  sectorFilterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sector = btn.getAttribute('data-sector');
      if (currentActiveSector === sector) {
        currentActiveSector = 'all';
        sectorFilterButtons.forEach(b => b.classList.remove('is-active'));
      } else {
        currentActiveSector = sector;
        sectorFilterButtons.forEach(b => b.classList.toggle('is-active', b === btn));
      }
    });
  });

  // Function to update left-rail waypoint button styles dynamically
  function updateWaypointIndicators(activeIndex) {
    const waypointButtons = document.querySelectorAll('nav[aria-label="Waypoint Navigation"] button[data-waypoint]');
    
    waypointButtons.forEach((btn) => {
      const waypointIndex = parseInt(btn.getAttribute('data-waypoint'), 10);
      const circle = btn.querySelector('span:first-child');
      const label = btn.querySelector('span:last-child');
      const isActive = waypointIndex === activeIndex;

      btn.classList.toggle('is-active', isActive);

      if (isActive) {
        btn.style.opacity = '1';
        if (circle) {
          circle.style.background = '#0284C7';
          circle.style.color = '#FFFFFF';
          circle.style.border = 'none';
          circle.style.boxShadow = '0 4px 10px rgba(2, 132, 199, 0.35)';
        }
        if (label) {
          label.style.color = '#0F172A';
          label.style.fontWeight = '700';
        }
      } else {
        btn.style.opacity = '0.55';
        if (circle) {
          circle.style.background = '#FFFFFF';
          circle.style.color = '#64748B';
          circle.style.border = '1px solid #CBD5E1';
          circle.style.boxShadow = 'none';
        }
        if (label) {
          label.style.color = '#64748B';
          label.style.fontWeight = '600';
        }
      }
    });
  }

  function updateWaypointUI(targetIndex) {
    // Update Waypoint Cards
    waypoints.forEach((card, idx) => {
      const cIdxAttr = card.getAttribute('data-wp-card') ?? card.getAttribute('data-wp');
      const cIdx = cIdxAttr !== null ? parseInt(cIdxAttr, 10) : idx;
      card.classList.toggle('is-active', cIdx === targetIndex);
    });

    // Update Tracker Left Rail (including dynamic inline styles)
    updateWaypointIndicators(targetIndex);
  }

  // Initialize Waypoint indicators
  updateWaypointUI(0);

  // --------------------------------------------------------------------------
  // 8. Natural Document Flow Footer (No Curtain Margin Offset)
  // --------------------------------------------------------------------------
  const updateFooterOffset = () => {
    const contentWrapper = document.getElementById('page-content-wrapper') || document.querySelector('.content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.marginBottom = '0px';
    }
  };
  updateFooterOffset();

  // --------------------------------------------------------------------------
  // 9. Continuous WebGL Animation Loop (Remains active across full page)
  // --------------------------------------------------------------------------
  let isLoopRunning = true;
  let animationFrameId = 0;

  function renderLoop() {
    if (!isLoopRunning) return;

    const elapsedTime = (performance.now() - startTime) * 0.001;

    // 1. Smoothly interpolate scroll progress for camera rail inertia
    rawScrollProgress = calculateScrollProgress();
    smoothedProgress += (rawScrollProgress - smoothedProgress) * 0.085;
    const p = Math.max(0.0001, Math.min(0.9999, smoothedProgress));

    // 2. Smooth, Non-Intersecting Architectural Flyby Camera & Parallel Look-At Evaluation
    function updateScrollytellingCamera(progress) {
      const clampedProgress = Math.max(0, Math.min(1, progress));

      // 1. Position camera along non-colliding curved spline
      const targetCamPos = cameraFlybyCurve.getPointAt(clampedProgress);
      const floatY = Math.sin(elapsedTime * 1.2) * 0.22;
      const floatX = Math.cos(elapsedTime * 0.9) * 0.18;
      camera.position.set(targetCamPos.x + floatX, targetCamPos.y + floatY, targetCamPos.z);

      // 2. Look-At target along parallel smoothed track
      const targetLookAt = cameraLookAtCurve.getPointAt(clampedProgress);
      camera.lookAt(targetLookAt);
    }
    // Terminal camera rail dampening: completes smooth arc at p=0.90 to hold elevated horizon overview
    updateScrollytellingCamera(Math.min(p / 0.90, 1.0));

    // Move beacon light with camera
    beaconLight.position.copy(camera.position);

    // 3. Animate Structural Nodes (Waypoint 01 Architectural Core + Drag-to-Rotate & Spring Return)
    const scrollRotationOffset = p * Math.PI * 2;

    // Evaluate active elastic spring return tween when released
    if (!isDragging && springTween && springTween.startTime !== undefined) {
      const tweenElapsed = performance.now() - springTween.startTime;
      const progress = Math.min(1, tweenElapsed / springTween.durationMs);
      const eased = easeElasticOut(progress, 1, 0.45);
      dragRotation.x = springTween.startX * (1 - eased);
      dragRotation.y = springTween.startY * (1 - eased);
      if (progress >= 1) {
        dragRotation.x = baseRotation.x;
        dragRotation.y = baseRotation.y;
        springTween = null;
      }
    }

    // Counter-rotation between Outer Kinetic Cage (0.2 rad/s) & Internal Glass Core (0.5 rad/s)
    outerKineticCage.rotation.y = -elapsedTime * 0.2 + scrollRotationOffset * 0.5;
    outerKineticCage.rotation.x = Math.sin(elapsedTime * 0.22) * 0.08;
    internalCoreAnchor.rotation.y = elapsedTime * 0.5 + scrollRotationOffset;
    internalCoreAnchor.rotation.z = Math.cos(elapsedTime * 0.35) * 0.1;
    coreNucleusMesh.rotation.y = -elapsedTime * 0.8;

    // Subtle vertical floating hover (±6px / ±0.35 world units sine wave)
    coreNodeGroup.position.y = 5.2 + Math.sin(elapsedTime * 1.5) * 0.35;

    // Smooth hover scale, ring luminescence & magnetic cursor proximity tilt
    corePointerState.currentTiltX += (corePointerState.targetTiltX - corePointerState.currentTiltX) * 0.08;
    corePointerState.currentTiltZ += (corePointerState.targetTiltZ - corePointerState.currentTiltZ) * 0.08;
    corePointerState.currentRingScale += (corePointerState.targetRingScale - corePointerState.currentRingScale) * 0.08;
    corePointerState.currentScale += (corePointerState.targetScale - corePointerState.currentScale) * 0.12;
    corePointerState.currentRingEmissive += (corePointerState.targetRingEmissive - corePointerState.currentRingEmissive) * 0.12;

    if (!window.gsap) {
      coreNodeGroup.scale.setScalar(corePointerState.currentScale);
    }
    datumRingMat.emissiveIntensity = corePointerState.currentRingEmissive;

    // Combine base magnetic tilt + manual drag/spring rotation on coreNodeGroup
    coreNodeGroup.rotation.x = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, corePointerState.currentTiltX + dragRotation.x)
    );
    coreNodeGroup.rotation.y = dragRotation.y;
    coreNodeGroup.rotation.z = corePointerState.currentTiltZ;

    ringGimbalA.rotation.y = elapsedTime * 0.32;
    ringGimbalB.rotation.y = -elapsedTime * 0.24;
    datumRingsGroup.scale.setScalar(corePointerState.currentRingScale);

    if (splineCoreObject && !isDragging) {
      splineCoreObject.rotation.y = scrollRotationOffset + dragRotation.y;
    }

    // 3B. Animate Waypoint 02 Infrastructure Bridge Monument ("Bridge_Pylon_Group")
    // Evaluate native elastic.out(1, 0.5) spring return tween when released
    if (!bridgeInteractionState.isDragging && bridgeInteractionState.springTween) {
      const bt = bridgeInteractionState.springTween;
      const tweenElapsed = performance.now() - bt.startTime;
      const progress = Math.min(1, tweenElapsed / bt.durationMs);
      const eased = easeElasticOut(progress, 1, 0.5);
      bt.model.rotation.x = bt.startX + (bt.targetX - bt.startX) * eased;
      bt.model.rotation.y = bt.startY + (bt.targetY - bt.startY) * eased;
      bt.model.rotation.z = bt.startZ + (bt.targetZ - bt.startZ) * eased;
      if (progress >= 1) {
        bt.model.rotation.set(bt.targetX, bt.targetY, bt.targetZ);
        bridgeInteractionState.springTween = null;
      }
    }

    // Smooth hover scale (1.04x) & stay-cable cobalt micro-pulse + hover intensification
    bridgeInteractionState.currentScale += (bridgeInteractionState.targetScale - bridgeInteractionState.currentScale) * 0.12;
    bridgeInteractionState.currentCableEmissive += (bridgeInteractionState.targetCableEmissive - bridgeInteractionState.currentCableEmissive) * 0.12;

    if (!window.gsap) {
      bridgeGroup.scale.setScalar(bridgeInteractionState.currentScale);
    }

    const idleCablePulse = (Math.sin(elapsedTime * 2.4) * 0.5 + 0.5) * 0.1;
    stayCableMat.emissiveIntensity = bridgeInteractionState.currentCableEmissive + idleCablePulse;
    cobaltAccentMat.emissiveIntensity = 0.28 + idleCablePulse * 1.4 + (bridgeInteractionState.currentCableEmissive - 0.08) * 0.8;

    // Gentle floating oscillation of CAD construction datum indicators (±4px / ±0.22 world units)
    bridgeDatumGroup.position.y = 0.35 + Math.sin(elapsedTime * 1.6) * 0.22;
    outerDatumMesh.rotation.z = elapsedTime * 0.18;
    innerDatumMesh.rotation.z = -elapsedTime * 0.25;

    // 3C. Animate Waypoint 03 BIM Digital Twin Tower Complex ("BIM_Tower_Group")
    // Evaluate native elastic.out(1, 0.5) spring return tween when released
    if (!bimInteractionState.isDragging && bimInteractionState.springTween) {
      const bmt = bimInteractionState.springTween;
      const tweenElapsed = performance.now() - bmt.startTime;
      const progress = Math.min(1, tweenElapsed / bmt.durationMs);
      const eased = easeElasticOut(progress, 1, 0.5);
      bmt.model.rotation.x = bmt.startX + (bmt.targetX - bmt.startX) * eased;
      bmt.model.rotation.y = bmt.startY + (bmt.targetY - bmt.startY) * eased;
      bmt.model.rotation.z = bmt.startZ + (bmt.targetZ - bmt.startZ) * eased;
      if (progress >= 1) {
        bmt.model.rotation.set(bmt.targetX, bmt.targetY, bmt.targetZ);
        bimInteractionState.springTween = null;
      }
    }

    // Smooth hover scale (1.04x), glass transmission (0.88 -> 0.94), and cobalt scan emissive
    bimInteractionState.currentScale += (bimInteractionState.targetScale - bimInteractionState.currentScale) * 0.12;
    bimInteractionState.currentGlassTransmission += (bimInteractionState.targetGlassTransmission - bimInteractionState.currentGlassTransmission) * 0.12;
    bimInteractionState.currentCobaltEmissive += (bimInteractionState.targetCobaltEmissive - bimInteractionState.currentCobaltEmissive) * 0.12;

    if (!window.gsap) {
      bimGroup.scale.setScalar(bimInteractionState.currentScale);
    }
    bimGlassMat.transmission = bimInteractionState.currentGlassTransmission;
    bimCobaltScanMat.emissiveIntensity = bimInteractionState.currentCobaltEmissive;

    // BIM Coordination Clash Ring: Vertical sweep through tower floors (ΔY = ±12 units, 4s cycle)
    clashScanRingGroup.position.y = 16.0 + Math.sin(elapsedTime * (Math.PI / 2)) * 12.0;
    clashRingMesh.rotation.z = elapsedTime * 0.22;
    innerClashRingMesh.rotation.z = -elapsedTime * 0.35;

    bimGroup.position.y = 2.0 + Math.sin(elapsedTime * 1.4) * 0.45;

    // 3D. Animate Waypoint 04 NDT Material Testing Crystal Core ("Testing_Core_Group")
    // Evaluate native elastic.out(1, 0.5) spring return tween when released
    if (!labsInteractionState.isDragging && labsInteractionState.springTween) {
      const lt = labsInteractionState.springTween;
      const tweenElapsed = performance.now() - lt.startTime;
      const progress = Math.min(1, tweenElapsed / lt.durationMs);
      const eased = easeElasticOut(progress, 1, 0.5);
      lt.model.rotation.x = lt.startX + (lt.targetX - lt.startX) * eased;
      lt.model.rotation.y = lt.startY + (lt.targetY - lt.startY) * eased;
      lt.model.rotation.z = lt.startZ + (lt.targetZ - lt.startZ) * eased;
      if (progress >= 1) {
        lt.model.rotation.set(lt.targetX, lt.targetY, lt.targetZ);
        labsInteractionState.springTween = null;
      }
    }

    // Smooth hover scale (1.05x) & pulse rim luminescence interpolation
    labsInteractionState.currentScale += (labsInteractionState.targetScale - labsInteractionState.currentScale) * 0.12;
    labsInteractionState.currentRimEmissive += (labsInteractionState.targetRimEmissive - labsInteractionState.currentRimEmissive) * 0.12;

    if (!window.gsap) {
      testNodeGroup.scale.setScalar(labsInteractionState.currentScale);
    }
    pulseRimMat.emissiveIntensity = labsInteractionState.currentRimEmissive;

    // Idle state: Slow crystal core rotation (0.3 rad/s) & central nucleus spin
    crystalCoreAssembly.rotation.y = elapsedTime * 0.3;
    crystalCoreAssembly.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08;
    nucleusMesh.rotation.y = -elapsedTime * 0.6;
    nucleusMesh.rotation.z = elapsedTime * 0.45;

    // Crackling energy rim continuous noise phase shifting (2.5s cycle)
    const cracklePhase = elapsedTime * ((Math.PI * 2) / 2.5);
    ringA.rotation.z = cracklePhase * 0.4;
    ringB.rotation.y = -cracklePhase * 0.35;
    ringAMesh.rotation.y = Math.sin(cracklePhase) * 0.2;
    ringBMesh.rotation.x = Math.cos(cracklePhase) * 0.2;

    // Sensor dust particles: Subtle Brownian floating hover (±3px / ±0.18 units)
    for (let s = 0; s < SENSOR_COUNT; s++) {
      const pData = sensorParticleData[s];
      const floatX = Math.sin(elapsedTime * pData.speed + pData.phase) * 0.18;
      const floatY = Math.cos(elapsedTime * pData.speed * 1.2 + pData.phase) * 0.18;
      const floatZ = Math.sin(elapsedTime * pData.speed * 0.8 + pData.phase) * 0.18;

      dummyPos.copy(pData.basePos).add(new THREE.Vector3(floatX, floatY, floatZ));
      dummyRot.set(elapsedTime * pData.rotSpeed, elapsedTime * pData.rotSpeed * 0.8, 0);
      dummyQuat.setFromEuler(dummyRot);
      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      sensorInstancedMesh.setMatrixAt(s, dummyMatrix);
    }
    sensorInstancedMesh.instanceMatrix.needsUpdate = true;

    // 4. Update Network Sector Pin Highlights & Ground Radar Wave Ring Pulsing
    networkMarkers.forEach((item, i) => {
      // Animate ground radar ring pulsing (±0.22 scale oscillation)
      const pulse = Math.sin(elapsedTime * 2.8 + i * 0.45) * 0.22;
      const ringScale = Math.max(0.2, item.baseScale + pulse);
      item.ring.scale.set(ringScale, ringScale, 1.0);

      if (currentActiveSector === 'all') {
        item.head.scale.set(1.0, 1.0, 1.0);
        item.head.material.color.setHex(item.baseColor);
        item.head.material.opacity = 0.95;
        item.ring.material.color.setHex(item.baseColor);
        item.ring.material.opacity = 0.35 + pulse * 0.15;
        item.stem.material.opacity = 1.0;
      } else if (item.sector === currentActiveSector) {
        item.head.scale.set(1.35, 1.35, 1.35);
        item.head.material.color.setHex(item.baseColor);
        item.head.material.opacity = 1.0;
        item.ring.material.color.setHex(item.baseColor);
        item.ring.material.opacity = 0.65;
        item.stem.material.opacity = 1.0;
      } else {
        item.head.scale.set(0.65, 0.65, 0.65);
        item.head.material.color.setHex(0x94A3B8);
        item.head.material.opacity = 0.25;
        item.ring.material.color.setHex(0x94A3B8);
        item.ring.material.opacity = 0.08;
        item.stem.material.opacity = 0.3;
      }
    });

    // 5. Cinematic Exit Blend into About Section (rawScrollProgress >= 0.88)
    // Smoothly fade WebGL canvas & Waypoint 05 card to 0 as user approaches bottom of 500vh hero track
    if (rawScrollProgress >= 0.88) {
      const fadeProgress = Math.min(1.0, (rawScrollProgress - 0.88) / 0.10); // 0.88 -> 0.98 fully fades
      const exitOpacity = Math.max(0.0, 1.0 - fadeProgress);
      if (canvas) canvas.style.opacity = exitOpacity.toString();
      
      const wp5Card = document.querySelector('[data-wp-card="4"]') || (waypoints && waypoints[4]);
      if (wp5Card) {
        wp5Card.style.opacity = exitOpacity.toString();
      }
      const hudNav = document.getElementById('scrolly-nav-rail') || document.querySelector('.gdr-tracker-nav');
      if (hudNav) {
        hudNav.style.opacity = exitOpacity.toString();
      }
    } else {
      if (canvas && canvas.style.opacity !== '') canvas.style.opacity = '1';
      const wp5Card = document.querySelector('[data-wp-card="4"]') || (waypoints && waypoints[4]);
      if (wp5Card && wp5Card.style.opacity !== '') {
        wp5Card.style.opacity = '';
      }
      const hudNav = document.getElementById('scrolly-nav-rail') || document.querySelector('.gdr-tracker-nav');
      if (hudNav && hudNav.style.opacity !== '') {
        hudNav.style.opacity = '1';
      }
    }

    // 6. Synchronize Narrative Cards & Journey Tracker (Stabilized Hysteresis-Clamped Index Selector)
    const clampedProgress = Math.max(0, Math.min(1, rawScrollProgress));
    let targetIndex = activeWaypointIndex;
    for (let i = 0; i < WAYPOINT_THRESHOLDS.length; i++) {
      if (clampedProgress >= WAYPOINT_THRESHOLDS[i].min && clampedProgress < WAYPOINT_THRESHOLDS[i].max) {
        targetIndex = WAYPOINT_THRESHOLDS[i].index;
        break;
      }
    }

    // Only dispatch update when index genuinely changes
    if (targetIndex !== activeWaypointIndex) {
      activeWaypointIndex = targetIndex;
      updateWaypointUI(activeWaypointIndex);
    }

    // Update Progress Line Fill
    if (trackerProgressLine) {
      trackerProgressLine.style.height = `${(rawScrollProgress * 100).toFixed(1)}%`;
    }

    // Fade out bottom scroll prompt once user initiates scroll
    if (scrollPrompt) {
      scrollPrompt.classList.toggle('is-hidden', rawScrollProgress > 0.02);
    }

    // Update HUD Telemetry text
    if (hudCoordText) {
      const activeRange = WAYPOINT_RANGES[activeWaypointIndex];
      const stageNum = String(activeWaypointIndex + 1).padStart(2, '0');
      hudCoordText.textContent = `GEO // LAT: 22.3072° N • LON: 73.1812° E | STAGE: ${stageNum} // ${activeRange.label}`;
    }

    // Render WebGL frame
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Window Resize Handler
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateFooterOffset();
  }
  window.addEventListener('resize', handleResize);

  // Start loop
  animationFrameId = requestAnimationFrame(renderLoop);

  return {
    destroy: () => {
      isLoopRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', updateFooterOffset);
      renderer.dispose();
      terrainGeo.dispose();
      terrainShaderMaterial.dispose();
    }
  };
}

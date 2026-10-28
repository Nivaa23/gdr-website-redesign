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
  // 3. Camera Rail & Target CatmullRom Splines
  // --------------------------------------------------------------------------
  const cameraRailPoints = [
    new THREE.Vector3(0, 24, 60),       // Waypoint 01: High overview of contour origin & core
    new THREE.Vector3(-12, 16, 12),     // Transition dive
    new THREE.Vector3(-32, 7.5, -45),   // Waypoint 02: Low dive along glowing Highway DPR ribbon & bridge
    new THREE.Vector3(-14, 18, -100),   // Climb into axonometric perspective
    new THREE.Vector3(26, 32, -145),    // Waypoint 03: Elevated axonometric view of 7D BIM wireframe complex
    new THREE.Vector3(6, 18, -195),     // Transition down
    new THREE.Vector3(-14, 9.5, -240),  // Waypoint 04: Macro focus on NABL structural material test cube
    new THREE.Vector3(-2, 22, -285),    // Climb toward panoramic horizon
    new THREE.Vector3(0, 44, -340)      // Waypoint 05: Panoramic horizon of nationwide interconnected nodes
  ];
  const cameraSpline = new THREE.CatmullRomCurve3(cameraRailPoints, false, 'catmullrom', 0.5);

  const targetRailPoints = [
    new THREE.Vector3(0, 4.5, 0),       // Target 01: Central precision coordinate cube
    new THREE.Vector3(-16, 5, -25),
    new THREE.Vector3(-26, 4.5, -75),   // Target 02: Highway ribbon & bridge pylon
    new THREE.Vector3(2, 9, -120),
    new THREE.Vector3(8, 12, -165),     // Target 03: BIM wireframe building core
    new THREE.Vector3(-4, 8, -210),
    new THREE.Vector3(-14, 7.5, -260),  // Target 04: Test cube center
    new THREE.Vector3(-2, 14, -305),
    new THREE.Vector3(0, 16, -440)      // Target 05: Distant illuminated national network horizon
  ];
  const targetSpline = new THREE.CatmullRomCurve3(targetRailPoints, false, 'catmullrom', 0.5);

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
  // 5. Dark Graphite Highway Spline (#444444)
  // --------------------------------------------------------------------------
  const alignmentPoints = [
    new THREE.Vector3(0, 0.5, 45),
    new THREE.Vector3(-10, 0.8, 5),
    new THREE.Vector3(-28, 2.5, -45),
    new THREE.Vector3(-22, 6.2, -85),   // Viaduct bridge span elevating over valley
    new THREE.Vector3(0, 8.8, -125),    // Flyover curve
    new THREE.Vector3(14, 4.0, -165),
    new THREE.Vector3(-8, 1.8, -215),
    new THREE.Vector3(-14, 1.2, -260),
    new THREE.Vector3(0, 2.5, -330),
    new THREE.Vector3(0, 6.0, -440)
  ];
  const alignmentCurve = new THREE.CatmullRomCurve3(alignmentPoints, false, 'catmullrom', 0.5);

  // Opaque Dark Graphite Vector Ribbon (#444444)
  const tubeGeo = new THREE.TubeGeometry(alignmentCurve, 320, 0.65, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x222222,
    emissiveIntensity: 0.25,
    roughness: 0.4,
    metalness: 0.15
  });
  const alignmentTube = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(alignmentTube);

  // High-Contrast Charcoal Centerline Ribbon (#222222)
  const centerTubeGeo = new THREE.TubeGeometry(alignmentCurve, 160, 0.18, 6, false);
  const centerTubeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const centerTube = new THREE.Mesh(centerTubeGeo, centerTubeMat);
  scene.add(centerTube);

  // Traveling Light Pulses along the Corridor (#444444 / #666666)
  const pulseSpheres = [];
  const pulseGeo = new THREE.SphereGeometry(0.65, 8, 8);
  const pulseMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x666666,
    emissiveIntensity: 0.8
  });
  for (let i = 0; i < 4; i++) {
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    scene.add(pulseMesh);
    pulseSpheres.push({
      mesh: pulseMesh,
      t: i * 0.25,
      speed: 0.08 + i * 0.02
    });
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
      if (isDragging) return;
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
      if (isScrollActive || !e) return;
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

  // NODE 2 (Waypoint 02): Cable-Stayed Bridge Pylon Structure (Dark Graphite #444444)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(-22, 0, -85);

  const pylonMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.95
  });

  // Left Pylon Tower (38m elevation)
  const pylonGeo = new THREE.CylinderGeometry(0.4, 1.4, 38, 4);
  const leftPylon = new THREE.Mesh(pylonGeo, pylonMat);
  leftPylon.position.set(-6, 19, 0);
  leftPylon.rotation.z = -0.06;
  bridgeGroup.add(leftPylon);

  // Right Pylon Tower
  const rightPylon = new THREE.Mesh(pylonGeo, pylonMat);
  rightPylon.position.set(6, 19, 0);
  rightPylon.rotation.z = 0.06;
  bridgeGroup.add(rightPylon);

  // Dark Graphite Pylon Stay Cables (#444444)
  const cableMat = new THREE.LineBasicMaterial({
    color: 0x444444,
    transparent: true,
    opacity: 0.85
  });
  for (let c = 0; c < 8; c++) {
    const cableY = 12 + c * 3;
    const cableZ = (c - 3.5) * 6;
    const cableGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, cableY, 0),
      new THREE.Vector3(0, 6.2, cableZ)
    ]);
    const cableLine = new THREE.Line(cableGeo, cableMat);
    bridgeGroup.add(cableLine);
  }
  scene.add(bridgeGroup);

  // NODE 3 (Waypoint 03): Architectural Clay 7D BIM Building Volumes (Dark Graphite #444444)
  const bimGroup = new THREE.Group();
  bimGroup.position.set(8, 10, -165);

  const bimClayMat = new THREE.MeshStandardMaterial({
    color: 0xF1F5F9,
    roughness: 0.9,
    metalness: 0.05
  });
  const bimWireMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.95
  });

  // Building Tower A (Clay + Slate Wireframe)
  const towerAGeo = new THREE.BoxGeometry(10, 26, 10);
  const towerA = new THREE.Mesh(towerAGeo, bimClayMat);
  const towerAWire = new THREE.Mesh(towerAGeo, bimWireMat);
  towerA.add(towerAWire);
  towerA.position.set(-4, 13, 0);
  bimGroup.add(towerA);

  // Building Tower B (Stepped)
  const towerBGeo = new THREE.BoxGeometry(8, 18, 8);
  const towerB = new THREE.Mesh(towerBGeo, bimClayMat);
  const towerBWire = new THREE.Mesh(towerBGeo, bimWireMat);
  towerB.add(towerBWire);
  towerB.position.set(6, 9, -4);
  bimGroup.add(towerB);

  // MEPF Conduit Lines (Dark Graphite #444444)
  const mepLinePoints = [
    new THREE.Vector3(-8, 2, -6),
    new THREE.Vector3(-4, 14, -6),
    new THREE.Vector3(6, 14, -4),
    new THREE.Vector3(6, 22, -4)
  ];
  const mepLineGeo = new THREE.BufferGeometry().setFromPoints(mepLinePoints);
  const mepLineMat = new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 2 });
  const mepLine = new THREE.Line(mepLineGeo, mepLineMat);
  bimGroup.add(mepLine);
  scene.add(bimGroup);

  // NODE 4 (Waypoint 04): Material Testing Stress-Test Cube with CAD Dimension Ticks (Dark Graphite #444444)
  const testNodeGroup = new THREE.Group();
  testNodeGroup.position.set(-14, 7.5, -258);

  const testFrameGeo = new THREE.BoxGeometry(8, 8, 8);
  const testFrameMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 1.0
  });
  const testFrame = new THREE.Mesh(testFrameGeo, testFrameMat);
  testNodeGroup.add(testFrame);

  // Internal Soil Density Stratum / Octahedron
  const stressGeo = new THREE.OctahedronGeometry(3.6, 2);
  const stressMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const stressMesh = new THREE.Mesh(stressGeo, stressMat);
  testNodeGroup.add(stressMesh);

  // Geotechnical Soil Density Layer Discs (#444444)
  for (let s = -3; s <= 3; s += 2) {
    const discGeo = new THREE.RingGeometry(0.8, 3.2, 16);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x444444,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = s;
    testNodeGroup.add(disc);
  }

  // Material Test Orbiting Particles (#444444)
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 90;
  const particleArray = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount * 3; p += 3) {
    particleArray[p] = (Math.random() - 0.5) * 12;
    particleArray[p + 1] = (Math.random() - 0.5) * 12;
    particleArray[p + 2] = (Math.random() - 0.5) * 12;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particleArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0x444444,
    transparent: true,
    opacity: 0.95
  });
  const particlePoints = new THREE.Points(particleGeo, particleMat);
  testNodeGroup.add(particlePoints);
  scene.add(testNodeGroup);

  // NODE 5 (Waypoint 05): Categorized National Network Pin Constellation
  const networkGroup = new THREE.Group();
  networkGroup.position.set(0, 10, -380);

  const beaconGeo = new THREE.CylinderGeometry(0.12, 0.35, 45, 6);

  // 16 Categorized Regional Projects across India (High-Contrast Light Theme)
  const SECTOR_COLORS = {
    tpqa: 0x0284C7,     // Cobalt: TPQA, PMC, IE Jobs
    design: 0x0D9488,   // Teal: Design & DPR Jobs
    survey: 0xD97706,   // Amber: Field Survey
    geotech: 0x7C3AED   // Violet: Geotech Investigation
  };

  const categorizedNodes = [
    // TPQA & PMC Jobs
    { pos: [0, 0, 0], sector: 'tpqa', label: 'Vadodara Central HQ' },
    { pos: [-24, -2, -18], sector: 'tpqa', label: 'Bharuch Corridor' },
    { pos: [22, -1, 35], sector: 'tpqa', label: 'Gandhinagar Institutional' },
    { pos: [-38, -3, 45], sector: 'tpqa', label: 'Junagadh Bridge QA' },
    // Design & DPR Jobs
    { pos: [-12, 2, -30], sector: 'design', label: 'Navsari Highway DPR' },
    { pos: [14, 3, -15], sector: 'design', label: 'Surat Express Alignment' },
    { pos: [-30, 1, 20], sector: 'design', label: 'Rajkot Ring Road DPR' },
    { pos: [32, 2, -40], sector: 'design', label: 'Ahmedabad Metro BIM' },
    // Field Survey (LiDAR & Drone)
    { pos: [-45, -4, 25], sector: 'survey', label: 'Bhuj Port Survey' },
    { pos: [-65, 0, 80], sector: 'survey', label: 'Jaisalmer Solar LiDAR' },
    { pos: [10, -2, -60], sector: 'survey', label: 'Narmada Canal Geomatics' },
    { pos: [-50, 2, -10], sector: 'survey', label: 'Kutch Coastal Bathymetry' },
    // Geotech Investigation
    { pos: [5, -1, 20], sector: 'geotech', label: 'Anand Foundation Testing' },
    { pos: [-20, -2, 50], sector: 'geotech', label: 'Somnath Deep Drilling' },
    { pos: [28, -3, 10], sector: 'geotech', label: 'Godhra Dam Exploration' },
    { pos: [-35, 0, -40], sector: 'geotech', label: 'Dahej Industrial Geotech' }
  ];

  const networkMarkers = [];

  categorizedNodes.forEach(item => {
    const colorHex = SECTOR_COLORS[item.sector] || 0x0284C7;
    const [nx, ny, nz] = item.pos;

    // Upward coordinate beacon
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35
    });
    const beam = new THREE.Mesh(beaconGeo, beamMat);
    beam.position.set(nx, ny + 22.5, nz);
    networkGroup.add(beam);

    // Glowing node marker sphere
    const markerMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95
    });
    const marker = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), markerMat);
    marker.position.set(nx, ny, nz);
    networkGroup.add(marker);

    networkMarkers.push({
      sector: item.sector,
      beam,
      marker,
      baseColor: colorHex
    });
  });
  scene.add(networkGroup);

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

    // 2. Camera Spline Rail Evaluation
    const camPos = cameraSpline.getPointAt(p);
    const targetPos = targetSpline.getPointAt(p);

    // Subtle natural floating idle breathing
    const floatY = Math.sin(elapsedTime * 1.2) * 0.45;
    const floatX = Math.cos(elapsedTime * 0.9) * 0.35;
    camera.position.set(camPos.x + floatX, camPos.y + floatY, camPos.z);
    camera.lookAt(targetPos);

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

    bimGroup.position.y = 10 + Math.sin(elapsedTime * 1.4) * 0.6;

    stressMesh.rotation.x = elapsedTime * 0.6;
    stressMesh.rotation.y = elapsedTime * 0.8;
    particlePoints.rotation.y = elapsedTime * 0.15;

    // 4. Advance Corridor Light Pulses
    pulseSpheres.forEach(item => {
      item.t = (item.t + item.speed * 0.018) % 1;
      const point = alignmentCurve.getPointAt(item.t);
      item.mesh.position.copy(point);
    });

    // 5. Update Network Sector Pin Highlights (Dark Graphite #444444 default)
    networkMarkers.forEach(pin => {
      if (currentActiveSector === 'all') {
        pin.marker.scale.set(1.0, 1.0, 1.0);
        pin.marker.material.color.setHex(0x444444);
        pin.marker.material.opacity = 0.95;
        pin.beam.material.color.setHex(0x444444);
        pin.beam.material.opacity = 0.4;
      } else if (pin.sector === currentActiveSector) {
        pin.marker.scale.set(1.4, 1.4, 1.4);
        pin.marker.material.color.setHex(pin.baseColor);
        pin.marker.material.opacity = 1.0;
        pin.beam.material.color.setHex(pin.baseColor);
        pin.beam.material.opacity = 0.6;
      } else {
        pin.marker.scale.set(0.7, 0.7, 0.7);
        pin.marker.material.color.setHex(0x94A3B8);
        pin.marker.material.opacity = 0.25;
        pin.beam.material.color.setHex(0x94A3B8);
        pin.beam.material.opacity = 0.1;
      }
    });

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
      tubeGeo.dispose();
      tubeMat.dispose();
    }
  };
}

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
  // 3. Camera Position Spline Curve (Eyes-on-Deck Perspective)
  // --------------------------------------------------------------------------
  const BRIDGE_DECK_Y = 14.5; // Exact top-of-deck elevation of Waypoint 02 bridge monument
  const BRIDGE_Z = -80.0;     // Z-position of the central bridge pylon

  const cameraControlPoints = [
    // Waypoint 01: Elevated overview of Foundation Core
    new THREE.Vector3(12, 14, 65),

    // Transition: Gliding smoothly up to bridge approach (no dip below bridge)
    new THREE.Vector3(8, 16.5, 10),
    new THREE.Vector3(4, 18.0, -35),

    // Waypoint 02: Positioned on the roadway looking forward through the stay cables
    new THREE.Vector3(0, BRIDGE_DECK_Y + 2.6, BRIDGE_Z + 30),    // Approaching deck (Z: -50)
    new THREE.Vector3(0, BRIDGE_DECK_Y + 2.6, BRIDGE_Z),         // Mid-span through pylon (Z: -80)
    new THREE.Vector3(-1.5, BRIDGE_DECK_Y + 2.6, BRIDGE_Z - 30), // Crossing forward (Z: -110)

    // Waypoint 03: Approaching BIM High-Rise Towers
    new THREE.Vector3(-8, 16, -140),

    // Waypoint 04: Macro focus on NABL structural material test cube
    new THREE.Vector3(-12, 11.5, -230),

    // Waypoint 05: Panoramic horizon of nationwide interconnected nodes
    new THREE.Vector3(0, 36, -340)
  ];

  const cameraPathCurve = new THREE.CatmullRomCurve3(cameraControlPoints, false, 'centripetal', 0.4);
  const cameraSpline = cameraPathCurve;

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
  // 5. Road Alignment Path Curve & Tube Geometry (Flush with Bridge Deck Elevation)
  // --------------------------------------------------------------------------
  const roadControlPoints = [
    // Waypoint 01: Low ground approach
    new THREE.Vector3(0, 0.8, 40),
    new THREE.Vector3(2, 1.2, 10),

    // Approach Ramp up to Bridge Deck (Smooth incline starting at Z: -25)
    new THREE.Vector3(4, 5.0, -25),
    new THREE.Vector3(3.5, 11.0, -50),

    // Waypoint 02: On Bridge Deck (Flush with bridge roadway surface at Y = 14.5)
    new THREE.Vector3(0, BRIDGE_DECK_Y + 0.2, BRIDGE_Z + 15),  // On deck entry (Z: -65)
    new THREE.Vector3(0, BRIDGE_DECK_Y + 0.2, BRIDGE_Z),       // Deck midpoint (Z: -80, under pylon saddle)
    new THREE.Vector3(-2, BRIDGE_DECK_Y + 0.2, BRIDGE_Z - 25), // On deck exit (Z: -105)

    // Descent Ramp down to Waypoint 03 (Design & BIM towers)
    new THREE.Vector3(-6, 9.0, -130),
    new THREE.Vector3(-10, 2.0, -170),

    // Waypoint 04 & 05: Testing Lab & National Footprint Corridor
    new THREE.Vector3(-14, 1.5, -260),
    new THREE.Vector3(0, 6.0, -370)
  ];

  // Rebuild CatmullRomCurve3 with smooth centripetal tension
  const roadPathCurve = new THREE.CatmullRomCurve3(roadControlPoints, false, 'centripetal', 0.5);
  const alignmentCurve = roadPathCurve;

  // Opaque Dark Graphite Vector Ribbon (#444444)
  const tubeGeo = new THREE.TubeGeometry(roadPathCurve, 200, 0.9, 16, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x222222,
    emissiveIntensity: 0.25,
    roughness: 0.4,
    metalness: 0.15
  });
  const roadTubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
  const alignmentTube = roadTubeMesh;
  scene.add(roadTubeMesh);

  // High-Contrast Cobalt / Charcoal Centerline Ribbon
  const centerTubeGeo = new THREE.TubeGeometry(roadPathCurve, 200, 0.22, 8, false);
  const centerTubeMat = new THREE.MeshBasicMaterial({ color: 0x0284C7 });
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
  bridgeGroup.position.set(0, 0, BRIDGE_Z);
  bridgeGroup.rotation.y = 0; // Aligned directly with corridor road & camera splines

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

  // NODE 3 (Waypoint 03): Architectural Clay 7D BIM Building Volumes (Dark Graphite #444444)
  const bimGroup = new THREE.Group();
  bimGroup.position.set(-10, 2, -170);

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

    // 2. Camera Spline Rail Evaluation (Eyes-on-Deck Perspective)
    function updateCameraAlongPath(progress) {
      // Sample position from stabilized camera path
      const camPos = cameraPathCurve.getPointAt(progress);
      const floatY = Math.sin(elapsedTime * 1.2) * 0.22;
      const floatX = Math.cos(elapsedTime * 0.9) * 0.18;
      camera.position.set(camPos.x + floatX, camPos.y + floatY, camPos.z);

      // Dynamic Look-At Target (Slightly ahead along the road curve for cinematic tracking)
      const lookAheadProgress = Math.min(1.0, progress + 0.08);
      const lookTarget = roadPathCurve.getPointAt(lookAheadProgress).clone();

      // Add subtle vertical lift to lookTarget when at the bridge (0.18 to 0.42) to frame pylon height without boundary snapping
      if (progress >= 0.14 && progress <= 0.46) {
        const bridgeLiftWeight = progress < 0.18
          ? (progress - 0.14) / 0.04
          : (progress > 0.42 ? (0.46 - progress) / 0.04 : 1.0);
        lookTarget.y += 3.5 * Math.max(0, Math.min(1, bridgeLiftWeight));
      } else if (progress < 0.14) {
        const wp01Weight = Math.max(0, 1.0 - progress / 0.14);
        lookTarget.x = THREE.MathUtils.lerp(lookTarget.x, 0.0, wp01Weight);
        lookTarget.y = THREE.MathUtils.lerp(lookTarget.y, 5.2, wp01Weight);
        lookTarget.z = THREE.MathUtils.lerp(lookTarget.z, 0.0, wp01Weight);
      }

      camera.lookAt(lookTarget);
    }
    updateCameraAlongPath(p);

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

    bimGroup.position.y = 2 + Math.sin(elapsedTime * 1.4) * 0.6;

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

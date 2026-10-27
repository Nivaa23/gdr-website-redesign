/**
 * GEO DESIGNS & RESEARCH — WEBGL 3D SCROLLYTELLING ENGINE
 * 
 * Inspired by:
 * - Hubtown web experience: Camera rail flight over dynamic infrastructure topography
 * - Visual Metaphor: Low-poly DEM terrain, Highway DPR alignment ribbon,
 *   BIM structural nodes, NABL holographic testing cube, and national network horizon.
 */

import * as THREE from 'three';
import './WebglScrollytelling.css';

let activeWaypointIndex = 0;

export function initWebglScrollytelling() {
  const canvas = document.getElementById('gdr-webgl-canvas');
  const track = document.getElementById('gdr-scrolly-track');
  if (!canvas || !track) return null;

  // Reduced motion preference check
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  // --------------------------------------------------------------------------
  // 1. Scene, Camera, Fog & Renderer Setup
  // --------------------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050B14);
  scene.fog = new THREE.FogExp2(0x050B14, 0.0075);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // --------------------------------------------------------------------------
  // 2. Lighting Rig
  // --------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0x0B1B2B, 1.6);
  scene.add(ambientLight);

  const cyanKeyLight = new THREE.DirectionalLight(0x00D2FF, 2.2);
  cyanKeyLight.position.set(40, 70, 30);
  scene.add(cyanKeyLight);

  const greenRimLight = new THREE.DirectionalLight(0x497E5E, 1.8);
  greenRimLight.position.set(-50, 45, -120);
  scene.add(greenRimLight);

  // Dynamic Beacon Light attached near camera
  const beaconLight = new THREE.PointLight(0x00D2FF, 3.5, 60);
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
  // 4. Procedural Low-Poly Topography Mesh (Digital Elevation Model - DEM)
  // --------------------------------------------------------------------------
  const terrainGeo = new THREE.PlaneGeometry(380, 560, 95, 140);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, -6, -180);

  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    // Multilayer procedural terrain height function
    let y = Math.sin(x * 0.032) * Math.cos(z * 0.022) * 7.5
          + Math.sin(x * 0.075 + 1.2) * Math.sin(z * 0.05) * 4.0
          + Math.cos(x * 0.018 - z * 0.016) * 5.5;

    // Transport corridor / valley easement
    const distFromCorridor = Math.abs(x + Math.sin(z * 0.02) * 26);
    if (distFromCorridor < 42) {
      y *= (distFromCorridor / 42);
    }

    posAttr.setY(i, y);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x06111D,
    roughness: 0.88,
    metalness: 0.15,
    flatShading: true
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  scene.add(terrainMesh);

  // Holographic Wireframe Topography Overlay
  const terrainWireMat = new THREE.MeshBasicMaterial({
    color: 0x11364F,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const terrainWireMesh = new THREE.Mesh(terrainGeo, terrainWireMat);
  terrainWireMesh.position.y += 0.06;
  scene.add(terrainWireMesh);

  // --------------------------------------------------------------------------
  // 5. Glowing Infrastructure Alignment Line (Highway DPR Ribbon & Bridges)
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

  // Primary Cyan Glowing Tube
  const tubeGeo = new THREE.TubeGeometry(alignmentCurve, 320, 0.55, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0x00D2FF,
    wireframe: true,
    transparent: true,
    opacity: 0.88
  });
  const alignmentTube = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(alignmentTube);

  // Parallel Secondary Blueprint Rail (Green)
  const parallelTubeGeo = new THREE.TubeGeometry(alignmentCurve, 220, 0.16, 6, false);
  const parallelMat = new THREE.MeshBasicMaterial({
    color: 0x497E5E,
    transparent: true,
    opacity: 0.8
  });
  const parallelTube = new THREE.Mesh(parallelTubeGeo, parallelMat);
  parallelTube.position.x += 2.2;
  scene.add(parallelTube);

  // Light Pulses Traveling along Corridor
  const pulseGroup = new THREE.Group();
  const pulseSpheres = [];
  const pulseGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xA3E8BF,
    transparent: true,
    opacity: 0.95
  });

  for (let i = 0; i < 14; i++) {
    const pMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulseGroup.add(pMesh);
    pulseSpheres.push({
      mesh: pMesh,
      t: i / 14,
      speed: 0.045 + Math.random() * 0.025
    });
  }
  scene.add(pulseGroup);

  // --------------------------------------------------------------------------
  // 6. Volumetric Structural Nodes at Waypoints
  // --------------------------------------------------------------------------

  // NODE 1 (Origin): Iconic Precision Geometric Core
  const coreNodeGroup = new THREE.Group();
  coreNodeGroup.position.set(0, 4.5, 0);

  const outerCubeGeo = new THREE.BoxGeometry(6.5, 6.5, 6.5);
  const outerCubeMat = new THREE.MeshBasicMaterial({
    color: 0x00D2FF,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const outerCube = new THREE.Mesh(outerCubeGeo, outerCubeMat);
  coreNodeGroup.add(outerCube);

  const innerCubeGeo = new THREE.BoxGeometry(4.2, 4.2, 4.2);
  const innerCubeMat = new THREE.MeshStandardMaterial({
    color: 0x497E5E,
    roughness: 0.3,
    metalness: 0.8,
    emissive: 0x1B3828,
    emissiveIntensity: 0.6
  });
  const innerCube = new THREE.Mesh(innerCubeGeo, innerCubeMat);
  coreNodeGroup.add(innerCube);

  // Orbital coordinate ring
  const ringGeo = new THREE.TorusGeometry(5.4, 0.08, 8, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xA3E8BF, transparent: true, opacity: 0.75 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 3;
  coreNodeGroup.add(ringMesh);

  scene.add(coreNodeGroup);

  // NODE 2 (Waypoint 02): Cable-Stayed Bridge Pylon Structure
  const bridgePylonGroup = new THREE.Group();
  bridgePylonGroup.position.set(-22, 6.2, -85);

  // Pylon Towers (A-Frame Towers)
  const pylonMat = new THREE.MeshStandardMaterial({
    color: 0x1A354A,
    roughness: 0.4,
    metalness: 0.7,
    emissive: 0x071D2D
  });
  const towerGeo = new THREE.CylinderGeometry(0.6, 1.2, 26, 6);
  const towerLeft = new THREE.Mesh(towerGeo, pylonMat);
  towerLeft.position.set(-4.5, 8, 0);
  towerLeft.rotation.z = -0.12;
  bridgePylonGroup.add(towerLeft);

  const towerRight = new THREE.Mesh(towerGeo, pylonMat);
  towerRight.position.set(4.5, 8, 0);
  towerRight.rotation.z = 0.12;
  bridgePylonGroup.add(towerRight);

  // Stay cables
  const cableMat = new THREE.LineBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.65 });
  for (let k = 1; k <= 5; k++) {
    const cablePointsLeft = [
      new THREE.Vector3(-4.5, 14 - k * 1.5, 0),
      new THREE.Vector3(-14 - k * 3.5, -2, 0)
    ];
    const cableGeoLeft = new THREE.BufferGeometry().setFromPoints(cablePointsLeft);
    bridgePylonGroup.add(new THREE.Line(cableGeoLeft, cableMat));

    const cablePointsRight = [
      new THREE.Vector3(4.5, 14 - k * 1.5, 0),
      new THREE.Vector3(14 + k * 3.5, -2, 0)
    ];
    const cableGeoRight = new THREE.BufferGeometry().setFromPoints(cablePointsRight);
    bridgePylonGroup.add(new THREE.Line(cableGeoRight, cableMat));
  }
  scene.add(bridgePylonGroup);

  // NODE 3 (Waypoint 03): Modular Architectural & 7D BIM Wireframe Complex
  const bimGroup = new THREE.Group();
  bimGroup.position.set(8, 10, -160);

  const bimMatCyan = new THREE.MeshBasicMaterial({ color: 0x00D2FF, wireframe: true, transparent: true, opacity: 0.7 });
  const bimMatGreen = new THREE.MeshBasicMaterial({ color: 0x497E5E, wireframe: true, transparent: true, opacity: 0.75 });

  // Multi-tier BIM blocks
  const block1 = new THREE.Mesh(new THREE.BoxGeometry(10, 16, 10), bimMatCyan);
  block1.position.set(0, 4, 0);
  bimGroup.add(block1);

  const block2 = new THREE.Mesh(new THREE.BoxGeometry(7, 22, 7), bimMatGreen);
  block2.position.set(7, 7, -6);
  bimGroup.add(block2);

  const block3 = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 12), bimMatCyan);
  block3.position.set(-6, 2, 5);
  bimGroup.add(block3);

  scene.add(bimGroup);

  // NODE 4 (Waypoint 04): Holographic NABL Structural Material Testing Cube
  const testNodeGroup = new THREE.Group();
  testNodeGroup.position.set(-14, 7.5, -258);

  const testFrameGeo = new THREE.BoxGeometry(8, 8, 8);
  const testFrameMat = new THREE.MeshBasicMaterial({
    color: 0x00D2FF,
    wireframe: true,
    transparent: true,
    opacity: 0.9
  });
  const testFrame = new THREE.Mesh(testFrameGeo, testFrameMat);
  testNodeGroup.add(testFrame);

  // Internal stress-line grid
  const stressGeo = new THREE.OctahedronGeometry(3.6, 2);
  const stressMat = new THREE.MeshBasicMaterial({
    color: 0xA3E8BF,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  const stressMesh = new THREE.Mesh(stressGeo, stressMat);
  testNodeGroup.add(stressMesh);

  // Orbiting material test particles
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 120;
  const particleArray = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount * 3; p += 3) {
    particleArray[p] = (Math.random() - 0.5) * 14;
    particleArray[p + 1] = (Math.random() - 0.5) * 14;
    particleArray[p + 2] = (Math.random() - 0.5) * 14;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particleArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0x00D2FF,
    transparent: true,
    opacity: 0.85
  });
  const particlePoints = new THREE.Points(particleGeo, particleMat);
  testNodeGroup.add(particlePoints);

  scene.add(testNodeGroup);

  // NODE 5 (Waypoint 05): Nationwide Smart Infrastructure Constellation
  const networkGroup = new THREE.Group();
  networkGroup.position.set(0, 10, -380);

  const beaconGeo = new THREE.CylinderGeometry(0.15, 0.4, 45, 6);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x00D2FF,
    transparent: true,
    opacity: 0.35
  });

  const nodeLocations = [
    [0, 0, 0],       // Vadodara HQ
    [-28, -2, -15],  // Bharuch
    [-42, -4, 25],   // Bhuj
    [18, -1, 35],    // Gandhinagar
    [-35, -3, 50],   // Junagadh
    [-15, -2, -30],  // Navsari
    [-65, 0, 80]     // Jaisalmer
  ];

  nodeLocations.forEach(([nx, ny, nz]) => {
    // Upward beacon beam
    const beam = new THREE.Mesh(beaconGeo, beaconMat);
    beam.position.set(nx, ny + 22.5, nz);
    networkGroup.add(beam);

    // Glowing node marker
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xA3E8BF })
    );
    marker.position.set(nx, ny, nz);
    networkGroup.add(marker);
  });
  scene.add(networkGroup);

  // --------------------------------------------------------------------------
  // 7. Scroll Tracking, Camera Spline Interpolation & HUD Waypoint Sync
  // --------------------------------------------------------------------------
  const waypoints = Array.from(document.querySelectorAll('.gdr-waypoint-card'));
  const trackerItems = Array.from(document.querySelectorAll('.gdr-tracker-item'));
  const trackerProgressLine = document.querySelector('.gdr-tracker-progress-line');
  const scrollPrompt = document.querySelector('.gdr-scroll-prompt');
  const hudCoordText = document.getElementById('gdr-hud-coords');

  const WAYPOINT_RANGES = [
    { index: 0, start: 0.00, end: 0.18, targetProgress: 0.00, label: 'OVERVIEW' },
    { index: 1, start: 0.19, end: 0.42, targetProgress: 0.28, label: 'INFRASTRUCTURE' },
    { index: 2, start: 0.43, end: 0.66, targetProgress: 0.54, label: 'DESIGN & BIM' },
    { index: 3, start: 0.67, end: 0.88, targetProgress: 0.77, label: 'TESTING & LABS' },
    { index: 4, start: 0.89, end: 1.00, targetProgress: 0.96, label: 'PARTNERSHIP' }
  ];

  let rawScrollProgress = 0;
  let smoothedProgress = 0;
  activeWaypointIndex = 0;
  const startTime = performance.now();

  function calculateScrollProgress() {
    const scrollY = window.scrollY;
    const trackRect = track.getBoundingClientRect();
    const trackTop = scrollY + trackRect.top;
    const trackHeight = track.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - window.innerHeight);
    const progress = (scrollY - trackTop) / maxScroll;
    return Math.max(0, Math.min(1, progress));
  }

  // Waypoint Tracker Click Handler
  trackerItems.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wp = WAYPOINT_RANGES[idx];
      if (!wp) return;
      const trackRect = track.getBoundingClientRect();
      const trackTop = window.scrollY + trackRect.top;
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      const targetScrollY = trackTop + (wp.targetProgress * maxScroll);
      window.scrollTo({
        top: Math.round(targetScrollY),
        behavior: 'smooth'
      });
    });
  });

  // Waypoint CTA Inquire / Explore Buttons
  const exploreDivisionsBtn = document.getElementById('btn-explore-divisions');
  if (exploreDivisionsBtn) {
    exploreDivisionsBtn.addEventListener('click', (e) => {
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

  const tenderInquiryBtn = document.getElementById('btn-tender-inquiry');
  if (tenderInquiryBtn) {
    tenderInquiryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const footer = document.getElementById('site-footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Main Render & Animation Loop
  // --------------------------------------------------------------------------
  let animationFrameId = 0;

  function renderLoop() {
    const elapsedTime = (performance.now() - startTime) * 0.001;

    // 1. Smoothly interpolate scroll progress for camera rail inertia
    rawScrollProgress = calculateScrollProgress();
    smoothedProgress += (rawScrollProgress - smoothedProgress) * 0.085;
    const p = Math.max(0.0001, Math.min(0.9999, smoothedProgress));

    // 2. Camera Spline Rail Evaluation
    const camPos = cameraSpline.getPointAt(p);
    const targetPos = targetSpline.getPointAt(p);

    // Subtle natural floating idle breathing (Hubtown style)
    const floatY = Math.sin(elapsedTime * 1.2) * 0.45;
    const floatX = Math.cos(elapsedTime * 0.9) * 0.35;
    camera.position.set(camPos.x + floatX, camPos.y + floatY, camPos.z);
    camera.lookAt(targetPos);

    // Move beacon light with camera
    beaconLight.position.copy(camera.position);

    // 3. Animate Structural Nodes
    // Node 1 rotating core
    coreNodeGroup.rotation.y = elapsedTime * 0.35;
    coreNodeGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.15;
    ringMesh.rotation.z = elapsedTime * 0.5;

    // Node 3 BIM block subtle hover
    bimGroup.position.y = 10 + Math.sin(elapsedTime * 1.4) * 0.6;

    // Node 4 test cube internal stress rotation
    stressMesh.rotation.x = elapsedTime * 0.6;
    stressMesh.rotation.y = elapsedTime * 0.8;
    particlePoints.rotation.y = elapsedTime * 0.15;

    // 4. Advance Corridor Light Pulses
    pulseSpheres.forEach(item => {
      item.t = (item.t + item.speed * 0.02) % 1;
      const point = alignmentCurve.getPointAt(item.t);
      item.mesh.position.copy(point);
    });

    // 5. Synchronize Narrative Cards & Journey Tracker
    let currentWaypoint = 0;
    for (let i = 0; i < WAYPOINT_RANGES.length; i++) {
      const range = WAYPOINT_RANGES[i];
      if (rawScrollProgress >= range.start && rawScrollProgress <= range.end) {
        currentWaypoint = i;
        break;
      }
    }

    if (currentWaypoint !== activeWaypointIndex) {
      activeWaypointIndex = currentWaypoint;

      // Update Waypoint Cards
      waypoints.forEach((card, idx) => {
        card.classList.toggle('is-active', idx === activeWaypointIndex);
      });

      // Update Tracker Left Rail
      trackerItems.forEach((item, idx) => {
        item.classList.toggle('is-active', idx === activeWaypointIndex);
      });
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
      hudCoordText.innerHTML = `GEO // LAT: 22.3072° N &bull; LON: 73.1812° E<br>CAMERA Z: ${camPos.z.toFixed(0)}m &bull; CAM_Y: ${camPos.y.toFixed(0)}m<br>MILESTONE: ${activeRange.label} [${(rawScrollProgress * 100).toFixed(0)}%]`;
    }

    // Render WebGL frame
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Window Resize
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', handleResize);

  // Start loop
  animationFrameId = requestAnimationFrame(renderLoop);

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
    }
  };
}

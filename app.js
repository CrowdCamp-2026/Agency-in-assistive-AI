/**
 * HarmonyCube: Multimodal Sensory Communication Cube Prototype
 * Facilitating co-regulation and negotiation between autistic children and family members
 */

// Application State
const state = {
  activeFace: 'child-tactile',
  sensoryPressure: 45, // 0 to 100%
  activeGesture: 'Need Space',
  noiseLevel: 68, // dB
  visualFlicker: 'Medium',
  classTimeRemaining: 15, // minutes
  soundEnabled: true,
  currentScenario: 'math-test',
  messages: [
    { sender: 'child', text: '🖐️ Squeezing hard (High Sensory Load)', time: '10:14 AM' },
    { sender: 'parent', text: 'Can we try 3 more math questions before we step out?', time: '10:15 AM' },
    { sender: 'ai', text: '⚖️ Clinician Suggestion: Child is at 65% overload. Recommend in-desk 2m headphone reset, then assess.', time: '10:15 AM' }
  ],
  selectedCompromiseId: 1,
  compromises: [
    {
      id: 1,
      title: 'In-Desk Sensory Reset',
      desc: 'Put on noise-canceling headphones + tactile fidget for 3 mins at desk, then do 2 questions.',
      tag: 'Micro-Break (Recommended)',
      harmonyScore: 88,
      duration: '3 mins'
    },
    {
      id: 2,
      title: 'Quiet Corner Station',
      desc: 'Move to back-of-room beanbag sensory station for 5 mins with sensory cube, then rejoin.',
      tag: 'Moderate Support',
      harmonyScore: 78,
      duration: '5 mins'
    },
    {
      id: 3,
      title: 'Immediate Hallway Decompression',
      desc: 'Full sensory exit: 5-minute cool-down walk with parent/aide to water fountain.',
      tag: 'High Relief',
      harmonyScore: 92,
      duration: '5-8 mins'
    }
  ]
};

// Face Target Orientations for Camera/Cube Rotation
const faceRotations = {
  'child-tactile': { x: 0, y: 0 },
  'child-gesture': { x: 0, y: Math.PI / 2 },
  'parent-text': { x: 0, y: -Math.PI / 2 },
  'harmony-ai': { x: 0, y: Math.PI },
  'calm-output': { x: -Math.PI / 2, y: 0 },
  'classroom-context': { x: Math.PI / 2, y: 0 }
};

// Canvas references for 6 faces
const faceCanvases = [];
const faceTextures = [];
const FACE_SIZE = 512;

// Audio Context
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playCalmTone(frequency = 440, type = 'sine', duration = 0.5) {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

function playHarmonyChord() {
  if (!state.soundEnabled) return;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    setTimeout(() => playCalmTone(freq, 'sine', 1.2), i * 120);
  });
}

// -------------------------------------------------------------
// Dynamic Canvas Renderers for the 6 Cube Faces
// -------------------------------------------------------------

function createFaceCanvas(faceIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = FACE_SIZE;
  canvas.height = FACE_SIZE;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx, faceIndex };
}

// Face 0: Front (+Z) -> Child Tactile & Squeeze
function renderChildTactileFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  // Border glow
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#06b6d4';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  // Header
  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 1: CHILD TACTILE', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Pressure & Squeeze Sensor', 35, 85);

  // Squeeze circle visualizer
  const centerX = FACE_SIZE / 2;
  const centerY = 240;
  const radius = 90 + (state.sensoryPressure * 0.4);

  const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Value Display
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(state.sensoryPressure)}%`, centerX, centerY + 14);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('Distress / Squeeze Force', centerX, centerY + 40);

  // Texture Ridges simulation at bottom
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('TACTILE RIBS / TEXTURE', 35, 385);

  for (let i = 0; i < 7; i++) {
    const y = 410 + i * 12;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(35, y, FACE_SIZE - 70, 6);
  }
}

// Face 1: Right (+X) -> Parent Text & Cues
function renderParentTextFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#8b5cf6';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#8b5cf6';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 3: PARENT INPUT', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Text & Calibrated Guidance', 35, 85);

  // Last parent message bubble
  const parentMsgs = state.messages.filter(m => m.sender === 'parent');
  const latest = parentMsgs[parentMsgs.length - 1] || { text: 'How are you feeling right now?' };

  ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
  ctx.lineWidth = 2;
  ctx.roundRect(35, 125, FACE_SIZE - 70, 150, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f3e8ff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('💬 Parent Message:', 55, 160);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#ffffff';
  wrapText(ctx, `"${latest.text}"`, 55, 200, FACE_SIZE - 110, 26);

  // Quick Empathy Tags
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('ACTIVE CUES:', 35, 320);

  const cues = ['⏱️ 3 Min Buffer', '🎧 Headphones First', '🤝 Co-Regulating'];
  cues.forEach((cue, idx) => {
    ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.roundRect(35, 340 + (idx * 45), FACE_SIZE - 70, 36, 10);
    ctx.fill();

    ctx.fillStyle = '#f3e8ff';
    ctx.font = '16px sans-serif';
    ctx.fillText(cue, 55, 364 + (idx * 45));
  });
}

// Face 2: Left (-X) -> Child Gesture Sensor
function renderChildGestureFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#06b6d4';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 2: CHILD GESTURE', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Motion & Spatial Orientation', 35, 85);

  // Active Gesture Display Box
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 3;
  ctx.roundRect(35, 120, FACE_SIZE - 70, 180, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.activeGesture, FACE_SIZE / 2, 195);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Current Movement Intent', FACE_SIZE / 2, 235);

  // Gesture motion trail illustration
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('SPATIAL IMU SENSORS:', 35, 340);

  const gestures = [
    { name: 'Wave / Push Away', desc: 'Need Space' },
    { name: 'Forward Tilt', desc: 'Overwhelmed' },
    { name: 'Side Rocking', desc: 'Self-Soothing' }
  ];

  gestures.forEach((g, i) => {
    const isCur = g.desc === state.activeGesture;
    ctx.fillStyle = isCur ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(35, 365 + (i * 42), FACE_SIZE - 70, 34, 8);
    ctx.fill();

    ctx.fillStyle = isCur ? '#38bdf8' : '#cbd5e1';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${g.name} → ${g.desc}`, 50, 388 + (i * 42));
  });
}

// Face 3: Back (-Z) -> Harmony / AI Clinician Negotiation
function renderHarmonyFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#10b981';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 4: HARMONY & AI', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Clinician Negotiation Engine', 35, 85);

  // Selected Compromise Card
  const comp = state.compromises.find(c => c.id === state.selectedCompromiseId) || state.compromises[0];

  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.roundRect(35, 120, FACE_SIZE - 70, 200, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`✓ ${comp.title}`, 55, 160);

  ctx.fillStyle = '#ffffff';
  ctx.font = '17px sans-serif';
  wrapText(ctx, comp.desc, 55, 195, FACE_SIZE - 110, 24);

  // Harmony Score Gauge
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CO-REGULATION HARMONY METER:', 35, 360);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.roundRect(35, 380, FACE_SIZE - 70, 28, 14);
  ctx.fill();

  ctx.fillStyle = 'linear-gradient(90deg, #10b981, #06b6d4)';
  const barW = ((FACE_SIZE - 70) * comp.harmonyScore) / 100;
  ctx.fillStyle = '#10b981';
  ctx.roundRect(35, 380, barW, 28, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${comp.harmonyScore}% Alignment Reached`, FACE_SIZE / 2, 400);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#6ee7b7';
  ctx.font = '14px sans-serif';
  ctx.fillText('🤖 AI Mediation Protocol: OT Sensory Diet Compliant', 35, 450);
}

// Face 4: Top (+Y) -> Calming Sensory Output & Breathing Pacer
function renderCalmOutputFace(ctx) {
  ctx.fillStyle = '#091e3a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 5: CALMING OUTPUT', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('4-7-8 Breathing & Haptic Light', 35, 85);

  // Glowing Orb Center
  const centerX = FACE_SIZE / 2;
  const centerY = 270;
  const t = Date.now() * 0.002;
  const pulse = Math.sin(t) * 0.25 + 0.75;
  const rad = 110 * pulse;

  const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, rad);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#38bdf8');
  grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.4)');
  grad.addColorStop(1, 'rgba(9, 30, 58, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  const breathState = Math.sin(t) > 0 ? 'Breathe In...' : 'Gently Release...';
  ctx.fillText(breathState, centerX, centerY + 8);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('Bioluminescent Haptic Feedback', centerX, 440);
  ctx.textAlign = 'left';
}

// Face 5: Bottom (-Y) -> Classroom Sensory Context
function renderClassroomContextFace(ctx) {
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#a855f7';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 6: CLASSROOM CONTEXT', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Sensory Environment Telemetry', 35, 85);

  // Sensor metrics
  const metrics = [
    { label: 'Ambient Noise', val: `${state.noiseLevel} dB`, status: state.noiseLevel > 65 ? 'Elevated' : 'Normal', color: '#f59e0b' },
    { label: 'Visual Stimulation', val: state.visualFlicker, status: 'Fluorescent Lighting', color: '#38bdf8' },
    { label: 'Lesson Time Left', val: `${state.classTimeRemaining} Mins`, status: 'Math Worksheet', color: '#10b981' }
  ];

  metrics.forEach((m, idx) => {
    const y = 130 + (idx * 105);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(35, y, FACE_SIZE - 70, 85, 12);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(m.label, 55, y + 32);

    ctx.fillStyle = m.color;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(m.val, 55, y + 64);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(m.status, FACE_SIZE - 55, y + 60);
    ctx.textAlign = 'left';
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// -------------------------------------------------------------
// Three.js 3D Interactive Scene Initialization
// -------------------------------------------------------------

let scene, camera, renderer, cubeMesh;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0.3, y: -0.4 };
let currentRotation = { x: 0.3, y: -0.4 };

function init3DScene() {
  const container = document.getElementById('cubeCanvasContainer');
  const width = container.clientWidth;
  const height = container.clientHeight || 500;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 4.8;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Create 6 face materials with dynamic CanvasTextures
  // Three.js BoxGeometry material face index order:
  // [0: +X (Right), 1: -X (Left), 2: +Y (Top), 3: -Y (Bottom), 4: +Z (Front), 5: -Z (Back)]
  const materials = [];
  const renderFunctions = [
    renderParentTextFace,      // 0: +X Right (Parent Text)
    renderChildGestureFace,    // 1: -X Left (Child Gesture)
    renderCalmOutputFace,      // 2: +Y Top (Calming Breathing Output)
    renderClassroomContextFace,// 3: -Y Bottom (Classroom Telemetry)
    renderChildTactileFace,    // 4: +Z Front (Child Tactile/Squeeze)
    renderHarmonyFace          // 5: -Z Back (Harmony & AI Clinician)
  ];

  for (let i = 0; i < 6; i++) {
    const faceObj = createFaceCanvas(i);
    faceCanvases.push(faceObj);
    renderFunctions[i](faceObj.ctx);

    const texture = new THREE.CanvasTexture(faceObj.canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    faceTextures.push(texture);

    materials.push(new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 0.15
    }));
  }

  // Rounded Box Geometry using BoxGeometry + bevel or standard geometry
  const geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  cubeMesh = new THREE.Mesh(geometry, materials);
  scene.add(cubeMesh);

  // Ambient Floating Halo ring around cube
  const ringGeo = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  cubeMesh.add(ring);

  // Interaction handlers for rotation
  const domEl = renderer.domElement;

  domEl.addEventListener('mousedown', e => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetRotation.y += deltaX * 0.008;
    targetRotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  domEl.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener('touchend', () => { isDragging = false; });

  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    targetRotation.y += deltaX * 0.008;
    targetRotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate();
}

function updateFaceTextures() {
  const renderFunctions = [
    renderParentTextFace,
    renderChildGestureFace,
    renderCalmOutputFace,
    renderClassroomContextFace,
    renderChildTactileFace,
    renderHarmonyFace
  ];

  for (let i = 0; i < 6; i++) {
    renderFunctions[i](faceCanvases[i].ctx);
    faceTextures[i].needsUpdate = true;
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth rotation interpolation (damping)
  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

  if (cubeMesh) {
    cubeMesh.rotation.x = currentRotation.x;
    cubeMesh.rotation.y = currentRotation.y;
  }

  // Update top breathing face dynamically for continuous animation
  renderCalmOutputFace(faceCanvases[2].ctx);
  faceTextures[2].needsUpdate = true;

  renderer.render(scene, camera);
}

// -------------------------------------------------------------
// UI & State Interaction Bindings
// -------------------------------------------------------------

function snapToFace(faceId) {
  state.activeFace = faceId;
  const rot = faceRotations[faceId];
  if (rot) {
    targetRotation.x = rot.x;
    targetRotation.y = rot.y;
  }

  // Update tab UI
  document.querySelectorAll('.facet-tab').forEach(tab => {
    if (tab.dataset.face === faceId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  playCalmTone(520, 'triangle', 0.2);
}

function handleSqueeze(delta) {
  state.sensoryPressure = Math.min(100, Math.max(5, state.sensoryPressure + delta));
  
  // Recalculate AI suggestions if distress is very high
  if (state.sensoryPressure > 75) {
    state.selectedCompromiseId = 3; // Shift to immediate decompression
  } else if (state.sensoryPressure > 45) {
    state.selectedCompromiseId = 2; // Quiet corner
  } else {
    state.selectedCompromiseId = 1; // In-desk
  }

  updateDOM();
  updateFaceTextures();
  playCalmTone(300 + state.sensoryPressure * 3, 'sine', 0.25);
}

function handleGestureSelect(gestureName) {
  state.activeGesture = gestureName;
  
  if (gestureName === 'Emergency Exit') {
    state.sensoryPressure = 90;
    state.selectedCompromiseId = 3;
  } else if (gestureName === 'Overwhelmed') {
    state.sensoryPressure = 70;
    state.selectedCompromiseId = 2;
  }

  updateDOM();
  updateFaceTextures();
  playCalmTone(620, 'sine', 0.3);
}

function handleParentSend(text) {
  if (!text.trim()) return;
  
  state.messages.push({
    sender: 'parent',
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // AI Clinician instant co-regulation synthesis response
  setTimeout(() => {
    let aiResponse = '';
    if (state.sensoryPressure > 70) {
      aiResponse = `⚖️ AI Clinician: Child's tactile distress is ${Math.round(state.sensoryPressure)}%. A 5-minute quiet corner or hallway step-out is strongly recommended before resuming.`;
    } else {
      aiResponse = `⚖️ AI Clinician: Moderate sensory tension (${Math.round(state.sensoryPressure)}%). Win-Win Compromise: Put on headphones, finish 1 problem, then take 3-minute sensory cube break.`;
    }

    state.messages.push({
      sender: 'ai',
      text: aiResponse,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    updateDOM();
    updateFaceTextures();
    playHarmonyChord();
  }, 600);

  updateDOM();
  updateFaceTextures();
  playCalmTone(700, 'sine', 0.2);
}

function selectCompromise(id) {
  state.selectedCompromiseId = id;
  updateDOM();
  updateFaceTextures();
  playCalmTone(600, 'sine', 0.25);
}

function triggerAgreement() {
  const comp = state.compromises.find(c => c.id === state.selectedCompromiseId);
  const toast = document.getElementById('harmonyToast');
  toast.innerText = `🤝 Agreement Reached: ${comp.title} (${comp.duration})`;
  toast.classList.add('visible');

  playHarmonyChord();

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);

  snapToFace('harmony-ai');
}

function setScenario(scenarioKey) {
  state.currentScenario = scenarioKey;
  if (scenarioKey === 'math-test') {
    state.sensoryPressure = 65;
    state.activeGesture = 'Need Space';
    state.noiseLevel = 54;
    state.visualFlicker = 'Low';
    state.classTimeRemaining = 12;
    state.messages = [
      { sender: 'child', text: '🖐️ High pressure squeeze: Overwhelmed by timed math test', time: '10:14 AM' },
      { sender: 'parent', text: 'Can we try 3 more math questions before we step out?', time: '10:15 AM' },
      { sender: 'ai', text: '⚖️ Suggestion: 2-minute in-desk headphone reset, then complete 2 problems together.', time: '10:15 AM' }
    ];
  } else if (scenarioKey === 'group-work') {
    state.sensoryPressure = 85;
    state.activeGesture = 'Overwhelmed';
    state.noiseLevel = 82;
    state.visualFlicker = 'High';
    state.classTimeRemaining = 25;
    state.messages = [
      { sender: 'child', text: '🖐️ Max squeeze + Tilt Down: Too loud in classroom group station', time: '1:30 PM' },
      { sender: 'parent', text: 'Group project is due today, but I see you need quiet.', time: '1:31 PM' },
      { sender: 'ai', text: '⚖️ Suggestion: Move to sensory quiet corner for 5 mins; complete role asynchronously.', time: '1:31 PM' }
    ];
    state.selectedCompromiseId = 2;
  } else if (scenarioKey === 'recess-transition') {
    state.sensoryPressure = 35;
    state.activeGesture = 'Self-Soothing';
    state.noiseLevel = 60;
    state.visualFlicker = 'Medium';
    state.classTimeRemaining = 5;
    state.messages = [
      { sender: 'child', text: '🖐️ Gentle rhythm tapping: Preparing for noisy hallway transition', time: '2:45 PM' },
      { sender: 'parent', text: 'Let’s leave 2 minutes before the bell rings.', time: '2:46 PM' }
    ];
    state.selectedCompromiseId = 1;
  }

  updateDOM();
  updateFaceTextures();
  playHarmonyChord();
}

// -------------------------------------------------------------
// DOM Updates
// -------------------------------------------------------------

function updateDOM() {
  // Update pressure bar
  const pressureFill = document.getElementById('pressureFill');
  const pressureVal = document.getElementById('pressureValue');
  if (pressureFill && pressureVal) {
    pressureFill.style.width = `${state.sensoryPressure}%`;
    pressureVal.innerText = `${Math.round(state.sensoryPressure)}%`;

    if (state.sensoryPressure > 75) {
      pressureFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else if (state.sensoryPressure > 40) {
      pressureFill.style.background = 'linear-gradient(90deg, #06b6d4, #f59e0b)';
    } else {
      pressureFill.style.background = 'linear-gradient(90deg, #06b6d4, #38bdf8)';
    }
  }

  // Update gesture chips
  document.querySelectorAll('.chip-gesture').forEach(chip => {
    if (chip.dataset.gesture === state.activeGesture) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Update chat history
  const chatHistory = document.getElementById('chatHistory');
  if (chatHistory) {
    chatHistory.innerHTML = state.messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        <div>${m.text}</div>
        <div style="font-size:0.65rem; opacity:0.6; margin-top:3px; text-align:right;">${m.time}</div>
      </div>
    `).join('');
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Update compromise list
  const compList = document.getElementById('compromiseList');
  if (compList) {
    compList.innerHTML = state.compromises.map(c => `
      <div class="compromise-item ${c.id === state.selectedCompromiseId ? 'selected' : ''}" onclick="selectCompromise(${c.id})">
        <div class="compromise-title">
          <span>${c.title}</span>
          <span class="compromise-tag">${c.tag}</span>
        </div>
        <div class="compromise-desc">${c.desc}</div>
      </div>
    `).join('');
  }

  // Update Harmony meter
  const comp = state.compromises.find(c => c.id === state.selectedCompromiseId) || state.compromises[0];
  const meterFill = document.getElementById('harmonyMeterFill');
  const meterText = document.getElementById('harmonyScoreText');
  if (meterFill && meterText) {
    meterFill.style.width = `${comp.harmonyScore}%`;
    meterText.innerText = `${comp.harmonyScore}% (High Co-Regulation)`;
  }
}

// -------------------------------------------------------------
// Initialize App on DOM Loaded
// -------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  init3DScene();
  updateDOM();

  // Face navigation clicks
  document.querySelectorAll('.facet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      snapToFace(tab.dataset.face);
    });
  });

  // Sound toggle button
  const soundBtn = document.getElementById('toggleSoundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.classList.toggle('active', state.soundEnabled);
      soundBtn.innerHTML = state.soundEnabled ? '🔊 Sound: On' : '🔇 Sound: Muted';
    });
  }

  // Parent send button & enter key
  const parentInput = document.getElementById('parentInput');
  const parentSendBtn = document.getElementById('parentSendBtn');
  if (parentSendBtn && parentInput) {
    parentSendBtn.addEventListener('click', () => {
      handleParentSend(parentInput.value);
      parentInput.value = '';
    });
    parentInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        handleParentSend(parentInput.value);
        parentInput.value = '';
      }
    });
  }

  // Parent chip clicks
  document.querySelectorAll('.btn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (parentInput) {
        parentInput.value = chip.innerText.replace(/^[^\s]+\s/, '');
        parentInput.focus();
      }
    });
  });

  // Scenario select
  const scenarioSelect = document.getElementById('scenarioSelect');
  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', e => {
      setScenario(e.target.value);
    });
  }
});

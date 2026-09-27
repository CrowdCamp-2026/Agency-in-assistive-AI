/**
 * HarmonyCube: Multimodal Sensory Communication Cube Prototype
 * Facilitating co-regulation and negotiation between autistic children and family members
 */

// Application State
const state = {
  activeView: 'cube', // 'cube', 'harmony', 'instructions'
  activeFace: 'child-tactile',
  sensoryPressure: 45, // 0 to 100%
  vibrationAlertActive: false,
  noiseLevel: 68, // dB
  visualFlicker: 'Medium',
  classTimeRemaining: 15, // minutes
  soundEnabled: true,
  currentScenario: 'math-test',
  messages: [
    { sender: 'child', text: '🖐️ Squeezing at 45% ➔ Translated: "Classroom noise tension is rising."', time: '10:14 AM' },
    { sender: 'parent', text: 'Can we try 3 more math questions before we step out?', time: '10:15 AM' },
    { sender: 'ai', text: '⚖️ Clinician Suggestion: Child is at moderate load. Recommend in-desk 2m headphone reset, then assess.', time: '10:15 AM' }
  ],
  selectedCompromiseId: 1,
  compromises: [
    {
      id: 1,
      title: 'In-Desk Sensory Reset',
      desc: 'Put on noise-canceling headphones + tactile fidget for 3 minutes at desk, then complete 2 questions.',
      tag: 'Tier 1: Micro-Break (Recommended)',
      harmonyScore: 88,
      duration: '3 mins',
      rationale: 'Preserves classroom continuity while dampening auditory overload immediately.'
    },
    {
      id: 2,
      title: 'Quiet Corner Station',
      desc: 'Move to back-of-room beanbag sensory station for 5 minutes with sensory cube, then rejoin worksheet.',
      tag: 'Tier 2: Moderate Support',
      harmonyScore: 78,
      duration: '5 mins',
      rationale: 'Provides physical distance from classroom movement while staying in the room.'
    },
    {
      id: 3,
      title: 'Immediate Hallway Decompression',
      desc: 'Full sensory exit: 5-minute cool-down walk with parent or aide to get water and regulate vestibular input.',
      tag: 'Tier 3: High Relief',
      harmonyScore: 92,
      duration: '5-8 mins',
      rationale: 'Essential when sympathetic nervous system is in acute fight-or-flight.'
    }
  ]
};

// Exact Face Target Rotations for 3D Cube (BoxGeometry)
const faceRotations = {
  'child-tactile': { x: 0, y: 0 },                    // Front (+Z) - Face 1
  'translation-face': { x: 0, y: Math.PI / 2 },       // Left (-X) - Face 2
  'parent-text': { x: 0, y: -Math.PI / 2 },           // Right (+X) - Face 3
  'harmony-ai': { x: 0, y: Math.PI }                  // Back (-Z) - Face 4
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

// Pleasant "Ding" Chime for incoming message alert
function playDingSound() {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Primary bell tone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5

    gain1.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    // Harmonic bell chime
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6

    gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.8);
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.warn('Ding sound error', e);
  }
}

// Haptic Vibration Audio Rumble
function playHapticRumble(duration = 0.6, freq = 75) {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.06);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Haptic audio error', e);
  }
}

function playHarmonyChord() {
  if (!state.soundEnabled) return;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    setTimeout(() => playCalmTone(freq, 'sine', 1.2), i * 120);
  });
}

// -------------------------------------------------------------
// View Switching Function
// -------------------------------------------------------------
function switchView(viewName) {
  state.activeView = viewName;
  
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));

  if (viewName === 'cube') {
    document.getElementById('panelCube').classList.add('active');
    document.getElementById('viewTabCube').classList.add('active');
    setTimeout(() => {
      const container = document.getElementById('cubeCanvasContainer');
      if (container && camera && renderer) {
        const w = container.clientWidth;
        const h = container.clientHeight || 500;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }, 50);
  } else if (viewName === 'harmony') {
    document.getElementById('panelHarmony').classList.add('active');
    document.getElementById('viewTabHarmony').classList.add('active');
  } else if (viewName === 'instructions') {
    document.getElementById('panelInstructions').classList.add('active');
    document.getElementById('viewTabInstructions').classList.add('active');
  }

  playCalmTone(480, 'sine', 0.2);
}

// -------------------------------------------------------------
// Translation Helpers: Squeeze -> Text Translation
// -------------------------------------------------------------

function getSqueezeTranslation(pressure) {
  if (pressure > 75) {
    return {
      category: 'Acute Overload',
      text: '"Sensory overload is severe. I urgently need to leave the classroom for a break."',
      color: '#ef4444'
    };
  } else if (pressure > 45) {
    return {
      category: 'Moderate Overload',
      text: '"Classroom noise tension is rising. I need a quiet buffer or short reset."',
      color: '#f59e0b'
    };
  } else {
    return {
      category: 'Mild / Regulated',
      text: '"I am feeling mostly okay, managing the task with light tactile pressure."',
      color: '#06b6d4'
    };
  }
}

// -------------------------------------------------------------
// Dynamic Canvas Renderers for Cube Faces
// -------------------------------------------------------------

function createFaceCanvas(faceIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = FACE_SIZE;
  canvas.height = FACE_SIZE;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx, faceIndex };
}

// Render Blank Face (For Faces 5 & 6)
function renderBlankFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeRect(6, 6, FACE_SIZE - 12, FACE_SIZE - 12);
}

// Face 0: Right (+X) -> Face 3 Parent Text & Messages
function renderParentTextFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#8b5cf6';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#8b5cf6';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 3: PARENT TEXT', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Family Support & Guidance Cues', 35, 85);

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
  ctx.fillText('💬 Latest Parent Message:', 55, 160);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#ffffff';
  wrapText(ctx, `"${latest.text}"`, 55, 200, FACE_SIZE - 110, 26);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('NOTIFYING CHILD CUBE:', 35, 320);

  ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
  ctx.roundRect(35, 340, FACE_SIZE - 70, 60, 10);
  ctx.fill();

  ctx.fillStyle = '#a78bfa';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('🔔 Vibration Alert & Ding Chime', 55, 375);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText('Informs child of incoming message quietly', 55, 435);
}

// Face 1: Left (-X) -> Face 2: Bidirectional Translation Face
function renderTranslationFace(ctx) {
  ctx.fillStyle = '#0b192c';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 2: TRANSLATION', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Bidirectional Multimodal Bridge', 35, 85);

  const trans = getSqueezeTranslation(state.sensoryPressure);

  // Channel 1: Child Squeeze -> Parent Text
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 2;
  ctx.roundRect(35, 115, FACE_SIZE - 70, 155, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`🖐️ CHILD SQUEEZE (${Math.round(state.sensoryPressure)}%) ➔ TEXT:`, 50, 145);

  ctx.fillStyle = trans.color;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`[${trans.category}]`, 50, 172);

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  wrapText(ctx, trans.text, 50, 202, FACE_SIZE - 100, 22);

  // Channel 2: Parent -> Child Arrival Notification (Vibration & Ding)
  ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.lineWidth = 2;
  ctx.roundRect(35, 290, FACE_SIZE - 70, 175, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('🔔 PARENT ➔ CHILD NOTIFICATION:', 50, 320);

  ctx.fillStyle = '#a78bfa';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('Vibration Pulse + Ding Sound Alert', 50, 355);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('Alerts child that parent sent a new message', 50, 385);

  // Draw Vibration waveform bars
  const t = Date.now() * 0.005;
  for (let i = 0; i < 10; i++) {
    const barH = 15 + Math.sin(t + i * 0.7) * 12;
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(50 + i * 38, 445 - barH, 24, barH);
  }
}

// Face 4: Front (+Z) -> Face 1 Child Tactile & Squeeze
function renderChildTactileFace(ctx) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, FACE_SIZE, FACE_SIZE);

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#06b6d4';
  ctx.strokeRect(7, 7, FACE_SIZE - 14, FACE_SIZE - 14);

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FACE 1: CHILD TACTILE', 35, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Pressure & Squeeze Sensor', 35, 85);

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

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(state.sensoryPressure)}%`, centerX, centerY + 14);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('Distress / Squeeze Force', centerX, centerY + 40);

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

// Face 5: Back (-Z) -> Face 4 Harmony / AI Clinician Negotiation Side
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
  ctx.fillText('Clinician Negotiation Step-In', 35, 85);

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

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CO-REGULATION HARMONY METER:', 35, 360);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.roundRect(35, 380, FACE_SIZE - 70, 28, 14);
  ctx.fill();

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
  ctx.fillText('🤖 AI Mediation: OT Sensory Diet Compliant', 35, 450);
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
  if (!container) return;
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

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  const materials = [];
  // Three.js BoxGeometry material face order:
  // [0: +X (Right), 1: -X (Left), 2: +Y (Top), 3: -Y (Bottom), 4: +Z (Front), 5: -Z (Back)]
  const renderFunctions = [
    renderParentTextFace,          // 0: +X Right -> Face 3: Parent Text
    renderTranslationFace,         // 1: -X Left -> Face 2: Translation Face
    renderBlankFace,               // 2: +Y Top -> Face 5: Blank
    renderBlankFace,               // 3: -Y Bottom -> Face 6: Blank
    renderChildTactileFace,        // 4: +Z Front -> Face 1: Child Tactile
    renderHarmonyFace              // 5: -Z Back -> Face 4: Harmony / AI Negotiation
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

  const geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  cubeMesh = new THREE.Mesh(geometry, materials);
  scene.add(cubeMesh);

  const ringGeo = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  cubeMesh.add(ring);

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
    renderTranslationFace,
    renderBlankFace,
    renderBlankFace,
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

  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

  if (cubeMesh) {
    cubeMesh.rotation.x = currentRotation.x;
    cubeMesh.rotation.y = currentRotation.y;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
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
  
  if (state.sensoryPressure > 75) {
    state.selectedCompromiseId = 3;
  } else if (state.sensoryPressure > 45) {
    state.selectedCompromiseId = 2;
  } else {
    state.selectedCompromiseId = 1;
  }

  updateDOM();
  updateFaceTextures();
  playCalmTone(300 + state.sensoryPressure * 3, 'sine', 0.25);
}

function handleParentSend(text) {
  if (!text.trim()) return;
  
  state.messages.push({
    sender: 'parent',
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // Trigger gentle notification chime ("ding") and haptic rumble to inform child of incoming message
  playDingSound();
  playHapticRumble(0.5, 75);

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
  }, 4500);

  if (state.activeView === 'cube') {
    snapToFace('harmony-ai');
  }
}

function setScenario(scenarioKey) {
  state.currentScenario = scenarioKey;
  if (scenarioKey === 'math-test') {
    state.sensoryPressure = 65;
    state.noiseLevel = 54;
    state.visualFlicker = 'Low';
    state.classTimeRemaining = 12;
    state.messages = [
      { sender: 'child', text: '🖐️ Squeezing at 65% ➔ Translated: "Math test pressure is overwhelming."', time: '10:14 AM' },
      { sender: 'parent', text: 'Can we try 3 more math questions before we step out?', time: '10:15 AM' },
      { sender: 'ai', text: '⚖️ Suggestion: 2-minute in-desk headphone reset, then complete 2 problems together.', time: '10:15 AM' }
    ];
  } else if (scenarioKey === 'group-work') {
    state.sensoryPressure = 85;
    state.noiseLevel = 82;
    state.visualFlicker = 'High';
    state.classTimeRemaining = 25;
    state.messages = [
      { sender: 'child', text: '🖐️ Squeezing at 85% ➔ Translated: "Severe noise overload in group station."', time: '1:30 PM' },
      { sender: 'parent', text: 'Group project is due today, but I see you need quiet.', time: '1:31 PM' },
      { sender: 'ai', text: '⚖️ Suggestion: Move to sensory quiet corner for 5 mins; complete role asynchronously.', time: '1:31 PM' }
    ];
    state.selectedCompromiseId = 2;
  } else if (scenarioKey === 'recess-transition') {
    state.sensoryPressure = 35;
    state.noiseLevel = 60;
    state.visualFlicker = 'Medium';
    state.classTimeRemaining = 5;
    state.messages = [
      { sender: 'child', text: '🖐️ Squeezing at 35% ➔ Translated: "Preparing for noisy hallway transition."', time: '2:45 PM' },
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
  const pressureFill = document.getElementById('pressureFill');
  const pressureVal = document.getElementById('pressureValue');
  const calloutDistress = document.getElementById('calloutDistress');
  if (pressureFill && pressureVal) {
    pressureFill.style.width = `${state.sensoryPressure}%`;
    pressureVal.innerText = `${Math.round(state.sensoryPressure)}%`;
    if (calloutDistress) calloutDistress.innerText = `${Math.round(state.sensoryPressure)}`;

    if (state.sensoryPressure > 75) {
      pressureFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else if (state.sensoryPressure > 40) {
      pressureFill.style.background = 'linear-gradient(90deg, #06b6d4, #f59e0b)';
    } else {
      pressureFill.style.background = 'linear-gradient(90deg, #06b6d4, #38bdf8)';
    }
  }

  // Translation Live Feed Updates
  const trans = getSqueezeTranslation(state.sensoryPressure);
  const transChildOutput = document.getElementById('transChildOutput');
  const transDistressBadge = document.getElementById('transDistressBadge');

  if (transChildOutput) transChildOutput.innerText = trans.text;
  if (transDistressBadge) {
    transDistressBadge.innerText = trans.category;
    transDistressBadge.style.color = trans.color;
  }

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

  const compDeck = document.getElementById('compromisesDeck');
  if (compDeck) {
    compDeck.innerHTML = state.compromises.map(c => `
      <div class="compromise-card-lg ${c.id === state.selectedCompromiseId ? 'selected' : ''}" onclick="selectCompromise(${c.id})">
        <div class="compromise-card-header">
          <span class="compromise-tier-tag">${c.tag}</span>
          <span style="font-size:0.8rem; color:#a7f3d0; font-weight:700;">⏱️ ${c.duration}</span>
        </div>
        <div class="compromise-card-title">${c.title}</div>
        <div class="compromise-card-desc">${c.desc}</div>
        <div class="compromise-meta-row">
          <div class="compromise-meta-item">
            <span>✨</span> Harmony Score: ${c.harmonyScore}%
          </div>
          <div style="font-size:0.75rem; color:#94a3b8; font-style:italic;">
            ${c.rationale}
          </div>
        </div>
      </div>
    `).join('');
  }

  const synthChild = document.getElementById('synthChildState');
  if (synthChild) {
    synthChild.innerHTML = `Tactile Force: <strong>${Math.round(state.sensoryPressure)}% (${state.sensoryPressure > 70 ? 'High Overload' : state.sensoryPressure > 40 ? 'Moderate Squeeze' : 'Gentle / Regulated'})</strong>. Non-verbal indicator: ${state.sensoryPressure > 70 ? 'High sympathetic nervous system load' : 'Manageable sensory demand'}.`;
  }

  const synthTrans = document.getElementById('synthTransState');
  if (synthTrans) {
    synthTrans.innerHTML = `Child Squeeze ➔ Text: <em>${trans.text}</em> &bull; Parent ➔ Child: <em>Vibration + Ding Notification Active</em>.`;
  }
}

// -------------------------------------------------------------
// Initialize App on DOM Loaded
// -------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  init3DScene();
  updateDOM();

  document.querySelectorAll('.facet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      snapToFace(tab.dataset.face);
    });
  });

  const soundBtn = document.getElementById('toggleSoundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.classList.toggle('active', state.soundEnabled);
      soundBtn.innerHTML = state.soundEnabled ? '🔊 Sound: On' : '🔇 Sound: Muted';
    });
  }

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

  document.querySelectorAll('.btn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (parentInput) {
        parentInput.value = chip.innerText.replace(/^[^\s]+\s/, '');
        parentInput.focus();
      }
    });
  });

  const scenarioSelect = document.getElementById('scenarioSelect');
  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', e => {
      setScenario(e.target.value);
    });
  }
});

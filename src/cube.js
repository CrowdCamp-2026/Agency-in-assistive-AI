// Sensory Cube Controller: Direct 4-Quadrant Tactile Faces & 3D Simulation

class SensoryCubeController {
  constructor() {
    this.currentFace = 1;
    this.rotations = {
      1: { x: 0, y: 0 },       // Front (Body Battery)
      2: { x: 0, y: -90 },     // Right (Sensory Triage)
      3: { x: 0, y: -180 },    // Back (Regulation Need)
      4: { x: 0, y: 90 },      // Left (Transition Buffer)
      5: { x: -90, y: 0 },     // Top (Zones of Regulation)
      6: { x: 90, y: 0 }       // Bottom (Emergency Stop)
    };

    // Current physical state of the cube
    this.state = {
      face1_battery: 'buzzing',
      face2_sensory: ['noise'],
      face3_comfort: 'headphones',
      face4_buffer: 'plus_5',
      face5_zone: 'yellow',
      face6_stopActive: false,
      lastUpdated: new Date()
    };

    this.onTelemetryUpdate = null;
  }

  setFace(faceNumber) {
    this.currentFace = faceNumber;
    const cubeEl = document.getElementById('cube3D');
    if (cubeEl) {
      const rot = this.rotations[faceNumber];
      cubeEl.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
    }
    this.updateActiveFaceTabs(faceNumber);
  }

  rotateNext() {
    const next = (this.currentFace % 6) + 1;
    this.setFace(next);
  }

  rotatePrev() {
    const prev = this.currentFace === 1 ? 6 : this.currentFace - 1;
    this.setFace(prev);
  }

  updateActiveFaceTabs(faceNumber) {
    document.querySelectorAll('.cube-face-pill').forEach(btn => {
      const f = parseInt(btn.getAttribute('data-face'));
      if (f === faceNumber) {
        btn.classList.add('bg-teal-600', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      } else {
        btn.classList.remove('bg-teal-600', 'text-white', 'shadow-xs');
        btn.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      }
    });

    const activeFaceTitle = document.getElementById('activeFaceTitleText');
    const faceNames = {
      1: "Face 1: Body Engine Battery (Touch a quadrant to set energy)",
      2: "Face 2: Sensory Push-Pins (Click pins to toggle discomfort)",
      3: "Face 3: Comfort Helper (Touch soothing tool)",
      4: "Face 4: Transition Buffer (Touch to request buffer time)",
      5: "Face 5: Emotional Zone Wheel (Touch emotional color zone)",
      6: "Face 6: Hard-Stop Slam Button (Slam to freeze demands)"
    };
    if (activeFaceTitle && faceNames[faceNumber]) {
      activeFaceTitle.textContent = faceNames[faceNumber];
    }
  }

  // Render the 4 interactive tactile quadrants directly on the 6 cube faces
  renderCubeFaceQuadrants() {
    // Face 1: Body Engine (4 quadrants)
    const elFace1 = document.getElementById('cubeSide1');
    if (elFace1) {
      elFace1.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">🔋</span>
            <span class="text-xs font-black text-slate-800">FACE 1: BODY ENGINE</span>
          </div>
          <span class="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">4 States</span>
        </div>
        <div class="grid grid-cols-2 gap-2 my-auto">
          <button onclick="window.cubeController.selectBattery('racing')" class="cube-quadrant-btn ${this.state.face1_battery === 'racing' ? 'active-teal' : ''}">
            <span class="text-2xl mb-0.5">🏎️</span>
            <span class="text-[11px] font-black leading-tight">Turbo Fast</span>
            <span class="text-[9px] opacity-75 mt-0.5">Over-revving</span>
          </button>
          <button onclick="window.cubeController.selectBattery('buzzing')" class="cube-quadrant-btn ${this.state.face1_battery === 'buzzing' ? 'active-teal' : ''}">
            <span class="text-2xl mb-0.5">⚡</span>
            <span class="text-[11px] font-black leading-tight">Buzzing</span>
            <span class="text-[9px] opacity-75 mt-0.5">Restless</span>
          </button>
          <button onclick="window.cubeController.selectBattery('steady')" class="cube-quadrant-btn ${this.state.face1_battery === 'steady' ? 'active-teal' : ''}">
            <span class="text-2xl mb-0.5">🔋</span>
            <span class="text-[11px] font-black leading-tight">Steady</span>
            <span class="text-[9px] opacity-75 mt-0.5">Calm pace</span>
          </button>
          <button onclick="window.cubeController.selectBattery('drained')" class="cube-quadrant-btn ${this.state.face1_battery === 'drained' ? 'active-teal' : ''}">
            <span class="text-2xl mb-0.5">🪫</span>
            <span class="text-[11px] font-black leading-tight">Drained</span>
            <span class="text-[9px] opacity-75 mt-0.5">Exhausted</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-slate-400 font-semibold">Touch any quadrant to set body engine</div>
      `;
    }

    // Face 2: Sensory Push-Pins (4 tactile pins)
    const elFace2 = document.getElementById('cubeSide2');
    if (elFace2) {
      const s = this.state.face2_sensory;
      elFace2.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">⚡</span>
            <span class="text-xs font-black text-slate-800">FACE 2: SENSORY PINS</span>
          </div>
          <span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Push-Pins</span>
        </div>
        <div class="grid grid-cols-2 gap-2 my-auto">
          <button onclick="window.cubeController.toggleSensoryTrigger('noise')" class="cube-quadrant-btn ${s.includes('noise') ? 'active-amber' : ''}">
            <span class="text-2xl mb-0.5">🔊</span>
            <span class="text-[11px] font-black leading-tight">Loud Sound</span>
            <span class="text-[9px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${s.includes('noise') ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">${s.includes('noise') ? 'Pressed' : 'Off'}</span>
          </button>
          <button onclick="window.cubeController.toggleSensoryTrigger('light')" class="cube-quadrant-btn ${s.includes('light') ? 'active-amber' : ''}">
            <span class="text-2xl mb-0.5">💡</span>
            <span class="text-[11px] font-black leading-tight">Glare Light</span>
            <span class="text-[9px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${s.includes('light') ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">${s.includes('light') ? 'Pressed' : 'Off'}</span>
          </button>
          <button onclick="window.cubeController.toggleSensoryTrigger('crowd')" class="cube-quadrant-btn ${s.includes('crowd') ? 'active-amber' : ''}">
            <span class="text-2xl mb-0.5">👥</span>
            <span class="text-[11px] font-black leading-tight">Crowded</span>
            <span class="text-[9px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${s.includes('crowd') ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">${s.includes('crowd') ? 'Pressed' : 'Off'}</span>
          </button>
          <button onclick="window.cubeController.toggleSensoryTrigger('texture')" class="cube-quadrant-btn ${s.includes('texture') ? 'active-amber' : ''}">
            <span class="text-2xl mb-0.5">🏷️</span>
            <span class="text-[11px] font-black leading-tight">Scratchy</span>
            <span class="text-[9px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${s.includes('texture') ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">${s.includes('texture') ? 'Pressed' : 'Off'}</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-slate-400 font-semibold">Click pins to signal physical pain/discomfort</div>
      `;
    }

    // Face 3: Comfort Swatches (4 tools)
    const elFace3 = document.getElementById('cubeSide3');
    if (elFace3) {
      const c = this.state.face3_comfort;
      elFace3.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">🛋️</span>
            <span class="text-xs font-black text-slate-800">FACE 3: COMFORT TOOL</span>
          </div>
          <span class="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">4 Helpers</span>
        </div>
        <div class="grid grid-cols-2 gap-2 my-auto">
          <button onclick="window.cubeController.selectComfort('headphones')" class="cube-quadrant-btn ${c === 'headphones' ? 'active-indigo' : ''}">
            <span class="text-2xl mb-0.5">🎧</span>
            <span class="text-[11px] font-black leading-tight">Headphones</span>
            <span class="text-[9px] opacity-75 mt-0.5">Muffle sounds</span>
          </button>
          <button onclick="window.cubeController.selectComfort('pressure')" class="cube-quadrant-btn ${c === 'pressure' ? 'active-indigo' : ''}">
            <span class="text-2xl mb-0.5">🛋️</span>
            <span class="text-[11px] font-black leading-tight">Pressure</span>
            <span class="text-[9px] opacity-75 mt-0.5">Firm hug/weight</span>
          </button>
          <button onclick="window.cubeController.selectComfort('movement')" class="cube-quadrant-btn ${c === 'movement' ? 'active-indigo' : ''}">
            <span class="text-2xl mb-0.5">🌀</span>
            <span class="text-[11px] font-black leading-tight">Stimming</span>
            <span class="text-[9px] opacity-75 mt-0.5">Pacing/fidget</span>
          </button>
          <button onclick="window.cubeController.selectComfort('toy_token')" class="cube-quadrant-btn ${c === 'toy_token' ? 'active-indigo' : ''}">
            <span class="text-2xl mb-0.5">🧸</span>
            <span class="text-[11px] font-black leading-tight">Special Item</span>
            <span class="text-[9px] opacity-75 mt-0.5">Hold comfort toy</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-slate-400 font-semibold">Touch to request soothing sensory tool</div>
      `;
    }

    // Face 4: Transition Buffer (4 options)
    const elFace4 = document.getElementById('cubeSide4');
    if (elFace4) {
      const b = this.state.face4_buffer;
      elFace4.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">⏳</span>
            <span class="text-xs font-black text-slate-800">FACE 4: BUFFER DIAL</span>
          </div>
          <span class="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Time Buffer</span>
        </div>
        <div class="grid grid-cols-2 gap-2 my-auto">
          <button onclick="window.cubeController.selectBuffer('plus_2')" class="cube-quadrant-btn ${b === 'plus_2' ? 'active-sky' : ''}">
            <span class="text-2xl mb-0.5">⏱️</span>
            <span class="text-[11px] font-black leading-tight">+2 Minutes</span>
            <span class="text-[9px] opacity-75 mt-0.5">Quick wind-down</span>
          </button>
          <button onclick="window.cubeController.selectBuffer('plus_5')" class="cube-quadrant-btn ${b === 'plus_5' ? 'active-sky' : ''}">
            <span class="text-2xl mb-0.5">⏳</span>
            <span class="text-[11px] font-black leading-tight">+5 Minutes</span>
            <span class="text-[9px] opacity-75 mt-0.5">Calm bridge</span>
          </button>
          <button onclick="window.cubeController.selectBuffer('plus_10')" class="cube-quadrant-btn ${b === 'plus_10' ? 'active-sky' : ''}">
            <span class="text-2xl mb-0.5">🛋️</span>
            <span class="text-[11px] font-black leading-tight">+10 Minutes</span>
            <span class="text-[9px] opacity-75 mt-0.5">Full transition</span>
          </button>
          <button onclick="window.cubeController.selectBuffer('one_more')" class="cube-quadrant-btn ${b === 'one_more' ? 'active-sky' : ''}">
            <span class="text-2xl mb-0.5">📖</span>
            <span class="text-[11px] font-black leading-tight">1 More Turn</span>
            <span class="text-[9px] opacity-75 mt-0.5">Finish page/step</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-slate-400 font-semibold">Touch to request transition time buffer</div>
      `;
    }

    // Face 5: Zones of Regulation (4 colors)
    const elFace5 = document.getElementById('cubeSide5');
    if (elFace5) {
      const z = this.state.face5_zone;
      elFace5.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">🎨</span>
            <span class="text-xs font-black text-slate-800">FACE 5: EMOTION ZONES</span>
          </div>
          <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">4 Zones</span>
        </div>
        <div class="grid grid-cols-2 gap-2 my-auto">
          <button onclick="window.cubeController.selectZone('blue')" class="cube-quadrant-btn ${z === 'blue' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-blue-50 text-blue-900 border-blue-200'}">
            <span class="text-2xl mb-0.5">🟦</span>
            <span class="text-[11px] font-black leading-tight">Blue Zone</span>
            <span class="text-[9px] opacity-80 mt-0.5">Sad / Tired / Slow</span>
          </button>
          <button onclick="window.cubeController.selectZone('green')" class="cube-quadrant-btn ${z === 'green' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-emerald-50 text-emerald-900 border-emerald-200'}">
            <span class="text-2xl mb-0.5">🟩</span>
            <span class="text-[11px] font-black leading-tight">Green Zone</span>
            <span class="text-[9px] opacity-80 mt-0.5">Calm / Regulated</span>
          </button>
          <button onclick="window.cubeController.selectZone('yellow')" class="cube-quadrant-btn ${z === 'yellow' ? 'bg-yellow-500 text-slate-900 border-yellow-600 shadow-md font-bold' : 'bg-yellow-50 text-yellow-900 border-yellow-200'}">
            <span class="text-2xl mb-0.5">🟨</span>
            <span class="text-[11px] font-black leading-tight">Yellow Zone</span>
            <span class="text-[9px] opacity-80 mt-0.5">Anxious / Buzzing</span>
          </button>
          <button onclick="window.cubeController.selectZone('red')" class="cube-quadrant-btn ${z === 'red' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-red-50 text-red-900 border-red-200'}">
            <span class="text-2xl mb-0.5">🟥</span>
            <span class="text-[11px] font-black leading-tight">Red Zone</span>
            <span class="text-[9px] opacity-80 mt-0.5">Overload / Panic</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-slate-400 font-semibold">Touch to share emotional energy zone</div>
      `;
    }

    // Face 6: Hard-Stop Slam Button
    const elFace6 = document.getElementById('cubeSide6');
    if (elFace6) {
      const active = this.state.face6_stopActive;
      elFace6.innerHTML = `
        <div class="flex items-center justify-between border-b border-red-200 pb-1 px-1">
          <div class="flex items-center gap-1">
            <span class="text-base">🛑</span>
            <span class="text-xs font-black text-red-700">FACE 6: HARD-STOP BRAKE</span>
          </div>
          <span class="text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Autonomy</span>
        </div>
        <div class="flex flex-col items-center justify-center my-auto p-2">
          <button onclick="window.cubeController.toggleEmergencyStop()" class="w-full py-6 px-4 rounded-2xl font-black text-base text-white shadow-xl transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 ${active ? 'bg-red-700 ring-4 ring-red-300 emergency-active' : 'bg-red-600 hover:bg-red-700'}">
            <span class="text-4xl">🛑</span>
            <span>${active ? 'STOP ACTIVE (Touch to Reset)' : 'SLAM STOP / PAUSE'}</span>
            <span class="text-[10px] opacity-80 font-normal">All demands and instructions pause immediately</span>
          </button>
        </div>
        <div class="text-[10px] text-center text-red-600 font-bold">Immutable Refusal & Break Right</div>
      `;
    }
  }

  selectBattery(val) {
    this.state.face1_battery = val;
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  toggleSensoryTrigger(val) {
    if (this.state.face2_sensory.includes(val)) {
      this.state.face2_sensory = this.state.face2_sensory.filter(x => x !== val);
    } else {
      this.state.face2_sensory.push(val);
    }
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  selectComfort(val) {
    this.state.face3_comfort = val;
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  selectBuffer(val) {
    this.state.face4_buffer = val;
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  selectZone(color) {
    this.state.face5_zone = color;
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  toggleEmergencyStop() {
    this.state.face6_stopActive = !this.state.face6_stopActive;
    this.renderCubeFaceQuadrants();
    this.notifyTelemetry();
  }

  notifyTelemetry() {
    this.state.lastUpdated = new Date();
    if (typeof this.onTelemetryUpdate === 'function') {
      this.onTelemetryUpdate(this.state);
    }
  }
}

if (typeof window !== 'undefined') {
  window.SensoryCubeController = SensoryCubeController;
}

// Main App Coordinator: Sensory Cube, Parent AI Co-Pilot, and Clinician Portal

class SensoryCubeApp {
  constructor() {
    this.activeScreen = 'live'; // 'live' | 'clinician'
    this.currentScenarioId = 'library';
    this.cube = new window.SensoryCubeController();
    window.cubeController = this.cube;

    // Parent Chat conversation history
    this.chatMessages = [
      {
        sender: 'ai',
        text: "Hello! I am your Sensory Co-Pilot. Whenever Leo touches or adjusts his Sensory Cube on the left, I'll translate his internal sensations into calm, actionable guidance for you here."
      }
    ];

    this.parentNotes = [];
  }

  init() {
    this.setupTopNavigation();
    this.renderScenarioSelector();
    this.cube.renderCubeFaceQuadrants();
    this.cube.setFace(1);

    this.setupCubeNavigation();
    this.renderParentCoPilot(this.cube.state);
    this.renderClinicianScreen();
  }

  setupTopNavigation() {
    const navLive = document.getElementById('navBtnLive');
    const navClinician = document.getElementById('navBtnClinician');
    const screenLive = document.getElementById('screenLive');
    const screenClinician = document.getElementById('screenClinician');

    if (navLive && navClinician) {
      navLive.addEventListener('click', () => {
        this.activeScreen = 'live';
        navLive.className = "px-4 py-2 rounded-xl text-xs font-black transition-all bg-teal-600 text-white shadow-xs flex items-center gap-1.5";
        navClinician.className = "px-4 py-2 rounded-xl text-xs font-black transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5";
        screenLive.classList.remove('hidden');
        screenClinician.classList.add('hidden');
      });

      navClinician.addEventListener('click', () => {
        this.activeScreen = 'clinician';
        navClinician.className = "px-4 py-2 rounded-xl text-xs font-black transition-all bg-indigo-600 text-white shadow-xs flex items-center gap-1.5";
        navLive.className = "px-4 py-2 rounded-xl text-xs font-black transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5";
        screenClinician.classList.remove('hidden');
        screenLive.classList.add('hidden');
      });
    }
  }

  setupCubeNavigation() {
    this.cube.onTelemetryUpdate = (state) => {
      this.renderParentCoPilot(state);
    };

    // Face selector pills (Face 1 through 6)
    document.querySelectorAll('.cube-face-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const face = parseInt(btn.getAttribute('data-face'));
        this.cube.setFace(face);
      });
    });

    // Rotate arrow buttons
    const btnRotateLeft = document.getElementById('btnRotateLeft');
    const btnRotateRight = document.getElementById('btnRotateRight');
    if (btnRotateLeft) {
      btnRotateLeft.addEventListener('click', () => this.cube.rotatePrev());
    }
    if (btnRotateRight) {
      btnRotateRight.addEventListener('click', () => this.cube.rotateNext());
    }
  }

  renderScenarioSelector() {
    const container = document.getElementById('scenarioSelectContainer');
    if (!container || !window.SCENARIOS) return;

    container.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xs font-black uppercase tracking-wider text-slate-500">Scenario:</span>
        <select id="scenarioDropdown" class="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-1.5 focus:ring-teal-500 focus:border-teal-500 font-bold shadow-xs">
          ${Object.values(window.SCENARIOS).map(sc => `
            <option value="${sc.id}" ${sc.id === this.currentScenarioId ? 'selected' : ''}>
              ${sc.icon} ${sc.title}
            </option>
          `).join('')}
        </select>
      </div>
    `;

    document.getElementById('scenarioDropdown').addEventListener('change', (e) => {
      this.currentScenarioId = e.target.value;
      this.renderParentCoPilot(this.cube.state);
      this.renderClinicianScreen();
    });
  }

  // Generates rich, fully dynamic explanation tailored to all selections on the cube
  generateDynamicSensoryExplanation(cubeState, scenario) {
    const engineMap = {
      racing: "vibrating at Turbo Fast speed (racing heart rate, physical restlessness)",
      buzzing: "buzzing with high restless energy",
      steady: "steady, calm, and receptive",
      drained: "completely drained and exhausted (low stamina, heavy body fatigue)"
    };

    const sensoryLabels = {
      noise: "loud or echoey acoustic noise",
      light: "harsh, glaring, or flickering overhead lights",
      crowd: "people crowding too close to his personal space",
      texture: "scratchy or painful clothing tactile irritation"
    };

    const zoneMap = {
      blue: "Blue Zone (feeling sluggish, sad, or shut down)",
      green: "Green Zone (calm, focused, and regulated)",
      yellow: "Yellow Zone (heightened anxiety, frustration, and sensory friction)",
      red: "Red Zone (acute sensory overload, panic, or fight-or-flight crisis)"
    };

    const comfortMap = {
      headphones: "Noise-Canceling Headphones to shut out overwhelming auditory stimulation",
      pressure: "Deep Proprioceptive Pressure (a firm hug or weighted lap pad) to ground his nervous system",
      movement: "Stimming / Movement (rocking, pacing, or hand-fidgeting) to release tension",
      toy_token: "holding his Special Interest comfort item as a reassuring transition bridge"
    };

    const bufferMap = {
      plus_2: "a 2-minute wind-down buffer",
      plus_5: "a 5-minute transition bridge",
      plus_10: "a 10-minute decompression buffer",
      one_more: "permission to finish 1 more page/turn before stopping"
    };

    const engineDesc = engineMap[cubeState.face1_battery] || cubeState.face1_battery;
    const zoneDesc = zoneMap[cubeState.face5_zone] || cubeState.face5_zone;
    const comfortDesc = comfortMap[cubeState.face3_comfort] || cubeState.face3_comfort;
    const bufferDesc = bufferMap[cubeState.face4_buffer] || cubeState.face4_buffer;
    
    let sensoryTriggerDesc = "no acute physical pain, but experiencing transition friction";
    if (cubeState.face2_sensory && cubeState.face2_sensory.length > 0) {
      sensoryTriggerDesc = cubeState.face2_sensory.map(k => sensoryLabels[k] || k).join(" and ");
    }

    let contextSetting = "this environment";
    if (scenario.id === 'library') contextSetting = "the library reading corner";
    else if (scenario.id === 'bedtime') contextSetting = "his bedroom bedtime routine";
    else if (scenario.id === 'grocery') contextSetting = "the supermarket aisle";

    const fullCause = `In ${contextSetting}, Leo's body engine is ${engineDesc}. He is actively triggered by ${sensoryTriggerDesc}, which has placed his nervous system into the ${zoneDesc}. Any perceived resistance or freezing is an involuntary protective response, not defiance. To safely regulate and cooperate, he is explicitly asking for ${comfortDesc}, along with ${bufferDesc}.`;

    return {
      fullCause,
      engineDesc,
      zoneDesc,
      comfortDesc,
      bufferDesc,
      sensoryTriggerDesc
    };
  }

  // Right Side: Render Parent Perspective View
  renderParentCoPilot(cubeState) {
    const scenario = window.SCENARIOS[this.currentScenarioId];
    const container = document.getElementById('parentCoPilotContainer');
    if (!container) return;

    const isEmergency = cubeState.face6_stopActive;
    const sensoryText = cubeState.face2_sensory.length > 0 ? cubeState.face2_sensory.join(', ') : 'None';
    const bufferTime = cubeState.face4_buffer.replace('plus_', '').replace('_', ' ') + (cubeState.face4_buffer.startsWith('plus') ? ' mins' : '');

    // Generate dynamic analysis
    const analysis = this.generateDynamicSensoryExplanation(cubeState, scenario);

    let headline = "";
    let sensoryCause = "";
    let optionA = "";
    let optionB = "";

    if (isEmergency) {
      headline = "🛑 Leo hit the Emergency Hard-Stop Button (Immediate Pause)";
      sensoryCause = "CRITICAL STOP SIGNAL: Leo has pressed Face 6 on his sensory cube. His nervous system is experiencing acute sensory distress or demand overload. In accordance with clinical guardrails, all walking commands, bedtime enforcement, and verbal questions must pause right now.";
      optionA = "Quiet Physical Presence: Sit beside Leo at eye level without speaking or making eye contact for 2 minutes.";
      optionB = "Sensory Sanctuary: Remove nearby observers, dim lights, and offer his comfort item silently.";
    } else {
      headline = `Leo needs ${bufferTime} & ${cubeState.face3_comfort.replace('_', ' ')} before transitioning`;
      sensoryCause = analysis.fullCause;

      // Dynamic Option A based on comfort pick
      if (cubeState.face3_comfort === 'headphones') {
        optionA = "Provide Headphones: Hand Leo his noise-canceling headphones right now before asking him to move.";
      } else if (cubeState.face3_comfort === 'pressure') {
        optionA = "Apply Deep Pressure: Offer firm, gentle shoulder compressions or drape a weighted lap pad over him.";
      } else if (cubeState.face3_comfort === 'movement') {
        optionA = "Allow Stimming: Give Leo 2 minutes to pace, flap, or fidget so his body can discharge adrenaline.";
      } else {
        optionA = "Transitional Object Bridge: Allow Leo to physically carry his favorite object into the next space.";
      }

      // Dynamic Option B based on buffer
      optionB = `Honor ${bufferTime} Buffer: Set a gentle visual countdown timer for ${bufferTime} and agree to transition when the chime sounds.`;
    }

    container.innerHTML = `
      <div class="space-y-5 fade-in">

        <!-- 1. SIMPLIFIED CHILD SIGNAL -->
        <div class="p-4 rounded-2xl border ${isEmergency ? 'bg-red-50 border-red-400 ring-2 ring-red-300' : 'bg-slate-900 text-white border-slate-800'} shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-black uppercase tracking-wider ${isEmergency ? 'text-red-700' : 'text-teal-400'}">
              ${isEmergency ? '🚨 Hard-Stop Signal Active' : '📡 Live Signals from Leo\'s Cube'}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full ${isEmergency ? 'bg-red-200 text-red-900 font-bold' : 'bg-slate-800 text-slate-300'}">
              Updated Live
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span class="px-2.5 py-1 rounded-lg ${isEmergency ? 'bg-red-100 text-red-900' : 'bg-slate-800 text-teal-300'}">
              🔋 Engine: ${cubeState.face1_battery}
            </span>
            <span class="px-2.5 py-1 rounded-lg ${isEmergency ? 'bg-red-100 text-red-900' : 'bg-slate-800 text-amber-300'}">
              ⚡ Discomfort: ${sensoryText}
            </span>
            <span class="px-2.5 py-1 rounded-lg ${isEmergency ? 'bg-red-100 text-red-900' : 'bg-slate-800 text-indigo-300'}">
              🛋️ Comfort: ${cubeState.face3_comfort}
            </span>
            <span class="px-2.5 py-1 rounded-lg ${isEmergency ? 'bg-red-100 text-red-900' : 'bg-slate-800 text-sky-300'}">
              ⏳ Buffer: ${bufferTime}
            </span>
            <span class="px-2.5 py-1 rounded-lg uppercase ${cubeState.face5_zone === 'red' ? 'bg-red-600 text-white' : cubeState.face5_zone === 'yellow' ? 'bg-yellow-500 text-slate-900' : 'bg-emerald-600 text-white'}">
              🎨 ${cubeState.face5_zone} zone
            </span>
          </div>
        </div>

        <!-- 2. AI SENSORY TRANSLATION & SUGGESTIONS (Dynamically Updates!) -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🤖</span>
              <h3 class="font-black text-slate-900 text-sm">${headline}</h3>
            </div>
            <button onclick="window.app.speakAloud('${headline.replace(/'/g, "\\'")}')" class="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
              <span>🔊</span> Read Aloud
            </button>
          </div>

          <!-- Dynamic "What Leo is Experiencing" Box -->
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium transition-all">
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-black text-indigo-950 flex items-center gap-1.5">
                <span>🧠</span> What Leo is Experiencing:
              </span>
              <span class="text-[10px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                Live Sensor Translation
              </span>
            </div>
            <p class="text-slate-800 leading-relaxed text-[12px]">
              ${sensoryCause}
            </p>
          </div>

          <!-- Suggested Co-Regulation Steps -->
          <div class="space-y-2">
            <div class="text-[11px] font-black uppercase tracking-wider text-slate-500">Recommended Steps for You:</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors">
                <div class="font-bold text-indigo-900 mb-0.5">Option A (Sensory Comfort)</div>
                <div class="text-slate-700">${optionA}</div>
              </div>
              <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors">
                <div class="font-bold text-indigo-900 mb-0.5">Option B (Buffer Agreement)</div>
                <div class="text-slate-700">${optionB}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. INTERACTIVE CHAT WITH AI & PARENT ACTIONS -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">💬</span>
              <h4 class="font-black text-slate-900 text-xs uppercase tracking-wider">Chat with Sensory Co-Pilot</h4>
            </div>
            <span class="text-[10px] text-slate-400">Ask questions or share constraints</span>
          </div>

          <!-- Chat Message Feed -->
          <div id="parentChatFeed" class="max-h-48 overflow-y-auto space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            ${this.chatMessages.map(msg => `
              <div class="flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}">
                <span class="text-[10px] font-bold text-slate-400 mb-0.5">${msg.sender === 'user' ? 'You' : 'Sensory Co-Pilot'}</span>
                <div class="p-2.5 rounded-xl max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none'}">
                  ${msg.text}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Quick Prompt Chips -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-bold text-slate-400">Quick Prompts:</span>
            <button onclick="window.app.sendQuickChat('What if we forgot his headphones?')" class="text-[11px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors">
              "Forgot headphones"
            </button>
            <button onclick="window.app.sendQuickChat('We have a hard appointment in 3 minutes!')" class="text-[11px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors">
              "Appointment in 3 min"
            </button>
            <button onclick="window.app.sendQuickChat('What words should I say to him right now?')" class="text-[11px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors">
              "What words to say?"
            </button>
          </div>

          <!-- Chat Input -->
          <div class="flex gap-2">
            <input type="text" id="parentChatInput" placeholder="Type a question for the AI (e.g. 'He is crying, what do I do?')..." class="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" onkeydown="if(event.key === 'Enter') window.app.handleChatSubmit()">
            <button onclick="window.app.handleChatSubmit()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs">
              Send
            </button>
          </div>
        </div>

        <!-- 4. PARENT SITUATIONAL NOTES / DESCRIPTIONS -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-slate-800">Parent Context Notes:</span>
            <span class="text-[10px] text-slate-400">Logged to clinician care plan</span>
          </div>
          <div class="flex gap-2">
            <input type="text" id="parentNoteInput" placeholder="Add note (e.g. 'Skipped snack today', 'Fire drill at school')..." class="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500">
            <button onclick="window.app.saveParentNote()" class="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              Save Note
            </button>
          </div>
          ${this.parentNotes.length > 0 ? `
            <div class="mt-2 space-y-1">
              ${this.parentNotes.map(n => `<div class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">📌 ${n}</div>`).join('')}
            </div>
          ` : ''}
        </div>

      </div>
    `;

    const chatFeed = document.getElementById('parentChatFeed');
    if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  handleChatSubmit() {
    const input = document.getElementById('parentChatInput');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = '';
    this.chatMessages.push({ sender: 'user', text: userText });

    const reply = window.generateAIChatReply(userText, this.cube.state, window.SCENARIOS[this.currentScenarioId]);
    setTimeout(() => {
      this.chatMessages.push({ sender: 'ai', text: reply });
      this.renderParentCoPilot(this.cube.state);
    }, 400);

    this.renderParentCoPilot(this.cube.state);
  }

  sendQuickChat(text) {
    this.chatMessages.push({ sender: 'user', text });
    const reply = window.generateAIChatReply(text, this.cube.state, window.SCENARIOS[this.currentScenarioId]);
    setTimeout(() => {
      this.chatMessages.push({ sender: 'ai', text: reply });
      this.renderParentCoPilot(this.cube.state);
    }, 400);

    this.renderParentCoPilot(this.cube.state);
  }

  saveParentNote() {
    const input = document.getElementById('parentNoteInput');
    if (!input || !input.value.trim()) return;
    this.parentNotes.push(input.value.trim());
    input.value = '';
    this.renderParentCoPilot(this.cube.state);
  }

  speakAloud(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }

  // Dedicated Clinician Screen (Separate Tab)
  renderClinicianScreen() {
    const container = document.getElementById('screenClinician');
    if (!container || !window.CLINICIAN_CARE_PLAN) return;

    const plan = window.CLINICIAN_CARE_PLAN;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6 fade-in">
        
        <!-- Header Profile Banner -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-3xl">
              🩺
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-black text-xl text-slate-900">${plan.patient.name}'s Clinical Sensory Care Plan</h2>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Active OT/SLP Protocol</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Lead OT: ${plan.patient.primaryClinician} • SLP: ${plan.patient.slpConsultant}</p>
            </div>
          </div>
          <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 px-4 text-xs text-indigo-900">
            <div class="font-bold">AAC Hardware Profile:</div>
            <div>6-Sided Tangible Sensory Cube with Direct 4-Quadrant Tactile Faces</div>
          </div>
        </div>

        <!-- 3-Column Clinical Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- Col 1: Sensory Profile -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span class="text-xl">🧬</span>
              <h3 class="font-black text-slate-900 text-sm">Sensory Diet Baseline</h3>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="font-bold text-slate-900 mb-1">Auditory Processing:</div>
                <div class="text-slate-600 leading-relaxed">${plan.sensoryProfile.auditory}</div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="font-bold text-slate-900 mb-1">Visual Sensitivity:</div>
                <div class="text-slate-600 leading-relaxed">${plan.sensoryProfile.visual}</div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="font-bold text-slate-900 mb-1">Proprioceptive Seeking:</div>
                <div class="text-slate-600 leading-relaxed">${plan.sensoryProfile.proprioception}</div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="font-bold text-slate-900 mb-1">Autistic Inertia Profile:</div>
                <div class="text-slate-600 leading-relaxed">${plan.sensoryProfile.autisticInertia}</div>
              </div>
            </div>
          </div>

          <!-- Col 2: De-escalation Protocols -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span class="text-xl">🛡️</span>
              <h3 class="font-black text-slate-900 text-sm">De-Escalation Protocols</h3>
            </div>

            <div class="space-y-3 text-xs">
              ${plan.deEscalationProtocols.map(proto => `
                <div class="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40">
                  <div class="font-black text-indigo-900 mb-1">${proto.trigger}</div>
                  <div class="text-slate-700 leading-relaxed">${proto.action}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Col 3: Telemetry Audit History -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span class="text-xl">📊</span>
              <h3 class="font-black text-slate-900 text-sm">Clinical Telemetry Audit Log</h3>
            </div>

            <div class="space-y-3 text-xs">
              ${plan.auditLog.map(log => `
                <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-slate-900">${log.scenario}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">${log.rating}</span>
                  </div>
                  <div class="text-slate-500 text-[11px] mb-1">${log.timestamp} • ${log.telemetry}</div>
                  <div class="text-slate-700 font-medium">${log.outcome}</div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.SensoryCubeApp = SensoryCubeApp;
}

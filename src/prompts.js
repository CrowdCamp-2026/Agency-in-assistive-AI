// Scaffolding, Clinician Care Plan, and AI Parent Co-Pilot Knowledge Base

const SCENARIOS = {
  library: {
    id: "library",
    title: "Leaving the Public Library",
    icon: "📚",
    context: "Location: Children's Reading Corner. Time: 5:15 PM. Prior activity: 45 minutes immersed in space books. Library is closing soon and becoming noisy.",
    potentialTriggers: ["Echoey acoustic noise", "Crowd gathering near checkout", "Abrupt break from intense reading hyperfocus"],
    clinicianNotes: "Child experiences extreme inertia when immersed in reading. Abruptly pulling books away triggers panic. Provide auditory protection and a 5-minute transitional countdown with a physical transition object."
  },
  bedtime: {
    id: "bedtime",
    title: "Navigating Bedtime Routine",
    icon: "🌙",
    context: "Location: Child's bedroom. Time: 8:45 PM. Target sleep time: 9:00 PM for school tomorrow. Child is building a complex Lego robot; parent is exhausted.",
    potentialTriggers: ["Harsh overhead bedroom lighting", "Tactile discomfort of pajamas", "Fear of abrupt end to creative play"],
    clinicianNotes: "Sensory wind-down must respect creative flow. Transition by allowing 1 robot piece to sleep on the bedside table. Switch lighting to amber and use deep proprioceptive pressure (weighted blanket)."
  },
  grocery: {
    id: "grocery",
    title: "Grocery Store Sensory Overload",
    icon: "🛒",
    context: "Location: Supermarket aisle 4. Time: 6:00 PM. High sensory input: buzzing fluorescent lights, shopping cart wheels, loud public address announcements.",
    potentialTriggers: ["Fluorescent light flicker", "Unpredictable loudspeaker announcements", "Spatial confinement"],
    clinicianNotes: "High risk of sensory overwhelm. When Red/Yellow zone or high noise is triggered, immediately reduce sensory input: move to a quieter outer aisle or offer a deep tactile fidget."
  }
};

const CLINICIAN_CARE_PLAN = {
  patient: {
    name: "Leo",
    age: 8,
    diagnosis: "Autism Spectrum (Level 1/2) with Sensory Processing Sensitivity",
    primaryClinician: "Dr. Elena Vance, MS, OTR/L (Occupational Therapy)",
    slpConsultant: "Marcus Reed, CCC-SLP (Neurodiversity-Affirming AAC Specialist)"
  },
  sensoryProfile: {
    auditory: "Sensory Avoidant: Highly sensitive to echoey acoustics, unexpected announcements, overlapping conversations. Needs active noise attenuation.",
    visual: "Sensory Avoidant: Distressed by 60Hz fluorescent flicker and harsh white overhead glare. Prefers warm amber (2200K) or natural perimeter light.",
    proprioception: "Sensory Seeking: Responds positively to deep joint compression, weighted lap pads (5 lbs), firm hugs, and carrying heavy transition books.",
    autisticInertia: "High: Switching out of intense special interest immersion causes acute neurological disorientation. Requires predictable visual/haptic buffers."
  },
  deEscalationProtocols: [
    {
      trigger: "Face 6 Slam Button (STOP / PAUSE)",
      action: "Immediate demand cessation. Do not speak, do not demand eye contact. Sit quietly at child's level. Wait minimum 2 minutes before offering low-demand co-regulation."
    },
    {
      trigger: "Yellow Zone + Auditory Discomfort",
      action: "Offer headphones first without talking. Grant requested transition buffer (+5 min). Allow transitional comfort object to bridge environments."
    },
    {
      trigger: "Red Zone (Acute Overwhelm)",
      action: "Create an immediate low-sensory sanctuary (dim light, perimeter space, remove onlookers). Protect physical safety with calm, zero-verbal presence."
    }
  ],
  auditLog: [
    { timestamp: "Yesterday 5:20 PM", scenario: "Library Departure", telemetry: "Noise + Yellow + 5min Buffer", outcome: "De-escalated via headphones + book bridge", rating: "Successful" },
    { timestamp: "Yesterday 8:50 PM", scenario: "Bedtime Routine", telemetry: "High Engine + Toy Comfort", outcome: "Robot on nightstand + weighted blanket", rating: "Successful" },
    { timestamp: "3 days ago 6:15 PM", scenario: "Supermarket", telemetry: "Face 6 STOP Pressed", outcome: "Parent executed verbal pause; moved to quiet car", rating: "Autonomy Respected" }
  ]
};

const CUBE_FACES_SPEC = [
  {
    id: 1,
    name: "Face 1: Body Engine",
    subtitle: "Turn dial to share body energy",
    icon: "🔋",
    options: [
      { id: "racing", label: "🏎️ Turbo Fast", desc: "Body vibrating, can't sit still" },
      { id: "buzzing", label: "⚡ High / Buzzing", desc: "Restless energy" },
      { id: "steady", label: "🔋 Steady & Calm", desc: "Regulated baseline" },
      { id: "drained", label: "🪫 Drained & Low", desc: "Exhausted, low stamina" }
    ]
  },
  {
    id: 2,
    name: "Face 2: Sensory Discomfort",
    subtitle: "Press push-pins for what hurts",
    icon: "⚡",
    options: [
      { id: "noise", label: "🔊 Too Loud", desc: "Echoey or sharp sounds" },
      { id: "light", label: "💡 Glaring Light", desc: "Bright or flickering lights" },
      { id: "crowd", label: "👥 Too Crowded", desc: "Too many people near me" },
      { id: "texture", label: "🏷️ Scratchy / Painful", desc: "Clothes or textures hurt" }
    ]
  },
  {
    id: 3,
    name: "Face 3: Comfort Helper",
    subtitle: "Toggle comforting sensory tool",
    icon: "🛋️",
    options: [
      { id: "headphones", label: "🎧 Noise Headphones", desc: "Block out overwhelming sounds" },
      { id: "pressure", label: "🛋️ Weighted Pressure", desc: "Firm hug or heavy blanket" },
      { id: "movement", label: "🌀 Stimming / Movement", desc: "Rocking, pacing, fidgeting" },
      { id: "toy_token", label: "🧸 Special Item", desc: "Hold beloved toy or book" }
    ]
  },
  {
    id: 4,
    name: "Face 4: Buffer Dial",
    subtitle: "Twist ratchet dial for time buffer",
    icon: "⏳",
    options: [
      { id: "plus_2", label: "+2 Minutes", desc: "Need a 2-minute wind-down" },
      { id: "plus_5", label: "+5 Minutes", desc: "Need a 5-minute bridge" },
      { id: "plus_10", label: "+10 Minutes", desc: "Need a 10-minute buffer" },
      { id: "one_more", label: "1 More Turn/Page", desc: "Finish current page or step" }
    ]
  },
  {
    id: 5,
    name: "Face 5: Emotional Zone",
    subtitle: "Turn wheel to emotional color",
    icon: "🎨",
    options: [
      { id: "blue", label: "🟦 Blue Zone", desc: "Sad, tired, moving slow" },
      { id: "green", label: "🟩 Green Zone", desc: "Calm, okay, ready" },
      { id: "yellow", label: "🟨 Yellow Zone", desc: "Anxious, frustrated, buzzing" },
      { id: "red", label: "🟥 Red Zone", desc: "Overwhelmed, panicking, can't cope" }
    ]
  },
  {
    id: 6,
    name: "Face 6: Hard-Stop Button",
    subtitle: "Emergency slam button (No/Pause)",
    icon: "🛑",
    isEmergency: true,
    options: [
      { id: "emergency_stop", label: "🛑 HIT STOP / PAUSE", desc: "Non-negotiable stop. All demands pause." }
    ]
  }
];

// Contextual AI chat engine responses for parent questions
function generateAIChatReply(userQuestion, cubeState, scenario) {
  const q = userQuestion.toLowerCase();

  if (cubeState.face6_stopActive || q.includes("stop") || q.includes("pause")) {
    return "Leo has activated the Face 6 STOP button. The clinical priority right now is zero verbal demands. Do not ask questions or negotiate. Give Leo 2 minutes of quiet physical presence. Once their heart rate slows, you can offer a gentle comfort item.";
  }

  if (q.includes("no headphone") || q.includes("forgot") || q.includes("lost")) {
    return `If you don't have headphones on hand, switch to proprioceptive grounding: offer firm, gentle shoulder compressions or let Leo press his palms together. You can also move to a quiet corner with softer acoustics to reduce auditory input.`;
  }

  if (q.includes("hurry") || q.includes("late") || q.includes("appointment") || q.includes("fast")) {
    return `Because you are pressed for time, avoid rushing Leo physically—that will trigger panic and take longer. Instead, accept his requested ${cubeState.face4_buffer.replace('plus_', '')}-minute buffer as your agreed departure time, and hand him a portable transition object (like his favorite book) right now so he is ready to walk when the timer dings.`;
  }

  if (q.includes("talk") || q.includes("say") || q.includes("explain")) {
    return `Use low-demand language. Avoid 'Why are you doing this?'. Instead say: 'I hear your cube signal. You need 5 minutes and it's too loud. Let's sit quietly until the chime.' Keep your voice half-volume and slow.`;
  }

  // General contextual reply
  return `Based on Leo's current cube signals (Engine: ${cubeState.face1_battery}, Zone: ${cubeState.face5_zone.toUpperCase()}, Need: ${cubeState.face3_comfort}), he is trying to regulate his nervous system against ${cubeState.face2_sensory.join(', ') || 'environmental sensory friction'}. Honoring his requested ${cubeState.face4_buffer.replace('plus_', '')}-minute buffer will prevent escalation.`;
}

if (typeof window !== 'undefined') {
  window.SCENARIOS = SCENARIOS;
  window.CLINICIAN_CARE_PLAN = CLINICIAN_CARE_PLAN;
  window.CUBE_FACES_SPEC = CUBE_FACES_SPEC;
  window.generateAIChatReply = generateAIChatReply;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENARIOS, CLINICIAN_CARE_PLAN, CUBE_FACES_SPEC, generateAIChatReply };
}

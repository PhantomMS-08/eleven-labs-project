/**
 * NARUTO SHIPPUDEN VOICE JUTSU - APPLICATION LOGIC
 * Powered by ElevenLabs Multilingual v2 (Hindi & English)
 * Features:
 * - Real-Time Web Audio DSP Acoustic Morphing (Pitch, Susanoo Bass, Kurama Rasp, Mask Chamber)
 * - Custom Voice Lab Manager (Upload / Paste Cloned Voice IDs)
 * - Dynamic Naruto Shippuden Aesthetic Themes
 * - Real-Time Chakra Frequency Spectrum Visualizer & Particle Canvas
 */

// ==========================================================================
// CONFIGURATION & CHARACTER DEFINITIONS
// ==========================================================================
const DEFAULT_API_KEY = "";
let currentApiKey = localStorage.getItem("shinobi_api_key") || DEFAULT_API_KEY;
let currentLanguage = "en"; // "en" | "hi"
let currentCharacterId = "madara";
let sfxEnabled = true;
let animeDspEnabled = true;
let currentAudioUrl = null;
let currentAudioBlob = null;
let currentPlayingMeta = null;

// Custom Cloned Voice IDs from localStorage
let customVoiceIds = JSON.parse(localStorage.getItem("shinobi_custom_voice_ids") || "{}");

// Base Character Database
const SHINOBI_DATA = {
  madara: {
    id: "madara",
    name: "Madara Uchiha",
    kanji: "宇智波斑",
    title: "Legendary Ghost of the Uchiha",
    defaultVoiceId: "pNInz6obpgDQGcFmaJgB", // Adam (Dominant, Deep)
    voiceStyle: "Dominant Deep Male • Multilingual v2",
    chakraClass: "theme-madara",
    auraText: "MADARA UCHIHA • SUSANOO CHAKRA",
    thumb: "assets/images/madara.jpg",
    defaultStability: 0.58,
    defaultSimilarity: 0.85,
    defaultSpeed: 0.95,
    dsp: {
      pitchFactor: 0.86, // -14% Deep Titan Pitch
      bassGain: 12,      // +12dB Sub-Bass boost
      bassFreq: 110,
      midGain: 3,
      midFreq: 800,
      highGain: -2,
      highFreq: 6000,
      reverbDelay: 0.085, // 85ms Susanoo Cavern Echo
      reverbGain: 0.35,
      distortion: 0,
      label: "Madara Susanoo Bass & Cavernous Reverb (-14% Pitch, +12dB Sub-Bass)"
    },
    quotes: {
      en: [
        "Wake up to reality! Nothing ever goes as planned in this accursed world.",
        "Would you like these clones to use Susanoo or not? The choice is yours.",
        "In this world, wherever there is light, there are always shadows. As long as the concept of victors exists, the vanquished will also exist."
      ],
      hi: [
        "हकीकत को पहचानो! इस दुनिया में जहां रोशनी है, वहां अंधेरा भी होगा।",
        "क्या तुम चाहते हो कि मेरे ये क्लोन सुसानो का इस्तेमाल करें या नहीं? फैसला तुम्हारा है।",
        "जब तक इस दुनिया में जीतने वाले रहेंगे, तब तक हारने वालों का वजूद भी रहेगा।"
      ]
    }
  },
  sasuke: {
    id: "sasuke",
    name: "Sasuke Uchiha",
    kanji: "宇智波佐助",
    title: "Shadow Hokage & Avenger",
    defaultVoiceId: "CwhRBWXzGAHq8TQ4Fs17", // Roger (Laid-Back, Sharp)
    voiceStyle: "Sharp Cold Resolute • Multilingual v2",
    chakraClass: "theme-sasuke",
    auraText: "SASUKE UCHIHA • CHIDORI LIGHTNING",
    thumb: "assets/images/sasuke.jpg",
    defaultStability: 0.52,
    defaultSimilarity: 0.82,
    defaultSpeed: 1.0,
    dsp: {
      pitchFactor: 0.93, // -7% Cold Brooding Detune
      bassGain: -2,
      bassFreq: 150,
      midGain: 6,       // Sharp high-mid attack
      midFreq: 2800,
      highGain: 4,      // Razor crispness
      highFreq: 5500,
      reverbDelay: 0.016, // Chidori Metallic Slapback
      reverbGain: 0.22,
      distortion: 0,
      label: "Sasuke Chidori Metallic Edge & Cold Detune (-7% Pitch, High-Mid Boost)"
    },
    quotes: {
      en: [
        "My name is Sasuke Uchiha. I hate a lot of things, and I don't particularly like anything.",
        "I have long since closed my eyes... My only goal is in the dark.",
        "If you think I'm just a foolish kid ruled by his emotions, that's fine. Following Itachi's path would be childish."
      ],
      hi: [
        "मेरा नाम सासुके उचिहा है। मैं अपने रास्ते में आने वाले हर कांटे को मिटा दूंगा।",
        "मेरी आँखें बहुत पहले ही बंद हो चुकी हैं... मेरा एकमात्र लक्ष्य अब इस अंधेरे में है।",
        "अगर तुम्हें लगता है कि मैं सिर्फ भावनाओं में बहने वाला नादान लड़का हूँ, तो ऐसा ही सही।"
      ]
    }
  },
  naruto: {
    id: "naruto",
    name: "Naruto Uzumaki",
    kanji: "うずまきナルト",
    title: "Hero of Konoha & Seventh Hokage",
    defaultVoiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam (Energetic)
    voiceStyle: "Spirited Fierce Raspy • Multilingual v2",
    chakraClass: "theme-naruto",
    auraText: "NARUTO UZUMAKI • NINE-TAILS CHAKRA",
    thumb: "assets/images/naruto.jpg",
    defaultStability: 0.40,
    defaultSimilarity: 0.78,
    defaultSpeed: 1.02,
    dsp: {
      pitchFactor: 1.15, // +15% Energetic Spurt Pitch
      bassGain: -4,
      bassFreq: 180,
      midGain: 8,       // Raspy throat presence
      midFreq: 2100,
      highGain: 3,
      highFreq: 4500,
      reverbDelay: 0.025,
      reverbGain: 0.15,
      distortion: 12,   // Kurama Nine-Tails throat rasp overdrive
      label: "Naruto Nine-Tails Raspy Drive & Energetic Spurt (+15% Pitch, Kurama Grit)"
    },
    quotes: {
      en: [
        "I'm not gonna run away, I never go back on my word! That's my nindo, my ninja way! Dattebayo!",
        "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be!",
        "Believe it! I am going to become the greatest Hokage the village has ever seen!"
      ],
      hi: [
        "मैं कभी पीछे नहीं हटूंगा और अपनी बात से कभी नहीं मुकरूंगा! यही मेरा निंजा धर्म है, दत्तेबायो!",
        "अगर तुम्हें अपनी किस्मत पसंद नहीं है, तो उसे स्वीकार मत करो। उसे बदलने की हिम्मत रखो!",
        "यकीन मानो! मैं इस गाँव का सबसे महान होकागे बनकर दिखाऊंगा!"
      ]
    }
  },
  tobi: {
    id: "tobi",
    name: "Tobi / Obito",
    kanji: "トビ / オビト",
    title: "The Masked Man of Akatsuki",
    defaultVoiceId: "N2lVS1w4EtoT3dr4eOWO", // Callum (Husky Trickster)
    altVoiceId: "pNInz6obpgDQGcFmaJgB",     // Deep Obito Voice
    persona: "tobi", // "tobi" | "obito"
    voiceStyle: "Trickster Mask / Deep Obito • Multilingual v2",
    chakraClass: "theme-tobi",
    auraText: "TOBI / OBITO • KAMUI SPACE-TIME VOID",
    thumb: "assets/images/tobi.jpg",
    defaultStability: 0.35,
    defaultSimilarity: 0.75,
    defaultSpeed: 1.05,
    dspTobi: {
      pitchFactor: 1.34, // +34% High-Pitched Goofy Squeak
      bassGain: -6,
      bassFreq: 220,
      midGain: 7,
      midFreq: 1800,
      highGain: 5,
      highFreq: 6000,
      reverbDelay: 0.03,
      reverbGain: 0.2,
      distortion: 0,
      label: "Playful Tobi High-Pitched Trickster Squeak (+34% Pitch)"
    },
    dspObito: {
      pitchFactor: 0.82, // -18% Deep Void Pitch
      bassGain: 10,
      bassFreq: 130,
      midGain: 4,
      midFreq: 650,      // Hollow Spiral Mask Interior
      highGain: -5,
      highFreq: 4000,
      reverbDelay: 0.09,
      reverbGain: 0.38,
      distortion: 5,
      label: "Masked Obito Spiral Mask Acoustic Chamber (-18% Pitch, Hollow Resonator)"
    },
    quotes: {
      en: [
        "Tobi is a good boy! Deidara-senpai, wait for me! Hehehe!",
        "There is no such thing as peace in this world, that is reality. I shall create a world of genuine dreams.",
        "When a man learns to love, he must bear the risk of hatred."
      ],
      hi: [
        "टोबी तो बहुत शरीफ और प्यारा लड़का है! दीदारा-सेनपाई, मेरे लिए रुको ना! हेहेहे!",
        "इस दुनिया में शांति नाम की कोई चीज़ नहीं है, यही हकीकत है। मैं सपनों की एक नई दुनिया बनाऊंगा।",
        "जब इंसान प्यार करना सीखता है, तो उसे नफ़रत का खतरा भी उठाना पड़ता है।"
      ]
    }
  },
  kakashi: {
    id: "kakashi",
    name: "Kakashi Hatake",
    kanji: "はたけカカシ",
    title: "The Copy Ninja of the Sharingan",
    defaultVoiceId: "kSIyQ8cADEzDIL2F7AbG", // Neil (Calm Masculine)
    voiceStyle: "Calm Composed Smooth • Multilingual v2",
    chakraClass: "theme-kakashi",
    auraText: "KAKASHI HATAKE • RAIKIRI LIGHTNING BLADE",
    thumb: "assets/images/kakashi.jpg",
    defaultStability: 0.60,
    defaultSimilarity: 0.82,
    defaultSpeed: 0.98,
    dsp: {
      pitchFactor: 0.96, // Slight calm drop
      bassGain: 4,      // Warm chest tone
      bassFreq: 350,
      midGain: 2,
      midFreq: 1400,
      highGain: -6,     // Cloth mask muffling effect
      highFreq: 4600,
      reverbDelay: 0.02,
      reverbGain: 0.12,
      distortion: 0,
      label: "Kakashi Shinobi Cloth Mask Acoustic Muffle & Relaxed Anbu Cadence"
    },
    quotes: {
      en: [
        "In the ninja world, those who break the rules are scum. But those who abandon their comrades are worse than scum.",
        "Look closely... Lightning Blade, Raikiri! I won't let you harm my comrades.",
        "Sorry I'm late, a black cat crossed my path so I had to take the long way."
      ],
      hi: [
        "निंजा की दुनिया में जो नियमों को तोड़ते हैं वे कचरा हैं। लेकिन जो अपने साथियों को छोड़ देते हैं, वे कचरे से भी बदतर हैं।",
        "माफ करना मुझे देर हो गई, रास्ते में एक काली बिल्ली आ गई थी इसलिए मुझे लंबा रास्ता लेना पड़ा।",
        "ध्यान से देखो... लाइटनिंग ब्लेड, राइकिरी! मैं तुम्हें अपने साथियों को नुकसान नहीं पहुँचाने दूँगा।"
      ]
    }
  }
};

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const bodyEl = document.body;
const charCards = document.querySelectorAll(".character-card");
const langBtnEn = document.getElementById("langBtnEn");
const langBtnHi = document.getElementById("langBtnHi");
const activeCharacterAuraText = document.getElementById("activeCharacterAuraText");
const activeCharThumb = document.getElementById("activeCharThumb");
const activeCharHeaderName = document.getElementById("activeCharHeaderName");
const activeCharVoiceStyle = document.getElementById("activeCharVoiceStyle");
const presetChipsContainer = document.getElementById("presetChipsContainer");
const textInput = document.getElementById("textInput");
const charCounter = document.getElementById("charCounter");
const clearTextBtn = document.getElementById("clearTextBtn");
const castJutsuBtn = document.getElementById("castJutsuBtn");
const randomQuoteBtn = document.getElementById("randomQuoteBtn");
const stabilitySlider = document.getElementById("stabilitySlider");
const similaritySlider = document.getElementById("similaritySlider");
const speedSlider = document.getElementById("speedSlider");
const stabilityVal = document.getElementById("stabilityVal");
const similarityVal = document.getElementById("similarityVal");
const speedVal = document.getElementById("speedVal");
const tobiPersonaContainer = document.getElementById("tobiPersonaContainer");
const personaTobi = document.getElementById("personaTobi");
const personaObito = document.getElementById("personaObito");

// DSP Morphing Elements
const animeDspToggle = document.getElementById("animeDspToggle");
const dspSwitchLabel = document.getElementById("dspSwitchLabel");
const currentDspFilterName = document.getElementById("currentDspFilterName");

// Overlay & Animation Elements
const castingOverlay = document.getElementById("castingOverlay");
const castingStatusText = document.getElementById("castingStatusText");
const mainSharingan = document.getElementById("mainSharingan");

// Audio Player Elements
const mainAudio = document.getElementById("mainAudioElement");
const playPauseBtn = document.getElementById("playPauseBtn");
const restartBtn = document.getElementById("restartBtn");
const progressBarContainer = document.getElementById("progressBarContainer");
const progressFill = document.getElementById("progressFill");
const volumeSlider = document.getElementById("volumeSlider");
const volumeIcon = document.getElementById("volumeIcon");
const soundWaveIcon = document.getElementById("soundWaveIcon");
const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const playbackTimeDisplay = document.getElementById("playbackTimeDisplay");
const downloadAudioBtn = document.getElementById("downloadAudioBtn");
const historyList = document.getElementById("historyList");
const emptyHistoryMsg = document.getElementById("emptyHistoryMsg");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Modals
const sfxToggleBtn = document.getElementById("sfxToggleBtn");
const keyConfigBtn = document.getElementById("keyConfigBtn");
const apiKeyModal = document.getElementById("apiKeyModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const apiKeyInput = document.getElementById("apiKeyInput");
const toggleKeyVisibility = document.getElementById("toggleKeyVisibility");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const resetDefaultKeyBtn = document.getElementById("resetDefaultKeyBtn");

// Voice Lab Modal
const voiceLabBtn = document.getElementById("voiceLabBtn");
const voiceLabModal = document.getElementById("voiceLabModal");
const closeVoiceLabModalBtn = document.getElementById("closeVoiceLabModalBtn");
const voiceLabModalBackdrop = document.getElementById("voiceLabModalBackdrop");
const saveVoiceIdsBtn = document.getElementById("saveVoiceIdsBtn");
const resetVoiceIdsBtn = document.getElementById("resetVoiceIdsBtn");
const voiceIdMadara = document.getElementById("voiceIdMadara");
const voiceIdSasuke = document.getElementById("voiceIdSasuke");
const voiceIdNaruto = document.getElementById("voiceIdNaruto");
const voiceIdTobi = document.getElementById("voiceIdTobi");
const voiceIdKakashi = document.getElementById("voiceIdKakashi");

// Canvas Elements
const chakraCanvas = document.getElementById("chakraCanvas");
const visualizerCanvas = document.getElementById("audioVisualizerCanvas");

// ==========================================================================
// WEB AUDIO GRAPH & SHINOBI DSP PROCESSING CHAIN
// ==========================================================================
let audioCtx = null;
let analyser = null;
let audioSource = null;
let audioConnected = false;

// DSP Nodes
let bassFilter = null;
let midFilter = null;
let highFilter = null;
let distortionNode = null;
let delayNode = null;
let delayGain = null;
let dryGain = null;
let wetGain = null;
let masterDspGain = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Distortion Curve Generator (Soft saturation for Kurama rasp)
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 10;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function setupAudioGraph() {
  if (audioConnected) return;
  try {
    const ctx = getAudioContext();
    
    // Create MediaElement Source
    audioSource = ctx.createMediaElementSource(mainAudio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;

    // Build DSP Filter Chain
    bassFilter = ctx.createBiquadFilter();
    bassFilter.type = "lowshelf";

    midFilter = ctx.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.Q.value = 1.2;

    highFilter = ctx.createBiquadFilter();
    highFilter.type = "peaking";
    highFilter.Q.value = 1.0;

    distortionNode = ctx.createWaveShaper();
    distortionNode.oversample = "2x";

    delayNode = ctx.createDelay(1.0);
    delayGain = ctx.createGain();
    dryGain = ctx.createGain();
    wetGain = ctx.createGain();
    masterDspGain = ctx.createGain();

    // Connect:
    // audioSource -> bassFilter -> midFilter -> highFilter -> distortionNode
    audioSource.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(distortionNode);

    // Split into Dry & Wet paths for delay/reverb
    distortionNode.connect(dryGain);
    distortionNode.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(wetGain);

    dryGain.connect(masterDspGain);
    wetGain.connect(masterDspGain);

    // Output to Analyser and Speakers
    masterDspGain.connect(analyser);
    analyser.connect(ctx.destination);

    audioConnected = true;
    updateDspFilters();
  } catch (e) {
    console.warn("Could not setup audio DSP graph:", e);
  }
}

function updateDspFilters() {
  if (!audioConnected || !audioCtx) return;
  const char = SHINOBI_DATA[currentCharacterId];
  let dspConfig = char.dsp;

  if (currentCharacterId === "tobi") {
    dspConfig = char.persona === "obito" ? char.dspObito : char.dspTobi;
  }

  currentDspFilterName.textContent = dspConfig.label;

  const userSpeed = parseInt(speedSlider.value, 10) / 100;

  if (animeDspEnabled) {
    // 1. Playback Rate / Pitch Modulation
    mainAudio.playbackRate = dspConfig.pitchFactor * userSpeed;

    // 2. Bass Frequency & Gain
    bassFilter.frequency.setValueAtTime(dspConfig.bassFreq, audioCtx.currentTime);
    bassFilter.gain.setValueAtTime(dspConfig.bassGain, audioCtx.currentTime);

    // 3. Mid Frequency & Gain
    midFilter.frequency.setValueAtTime(dspConfig.midFreq, audioCtx.currentTime);
    midFilter.gain.setValueAtTime(dspConfig.midGain, audioCtx.currentTime);

    // 4. High Frequency & Gain
    highFilter.frequency.setValueAtTime(dspConfig.highFreq, audioCtx.currentTime);
    highFilter.gain.setValueAtTime(dspConfig.highGain, audioCtx.currentTime);

    // 5. Distortion / Overdrive
    if (dspConfig.distortion > 0) {
      distortionNode.curve = makeDistortionCurve(dspConfig.distortion);
    } else {
      distortionNode.curve = null;
    }

    // 6. Delay / Echo (Susanoo cavern / Chidori reflection)
    delayNode.delayTime.setValueAtTime(dspConfig.reverbDelay, audioCtx.currentTime);
    delayGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    wetGain.gain.setValueAtTime(dspConfig.reverbGain, audioCtx.currentTime);
    dryGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
  } else {
    // Bypass DSP
    mainAudio.playbackRate = userSpeed;
    bassFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    midFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    highFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    distortionNode.curve = null;
    wetGain.gain.setValueAtTime(0, audioCtx.currentTime);
    dryGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
  }
}

// ==========================================================================
// SYNTHESIZED SHINOBI SOUND EFFECTS (Web Audio API)
// ==========================================================================
function playSharinganSFX() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {}
}

function playJutsuCastSFX() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.9);
    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.25, now + 0.2);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(880, now);
    chime.frequency.exponentialRampToValueAtTime(1440, now + 0.3);
    chimeGain.gain.setValueAtTime(0.18, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 1.0);
    chime.start(now);
    chime.stop(now + 0.75);
  } catch (e) {}
}

function playClickSFX() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
}

// ==========================================================================
// CHARACTER & THEME SWITCHING
// ==========================================================================
function selectCharacter(charId) {
  const char = SHINOBI_DATA[charId];
  if (!char) return;

  currentCharacterId = charId;
  playSharinganSFX();

  // Update Body Theme
  bodyEl.className = char.chakraClass;
  bodyEl.setAttribute("data-character", charId);

  // Update Cards state
  charCards.forEach(card => {
    if (card.dataset.char === charId) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  // Check if Custom Cloned Voice ID is active
  const customId = customVoiceIds[charId];
  const voiceLabel = customId 
    ? `✨ Custom Cloned Voice (${customId.slice(0, 8)}...)` 
    : char.voiceStyle;

  // Update Console Banner
  activeCharacterAuraText.textContent = char.auraText;
  activeCharThumb.src = char.thumb;
  activeCharHeaderName.textContent = `${char.name} (${char.kanji})`;
  activeCharVoiceStyle.textContent = voiceLabel;

  // Show/hide Tobi Persona controls
  if (charId === "tobi") {
    tobiPersonaContainer.style.display = "flex";
  } else {
    tobiPersonaContainer.style.display = "none";
  }

  // Set sliders to character defaults
  stabilitySlider.value = Math.round(char.defaultStability * 100);
  stabilityVal.textContent = `${stabilitySlider.value}%`;
  similaritySlider.value = Math.round(char.defaultSimilarity * 100);
  similarityVal.textContent = `${similaritySlider.value}%`;
  speedSlider.value = Math.round(char.defaultSpeed * 100);
  speedVal.textContent = `${(speedSlider.value / 100).toFixed(1)}x`;

  // Render Preset Quotes
  renderPresetQuotes();

  // Update DSP Filters
  updateDspFilters();

  // If textInput is empty or has another preset, set the first quote
  const currentQuotes = char.quotes[currentLanguage];
  if (!textInput.value || Object.values(SHINOBI_DATA).some(c => c.quotes[currentLanguage].includes(textInput.value))) {
    textInput.value = currentQuotes[0];
    updateCharCounter();
  }
}

function renderPresetQuotes() {
  const char = SHINOBI_DATA[currentCharacterId];
  const quotes = char.quotes[currentLanguage];
  presetChipsContainer.innerHTML = "";

  quotes.forEach((quote) => {
    const chip = document.createElement("button");
    chip.className = "quote-chip";
    chip.title = quote;
    chip.textContent = quote;
    chip.addEventListener("click", () => {
      playClickSFX();
      textInput.value = quote;
      updateCharCounter();
      textInput.focus();
    });
    presetChipsContainer.appendChild(chip);
  });
}

function updateCharCounter() {
  const len = textInput.value.length;
  charCounter.textContent = `${len} / 2500 characters`;
  if (len > 2500) {
    charCounter.style.color = "#ff3366";
  } else {
    charCounter.style.color = "var(--text-muted)";
  }
}

// ==========================================================================
// BACKGROUND CHAKRA PARTICLES CANVAS
// ==========================================================================
let particles = [];
function initChakraCanvas() {
  const ctx = chakraCanvas.getContext("2d");
  function resize() {
    chakraCanvas.width = window.innerWidth;
    chakraCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  particles = [];
  const count = window.innerWidth < 768 ? 35 : 70;
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  function getChakraColor() {
    switch (currentCharacterId) {
      case "madara": return "255, 30, 60";
      case "sasuke": return "0, 210, 255";
      case "naruto": return "255, 140, 0";
      case "tobi": return "255, 90, 0";
      case "kakashi": return "0, 240, 255";
      default: return "255, 50, 50";
    }
  }

  function createParticle() {
    return {
      x: Math.random() * chakraCanvas.width,
      y: Math.random() * chakraCanvas.height + chakraCanvas.height,
      radius: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 1.4 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.05 + 0.01
    };
  }

  function animate() {
    ctx.clearRect(0, 0, chakraCanvas.width, chakraCanvas.height);
    const color = getChakraColor();

    for (let p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.4;
      p.alpha += Math.sin(p.y * 0.05) * p.pulse;

      if (p.y < -20) {
        p.y = chakraCanvas.height + 20;
        p.x = Math.random() * chakraCanvas.width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${Math.max(0.1, Math.min(0.9, p.alpha))})`;
      ctx.shadowBlur = p.radius * 4;
      ctx.shadowColor = `rgba(${color}, 0.8)`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================================================
// REAL-TIME AUDIO FREQUENCY VISUALIZER
// ==========================================================================
function initAudioVisualizer() {
  const ctx = visualizerCanvas.getContext("2d");
  function resize() {
    visualizerCanvas.width = visualizerCanvas.parentElement.clientWidth;
    visualizerCanvas.height = 85;
  }
  window.addEventListener("resize", resize);
  resize();

  const bufferLength = 64;
  const dataArray = new Uint8Array(bufferLength);

  function getChakraGradient(height) {
    const grad = ctx.createLinearGradient(0, height, 0, 0);
    switch (currentCharacterId) {
      case "madara":
        grad.addColorStop(0, "#ff1a40");
        grad.addColorStop(1, "#ff8095");
        break;
      case "sasuke":
        grad.addColorStop(0, "#00d2ff");
        grad.addColorStop(1, "#9966ff");
        break;
      case "naruto":
        grad.addColorStop(0, "#ff6600");
        grad.addColorStop(1, "#ffcc00");
        break;
      case "tobi":
        grad.addColorStop(0, "#ff5500");
        grad.addColorStop(1, "#aa00ff");
        break;
      case "kakashi":
        grad.addColorStop(0, "#00f0ff");
        grad.addColorStop(1, "#76ff03");
        break;
      default:
        grad.addColorStop(0, "#ff3366");
        grad.addColorStop(1, "#ff99aa");
    }
    return grad;
  }

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    const isPlaying = !mainAudio.paused && !mainAudio.ended && mainAudio.currentTime > 0;
    if (analyser && isPlaying) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      const time = Date.now() * 0.003;
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.max(8, Math.sin(time + i * 0.25) * 18 + 20);
      }
    }

    const barWidth = (visualizerCanvas.width / bufferLength) * 1.4;
    let barHeight;
    let x = 0;
    const grad = getChakraGradient(visualizerCanvas.height);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * visualizerCanvas.height * 0.92;
      ctx.fillStyle = grad;
      ctx.shadowBlur = isPlaying ? 10 : 2;
      ctx.shadowColor = grad;

      const y = visualizerCanvas.height - barHeight;
      ctx.fillRect(x, y, barWidth - 1.5, barHeight);
      x += barWidth;
      if (x > visualizerCanvas.width) break;
    }
    ctx.shadowBlur = 0;
  }
  draw();
}

// ==========================================================================
// VOICE JUTSU SYNTHESIS (ELEVENLABS MULTILINGUAL v2 + DSP)
// ==========================================================================
function getEffectiveVoiceId(charId) {
  // Check if user set a custom cloned voice ID
  if (customVoiceIds[charId] && customVoiceIds[charId].trim() !== "") {
    return customVoiceIds[charId].trim();
  }

  const char = SHINOBI_DATA[charId];
  if (charId === "tobi" && char.persona === "obito") {
    return char.altVoiceId;
  }
  return char.defaultVoiceId;
}

async function castVoiceJutsu() {
  const text = textInput.value.trim();
  if (!text) {
    alert("Please enter speech dialogue into the Shinobi scroll before casting Jutsu!");
    textInput.focus();
    return;
  }

  const char = SHINOBI_DATA[currentCharacterId];
  const voiceId = getEffectiveVoiceId(currentCharacterId);

  const stability = parseInt(stabilitySlider.value, 10) / 100;
  const similarity = parseInt(similaritySlider.value, 10) / 100;

  // 1. Trigger Animation & Sound FX
  playJutsuCastSFX();
  mainSharingan.classList.add("active-jutsu");
  castingOverlay.classList.add("show");
  castJutsuBtn.disabled = true;

  const seals = ["seal1", "seal2", "seal3", "seal4"];
  let step = 0;
  const signInterval = setInterval(() => {
    seals.forEach(id => document.getElementById(id).classList.remove("active"));
    const activeSeal = document.getElementById(seals[step % seals.length]);
    if (activeSeal) activeSeal.classList.add("active");
    step++;
  }, 220);

  castingStatusText.textContent = `Channeling ${char.name}'s Chakra (${currentLanguage.toUpperCase()})...`;

  try {
    let audioBlob = null;

    // Strategy A: Python backend proxy
    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": currentApiKey
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: stability,
            similarity_boost: similarity,
            style: 0.35,
            use_speaker_boost: true
          }
        })
      });

      if (resp.ok) {
        audioBlob = await resp.blob();
      } else {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.detail?.message || errJson.error || `HTTP ${resp.status}`);
      }
    } catch (proxyError) {
      console.log("Directing to ElevenLabs direct API fallback...", proxyError);

      // Strategy B: Direct browser request to ElevenLabs API
      const directResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": currentApiKey,
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: stability,
            similarity_boost: similarity,
            style: 0.35,
            use_speaker_boost: true
          }
        })
      });

      if (directResp.ok) {
        audioBlob = await directResp.blob();
      } else {
        const errJson = await directResp.json().catch(() => ({}));
        throw new Error(errJson.detail?.message || `ElevenLabs API Error: ${directResp.statusText}`);
      }
    }

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("Empty audio received from voice synthesizer");
    }

    clearInterval(signInterval);
    castingStatusText.textContent = "Voice Jutsu Activated!";
    setTimeout(() => {
      castingOverlay.classList.remove("show");
      mainSharingan.classList.remove("active-jutsu");
      castJutsuBtn.disabled = false;
    }, 400);

    // Load Audio
    currentAudioBlob = audioBlob;
    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = URL.createObjectURL(audioBlob);

    currentPlayingMeta = {
      character: char.name,
      kanji: char.kanji,
      lang: currentLanguage.toUpperCase(),
      text: text,
      url: currentAudioUrl,
      blob: currentAudioBlob,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    nowPlayingTitle.textContent = `${char.name} — "${text.slice(0, 55)}${text.length > 55 ? '...' : ''}"`;
    mainAudio.src = currentAudioUrl;

    // Connect Web Audio Graph & Apply DSP
    setupAudioGraph();
    getAudioContext();
    updateDspFilters();

    mainAudio.play().then(() => {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      soundWaveIcon.classList.add("playing");
    }).catch(err => {
      console.log("Autoplay waiting for user gesture:", err);
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });

    addToHistory(currentPlayingMeta);

  } catch (error) {
    clearInterval(signInterval);
    castingOverlay.classList.remove("show");
    mainSharingan.classList.remove("active-jutsu");
    castJutsuBtn.disabled = false;

    console.error("Jutsu Casting Failed:", error);
    alert(`Voice Jutsu Notice: ${error.message}\n\nTip: You can configure custom cloned voice IDs in the Shinobi Voice Lab!`);
  }
}

// ==========================================================================
// AUDIO CONTROLS & TIMELINE
// ==========================================================================
function togglePlayPause() {
  if (!mainAudio.src) {
    castVoiceJutsu();
    return;
  }
  setupAudioGraph();
  getAudioContext();
  updateDspFilters();

  if (mainAudio.paused) {
    mainAudio.play();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    soundWaveIcon.classList.add("playing");
  } else {
    mainAudio.pause();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    soundWaveIcon.classList.remove("playing");
  }
}

function restartAudio() {
  if (mainAudio.src) {
    mainAudio.currentTime = 0;
    updateDspFilters();
    mainAudio.play();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    soundWaveIcon.classList.add("playing");
  }
}

mainAudio.addEventListener("timeupdate", () => {
  if (!mainAudio.duration) return;
  const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
  progressFill.style.width = `${pct}%`;

  const curM = Math.floor(mainAudio.currentTime / 60);
  const curS = Math.floor(mainAudio.currentTime % 60);
  const durM = Math.floor(mainAudio.duration / 60);
  const durS = Math.floor(mainAudio.duration % 60);

  const fmtCur = `${curM.toString().padStart(2, '0')}:${curS.toString().padStart(2, '0')}`;
  const fmtDur = `${durM.toString().padStart(2, '0')}:${durS.toString().padStart(2, '0')}`;
  playbackTimeDisplay.textContent = `${fmtCur} / ${fmtDur}`;
});

mainAudio.addEventListener("ended", () => {
  playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  soundWaveIcon.classList.remove("playing");
  progressFill.style.width = "0%";
});

progressBarContainer.addEventListener("click", (e) => {
  if (!mainAudio.duration) return;
  const rect = progressBarContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  mainAudio.currentTime = pct * mainAudio.duration;
});

volumeSlider.addEventListener("input", (e) => {
  const val = e.target.value / 100;
  mainAudio.volume = val;
  if (val === 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark volume-icon";
  } else if (val < 0.5) {
    volumeIcon.className = "fa-solid fa-volume-low volume-icon";
  } else {
    volumeIcon.className = "fa-solid fa-volume-high volume-icon";
  }
});

// Download MP3
downloadAudioBtn.addEventListener("click", () => {
  if (!currentAudioBlob) {
    alert("Please cast a voice jutsu first to download its audio!");
    return;
  }
  const char = SHINOBI_DATA[currentCharacterId];
  const filename = `${char.name.replace(/\s+/g, '_')}_${currentLanguage.toUpperCase()}_Jutsu_Voice.mp3`;

  const a = document.createElement("a");
  a.href = currentAudioUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// ==========================================================================
// HISTORY & REPLAY
// ==========================================================================
let speechHistory = [];

function addToHistory(item) {
  emptyHistoryMsg.style.display = "none";
  speechHistory.unshift(item);
  if (speechHistory.length > 10) speechHistory.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (speechHistory.length === 0) {
    emptyHistoryMsg.style.display = "block";
    historyList.appendChild(emptyHistoryMsg);
    return;
  }

  speechHistory.forEach((item) => {
    const el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `
      <div class="history-item-left">
        <img src="${SHINOBI_DATA[currentCharacterId].thumb}" class="history-thumb" alt="${item.character}">
        <div class="history-item-texts">
          <div class="history-char-name">
            ${item.character} <span class="lang-tag">${item.lang}</span>
            <span style="font-size:0.7rem; color:var(--text-dim); margin-left:0.5rem;">${item.timestamp}</span>
          </div>
          <div class="history-quote-text">"${item.text}"</div>
        </div>
      </div>
      <div class="history-item-actions">
        <button class="history-action-btn play-hist-btn" title="Replay">
          <i class="fa-solid fa-play"></i>
        </button>
        <button class="history-action-btn dl-hist-btn" title="Download">
          <i class="fa-solid fa-download"></i>
        </button>
      </div>
    `;

    el.querySelector(".play-hist-btn").addEventListener("click", () => {
      mainAudio.src = item.url;
      updateDspFilters();
      mainAudio.play();
      nowPlayingTitle.textContent = `${item.character} — "${item.text.slice(0, 55)}..."`;
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      soundWaveIcon.classList.add("playing");
    });

    el.querySelector(".dl-hist-btn").addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = item.url;
      a.download = `${item.character.replace(/\s+/g, '_')}_speech.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    historyList.appendChild(el);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  speechHistory = [];
  renderHistory();
});

// ==========================================================================
// VOICE LAB MODAL LOGIC
// ==========================================================================
function openVoiceLab() {
  voiceIdMadara.value = customVoiceIds.madara || SHINOBI_DATA.madara.defaultVoiceId;
  voiceIdSasuke.value = customVoiceIds.sasuke || SHINOBI_DATA.sasuke.defaultVoiceId;
  voiceIdNaruto.value = customVoiceIds.naruto || SHINOBI_DATA.naruto.defaultVoiceId;
  voiceIdTobi.value = customVoiceIds.tobi || SHINOBI_DATA.tobi.defaultVoiceId;
  voiceIdKakashi.value = customVoiceIds.kakashi || SHINOBI_DATA.kakashi.defaultVoiceId;

  voiceLabModal.classList.add("show");
}

function saveVoiceIds() {
  customVoiceIds = {
    madara: voiceIdMadara.value.trim(),
    sasuke: voiceIdSasuke.value.trim(),
    naruto: voiceIdNaruto.value.trim(),
    tobi: voiceIdTobi.value.trim(),
    kakashi: voiceIdKakashi.value.trim()
  };

  localStorage.setItem("shinobi_custom_voice_ids", JSON.stringify(customVoiceIds));
  voiceLabModal.classList.remove("show");
  selectCharacter(currentCharacterId); // Refresh UI
  alert("Shinobi Voice Lab updated! Custom cloned Voice IDs are now active.");
}

function resetVoiceIds() {
  customVoiceIds = {};
  localStorage.removeItem("shinobi_custom_voice_ids");
  openVoiceLab();
  selectCharacter(currentCharacterId);
  alert("Reset to default character voice IDs.");
}

// ==========================================================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================================================
function initEvents() {
  // Character Card Clicks
  charCards.forEach(card => {
    card.addEventListener("click", () => {
      const charId = card.dataset.char;
      selectCharacter(charId);
    });
  });

  // Language buttons
  langBtnEn.addEventListener("click", () => {
    playClickSFX();
    currentLanguage = "en";
    langBtnEn.classList.add("active");
    langBtnHi.classList.remove("active");
    renderPresetQuotes();
    const char = SHINOBI_DATA[currentCharacterId];
    textInput.value = char.quotes.en[0];
    updateCharCounter();
  });

  langBtnHi.addEventListener("click", () => {
    playClickSFX();
    currentLanguage = "hi";
    langBtnHi.classList.add("active");
    langBtnEn.classList.remove("active");
    renderPresetQuotes();
    const char = SHINOBI_DATA[currentCharacterId];
    textInput.value = char.quotes.hi[0];
    updateCharCounter();
  });

  // Tobi Persona Switch
  personaTobi.addEventListener("click", () => {
    playClickSFX();
    SHINOBI_DATA.tobi.persona = "tobi";
    personaTobi.classList.add("active");
    personaObito.classList.remove("active");
    updateDspFilters();
  });

  personaObito.addEventListener("click", () => {
    playClickSFX();
    SHINOBI_DATA.tobi.persona = "obito";
    personaObito.classList.add("active");
    personaTobi.classList.remove("active");
    updateDspFilters();
  });

  // Anime DSP Toggle
  animeDspToggle.addEventListener("change", () => {
    animeDspEnabled = animeDspToggle.checked;
    dspSwitchLabel.textContent = animeDspEnabled ? "DSP ON" : "DSP OFF";
    playClickSFX();
    updateDspFilters();
  });

  // Textarea input
  textInput.addEventListener("input", updateCharCounter);
  clearTextBtn.addEventListener("click", () => {
    playClickSFX();
    textInput.value = "";
    updateCharCounter();
    textInput.focus();
  });

  // Cast Jutsu Button
  castJutsuBtn.addEventListener("click", castVoiceJutsu);

  // Random Dialogue Generator
  randomQuoteBtn.addEventListener("click", () => {
    playClickSFX();
    const char = SHINOBI_DATA[currentCharacterId];
    const quotes = char.quotes[currentLanguage];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    textInput.value = randomQuote;
    updateCharCounter();
  });

  // Sliders
  stabilitySlider.addEventListener("input", (e) => {
    stabilityVal.textContent = `${e.target.value}%`;
  });
  similaritySlider.addEventListener("input", (e) => {
    similarityVal.textContent = `${e.target.value}%`;
  });
  speedSlider.addEventListener("input", (e) => {
    const spd = (e.target.value / 100).toFixed(1);
    speedVal.textContent = `${spd}x`;
    updateDspFilters();
  });

  // Player buttons
  playPauseBtn.addEventListener("click", togglePlayPause);
  restartBtn.addEventListener("click", restartAudio);

  // SFX Toggle
  sfxToggleBtn.addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    sfxToggleBtn.innerHTML = sfxEnabled 
      ? '<i class="fa-solid fa-volume-high"></i><span>SFX ON</span>' 
      : '<i class="fa-solid fa-volume-xmark"></i><span>SFX OFF</span>';
  });

  // Sharingan click animation
  mainSharingan.addEventListener("click", () => {
    playSharinganSFX();
    mainSharingan.classList.add("active-jutsu");
    setTimeout(() => mainSharingan.classList.remove("active-jutsu"), 1200);
  });

  // API Modal Handlers
  keyConfigBtn.addEventListener("click", () => {
    apiKeyInput.value = currentApiKey;
    apiKeyModal.classList.add("show");
  });
  closeModalBtn.addEventListener("click", () => apiKeyModal.classList.remove("show"));
  modalBackdrop.addEventListener("click", () => apiKeyModal.classList.remove("show"));

  toggleKeyVisibility.addEventListener("click", () => {
    const isPass = apiKeyInput.type === "password";
    apiKeyInput.type = isPass ? "text" : "password";
    toggleKeyVisibility.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      currentApiKey = key;
      localStorage.setItem("shinobi_api_key", key);
      apiKeyModal.classList.remove("show");
      alert("Shinobi ElevenLabs API key successfully updated!");
    }
  });

  resetDefaultKeyBtn.addEventListener("click", () => {
    apiKeyInput.value = DEFAULT_API_KEY;
    currentApiKey = DEFAULT_API_KEY;
    localStorage.removeItem("shinobi_api_key");
    alert("Reset to default Shinobi API key!");
  });

  // Voice Lab Handlers
  voiceLabBtn.addEventListener("click", openVoiceLab);
  closeVoiceLabModalBtn.addEventListener("click", () => voiceLabModal.classList.remove("show"));
  voiceLabModalBackdrop.addEventListener("click", () => voiceLabModal.classList.remove("show"));
  saveVoiceIdsBtn.addEventListener("click", saveVoiceIds);
  resetVoiceIdsBtn.addEventListener("click", resetVoiceIds);
}

// ==========================================================================
// BOOTSTRAP
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  selectCharacter("madara");
  initChakraCanvas();
  initAudioVisualizer();
  initEvents();
  updateCharCounter();
});

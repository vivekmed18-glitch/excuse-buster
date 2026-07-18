// --- Application State ---
const state = {
  bustedCount: parseInt(localStorage.getItem('excuse_busted_count')) || 0,
  selectedTone: 'coach',
  apiEngine: localStorage.getItem('excuse_api_engine') || 'mock',
  apiKey: localStorage.getItem('excuse_api_key') || '',
  activeTheme: localStorage.getItem('excuse_buster_theme') || 'amber',
  roadmapMode: false,
  selectedAspect: '1:1',
  currentUtterance: null,
  isSpeaking: false,
  lastExcuseText: '',
  lastBustedResponse: null // { excuse, callout, action } where action is string or array
};

// --- Web Audio API Programmatic UI Synthesizer ---
const SynthAudio = {
  ctx: null,
  enabled: localStorage.getItem('excuse_sound_enabled') !== 'false',
  noiseBuffer: null,

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch (e) {
          console.warn('Failed to resume AudioContext:', e);
        }
      }
      return;
    }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  },

  getNoiseBuffer() {
    if (this.noiseBuffer) return this.noiseBuffer;
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  },

  async playTick() {
    if (!this.enabled) return;
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  },

  async playClick() {
    if (!this.enabled) return;
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  },

  async playThud() {
    if (!this.enabled) return;
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    // Deep heavy stamp slam sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  },

  async playBust(tone) {
    if (!this.enabled) return;
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    
    if (tone === 'coach') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
        
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } else if (tone === 'brutal') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.linearRampToValueAtTime(45, now + 0.5);
      
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(84, now);
      osc2.frequency.linearRampToValueAtTime(47, now + 0.5);
      
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      
      const cleanUp = () => {
        osc1.disconnect();
        osc2.disconnect();
        gain.disconnect();
      };
      osc1.onended = cleanUp;
      
      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now);
      osc2.stop(now + 0.5);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.4);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      
      osc.start(now);
      osc.stop(now + 0.4);
    }
  },

  async playSwoosh() {
    if (!this.enabled) return;
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    const buffer = this.getNoiseBuffer();
    if (!buffer) return;
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.5, now);
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noiseNode.onended = () => {
      noiseNode.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.35);
  },

  async playToggle() {
    await this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.08);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.22);
  }
};

// --- Mock Database for Offline/Initial Mode ---
const mockDatabase = {
  gym: {
    name: 'Fear of Discomfort & Inertia',
    coach: {
      callout: 'Waiting for "next week" is a comforting lie. You are prioritizing temporary convenience over your long-term health and vitality. The perfect energy level will never arrive; you have to generate it by moving.',
      action: 'Put on your exercise shoes right now. Do not think about the workout. Just step outside your door for 2 minutes.'
    },
    brutal: {
      callout: 'You are letting comfort run your life. Next week doesn\'t exist. You\'re just avoiding the initial sweat and feeling out of shape. Stop coddling yourself.',
      action: 'Drop and do 10 squats immediately. No gym required. Do them right where you are standing.'
    },
    funny: {
      callout: 'Ah, "next week"—that mythical land where you are suddenly a disciplined Olympian with unlimited free time. Spoiler alert: Next week you is exactly the same as today you.',
      action: 'Do 10 high-knees on the spot while screaming "I am an athlete!" at the top of your lungs.'
    }
  },
  coding: {
    name: 'Fear of Failure / Imposter Syndrome',
    coach: {
      callout: 'Complexity can feel paralyzing. You don\'t need to understand the entire codebase to write the first line of code. Progress is built block by block.',
      action: 'Open your code editor, create a blank file, and write a single console.log statement. That\'s it. You\'ve started.'
    },
    brutal: {
      callout: 'You are waiting for inspiration to compile. It won\'t. You are hiding behind tutorials because building real things is risky. Write buggy code, just write something.',
      action: 'Open your IDE and write one single function that prints "Hello World". Save the file. Close the tab.'
    },
    funny: {
      callout: 'You aren\'t waiting to learn more; you are waiting for a magical fairy to write the repository for you. It\'s not going to happen, and ChatGPT is getting tired of holding your hand.',
      action: 'Create a repository named "excuse-buster-temp" and write a comment saying: "// I was forced to write this by an AI."'
    }
  },
  clean: {
    name: 'Dread of Boring Tasks',
    coach: {
      callout: 'A cluttered space reflects a cluttered mind. You don\'t have to clean the whole house. Just focus on a single corner to clear your path.',
      action: 'Pick up exactly three items off your desk or floor and put them in their proper place.'
    },
    brutal: {
      callout: 'You are living in your own mess because you lack 5 minutes of basic discipline. Letting chores pile up drains your subconscious energy. Clean it up.',
      action: 'Set a timer for 180 seconds. Pick up trash and wipe down your immediate workspace until the timer rings.'
    },
    funny: {
      callout: 'You are waiting for the dust bunnies to form a union and clean the room themselves. Sadly, they have terrible work ethic. Take charge.',
      action: 'Take one dirty mug/glass to the kitchen sink and rinse it. Just one. Do not look at the rest.'
    }
  },
  generic: {
    name: 'Classic Procrastination Loop',
    coach: {
      callout: 'You are waiting for the "perfect moment" to begin. But waiting only breeds anxiety. The easiest way to reduce the weight of this task is to make the first move, however small.',
      action: 'Spend exactly 2 minutes doing the very first sub-step of this task. Write down one word, check one link, or open one document.'
    },
    brutal: {
      callout: 'This excuse is a shield to protect you from effort. Every hour you spend putting this off is an hour you spend carrying the guilt of not doing it. Just get it over with.',
      action: 'Stop thinking. Close all browser tabs unrelated to the task, and spend 5 minutes working on it with a timer running.'
    },
    funny: {
      callout: 'A highly creative piece of fiction. You should write a novel instead of making excuses. Your brain is working overtime just to avoid 5 minutes of actual labor.',
      action: 'Do the easiest, smallest part of this task right now while humming a victory theme song.'
    }
  }
};

// --- DOM Elements ---
const elements = {
  form: document.getElementById('excuse-form'),
  input: document.getElementById('excuse-input'),
  charCurrent: document.getElementById('char-current'),
  toneBtns: document.querySelectorAll('.tone-circle-btn'),
  btnBust: document.getElementById('btn-bust'),
  resultPanel: document.getElementById('result-panel'),
  resExcuse: document.getElementById('res-excuse'),
  resCallout: document.getElementById('res-callout'),
  resAction: document.getElementById('res-action'),
  resRoadmap: document.getElementById('res-roadmap'),
  actionEyebrow: document.getElementById('action-eyebrow'),
  btnCopy: document.getElementById('btn-copy'),
  btnDownload: document.getElementById('btn-download'),
  btnSettings: document.getElementById('btn-settings'),
  settingsModal: document.getElementById('settings-modal'),
  settingsForm: document.getElementById('settings-form'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  apiKeyContainer: document.getElementById('api-key-container'),
  apiKeyInput: document.getElementById('api-key-input'),
  apiKeyLabel: document.getElementById('api-key-label'),
  btnTogglePassword: document.getElementById('btn-toggle-password'),
  bustedCounter: document.getElementById('busted-counter'),
  shareCanvas: document.getElementById('share-card-canvas'),
  soundToggle: document.getElementById('sound-effects-toggle'),
  
  // New Feature elements
  btnDashboard: document.getElementById('btn-dashboard'),
  analyticsModal: document.getElementById('analytics-modal'),
  btnCloseAnalytics: document.getElementById('btn-close-analytics'),
  roadmapToggle: document.getElementById('roadmap-mode-toggle'),
  btnTts: document.getElementById('btn-tts'),
  aspectRatioSelector: document.getElementById('aspect-ratio-selector'),
  btnCalendar: document.getElementById('btn-calendar'),
  btnRemind: document.getElementById('btn-remind'),
  statTotal: document.getElementById('stat-total'),
  statStreak: document.getElementById('stat-streak'),
  barGym: document.getElementById('bar-gym'),
  barCoding: document.getElementById('bar-coding'),
  barClean: document.getElementById('bar-clean'),
  barGeneric: document.getElementById('bar-generic'),
  valGym: document.getElementById('val-gym'),
  valCoding: document.getElementById('val-coding'),
  valClean: document.getElementById('val-clean'),
  valGeneric: document.getElementById('val-generic'),
  btnRebust: document.getElementById('btn-rebust'),
  resultPlaceholder: document.getElementById('result-placeholder'),
  resultActiveWrapper: document.getElementById('result-active-wrapper'),
  lblActiveTone: document.getElementById('lbl-active-tone')
};

// --- Local Storage Analytics Module ---
const Analytics = {
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('excuse_analytics_history') || '[]');
    } catch (e) {
      return [];
    }
  },
  
  saveHistory(history) {
    localStorage.setItem('excuse_analytics_history', JSON.stringify(history));
  },
  
  trackBust(excuseText) {
    const history = this.getHistory();
    const category = classifyExcuseLocally(excuseText);
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Log entry
    history.push({
      timestamp: Date.now(),
      date: todayStr,
      category: category,
      excuse: excuseText
    });
    this.saveHistory(history);
    
    // Recalculate streak
    let streak = 0;
    const uniqueDates = Array.from(new Set(history.map(h => h.date))).sort();
    if (uniqueDates.length > 0) {
      const today = new Date(todayStr);
      let checkDate = new Date(todayStr);
      
      if (uniqueDates.includes(todayStr)) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        let prevDateStr = checkDate.toISOString().split('T')[0];
        
        while (uniqueDates.includes(prevDateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
          prevDateStr = checkDate.toISOString().split('T')[0];
        }
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
        let prevDateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(prevDateStr)) {
          streak = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          prevDateStr = checkDate.toISOString().split('T')[0];
          while (uniqueDates.includes(prevDateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            prevDateStr = checkDate.toISOString().split('T')[0];
          }
        }
      }
    }
    
    localStorage.setItem('excuse_bust_streak', streak);
    return {
      total: history.length,
      streak: streak,
      categories: this.getCategoryBreakdown(history)
    };
  },
  
  getCategoryBreakdown(history) {
    const counts = { gym: 0, coding: 0, clean: 0, generic: 0 };
    history.forEach(h => {
      if (counts[h.category] !== undefined) {
        counts[h.category]++;
      } else {
        counts.generic++;
      }
    });
    return counts;
  },
  
  getStats() {
    const history = this.getHistory();
    const streak = parseInt(localStorage.getItem('excuse_bust_streak')) || 0;
    return {
      total: history.length,
      streak: streak,
      categories: this.getCategoryBreakdown(history)
    };
  }
};

// --- Web Speech API Text-to-Speech Engine ---
const VoiceCoach = {
  synth: window.speechSynthesis,
  
  speak(text, tone, onEndCallback) {
    this.cancel();
    if (!text || !this.synth) return;
    
    state.isSpeaking = true;
    if (elements.btnTts) {
      elements.btnTts.classList.add('audio-pulse-active');
      elements.btnTts.querySelector('i').className = 'ph-light ph-speaker-none';
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    state.currentUtterance = utterance;
    
    if (tone === 'coach') {
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
    } else if (tone === 'brutal') {
      utterance.rate = 0.78;
      utterance.pitch = 0.85;
    } else if (tone === 'funny') {
      utterance.rate = 1.15;
      utterance.pitch = 1.25;
    }
    
    const voices = this.synth.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google'));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Natural'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-'));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onend = () => {
      this.clearState();
      if (onEndCallback) onEndCallback();
    };
    
    utterance.onerror = () => {
      this.clearState();
    };
    
    this.synth.speak(utterance);
  },
  
  cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.clearState();
  },
  
  clearState() {
    state.isSpeaking = false;
    state.currentUtterance = null;
    if (elements.btnTts) {
      elements.btnTts.classList.remove('audio-pulse-active');
      elements.btnTts.querySelector('i').className = 'ph-light ph-speaker-high';
    }
  }
};

// --- Wall of Shame Simulated Feed Ticker ---
const WallOfShame = {
  ticker: null,
  
  init() {
    this.ticker = document.getElementById('community-ticker');
    if (!this.ticker) return;
    
    const mockExcuses = [
      { excuse: "I'll start my coding project when I feel inspired.", roast: "Spoiler alert: Inspiration isn't coming. Discipline is.", tone: "brutal" },
      { excuse: "I'm too tired to wash the dishes tonight.", roast: "Sure, let them grow their own civilization by morning.", tone: "funny" },
      { excuse: "I need to do more research before I build this.", roast: "Research is procrastination dressed in a suit. Start coding.", tone: "coach" },
      { excuse: "I'll clean my room tomorrow.", roast: "Ah, the mythical day where clean clothes fold themselves.", tone: "funny" },
      { excuse: "I need to buy better running shoes first.", roast: "Your feet work fine. Put on whatever you have and run.", tone: "coach" },
      { excuse: "I don't have enough time today.", roast: "You had enough time to read this. Go.", tone: "brutal" },
      { excuse: "It's raining, so I can't go for my run.", roast: "You aren't made of sugar. Go splash.", tone: "coach" },
      { excuse: "I'll study after checking social media for 5 minutes.", roast: "5 minutes of scrolling is a black hole. Close the tab.", tone: "brutal" }
    ];
    
    const fullList = [...mockExcuses, ...mockExcuses];
    
    this.ticker.innerHTML = '';
    fullList.forEach(item => {
      const div = document.createElement('div');
      div.className = `ticker-item tone-${item.tone}`;
      
      let badge = '🔥';
      if (item.tone === 'brutal') badge = '💀';
      if (item.tone === 'funny') badge = '🤡';
      
      div.innerHTML = `${badge} <span class="accent-text">"${item.excuse}"</span> ➜ ${item.roast}`;
      this.ticker.appendChild(div);
    });
  }
};

// --- Helper Functions ---

// Secure Odometer Digits Update
function updateOdometer(count, immediate = false) {
  if (!elements.bustedCounter) return;
  const digitsStr = String(count).padStart(3, '0');
  const digitElements = elements.bustedCounter.querySelectorAll('.digit');
  
  digitElements.forEach((el, index) => {
    const targetDigit = digitsStr[index] || '0';
    if (immediate) {
      el.textContent = targetDigit;
      el.style.transform = 'none';
    } else {
      el.style.transform = 'translateY(-10px)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = targetDigit;
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
        }, 100);
      }, 200);
    }
  });
}

// Generate Offscreen Styled Share Card via Canvas
function downloadShareCard(excuseText, excuseType, calloutText, actionContent, tone, aspectRatio) {
  const canvas = elements.shareCanvas;
  const ctx = canvas.getContext('2d');
  
  let canvasW = 1200;
  let canvasH = 1200; 
  
  let layout = {
    padding: 70,
    logoY: 90,
    subtitleY: 120,
    badgeX: 950,
    badgeY: 65,
    badgeW: 170,
    badgeH: 40,
    excuseLabelY: 200,
    excuseTextY: 250,
    dividerY: 380,
    typeLabelY: 440,
    typeTextY: 490,
    calloutLabelY: 590,
    calloutTextY: 640,
    actionBoxPadding: 25,
    actionBoxOffset: 40,
    actionBoxHeight: 180,
    watermarkY: 1140,
    watermarkR: 970,
    fontLogo: '800 32px Outfit',
    fontSub: '500 14px Outfit',
    fontLabel: 'bold 16px Outfit',
    fontExcuse: 'italic 26px Plus Jakarta Sans',
    fontType: '800 36px Outfit',
    fontCallout: '400 20px Plus Jakarta Sans',
    fontActionLabel: 'bold 14px Outfit',
    fontActionText: '600 22px Outfit',
    fontWatermark: '500 12px Outfit',
    textWidth: 1060
  };

  if (aspectRatio === '9:16') {
    canvasW = 1080;
    canvasH = 1920; 
    layout = {
      padding: 60,
      logoY: 110,
      subtitleY: 145,
      badgeX: 780,
      badgeY: 85,
      badgeW: 240,
      badgeH: 50,
      excuseLabelY: 280,
      excuseTextY: 340,
      dividerY: 560,
      typeLabelY: 640,
      typeTextY: 700,
      calloutLabelY: 820,
      calloutTextY: 880,
      actionBoxPadding: 30,
      actionBoxOffset: 60,
      actionBoxHeight: 280,
      watermarkY: 1850,
      watermarkR: 750,
      fontLogo: '800 42px Outfit',
      fontSub: '500 18px Outfit',
      fontLabel: 'bold 22px Outfit',
      fontExcuse: 'italic 30px Plus Jakarta Sans',
      fontType: '800 48px Outfit',
      fontCallout: '400 24px Plus Jakarta Sans',
      fontActionLabel: 'bold 18px Outfit',
      fontActionText: '600 26px Outfit',
      fontWatermark: '500 16px Outfit',
      textWidth: 960
    };
  } else if (aspectRatio === '16:9') {
    canvasW = 1920;
    canvasH = 1080; 
    layout = {
      padding: 100,
      logoY: 120,
      subtitleY: 155,
      badgeX: 1620,
      badgeY: 95,
      badgeW: 200,
      badgeH: 45,
      excuseLabelY: 250,
      excuseTextY: 300,
      dividerY: 450,
      typeLabelY: 520,
      typeTextY: 580,
      calloutLabelY: 680,
      calloutTextY: 730,
      actionBoxPadding: 35,
      actionBoxOffset: 50,
      actionBoxHeight: 180,
      watermarkY: 1020,
      watermarkR: 1650,
      fontLogo: '800 36px Outfit',
      fontSub: '500 16px Outfit',
      fontLabel: 'bold 18px Outfit',
      fontExcuse: 'italic 28px Plus Jakarta Sans',
      fontType: '800 40px Outfit',
      fontCallout: '400 22px Plus Jakarta Sans',
      fontActionLabel: 'bold 16px Outfit',
      fontActionText: '600 24px Outfit',
      fontWatermark: '500 14px Outfit',
      textWidth: 1720
    };
  }
  
  canvas.width = canvasW;
  canvas.height = canvasH;
  
  // 1. Draw Background Gradient
  const grad = ctx.createRadialGradient(canvasW/2, canvasH/2, 50, canvasW/2, canvasH/2, Math.max(canvasW, canvasH)*0.6);
  grad.addColorStop(0, '#0f1322');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);
  
  // 2. Draw Decorative Glow Orbs
  let toneColor = '#f59e0b'; 
  if (tone === 'brutal') toneColor = '#ef4444';
  if (tone === 'funny') toneColor = '#10b981';
  
  ctx.save();
  ctx.globalAlpha = 0.12;
  const glowGrad = ctx.createRadialGradient(canvasW - 200, 200, 10, canvasW - 200, 200, 350);
  glowGrad.addColorStop(0, toneColor);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.restore();
  
  // 3. Draw Outer Bezel / Border Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, canvasW - 80, canvasH - 80);
  
  // 4. Logo / Header
  ctx.fillStyle = '#f8fafc';
  ctx.font = layout.fontLogo;
  ctx.fillText('EXCUSE BUSTER', layout.padding, layout.logoY);
  
  ctx.fillStyle = '#64748b';
  ctx.font = layout.fontSub;
  ctx.fillText('AI MOTIVATIONAL ARCHITECT', layout.padding, layout.subtitleY);
  
  // Tone Badge Tag
  ctx.strokeStyle = toneColor + '66';
  ctx.fillStyle = toneColor + '1a';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, layout.badgeX, layout.badgeY, layout.badgeW, layout.badgeH, layout.badgeH/2, true, true);
  ctx.fillStyle = toneColor;
  ctx.font = 'bold 12px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText(tone.toUpperCase() + ' MODE', layout.badgeX + layout.badgeW/2, layout.badgeY + layout.badgeH/2 + 5);
  ctx.textAlign = 'left';
  
  // 5. Draw the Excuse Text
  ctx.fillStyle = '#94a3b8';
  ctx.font = layout.fontLabel;
  ctx.fillText('THE SUBMITTED EXCUSE:', layout.padding, layout.excuseLabelY);
  
  ctx.fillStyle = '#f8fafc';
  ctx.font = layout.fontExcuse;
  wrapText(ctx, `"${excuseText}"`, layout.padding, layout.excuseTextY, layout.textWidth, 40);
  
  // Horizontal divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.moveTo(layout.padding, layout.dividerY);
  ctx.lineTo(canvasW - layout.padding, layout.dividerY);
  ctx.stroke();
  
  // 6. Draw Busted Classification
  ctx.fillStyle = toneColor;
  ctx.font = layout.fontLabel;
  ctx.fillText('IDENTIFIED CORE EXCUSE:', layout.padding, layout.typeLabelY);
  
  ctx.fillStyle = '#f8fafc';
  ctx.font = layout.fontType;
  ctx.fillText(excuseType, layout.padding, layout.typeTextY);
  
  // 7. Draw the Callout Text
  ctx.fillStyle = '#94a3b8';
  ctx.font = layout.fontLabel;
  ctx.fillText('THE ROAST / CALLOUT:', layout.padding, layout.calloutLabelY);
  
  ctx.fillStyle = '#cbd5e1';
  ctx.font = layout.fontCallout;
  const nextY = wrapText(ctx, calloutText, layout.padding, layout.calloutTextY, layout.textWidth, 34);
  
  // 8. Draw Action Box
  const boxY = Math.max(nextY + layout.actionBoxOffset, canvasH - layout.actionBoxHeight - 120);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.strokeStyle = toneColor + '2e';
  drawRoundedRect(ctx, layout.padding, boxY, layout.textWidth, layout.actionBoxHeight, 16, true, true);
  
  ctx.fillStyle = toneColor;
  ctx.font = layout.fontActionLabel;
  ctx.fillText(Array.isArray(actionContent) ? 'MICRO-HABIT ROADMAP CHECKLIST:' : '5-MINUTE ACTION TO TAKE NOW:', layout.padding + 25, boxY + 35);
  
  ctx.fillStyle = '#f8fafc';
  ctx.font = layout.fontActionText;
  
  if (Array.isArray(actionContent)) {
    actionContent.forEach((step, idx) => {
      ctx.fillText(`${idx + 1}. ${step}`, layout.padding + 25, boxY + 75 + idx * 35);
    });
  } else {
    wrapText(ctx, actionContent, layout.padding + 25, boxY + 75, layout.textWidth - 50, 32);
  }
  
  // 9. Watermark Footer
  ctx.fillStyle = '#475569';
  ctx.font = layout.fontWatermark;
  ctx.fillText('excusebuster.ai', layout.padding, layout.watermarkY);
  ctx.fillText('BUSTER ID: ' + Math.random().toString(36).substring(2, 9).toUpperCase(), layout.watermarkR, layout.watermarkY);
  
  const link = document.createElement('a');
  link.download = `excuse-busted-${tone}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

// Sleek glassmorphic notification banner
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  
  let icon = 'ph-info';
  if (type === 'error') icon = 'ph-warning-circle';
  if (type === 'success') icon = 'ph-check-circle';
  
  toast.innerHTML = `<i class="ph-light ${icon}" style="font-size: 16px;"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 4000);
}

// Clean and parse markdown code blocks or invalid JSON
function parseRobustJSON(text) {
  let clean = text.trim();
  if (clean.includes('```')) {
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      clean = match[1].trim();
    } else {
      clean = clean.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    }
  }
  return JSON.parse(clean);
}

function classifyExcuseLocally(text) {
  const clean = text.toLowerCase();
  if (clean.includes('gym') || clean.includes('workout') || clean.includes('exercise') || clean.includes('run') || clean.includes('fit') || clean.includes('sport') || clean.includes('cardio') || clean.includes('walk') || clean.includes('jog') || clean.includes('hike') || clean.includes('step') || clean.includes('stroll')) {
    return 'gym';
  }
  if (clean.includes('code') || clean.includes('program') || clean.includes('project') || clean.includes('write') || clean.includes('learn') || clean.includes('developer') || clean.includes('repo') || clean.includes('bug') || clean.includes('test')) {
    return 'coding';
  }
  if (clean.includes('clean') || clean.includes('room') || clean.includes('wash') || clean.includes('dishes') || clean.includes('chore') || clean.includes('laundry') || clean.includes('vacuum') || clean.includes('tidy')) {
    return 'clean';
  }
  return 'generic';
}

function generateMockResponse(text, tone) {
  const category = classifyExcuseLocally(text);
  const data = mockDatabase[category];
  const responseData = data[tone];
  
  let excuseName = data.name;
  if (category === 'generic' && text.length > 5 && text.trim().slice(-1) !== '.') {
    excuseName = 'Classic Procrastination Loop';
  }
  
  let actionResult = responseData.action;
  if (state.roadmapMode) {
    if (category === 'gym') {
      actionResult = [
        "Locate workout clothing and place them directly in front of you.",
        "Put on your training shoes and tie them immediately.",
        "Walk outside the door and set a timer to jog for exactly 5 minutes."
      ];
    } else if (category === 'coding') {
      actionResult = [
        "Open your code editor and close any web browser tabs that distract you.",
        "Create a single file 'app_test.js' or 'index.html' locally.",
        "Write a 3-line boilerplate function that logs a victory statement."
      ];
    } else if (category === 'clean') {
      actionResult = [
        "Locate three loose items lying out of place on the floor/desk.",
        "Return all three items to their correct storage location.",
        "Use a wet cloth or wipe to clean down your active desk surface."
      ];
    } else {
      actionResult = [
        "Isolate the single smallest sub-step of the task you are avoiding.",
        "Set a timer and spend exactly 120 seconds executing that sub-step.",
        "Jot down the next sub-step to keep momentum going for tomorrow."
      ];
    }
  }
  
  return {
    excuse: excuseName,
    callout: responseData.callout,
    action: actionResult
  };
}

// Call Gemini API (using client-side fetch)
async function callGeminiAPI(excuseText, tone, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  let actionPromptDesc = 'one specific task they can do in 5 minutes';
  if (state.roadmapMode) {
    actionPromptDesc = 'an array of exactly 3 sequential, progressive 5-minute action steps to demolish the excuse';
  }
  
  const systemPrompt = `You are Excuse Buster, a sharp motivational coach. The user gives an excuse. Respond in exactly 3 short parts, strictly formatted as JSON. The JSON keys MUST be exactly: "excuse" (name the real excuse in one line), "callout" (bluntly explain why it's holding them back), and "action" (${actionPromptDesc}). Match the selected tone: Coach (warm but firm), Brutal (harsh and direct), or Funny (playful and satirical). Do not include any markdown backticks or formatting outside the raw JSON.`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser Excuse: "${excuseText}"\nTone: ${tone}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Gemini API connection failed.');
  }

  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  return parseRobustJSON(rawText);
}

// Call OpenAI API (using client-side fetch)
async function callOpenAIAPI(excuseText, tone, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  let actionPromptDesc = 'one specific task they can do in 5 minutes';
  if (state.roadmapMode) {
    actionPromptDesc = 'an array of exactly 3 sequential, progressive 5-minute action steps to demolish the excuse';
  }
  
  const systemPrompt = `You are Excuse Buster, a sharp motivational coach. The user gives an excuse. Respond in exactly 3 short parts, strictly formatted as JSON. The JSON keys MUST be exactly: "excuse" (name the real excuse in one line), "callout" (bluntly explain why it's holding them back), and "action" (${actionPromptDesc}). Match the selected tone: Coach (warm but firm), Brutal (harsh and direct), or Funny (playful and satirical).`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Excuse: "${excuseText}"\nTone: ${tone}` }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'OpenAI API connection failed.');
  }

  const result = await response.json();
  const rawText = result.choices[0].message.content;
  return parseRobustJSON(rawText);
}

// Open / Close Analytics Dashboard
function updateDashboardUI() {
  const stats = Analytics.getStats();
  elements.statTotal.textContent = stats.total;
  elements.statStreak.textContent = `${stats.streak} day${stats.streak === 1 ? '' : 's'}`;
  
  const total = stats.total || 1;
  const gymPercent = Math.min(100, Math.round((stats.categories.gym / total) * 100));
  const codingPercent = Math.min(100, Math.round((stats.categories.coding / total) * 100));
  const cleanPercent = Math.min(100, Math.round((stats.categories.clean / total) * 100));
  const genericPercent = Math.min(100, Math.round((stats.categories.generic / total) * 100));
  
  elements.barGym.style.width = `${gymPercent}%`;
  elements.valGym.textContent = stats.categories.gym;
  
  elements.barCoding.style.width = `${codingPercent}%`;
  elements.valCoding.textContent = stats.categories.coding;
  
  elements.barClean.style.width = `${cleanPercent}%`;
  elements.valClean.textContent = stats.categories.clean;
  
  elements.barGeneric.style.width = `${genericPercent}%`;
  elements.valGeneric.textContent = stats.categories.generic;
}

function generateGoogleCalendarLink(actionText, excuseText) {
  const now = new Date();
  const startTime = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(now.getTime() + 5 * 60 * 1000); 
  const endTime = end.toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const title = encodeURIComponent(`Excuse Busted: 5-Minute Action`);
  const details = encodeURIComponent(`Action plan generated to demolish excuses.\n\nOriginal excuse: "${excuseText}"\n\nYour 5-minute action: ${actionText}`);
  const dates = `${startTime}/${endTime}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

function scheduleNotificationReminder(actionText) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return;
  }
  
  if (Notification.permission === "granted") {
    triggerTimerNotification(actionText);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        triggerTimerNotification(actionText);
      }
    });
  } else {
    alert("Notification permission denied. Enable it in browser settings.");
  }
}

function triggerTimerNotification(actionText) {
  const btnSpan = elements.btnRemind.querySelector('span');
  const btnIcon = elements.btnRemind.querySelector('i');
  btnSpan.textContent = 'Scheduled!';
  btnIcon.className = 'ph-light ph-check';
  
  const delaySec = 10;
  setTimeout(() => {
    new Notification("Excuse Buster Reminder!", {
      body: `Time to do it: ${actionText}`,
      icon: "favicon.ico"
    });
    
    if (elements.btnRemind) {
      btnSpan.textContent = 'Remind Me';
      btnIcon.className = 'ph-light ph-bell';
    }
  }, delaySec * 1000);
  
  alert(`Reminder scheduled! Keep this tab open. A push notification will appear in ${delaySec} seconds.`);
}

// Initial setup on Page Load
function init() {
  updateOdometer(state.bustedCount, true);
  
  document.body.className = `theme-${state.activeTheme}`;
  const activeDot = document.querySelector(`.theme-dot[data-theme="${state.activeTheme}"]`);
  if (activeDot) {
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
    activeDot.classList.add('active');
  }

  const engineRadio = document.querySelector(`input[name="engine"][value="${state.apiEngine}"]`);
  if (engineRadio) {
    engineRadio.checked = true;
    toggleAPIKeyInputVisibility(state.apiEngine);
  }
  
  if (state.apiKey) {
    elements.apiKeyInput.value = state.apiKey;
  }

  if (elements.soundToggle) {
    elements.soundToggle.checked = SynthAudio.enabled;
  }
  
  WallOfShame.init();
}

function toggleAPIKeyInputVisibility(engine) {
  if (engine === 'mock') {
    elements.apiKeyContainer.classList.add('hidden');
  } else {
    elements.apiKeyContainer.classList.remove('hidden');
    elements.apiKeyLabel.textContent = engine === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key';
    elements.apiKeyInput.placeholder = `Enter your ${engine === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const excuseText = elements.input.value.trim();
  if (!excuseText) return;
  
  elements.btnBust.classList.add('glitch-active');
  SynthAudio.playClick();
  
  elements.btnBust.disabled = true;
  elements.btnBust.querySelector('.btn-label').textContent = 'Busting excuse...';
  elements.btnBust.querySelector('.btn-icon-wrapper i').className = 'ph-light ph-spinner-gap spin-animation';
  
  try {
    let result = null;
    
    if (state.apiEngine === 'mock') {
      await new Promise(r => setTimeout(r, 900));
      result = generateMockResponse(excuseText, state.selectedTone);
    } else {
      if (!state.apiKey) {
        throw new Error(`API key required for ${state.apiEngine.toUpperCase()} engine. Please configure it in Settings.`);
      }
      
      try {
        if (state.apiEngine === 'gemini') {
          result = await callGeminiAPI(excuseText, state.selectedTone, state.apiKey);
        } else if (state.apiEngine === 'openai') {
          result = await callOpenAIAPI(excuseText, state.selectedTone, state.apiKey);
        }
      } catch (apiErr) {
        console.warn("Primary API failed, falling back to local database:", apiErr);
        showToast(`API error: ${apiErr.message}. Swapping to local offline engine.`, 'error');
        await new Promise(r => setTimeout(r, 600));
        result = generateMockResponse(excuseText, state.selectedTone);
      }
    }
    
    if (!result || !result.excuse || !result.callout || !result.action) {
      throw new Error("Invalid response format received from AI.");
    }
    
    state.lastExcuseText = excuseText;
    state.lastBustedResponse = result;
    VoiceCoach.cancel();
    
    elements.resExcuse.textContent = result.excuse;
    elements.resCallout.textContent = result.callout;
    
    const resActionContainer = elements.resAction;
    const resRoadmapContainer = elements.resRoadmap;
    
    if (Array.isArray(result.action)) {
      resActionContainer.classList.add('hidden');
      resRoadmapContainer.classList.remove('hidden');
      elements.actionEyebrow.innerHTML = '<i class="ph-light ph-git-fork"></i> 3-Step Habit Roadmap';
      
      resRoadmapContainer.innerHTML = '';
      result.action.forEach((step, idx) => {
        const li = document.createElement('li');
        li.className = 'roadmap-step';
        li.innerHTML = `
          <input type="checkbox" class="step-checkbox" id="chk-step-${idx}">
          <span class="step-text">${step}</span>
        `;
        
        const chk = li.querySelector('.step-checkbox');
        chk.addEventListener('change', (e) => {
          SynthAudio.playTick();
          if (e.target.checked) {
            li.classList.add('completed');
          } else {
            li.classList.remove('completed');
          }
        });
        
        resRoadmapContainer.appendChild(li);
      });
    } else {
      resRoadmapContainer.classList.add('hidden');
      resActionContainer.classList.remove('hidden');
      elements.actionEyebrow.innerHTML = '<i class="ph-light ph-play-circle"></i> 5-Minute Action';
      resActionContainer.textContent = result.action;
    }
    
    SynthAudio.playSwoosh();
    
    const tag = document.getElementById('status-tag');
    tag.classList.remove('stamp-active');
    void tag.offsetWidth; 
    tag.classList.add('stamp-active');
    
    setTimeout(() => {
      SynthAudio.playThud(); 
      SynthAudio.playBust(state.selectedTone);
    }, 120);
    
    elements.resultPlaceholder.classList.add('hidden');
    elements.resultActiveWrapper.classList.remove('hidden');
    
    elements.resultPanel.className = `double-bezel-outer result-section tone-${state.selectedTone}`;
    if (window.innerWidth < 992) {
      elements.resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    state.bustedCount += 1;
    localStorage.setItem('excuse_busted_count', state.bustedCount);
    updateOdometer(state.bustedCount);
    Analytics.trackBust(excuseText);
    
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    elements.btnBust.classList.remove('glitch-active');
    elements.btnBust.disabled = false;
    elements.btnBust.querySelector('.btn-label').textContent = 'Bust Procrastination';
    elements.btnBust.querySelector('.btn-icon-wrapper i').className = 'ph-light ph-arrow-right';
  }
}

elements.input.addEventListener('input', () => {
  const current = elements.input.value.length;
  elements.charCurrent.textContent = current;
});

const toneLabels = {
  coach: 'Warm Coach',
  brutal: 'Brutal Truth',
  funny: 'Funny Roast'
};

elements.toneBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    SynthAudio.playClick();
    elements.toneBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedTone = btn.dataset.tone;
    if (elements.lblActiveTone) {
      elements.lblActiveTone.textContent = `Selected: ${toneLabels[state.selectedTone]}`;
    }
  });

  btn.addEventListener('mouseenter', () => {
    SynthAudio.playTick();
  });
});

elements.btnSettings.addEventListener('click', () => {
  SynthAudio.playClick();
  elements.settingsModal.classList.remove('hidden');
});
elements.btnSettings.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.btnCloseSettings.addEventListener('click', () => {
  SynthAudio.playClick();
  elements.settingsModal.classList.add('hidden');
});
elements.btnCloseSettings.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.settingsModal.addEventListener('click', (e) => {
  if (e.target === elements.settingsModal) {
    SynthAudio.playClick();
    elements.settingsModal.classList.add('hidden');
  }
});

document.querySelectorAll('.theme-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    SynthAudio.playTick();
    const theme = dot.dataset.theme;
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    document.body.className = `theme-${theme}`;
    state.activeTheme = theme;
  });
});

elements.settingsForm.addEventListener('change', (e) => {
  if (e.target.name === 'engine') {
    SynthAudio.playClick();
    toggleAPIKeyInputVisibility(e.target.value);
  }
});

elements.settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  SynthAudio.playClick();
  const selectedEngine = document.querySelector('input[name="engine"]:checked').value;
  const keyVal = elements.apiKeyInput.value.trim();
  const soundVal = elements.soundToggle.checked;
  
  state.apiEngine = selectedEngine;
  state.apiKey = keyVal;
  SynthAudio.enabled = soundVal;
  
  localStorage.setItem('excuse_api_engine', selectedEngine);
  localStorage.setItem('excuse_api_key', keyVal);
  localStorage.setItem('excuse_sound_enabled', soundVal);
  localStorage.setItem('excuse_buster_theme', state.activeTheme);
  
  elements.settingsModal.classList.add('hidden');
});

if (elements.soundToggle) {
  elements.soundToggle.addEventListener('change', (e) => {
    SynthAudio.enabled = e.target.checked;
    localStorage.setItem('excuse_sound_enabled', SynthAudio.enabled);
    if (SynthAudio.enabled) {
      SynthAudio.playToggle();
    }
  });
}

elements.btnTogglePassword.addEventListener('click', () => {
  SynthAudio.playClick();
  const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
  elements.apiKeyInput.type = type;
  elements.btnTogglePassword.querySelector('i').className = type === 'password' ? 'ph-light ph-eye' : 'ph-light ph-eye-closed';
});

elements.btnCopy.addEventListener('click', async () => {
  SynthAudio.playClick();
  const excuseText = state.lastExcuseText || "I'll do it later";
  
  let actionText = '';
  if (state.lastBustedResponse && Array.isArray(state.lastBustedResponse.action)) {
    actionText = state.lastBustedResponse.action.map((step, i) => `${i+1}. ${step}`).join('\n');
  } else {
    actionText = elements.resAction.textContent;
  }
  
  const textToCopy = `EXCUSE BUSTER (${state.selectedTone.toUpperCase()} MODE)\n\nOriginal Excuse: "${excuseText}"\n\n1. The Real Excuse: ${elements.resExcuse.textContent}\n2. The Callout: ${elements.resCallout.textContent}\n3. Action/Roadmap:\n${actionText}`;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    const span = elements.btnCopy.querySelector('span');
    const origText = span.textContent;
    span.textContent = 'Copied!';
    elements.btnCopy.querySelector('i').className = 'ph-light ph-check';
    
    setTimeout(() => {
      span.textContent = origText;
      elements.btnCopy.querySelector('i').className = 'ph-light ph-copy';
    }, 2000);
  } catch (err) {
    alert('Failed to copy results.');
  }
});
elements.btnCopy.addEventListener('mouseenter', () => SynthAudio.playTick());

document.querySelectorAll('.aspect-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    SynthAudio.playTick();
    document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedAspect = btn.dataset.ratio;
  });
});

elements.btnDownload.addEventListener('click', () => {
  SynthAudio.playClick();
  const excuseText = state.lastExcuseText || "I'll do it later";
  const excuseType = elements.resExcuse.textContent;
  const callout = elements.resCallout.textContent;
  
  let action = '';
  if (state.lastBustedResponse && Array.isArray(state.lastBustedResponse.action)) {
    action = state.lastBustedResponse.action;
  } else {
    action = elements.resAction.textContent;
  }
  
  downloadShareCard(excuseText, excuseType, callout, action, state.selectedTone, state.selectedAspect);
});
elements.btnDownload.addEventListener('mouseenter', () => SynthAudio.playTick());

if (elements.roadmapToggle) {
  elements.roadmapToggle.addEventListener('change', (e) => {
    SynthAudio.playTick();
    state.roadmapMode = e.target.checked;
  });
}

elements.btnTts.addEventListener('click', () => {
  SynthAudio.playClick();
  
  if (state.isSpeaking) {
    VoiceCoach.cancel();
  } else {
    const textToSpeak = `${elements.resExcuse.textContent}. ${elements.resCallout.textContent}.`;
    VoiceCoach.speak(textToSpeak, state.selectedTone, () => {});
  }
});
elements.btnTts.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.btnCalendar.addEventListener('click', () => {
  SynthAudio.playClick();
  
  let primaryAction = '';
  if (state.lastBustedResponse && Array.isArray(state.lastBustedResponse.action)) {
    primaryAction = state.lastBustedResponse.action[0];
  } else {
    primaryAction = elements.resAction.textContent;
  }
  
  const calendarLink = generateGoogleCalendarLink(primaryAction, state.lastExcuseText);
  window.open(calendarLink, '_blank');
});
elements.btnCalendar.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.btnRemind.addEventListener('click', () => {
  SynthAudio.playClick();
  let primaryAction = '';
  if (state.lastBustedResponse && Array.isArray(state.lastBustedResponse.action)) {
    primaryAction = state.lastBustedResponse.action[0];
  } else {
    primaryAction = elements.resAction.textContent;
  }
  scheduleNotificationReminder(primaryAction);
});
elements.btnRemind.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.btnDashboard.addEventListener('click', () => {
  SynthAudio.playClick();
  updateDashboardUI();
  elements.analyticsModal.classList.remove('hidden');
});
elements.btnDashboard.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.btnCloseAnalytics.addEventListener('click', () => {
  SynthAudio.playClick();
  elements.analyticsModal.classList.add('hidden');
});
elements.btnCloseAnalytics.addEventListener('mouseenter', () => SynthAudio.playTick());

elements.analyticsModal.addEventListener('click', (e) => {
  if (e.target === elements.analyticsModal) {
    SynthAudio.playClick();
    elements.analyticsModal.classList.add('hidden');
  }
});

elements.form.addEventListener('submit', handleFormSubmit);

// Re-Bust / Regenerate button click listener
if (elements.btnRebust) {
  elements.btnRebust.addEventListener('click', () => {
    SynthAudio.playClick();
    elements.input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      handleFormSubmit(new Event('submit'));
    }, 450); // Let the scroll complete
  });
  elements.btnRebust.addEventListener('mouseenter', () => SynthAudio.playTick());
}

init();

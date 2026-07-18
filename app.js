// --- Application State ---
const state = {
  bustedCount: parseInt(localStorage.getItem('excuse_busted_count')) || 0,
  selectedTone: 'coach',
  apiEngine: localStorage.getItem('excuse_api_engine') || 'mock',
  apiKey: localStorage.getItem('excuse_api_key') || ''
};

// --- Web Audio API Programmatic UI Synthesizer ---
const SynthAudio = {
  ctx: null,
  enabled: localStorage.getItem('excuse_sound_enabled') !== 'false',

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  },

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Very short, quiet high-frequency tick for hover feedback
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  },

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Snappy mechanical click for button presses
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  },

  playBust(tone) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    if (tone === 'coach') {
      // Warm, motivating major arpeggio chime (C5 -> E5 -> G5 -> C6)
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
        
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } else if (tone === 'brutal') {
      // Harsh low dissonance buzz (low clash saw waves) followed by bass drop
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
      osc2.frequency.setValueAtTime(84, now); // clash/dissonance
      osc2.frequency.linearRampToValueAtTime(47, now + 0.5);
      
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      
      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now);
      osc2.stop(now + 0.5);
    } else {
      // Funny tone: cartoonish pitch-bending slide
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.quadraticRampToValueAtTime(140, now + 0.2);
      osc.frequency.quadraticRampToValueAtTime(550, now + 0.4);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    }
  },

  playSwoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Ethereal white noise swoosh sweep for reveals
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
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
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.35);
  },

  playToggle() {
    this.init();
    if (!this.ctx) return;
    
    // Clean audio check toggle chime (A5 -> E6)
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
  toneBtns: document.querySelectorAll('.tone-btn'),
  btnBust: document.getElementById('btn-bust'),
  resultPanel: document.getElementById('result-panel'),
  resExcuse: document.getElementById('res-excuse'),
  resCallout: document.getElementById('res-callout'),
  resAction: document.getElementById('res-action'),
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
  soundToggle: document.getElementById('sound-effects-toggle')
};

// --- Helper Functions ---

// Secure Odometer Digits Update
function updateOdometer(count, immediate = false) {
  const digitsStr = String(count).padStart(3, '0');
  const digitElements = elements.bustedCounter.querySelectorAll('.digit');
  
  digitElements.forEach((el, index) => {
    const targetDigit = digitsStr[index] || '0';
    if (immediate) {
      el.textContent = targetDigit;
      el.style.transform = 'none';
    } else {
      // Small elastic bounce transition
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
function downloadShareCard(excuseText, excuseType, calloutText, actionText, tone) {
  const canvas = elements.shareCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set dimensions for premium card (1200x900)
  canvas.width = 1200;
  canvas.height = 900;
  
  // 1. Draw Background Gradient
  const grad = ctx.createRadialGradient(600, 450, 50, 600, 450, 700);
  grad.addColorStop(0, '#0f1322');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 2. Draw Decorative Glow Orbs
  let toneColor = '#f59e0b'; // Amber
  if (tone === 'brutal') toneColor = '#ef4444';
  if (tone === 'funny') toneColor = '#10b981';
  
  ctx.save();
  ctx.globalAlpha = 0.12;
  const glowGrad = ctx.createRadialGradient(900, 200, 10, 900, 200, 300);
  glowGrad.addColorStop(0, toneColor);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 3. Draw Outer Bezel / Border Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  // Inner margin border
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // 4. Logo / Header
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 32px Outfit';
  ctx.fillText('EXCUSE BUSTER', 70, 90);
  
  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px Outfit';
  ctx.fillText('AI MOTIVATIONAL ARCHITECT', 70, 120);

  // Tone Badge Tag
  ctx.strokeStyle = toneColor + '66'; // Opacity
  ctx.fillStyle = toneColor + '1a';
  ctx.lineWidth = 1;
  // Draw Rounded pill
  drawRoundedRect(ctx, 950, 65, 170, 40, 20, true, true);
  ctx.fillStyle = toneColor;
  ctx.font = 'bold 12px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText(tone.toUpperCase() + ' MODE', 1035, 90);
  ctx.textAlign = 'left'; // Reset

  // 5. Draw the Excuse Text
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px Outfit';
  ctx.fillText('THE SUBMITTED EXCUSE:', 70, 200);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 26px Plus Jakarta Sans';
  wrapText(ctx, `"${excuseText}"`, 70, 240, 1060, 40);

  // Horizontal divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.moveTo(70, 340);
  ctx.lineTo(1130, 340);
  ctx.stroke();

  // 6. Draw Busted Classification
  ctx.fillStyle = toneColor;
  ctx.font = 'bold 16px Outfit';
  ctx.fillText('IDENTIFIED CORE EXCUSE:', 70, 390);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 36px Outfit';
  ctx.fillText(excuseType, 70, 440);

  // 7. Draw the Callout Text
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px Outfit';
  ctx.fillText('THE ROAST / CALLOUT:', 70, 520);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 20px Plus Jakarta Sans';
  const nextY = wrapText(ctx, calloutText, 70, 560, 1060, 32);

  // 8. Draw Action Box (Highlighted Outer/Inner bezel style)
  const boxY = Math.max(nextY + 30, 660);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.strokeStyle = toneColor + '2e';
  drawRoundedRect(ctx, 70, boxY, 1060, 140, 16, true, true);
  
  ctx.fillStyle = toneColor;
  ctx.font = 'bold 14px Outfit';
  ctx.fillText('5-MINUTE ACTION TO TAKE NOW:', 95, boxY + 35);
  
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 22px Outfit';
  wrapText(ctx, actionText, 95, boxY + 75, 1010, 32);

  // 9. Watermark Footer
  ctx.fillStyle = '#475569';
  ctx.font = '500 12px Outfit';
  ctx.fillText('excusebuster.ai', 70, 850);
  ctx.fillText('BUSTER ID: ' + Math.random().toString(36).substring(2, 9).toUpperCase(), 970, 850);

  // Convert to image and download
  const link = document.createElement('a');
  link.download = `excuse-busted-${tone}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Canvas Rounded Rect Helper
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

// Canvas Text Wrapping Helper
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

// Determine Local Mock Category from Text Keywords
function classifyExcuseLocally(text) {
  const clean = text.toLowerCase();
  if (clean.includes('gym') || clean.includes('workout') || clean.includes('exercise') || clean.includes('run') || clean.includes('fit')) {
    return 'gym';
  }
  if (clean.includes('code') || clean.includes('program') || clean.includes('project') || clean.includes('write') || clean.includes('learn') || clean.includes('developer') || clean.includes('repo')) {
    return 'coding';
  }
  if (clean.includes('clean') || clean.includes('room') || clean.includes('wash') || clean.includes('dishes') || clean.includes('chore') || clean.includes('laundry')) {
    return 'clean';
  }
  return 'generic';
}

// Mock AI Engine Call (Instant Response Generator)
function generateMockResponse(text, tone) {
  const category = classifyExcuseLocally(text);
  const data = mockDatabase[category];
  const responseData = data[tone];
  
  let excuseName = data.name;
  
  // Custom Dynamic Additions to make Mock feel somewhat AI-like
  if (category === 'generic') {
    if (text.length > 5 && text.trim().slice(-1) !== '.') {
      excuseName = 'Classic Procrastination';
    }
  }
  
  return {
    excuse: excuseName,
    callout: responseData.callout,
    action: responseData.action
  };
}

// --- API Connectors ---

// Call Gemini API (using client-side fetch)
async function callGeminiAPI(excuseText, tone, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemPrompt = `You are Excuse Buster, a sharp motivational coach. The user gives an excuse. Respond in exactly 3 short parts, strictly formatted as JSON. The JSON keys MUST be exactly: "excuse" (name the real excuse in one line), "callout" (bluntly explain why it's holding them back), and "action" (one specific task they can do in 5 minutes). Match the selected tone: Coach (warm but firm), Brutal (harsh and direct), or Funny (playful and satirical). Do not include any markdown backticks or formatting outside the raw JSON.`;
  
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
  return JSON.parse(rawText.trim());
}

// Call OpenAI API (using client-side fetch)
async function callOpenAIAPI(excuseText, tone, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const systemPrompt = `You are Excuse Buster, a sharp motivational coach. The user gives an excuse. Respond in exactly 3 short parts, strictly formatted as JSON. The JSON keys MUST be exactly: "excuse" (name the real excuse in one line), "callout" (bluntly explain why it's holding them back), and "action" (one specific task they can do in 5 minutes). Match the selected tone: Coach (warm but firm), Brutal (harsh and direct), or Funny (playful and satirical).`;
  
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
  return JSON.parse(rawText.trim());
}

// --- Controller Actions & Event Listeners ---

// Initial setup on Page Load
function init() {
  updateOdometer(state.bustedCount, true);
  
  // Restore Settings States
  const engineRadio = document.querySelector(`input[name="engine"][value="${state.apiEngine}"]`);
  if (engineRadio) {
    engineRadio.checked = true;
    toggleAPIKeyInputVisibility(state.apiEngine);
  }
  
  if (state.apiKey) {
    elements.apiKeyInput.value = state.apiKey;
  }

  // Restore Sound toggle state
  if (elements.soundToggle) {
    elements.soundToggle.checked = SynthAudio.enabled;
  }
}

// Show/Hide API Key Panel
function toggleAPIKeyInputVisibility(engine) {
  if (engine === 'mock') {
    elements.apiKeyContainer.classList.add('hidden');
  } else {
    elements.apiKeyContainer.classList.remove('hidden');
    elements.apiKeyLabel.textContent = engine === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key';
    elements.apiKeyInput.placeholder = `Enter your ${engine === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`;
  }
}

// Handle Form Submission (Excuse Busting)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const excuseText = elements.input.value.trim();
  if (!excuseText) return;
  
  // Play click feedback
  SynthAudio.playClick();
  
  // Show Loading / Disable State
  elements.btnBust.disabled = true;
  elements.btnBust.querySelector('.btn-label').textContent = 'Busting excuse...';
  elements.btnBust.querySelector('.btn-icon-wrapper i').className = 'ph-light ph-spinner-gap spin-animation';
  
  try {
    let result = null;
    
    if (state.apiEngine === 'mock') {
      // Simulate slight visual latency to feel premium
      await new Promise(r => setTimeout(r, 900));
      result = generateMockResponse(excuseText, state.selectedTone);
    } else {
      if (!state.apiKey) {
        throw new Error(`API key required for ${state.apiEngine.toUpperCase()} engine. Please configure it in Settings.`);
      }
      
      if (state.apiEngine === 'gemini') {
        result = await callGeminiAPI(excuseText, state.selectedTone, state.apiKey);
      } else if (state.apiEngine === 'openai') {
        result = await callOpenAIAPI(excuseText, state.selectedTone, state.apiKey);
      }
    }
    
    if (!result || !result.excuse || !result.callout || !result.action) {
      throw new Error("Invalid response format received from AI.");
    }
    
    // Update Result UI
    elements.resExcuse.textContent = result.excuse;
    elements.resCallout.textContent = result.callout;
    elements.resAction.textContent = result.action;
    
    // Trigger transition sounds
    SynthAudio.playSwoosh();
    setTimeout(() => {
      SynthAudio.playBust(state.selectedTone);
    }, 150);
    
    // Dynamic Accent Styling on Bezel
    elements.resultPanel.className = `double-bezel-outer result-section tone-${state.selectedTone}`;
    elements.resultPanel.classList.remove('hidden');
    
    // Scroll result card into view smoothly
    elements.resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Increment Counter
    state.bustedCount += 1;
    localStorage.setItem('excuse_busted_count', state.bustedCount);
    updateOdometer(state.bustedCount);
    
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    // Reset Button State
    elements.btnBust.disabled = false;
    elements.btnBust.querySelector('.btn-label').textContent = 'Bust Procrastination';
    elements.btnBust.querySelector('.btn-icon-wrapper i').className = 'ph-light ph-arrow-right';
  }
}

// Update character counter
elements.input.addEventListener('input', () => {
  const current = elements.input.value.length;
  elements.charCurrent.textContent = current;
});

// Event Listeners for Tone Selection
elements.toneBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Play button click sound
    SynthAudio.playClick();
    
    elements.toneBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedTone = btn.dataset.tone;
  });

  // Play subtle hover tick
  btn.addEventListener('mouseenter', () => {
    SynthAudio.playTick();
  });
});

// Event Listeners for Settings Modal
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

// Close modal when clicking outside content container
elements.settingsModal.addEventListener('click', (e) => {
  if (e.target === elements.settingsModal) {
    SynthAudio.playClick();
    elements.settingsModal.classList.add('hidden');
  }
});

// Settings radio triggers
elements.settingsForm.addEventListener('change', (e) => {
  if (e.target.name === 'engine') {
    SynthAudio.playClick();
    toggleAPIKeyInputVisibility(e.target.value);
  }
});

// Save Settings Form
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
  
  elements.settingsModal.classList.add('hidden');
});

// Sound Toggle Listener
if (elements.soundToggle) {
  elements.soundToggle.addEventListener('change', (e) => {
    SynthAudio.enabled = e.target.checked;
    localStorage.setItem('excuse_sound_enabled', SynthAudio.enabled);
    if (SynthAudio.enabled) {
      SynthAudio.playToggle();
    }
  });
}

// Toggle password visibility
elements.btnTogglePassword.addEventListener('click', () => {
  SynthAudio.playClick();
  const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
  elements.apiKeyInput.type = type;
  elements.btnTogglePassword.querySelector('i').className = type === 'password' ? 'ph-light ph-eye' : 'ph-light ph-eye-closed';
});

// Copy results to Clipboard
elements.btnCopy.addEventListener('click', async () => {
  SynthAudio.playClick();
  const excuseText = elements.input.value.trim() || "I'll do it later";
  const textToCopy = `EXCUSE BUSTER (${state.selectedTone.toUpperCase()} MODE)\n\nOriginal Excuse: "${excuseText}"\n\n1. The Real Excuse: ${elements.resExcuse.textContent}\n2. The Callout: ${elements.resCallout.textContent}\n3. The Action (5 Mins): ${elements.resAction.textContent}`;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    
    // Smooth Feedback transition
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

// Trigger Download Share Card
elements.btnDownload.addEventListener('click', () => {
  SynthAudio.playClick();
  const excuseText = elements.input.value.trim() || "I'll do it later";
  const excuseType = elements.resExcuse.textContent;
  const callout = elements.resCallout.textContent;
  const action = elements.resAction.textContent;
  
  downloadShareCard(excuseText, excuseType, callout, action, state.selectedTone);
});
elements.btnDownload.addEventListener('mouseenter', () => SynthAudio.playTick());

// Form execution trigger
elements.form.addEventListener('submit', handleFormSubmit);

// Initialize application state
init();

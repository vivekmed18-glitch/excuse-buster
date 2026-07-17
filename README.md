# Excuse Buster — AI Motivational Architect

Excuse Buster is a high-end, responsive web application that detects excuses, calls out the underlying reason for procrastination, and gives the user one actionable, 5-minute task to break the cycle immediately.

It is built adhering to the premium **Ethereal Glass** design system, featuring haptic nested panels, flowing background mesh glow, and micro-animations.

---

## Features
* **Double-Bezel Nesting:** Cards and input fields use custom nested bezels with calculated outer/inner border radii (`rounded-[28px]`, `rounded-[22px]`) to feel like physical machined hardware.
* **3 Tone/Personality Modes:**
  * **Warm Coach:** Motivating, encouraging, but firm.
  * **Brutal Truth:** No-nonsense, direct, and slightly harsh callouts.
  * **Funny Roast:** Playful, satirical, and highly shareable roasts.
* **Excuses Busted Counter:** Persists in browser `localStorage` and counts up with odometer digit animations.
* **Offline Mock Simulator:** Works instantly out-of-the-box with custom rules for common excuses (Gym, Coding, Cleaning, and General Tasks) even without API keys.
* **API Integration:** Connects to **Gemini API (1.5 Flash)** and **OpenAI API (GPT-4o Mini)** directly on the client side via a local settings console.
* **HTML5 Canvas Card Downloader:** Generates and exports beautiful, high-res (`1200x900`) PNG cards with gradients and structured results suitable for social media sharing.

---

## File Structure
```
excuse-buster/
├── index.html     # Main markup and DOM structure
├── index.css      # Ethereal Glass CSS design system
├── app.js         # State, APIs, Canvas exporter, and mock data
└── README.md      # Project documentation (this file)
```

---

## Local Setup & Execution

### 1. Launch a Local Web Server
Since the application uses standard JavaScript modules, client-side fetches, and canvas image exports, running it via a local web server is recommended.

From the `excuse-buster` directory, run one of the following commands:

**Using Node (npx):**
```bash
npx serve .
```

**Using Python:**
```bash
python -m http.server 8000
```

### 2. Open in Browser
Visit the server URL (usually `http://localhost:3000` or `http://localhost:8000`) in your browser to start busting excuses.

---

## Configuration & Keys
1. Click the **Gear icon** in the top right to open the configuration panel.
2. Select your AI engine:
   * **Local Simulator:** (Default) Rule-based matching.
   * **Gemini API:** Plug in your Google AI Studio API Key.
   * **OpenAI API:** Plug in your OpenAI API Key.
3. API keys are saved directly in your browser's local storage and are never sent to external servers other than the official API endpoints.

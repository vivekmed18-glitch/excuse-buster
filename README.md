# 🚀 Excuse Buster — Banish Procrastination Instantly

[![Live App](https://img.shields.io/badge/Live%20App-Excuse%20Buster-amber?style=for-the-badge&logo=googlechrome&logoColor=white)](https://vivekmed18-glitch.github.io/excuse-buster/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vivekmed18-glitch/excuse-buster)

> **One-Line Pitch:** An AI coach that calls out your excuses, banishes procrastination, and gives you one tiny action to start now.

---

## Build Week architecture update

The app now separates browser presentation from the decision-making pipeline:

```
User input -> core.js trigger analysis -> response orchestrator -> AI provider
                                                     |                 |
                                                     +-- local coach <--+
                                                           |
                                               validated response -> accessible UI
```

- `core.js` is a dependency-free, testable domain module. It classifies a procrastination trigger, validates provider output, creates personalized advice from local history, and owns the timeout-aware fallback orchestration.
- `app.js` is the UI adapter. It selects the requested provider, renders results, records local analytics, and never needs to decide whether malformed API output is safe to display.
- Provider calls time out after 12 seconds. Missing keys, network failures, invalid JSON, HTTP errors, and incomplete model output all use the local coach instead of leaving the user stranded.
- API keys are held only for the current browser session. Existing persisted API-key data is removed on startup; use a server-side proxy before deploying provider keys in production.
- The result now includes a pattern insight based on the user's most frequent local trigger, such as fatigue, task overwhelm, or time scarcity.

### Quality and accessibility changes

- Live status text explains analysis, local fallback, and errors without relying on animation or color.
- Results announce to assistive technology and receive keyboard focus after generation.
- Keyboard focus is consistently visible; buttons and text input retain touch-friendly sizing on small screens.
- Mobile styling tightens the header, improves textarea legibility, and preserves a clear one-column action layout.

### Tests

Run the deterministic core suite with:

```bash
npm.cmd test
```

It covers trigger classification, personalization, response normalization, fallback behavior, and timeout reporting. The existing browser smoke test remains available with `npm.cmd run test:e2e` (it targets the deployed URL by default).

---

## 🎯 Problem
People don’t fail because of big obstacles — they fail because of small excuses:
* *"I’ll do it later."*
* *"I’m not ready."*
* *"I don’t have time."*

These micro-excuses stop momentum before action even begins.

---

## ⚡ Solution
**Excuse Buster** takes any excuse, names the real psychological reason behind it, roasts the procrastination loop, and gives **one 5-minute action** (or a 3-step habit roadmap) to break the cycle immediately.

---

## 🛠️ How It Works
1. **Input:** Type what you keep avoiding (e.g., *"can't go out for walk"*).
2. **Identify:** AI names the underlying excuse (e.g., *Energy Illusion & Fatigue Shield*).
3. **Callout:** AI calls it out matched to your chosen tone (**Warm Coach ❤️**, **Brutal Roast ☠️**, or **Stoic Philosopher 📜**).
4. **Action:** AI delivers one tiny 5-minute action step (or a 3-step checkable roadmap) to do right now.

---

## 🔥 Key Features
* 🎭 **3 Personality Modes:** Warm Coach / Brutal Roast / Stoic Philosopher.
* 🔮 **3D Spatial Depth & Claymorphic UI:** Split-screen desktop dashboard with 3D liquid marble selectors and responsive mobile stacking.
* 🎙️ **AI Voice Coaching (TTS):** Audio button that reads the roasts aloud using custom voice pitches and rates per persona.
* 🔊 **Web Audio Synthesizer Engine:** Real-time synthesized click, thud, and swoosh audio feedback on interaction.
* 📈 **Persistent Analytics & Burn Streak Odometer:** Real-time local tracking of excuses demolished, active burn streaks, and trigger category breakdowns.
* 🧱 **3-Step Habit Roadmap Mode:** Toggle switch converting overwhelming tasks into 3 checkable micro-habit steps with tick sound effects.
* 🌐 **Community Feed / Wall of Shame:** Real-time anonymous public ticker displaying excuse roasts across the community.
* 📅 **Calendar & Push Notifications:** Direct Google Calendar event scheduling and native desktop Web Notification reminders.
* 🖼️ **Multi-Format Shareable Canvas Cards:** Aspect ratio customizer (Square 1:1, Story 9:16, Wallpaper 16:9) with single-click PNG canvas export.
* ⚡ **Resilient Tri-Engine Processing:** Gemini API (1.5 Flash), OpenAI API (GPT-4o Mini), and offline local simulator with dynamic excuse roaster.

---

## 💻 Tech Stack
* **Core:** HTML5, Vanilla CSS3, JavaScript (ES6+).
* **AI Integration:** Gemini API / OpenAI API adapters, validated JSON responses, a 12-second timeout, and a private local-coach fallback.
* **Styling & FX:** Spatial Claymorphism, Double-Bezel Glass Containers, Web Audio Synth engine, Web Speech API.
* **Testing & Quality:** Headless Playwright automated E2E test suite (`test.js`).

---

## 🏃 Running the Project

### Option 1: Use the Hosted Demo
The easiest way to test Excuse Buster is through the live demo linked at the top of this README.

No account, API key, or sample dataset is required. The application starts with its Local Simulator enabled so judges can immediately test the main experience.

**Suggested test input:** `I will start exercising next week.`

### Option 2: Run Locally
**Requirements:**
* A modern browser such as Google Chrome, Microsoft Edge, or Firefox
* Node.js 18 or newer for automated testing
* Google Chrome installed for the current Playwright test configuration

Clone the repository and enter the project folder:
```bash
git clone https://github.com/vivekmed18-glitch/excuse-buster.git
cd excuse-buster
```

The project is a static HTML, CSS, and JavaScript application. Start a local web server with either of these commands:
```bash
python -m http.server 8000
```
or:
```bash
npx serve .
```
Open the local address displayed by the command in your browser.

---

## 🧪 Testing
Install the locked dependency set:
```bash
npm ci
```

Run the deterministic core-logic tests:
```bash
npm test
```

Run the Playwright end-to-end test against the deployed app:
```bash
npm run test:e2e
```

The test verifies:
* The deployed application opens successfully.
* A user can submit an excuse using Brutal Truth mode.
* The result includes a named excuse, callout, and five-minute action.
* Three-Step Habit Roadmap mode generates exactly three steps.
* The Stoic Philosopher coach mode can be selected.

To test a local server rather than the deployed app:
```bash
TEST_URL=http://localhost:8000 npm run test:e2e
```

### Testing Without an API Key
No API key is required for judging.

Open Settings and leave Local Simulator selected. This mode allows judges to test the complete user flow immediately without creating an account or supplying credentials.

Optional external AI engines can also be configured through the settings panel. Keys are held only in memory for the current browser session and are never written to LocalStorage. A provider error, malformed response, missing key, or timeout automatically uses the local coach so the user still gets a validated action plan.

---

## 🤖 How  Codex Was Used
Antigravity (built on Codex/Gemini models) was used as the primary implementation and iteration partner for Excuse Buster.

It accelerated development by helping to:
* Structure the application using HTML, CSS, and vanilla JavaScript.
* Implement the split-screen input-and-results experience.
* Build the circular coach-tone controls and spatial claymorphic interface.
* Develop the five-minute action and three-step roadmap flows.
* Implement browser-based speech, analytics, reminders, sharing, and export features.
* Debug interactions and state transitions.
* Create the Playwright end-to-end test covering the primary user journey.

Antigravity was especially useful for turning product ideas into functioning interface components, reviewing changes, and iterating across the UI, application logic, and testing workflow.

---

## 🧠 How GPT-5.6 Was Used
GPT-5.6 was used as a product, UX, and reasoning partner throughout development.

It helped:
* Refine the core concept from a general motivation tool into an immediate anti-procrastination coach.
* Evaluate the interface and identify usability improvements.
* Design the side-by-side layout with user input on the left and results on the right.
* Simplify the coach selectors into compact circular controls.
* Develop the spatial UI and claymorphism design direction.
* Refine the coach personalities, interface copy, example excuses, and action language.
* Review the project from a first-time-user and competition-judge perspective.
* Prepare the README, testing plan, demo structure, and submission narrative.

GPT-5.6 was used meaningfully during product development and design rather than being added only as a decorative reference.

---

## 💡 Developer product and engineering decisions
The developer made the final product and engineering decisions, including:
* **Immediate action over generic advice:** Every result ends with either one five-minute action or a three-step roadmap.
* **Multiple coaching personalities:** Users can choose a supportive, direct, or philosophical response style.
* **No-key testing:** Local Simulator mode allows anyone to evaluate the app immediately.
* **Visible results beside the input:** The split-screen interface reduces navigation and makes the transformation easy to understand.
* **Shareable outputs:** Users can copy their result or export it in social-media-friendly dimensions.
* **Safe resilience over a blank error screen:** external AI is optional; the local coach is the reliable default and response contracts are validated before rendering.
* **Private defaults:** API keys are session-only, and no key is needed for a reviewer to test the complete flow.
* **Accessible feedback:** status, errors, and generated results are announced and keyboard focus is moved to the result; responsive controls remain usable on mobile.
* **Progress reinforcement:** Local analytics and streak tracking make repeated use feel rewarding.

---

## 🎬 30-Second Demo Script
1. **Type:** *"I'll start the gym next week."*
2. **Submit:** Watch the digital glitch effect, stamp slam bounce, and low-frequency synth thud.
3. **Review:** See the named excuse (*Fear of Discomfort & Inertia*), callout, and 5-minute action.
4. **Switch Persona:** Click the **Stoic Philosopher** circle (`📜`) → resubmit to see Marcus Aurelius style discipline advice.
5. **Toggle Roadmap:** Switch on **3-Step Habit Roadmap** to unpack the excuse into checkable micro-habit steps.
6. **View Counter & Ticker:** Highlight the rolling digit odometer and real-time Wall of Shame community ticker.

---

## 📋 Sample Data
No external dataset is needed.

Examples that can be entered directly into the application include:
* *“I will start exercising next week.”*
* *“I am not ready to apply for that job.”*
* *“I will clean my room tomorrow.”*
* *“I do not have enough time to study.”*
* *“I am waiting until I feel motivated.”*

---

## 📱 Supported Platforms
Excuse Buster is a responsive browser application and can be used on:
* Windows
* macOS
* Linux
* Android
* iOS

A current Chromium, Firefox, or Safari-based browser is recommended.

---

🔗 **Live App URL:** [https://vivekmed18-glitch.github.io/excuse-buster/](https://vivekmed18-glitch.github.io/excuse-buster/)

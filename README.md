# 🍥 Naruto Shippuden Text-to-Speech (TTS) Studio
### 忍術音声スタジオ • Powered by ElevenLabs Multilingual v2

An anime-inspired text-to-speech studio that synthesizes speech in **English** and **Hindi (हिंदी)** in the voices of five iconic *Naruto Shippuden* characters: **Madara Uchiha**, **Sasuke Uchiha**, **Naruto Uzumaki**, **Tobi / Obito**, and **Kakashi Hatake**.

---

## ⚡ Features

- **Five Anime Character Voices**:
  - 🔴 **Madara Uchiha (宇智波斑)**: Deep, commanding, godlike shinobi presence (*Susanoo Crimson Theme*).
  - 🔵 **Sasuke Uchiha (宇智波佐助)**: Sharp, cold, intense avenger tone (*Chidori Lightning Cyan/Indigo Theme*).
  - 🟠 **Naruto Uzumaki (うずまきナルト)**: Energetic, fierce, spirited Hokage tone (*Kurama Golden Chakra Theme*).
  - 🟣 **Tobi / Obito (トビ / オビト)**: Dual Persona! Playful high-pitched masked trickster or sinister low-pitched Obito (*Kamui Void Theme*).
  - 🟢 **Kakashi Hatake (はたけカカシ)**: Calm, composed, smooth copy ninja (*Raikiri Lightning & Leaf Jade Theme*).

- **Bilingual Speech (Hindi & English)**:
  - English TTS & Authentic Hindi TTS with Devanagari script support via `eleven_multilingual_v2`.
  - Curated iconic dialogues and preset chips for both English and Hindi.

- **Naruto Shippuden Aesthetics & Animations**:
  - Interactive **Rotating 3-Tomoe Sharingan** in the header that accelerates during Jutsu activation.
  - **Dynamic Theme Shifting**: Interface colors and chakra auras morph instantly according to the selected character.
  - **Animated Shinobi Hand Signs (Kuji-in)**: Overlay cycling through Tiger, Dragon, Snake, and Ram hand seals during voice generation.
  - **Rasengan Chakra Spinner** with multi-ring 3D spherical spin.
  - **Chakra Waveform Spectrum Visualizer**: Live real-time Web Audio API frequency visualizer reacting to the character's voice.
  - **Floating Chakra Particles Canvas**: Ethereal particles drifting across the shinobi battlefield.
  - **Synthesized Ninja Sound Effects (SFX)**: Web Audio API sound generator for Sharingan rings, Chakra surges, and Shuriken clicks (toggleable).

- **Advanced Voice Controls**:
  - **Chakra Stability**: Slider from steady delivery to expressive dramatic anime inflection.
  - **Voice Resonance / Clarity**: Similarity boost slider.
  - **Shinobi Pace**: Playback cadence from 0.7x (slow dramatic) to 1.3x (rapid ninja).
  - **MP3 Download**: Direct download button to save synthesized quotes (e.g. `Madara_Uchiha_EN_Jutsu_Voice.mp3`).
  - **Jutsu History**: Scroll showing recently cast speeches with instant replay and download.

---

## 🚀 Quick Start

### Option 1: Double-Click Launcher (Windows)
Double-click `start.bat` in this folder. It will start the Python server and display:
```
http://localhost:3000
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option 2: Run via Terminal
```powershell
python server.py
```
Then visit [http://localhost:3000](http://localhost:3000) in any browser.

---

## 📁 File Structure

```
eleven labs project/
├── assets/
│   └── images/
│       ├── madara.jpg          # High-resolution anime portrait of Madara Uchiha
│       ├── sasuke.jpg          # High-resolution anime portrait of Sasuke Uchiha
│       ├── naruto.jpg          # High-resolution anime portrait of Naruto Uzumaki
│       ├── tobi.jpg            # High-resolution anime portrait of Tobi / Obito
│       ├── kakashi.jpg         # High-resolution anime portrait of Kakashi Hatake
│       └── naruto_bg.jpg       # Ultra 4K Naruto Shippuden landscape background
├── index.html                  # Main application structure & semantic layout
├── styles.css                  # Naruto Shippuden dark anime theme & animations
├── app.js                      # Client logic, Web Audio graph, visualizer & API
├── server.py                   # Non-blocking Threading HTTP Server & ElevenLabs proxy
├── start.bat                   # Windows one-click start script
└── README.md                   # Documentation
```

---

## 🔑 ElevenLabs API Integration

- **Environment Configuration**: Copy `.env.example` to `.env` and add your ElevenLabs API key:
  ```env
  ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
  ```
- **Custom Key Management via UI**: Click the **API KEY** button in the top right of the website to update or test with any other API key directly from the UI.

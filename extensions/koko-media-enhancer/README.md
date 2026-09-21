# Koko AI - Media Enhancer & Clean Exporter (Browser Extension)

This Chromium Manifest V3 browser extension fulfills your request for an external browser tool to clean and remove Gemini image and video watermarks using client-side canvas rendering.

---

## How to Install in Chrome / Brave / Edge

1. Open your browser and navigate to the Extensions page:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** in the top-left corner.
4. Select this directory:
   ```
   d:\hackathon projects\Koko Ai\extensions\koko-media-enhancer
   ```
5. The **Koko AI - Media Enhancer** extension will now be active in your browser.

---

## How to Use

1. Open Koko AI in your browser (`http://localhost:5173`).
2. Ask Koko to generate an image (e.g. *"Generate an image of a futuristic neural server architecture"*).
3. Hover over the generated image in the chat.
4. Click the floating **"✨ Clean Canvas Export"** button.
5. The extension uses client-side HTML5 canvas to clean the watermark zone and immediately saves the clean PNG image to your local computer.

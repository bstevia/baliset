# Baliset

A Firefox extension that renders heatmaps from guitar tabs on [Ultimate Guitar](https://www.ultimate-guitar.com/).

## Requirements

- [Node.js](https://nodejs.org/) (with npm)
- Firefox 109 or newer

## Running locally

1. **Install dependencies and build**

   ```bash
   npm install
   npm run build
   ```

   This compiles the TypeScript in `src/` into `content.js`.

2. **Load the extension in Firefox**

   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on…**
   - Select `manifest.json` from this directory

3. **Try it out**

   Open any tab page on `ultimate-guitar.com`. The heatmap overlay renders automatically.

> Temporary add-ons are removed when Firefox restarts, so repeat step 2 each session.

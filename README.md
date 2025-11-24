# Fantasy Command (Vanilla)

A glassy, single-page Fantasy Football dashboard rebuilt in plain HTML, CSS (Tailwind CDN), and vanilla JavaScript + D3. No Angular or build tooling required.

## Quick Start

```bash
# from repo root
python -m http.server 3000
# then open http://localhost:3000
```

Everything is static: sample data ships inside `app.js`, charts are rendered with D3, and styles come from `styles.css` plus Tailwind via CDN.

## Files
- `index.html` – page layout and Tailwind/D3 includes
- `app.js` – data, state, rendering logic, charts, interactions
- `styles.css` – custom glassmorphism helpers and global tweaks
- `metadata.json` – app metadata retained for AI Studio

## Notes
- Player selector updates the radar and rating in real time.
- Bar chart can be filtered by position (All/WR/RB/QB/TE).
- No build step or dependencies are needed; feel free to swap the sample data with your own.

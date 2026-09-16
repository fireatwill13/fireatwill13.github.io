# Portfolio — William Zhang

A single-page, static portfolio site. No build step, no dependencies. Just open it.

## Run it locally
Either double-click `index.html`, or serve it (recommended so smooth scroll + fonts behave):

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files
| File | What it holds |
|------|---------------|
| `index.html` | All content — text, projects, sections. **Edit here to change words.** |
| `styles.css` | All styling. Warm/paper palette in `:root` (light, default); dark palette in `[data-theme="dark"]`. Fonts: Fraunces + Inter + Space Mono. |
| `script.js` | Hero typewriter, scroll reveals, scroll-progress bar, theme toggle, nav. |
| `assets/` | Drop images / CAD renders / photos here. |

## Editing cheatsheet
- **Change the typed hero headline:** edit the `HEADLINE` array near the top of `script.js`.
  Each `{ text }` is typed out; `{ br: true }` is a line break; add `cls: "grad"` to a segment
  to style it (the italic accent phrase with the underline sweep).
- **Add your photo:** drop `portrait.jpg` in `assets/`, then in `index.html` replace the
  `<div class="portrait__img">…</div>` contents with `<img src="assets/portrait.jpg" alt="William" />`.
- **Change project text:** find the `<article class="card">` blocks in `index.html`.
- **Add a project:** copy one `<article>…</article>` block, bump the `data-accent` letter (a–e) and index.
- **Add a project image:** replace that card's `<div class="card__placeholder">…</div>` with
  `<img src="assets/your-image.jpg" alt="..." />`.
- **Personal interests:** edit the "Off the clock" list in the About section.
- **Change accent color:** edit `--accent` / `--accent-2` in `styles.css` (both `:root` and the dark block).
- **Scroll animations:** any element with `class="reveal"` fades/slides in. Add
  `data-reveal="left|right|scale|up"` for direction; wrap a group in `data-stagger` for a cascade.
- **Social links:** update the `#` hrefs in the Contact section + footer.

## Accessibility
Respects `prefers-reduced-motion` — the typewriter, reveals, and looping animations are disabled
for visitors who ask for reduced motion; the full headline renders instantly instead.

## Deploy (free options)
- **GitHub Pages:** push this folder to a repo, Settings → Pages → deploy from `main`.
- **Netlify / Vercel:** drag-and-drop the folder, or connect the repo. No build command needed.

Everything is placeholder copy for now — swap in your own wording.

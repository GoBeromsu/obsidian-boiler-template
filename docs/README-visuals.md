# README visuals

How to add the demo visual required by [README-template.md](README-template.md).

## Where and how big

- Assets live in `docs/assets/` of the plugin repo. They are not shipped in the release (only `main.js`, `manifest.json`, `styles.css` are).
- One hero demo, 3 to 15 seconds, about 800 px wide, under about 3 MB. Show one workflow, no cursor wandering.
- Prefer WebP (animated) or MP4 over GIF for anything longer than a few seconds. GIF is the most compatible, keep it small.
- Use a PNG for static shots. Always write alt text that says what happens.

## Link style

- Obsidian's docs state that the public listing excerpt rewrites relative links and images (for example `./images/screenshot.png`) against the repository. Relative paths therefore work on the listing page.
- Not verified: how the in-app community plugin browser renders relative paths, `<picture>`, or Mermaid.
- Recommendation: use absolute `https://raw.githubusercontent.com/<owner>/<repo>/main/docs/assets/<file>` URLs. They render identically on GitHub, the listing and in-app, with no rewriting needed. Trade-off: they point at `main`, so a new image shows up on `main` before the release.
- MP4 does not embed in a README on the listing or in-app. Link a YouTube URL, or wrap a poster image: `[![alt](poster.png)](https://youtu.be/ID)`.

## Light and dark

GitHub supports `prefers-color-scheme` in `<picture>`:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OWNER/REPO/main/docs/assets/demo-dark.webp">
  <img alt="What the demo shows" src="https://raw.githubusercontent.com/OWNER/REPO/main/docs/assets/demo-light.webp">
</picture>
```

Because in-app support for `<picture>` is unverified, the `<img>` fallback must be a complete, readable image. Record in the theme most users run (default theme), and only add a variant when the plugin's own UI differs visibly.

## Diagrams

GitHub renders Mermaid in fenced `mermaid` blocks. Whether Obsidian's in-app browser renders them is unverified; assume it shows the raw code. Use Mermaid only for flow or architecture that is secondary to the demo, and keep the surrounding sentence meaningful without it.

## Recording a demo from `.dev-vault`

Never record in a personal vault.

1. `bun workspace/dev-vault.ts` (from the workspace root), then open `.dev-vault` with the plugin built (`bun run build`) and enabled.
2. Put a small, anonymous sample note set in `.dev-vault` that shows the feature.
3. Static shot: `obsidian vault=.dev-vault dev:screenshot path=docs/assets/shot.png`. Drive the UI with `obsidian vault=.dev-vault command id=<plugin-id>:<command>` for reproducible states.
4. Animation on macOS: `screencapture -v -V 10 demo.mov` (or Cmd+Shift+5), then
   ```
   ffmpeg -i demo.mov -vf "fps=12,scale=800:-1:flags=lanczos" -loop 0 docs/assets/demo.webp
   ffmpeg -i demo.mov -vf "fps=12,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" docs/assets/demo.gif
   ```
5. Check the size (`ls -lh docs/assets`), reduce `fps` or width if over budget, and commit.

## Sources

- https://docs.obsidian.md/plugins/releasing/submit-plugin (README requirements, relative image rewriting)
- https://docs.obsidian.md/community-directory/developer-policies (disclosures)
- https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax (`<picture>`, Mermaid)

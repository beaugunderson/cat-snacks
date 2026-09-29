# cat-snacks

Procedural cat-face generator: seed -> genome -> scene (shapes) -> style painter -> effects -> canvas.

- ES modules, pnpm, Vite (`web/` playground), vitest; node rendering uses `canvas` (node-canvas v3, a dev dependency, allowlisted in `pnpm-workspace.yaml` so its prebuilt binary installs).
- All drawing happens in a 600x600 design space; `renderCat` scales to the requested size. The head is built in head-local coordinates (origin at head center), and `scene.frame` maps them onto the canvas.
- `src/catalog.js` lists every trait value; `test/cats.test.js` fails if a name lacks an implementation, and smoke-renders every value.
- Randomness is always a forked `Rng` (`rng.fork(label)`), never `Math.random`, so renders stay deterministic. `randomSeed()` is the one exception.
- Style tweaks in `src/styles/meta.js` run before user overrides, so pinned traits always win.
- Visual checks: `pnpm cat --gallery --seed <s> --set effects= -o out/gallery.png` renders one cat per style; `out/` is gitignored.
- The dev server binds `localhost` (IPv6 on this machine), so `curl http://127.0.0.1:5173` fails while the server is healthy.

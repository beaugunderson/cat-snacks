## cat-snacks 😸

**It is an explicit goal of this project to be patient with and friendly to
everyone participating!**

cat-snacks is a collaborative project to explore the universe of adorable (and
occasionally deeply cursed) cat faces. Every cat grows from a seed: the same
seed always draws the same cat. You can help by adding new ways to draw cat
faces!

![the same cat drawn in all sixteen styles](/examples/styles.png)

### How to contribute

First, take a look at the [code of conduct](CODE_OF_CONDUCT.md)! After that,
please feel free to:

#### Open issues with questions

- you will be met with patience and kindness!
- it is totally acceptable to ask for tech support via creating an issue here

#### Open issues with suggestions

- even if you can't or don't want to code!
- you could...
  - describe your idea
  - add a sketch or drawing
  - link to a reference image of something you think should be added

#### Send pull requests

- these don't have to be perfect! (the caveat being, if I make changes to your
  code after merging it, please don't be sad! it's only done in the spirit of
  making things modular & readable for future cat-face explorers)

### Getting started

```sh
$ git clone https://github.com/beaugunderson/cat-snacks
$ cd cat-snacks
$ pnpm install
$ pnpm start   # the playground, with live reload
$ pnpm test
```

The playground has a button for a new cat (or press space), a chaos slider, and
a menu for every trait. Picking a trait pins it, so it sticks around while you
shuffle through new cats. It can animate cats (`a`), show a grid (`g`), save a
PNG (`s`), and record a short video clip. The URL always describes the current
cat, so you can share it.

From the command line:

```sh
$ pnpm cat --seed biscuit --style watercolor -o biscuit.png
$ pnpm cat --chaos 1 --set accessories=crown,lasers --set effects=glitch
$ pnpm cat --grid 5 -o grid.png
$ pnpm cat --gallery --seed biscuit   # one cat in every style
$ pnpm cat --help
```

As a library (ES modules, no runtime dependencies in the browser):

```js
import {createGenome, renderCat} from './src/index.js';

const genome = createGenome('biscuit', {style: 'neon', chaos: 0.8});
const canvas = renderCat(genome, {size: 800, t: null, transparent: false});
```

`t` is the animation time in seconds (blinking, bobbing, spinning
backgrounds). `transparent` leaves out the background. In node, call
`setCanvasFactory(createCanvas)` with `createCanvas` from the `canvas` package
first.

### How it works

- **genome** (`src/genome.js`): a flat object of traits (head shape, ears,
  eyes, fur, patterns, accessories, style, effects...) chosen from the seed.
  `chaos` (0 to 1) controls how often the weird stuff shows up. Any trait can
  be pinned with an override.
- **scene** (`src/scene.js`, `src/parts/`): turns a genome into shapes, which
  are plain polylines tagged with a role (`head`, `iris`, `whisker`...) and
  the colors the classic style would use.
- **styles** (`src/styles/`): each style decides how to paint the same shapes.
  Line art hatches them, neon turns them into glowing tubes, pixel art
  rasterizes them, and cubist and pop art collage whole renders.
- **effects** (`src/effects.js`): pixel-level passes over the finished picture
  (glitch, riso, Atkinson dithering, CRT...) or over the cat on its own layer
  (sticker, shadow, glow).

To figure out how bezier curve math works this [interactive curve tool][tool]
can be helpful.

[tool]: http://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html

### How to add a new thing

Every choosable trait is listed in `src/catalog.js`, and the tests check that
each name there has an implementation.

- **an accessory**: add a function to `src/parts/accessories.js` that takes the
  head's anchors (eye positions, top of head, chin, ear tips) and returns
  `{front, back}` shapes, then add its name to a slot in `ACCESSORY_SLOTS`
- **an eye, mouth, nose or whisker kind**: add a `case` in `src/parts/face.js`
  and the name to the catalog
- **a fur pattern**: add a function to `PATTERNS` in `src/parts/markings.js`;
  it is clipped to the head automatically
- **a background**: add a function to `src/backgrounds.js` that paints the
  600x600 canvas
- **an effect**: add a function to `src/effects.js` that rewrites a canvas,
  and its name to a group in `EFFECT_GROUPS` (or `LAYER_EFFECTS`)
- **a style**: add a painter in `src/styles/`, register it in
  `src/styles/index.js`, and give it a weight (and optionally a genome tweak)
  in `src/styles/meta.js`

Then run `pnpm cat --gallery` or `pnpm test` to see it in action.

### Help wanted!

- more styles: ukiyo-e, stained glass windows, tattoo flash, claymation...
- more colors (or color sets, colors that work well together)
- snacks! toys! more hats!
- notched ears, scars, tongues of unusual length
- reference images of cartoon cat faces for inspiration

![a grid of cats at high chaos](/examples/chaos-grid.png)

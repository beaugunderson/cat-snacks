## cat-snacks

**It is an explicit goal of this project to be patient with and friendly to
everyone participating!**

[@catsnacks](https://twitter.com/catsnacks) is a collaborative Twitter bot &
exists exists to explore the universe of adorable cat faces. You can help
[@catsnacks](https://twitter.com/catsnacks) do this by adding new ways to draw
cat faces!

### How to contribute

First, take a look at the [code of conduct](CODE_OF_CONDUCT.md)! After that,
please feel free to:

- open issues with questions
  - I will be very nice & patient! it is totally acceptable to ask for tech
    support via creating an issue here
- open issues with suggestions
  - even if you can't or don't want to code!
  - you could describe your idea, or add a sketch or drawing, or link to a
    reference image of something you think should be added
- send pull requests
  - these don't have to be perfect! (the caveat being, if I make changes to
    your code after merging it, please don't be offended! it's only done in the
    spirit of making things modular & readable for future cat-face explorers)

### How to add a new part

Let's say you wanted to add tabby markings, you could accomplish that by:

- make a new file for the drawing code: `./lib/tabby-markings.js`
- put a function in `module.exports of that file that takes `ctx` and `options`
  parameters
- add options to `generate-cat.js` if it makes sense to (for example maybe you
  want to be able to expose some of the parameters for tweaking)
- import your module from the module that will call it, in this case
  `./lib/head-markings.js` and call it where it makes sense to (in this case by
  adding it to the list of randomly-chosen facial marking functions)

### Help wanted

- more colors (or color sets, colors that work well together)
- accessories (glasses, snacks, toys, hats)
- different mouths
- an 8-bit version
- different backgrounds (polka dots? gradients? stripes? chevrons? stars?)
- reference images of cartoon cat faces for inspiration, maybe a `./reference`
  directory?

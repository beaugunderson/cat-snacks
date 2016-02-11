## cat-snacks 😸

**It is an explicit goal of this project to be patient with and friendly to
everyone participating!**

[@catsnacks](https://twitter.com/catsnacks) is a collaborative Twitter bot &
exists exists to explore the universe of adorable cat faces. You can help
@catsnacks do this by adding new ways to draw cat faces!

*Note: the first iteration of @catsnacks had a very [Neko Atsume][neko] feel to
it (I was playing and enjoying the game around the time I made the original
prototype) but I want to expand way beyond that aesthetic to encompass all
kinds of cartoon kitties.*

[neko]: https://itunes.apple.com/us/app/neko-atsume-kitty-collector/id923917775?mt=8

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
$ npm install
$ npm start # this starts a browser version with live reload
```

To figure out how bezier curve math works this [interactive curve tool][tool]
can be helpful.

[tool]: http://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html

### How to add a new part

Let's say you wanted to add tabby markings, you could accomplish that with
these steps:

- make a new file for the drawing code: `./parts/tabby-markings.js`
- put a function in `module.exports` of that file that takes `ctx` and
  `options` parameters
- add options to `generate-cat.js` if it makes sense to (for example maybe you
  want to be able to expose some of the parameters for tweaking)
- import your module from the module that will call it, in this case
  `./parts/head-markings.js` and call it where it makes sense to (in this case
  by adding it to the list of randomly-chosen facial marking functions)

### Help wanted!

- more colors (or color sets, colors that work well together)
- accessories (snacks, toys, hats)
- different mouths, eyes, noses, stripes, fur patterns
  - notched ears
- different backgrounds (gradients? stripes? chevrons?)
- reference images of cartoon cat faces for inspiration, maybe a `./reference`
  directory?
- filters?
  - ascii using [aalib.js](https://github.com/moriyoshi/aalib.js) or
    [ascii](http://npm.im/ascii)?
  - glitch mode

![a 5x5 grid of adorable cat faces](/examples/output-grid.png)

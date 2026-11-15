digit sequencer for [Strudel](https://strudel.cc)

Paste `template.js` into a blank project and remove the leading `//` from each line (Ctrl+/ toggles it). The first three lines are:

```js
let tonalScale = "C:minor"
let usePi = false // false = e
let melmess = (await import('https://cdn.jsdelivr.net/gh/mikelbengoetxea/melmess@main/melmess.js')).make(() => usePi)
```


```js
$:n(melmess(
   4,  8,  8, // mel: start, len, crowd
  12,  4,  5, // mask: start, len, thresh
   0,  0,  1)) // emb: shift, emb, twirl
  .scale(tonalScale)
  .s("sine")
```

| Row | 1st | 2nd | 3rd |
|---|---|---|---|
| mel | start in the pool | number of notes in the melody loop | crowd: slots (notes or rests) per bar |
| mask | start in the pool | number of digits in the mask loop | thresh: digits >= thresh are on |
| emb | shift along the gap rank (wraps) | emb: how many gaps get embellished (0 = none, capped) | twirl: notes inserted per gap |

Start positions wrap around the end of the pool. The gap rank is shortest first, then leftmost.

## Pinning a version

`@main` always loads the latest file, and jsDelivr caches branches for a while. To keep an old project sounding the same, point the URL at a tag or commit instead (for example `@v1.0`).

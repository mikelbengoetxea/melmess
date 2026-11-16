// melmess.js: digit sequencer for Strudel (pi / e digits as melody + mask + embellishments)
// usage: let melmess = (await import('<url to this file>')).make(() => usePi)

const piPool = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4]
const ePool  = [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5, 9, 0, 4, 5, 2, 3, 5, 3]
const gcd = (a, b) => b ? gcd(b, a % b) : a
const lcm = (a, b) => a * b / gcd(a, b)

// getUsePi is a function that returns true (pi), false (e) or 'alt' (single quotes: one bar of pi, one bar of e, alternating).
// It is read every time melmess is called, so toggling usePi in your project and re-evaluating switches the pool.
// Without it, pi is used.
export const make = (getUsePi = () => true) => {
  const { silence, timeCat, pure, slowcat } = globalThis // Strudel's own functions, looked up when make() runs
  const build = (pool, ms, ml, crowd, xs, xl, t, shift, emb, twirl) => { // melody start, melody length, crowd = slots (notes or rests) per bar, mess start, mess length, t = threshold (>= t is on), shift = emb shift (moves the embellished gaps along the rank, wraps), emb = embellishment (0 = none, k = the first k gaps in the rank, capped), twirl = notes inserted in each gap (equal spacing in time and pitch)
    const pick = (start, length) => Array.from({length}, (_, i) => pool[(start + i) % pool.length])
    let notes = pick(ms, ml)
    let d = pick(xs, xl).map(x => x >= t ? 1 : 0)
    let n = lcm(ml, xl) // slots until melody loop and mask loop line up again
    let f = twirl + 1 // grid units per slot, so every twirl note lands on a whole unit
    let ev = [] // events on the grid: {t: start, len, v}
    for (let w = 0; w < n / ml; w++) { // one pass per melody loop
      let at = [] // positions of sounding notes in this loop
      for (let k = 0; k < ml; k++) {
        let i = w * ml + k
        if (d[i % xl]) { at.push(k); ev.push({t: f * i, len: f, v: notes[k]}) }
      }
      if (emb > 0 && twirl > 0 && at.length) {
        let gaps = at.map((p, j) => { let q = at[(j + 1) % at.length]; return {p, q, g: (q - p + ml) % ml || ml} })
          .sort((a, b) => a.g - b.g || a.p - b.p) // shortest first, then leftmost
        for (let r = 0; r < Math.min(emb, gaps.length); r++) { // emb capped at the number of gaps
          let {p, q, g} = gaps[(((shift + r) % gaps.length) + gaps.length) % gaps.length]
          for (let j = 1; j <= twirl; j++)
            ev.push({t: f * w * ml + (f * p + j * g) % (f * ml), len: 1, v: Math.round(notes[p] + j * (notes[q] - notes[p]) / f)})
        }
      }
    }
    ev.sort((a, b) => a.t - b.t)
    let out = [], pos = 0
    ev.forEach((e, j) => {
      if (e.t > pos) out.push([e.t - pos, silence])
      let len = Math.min(e.len, (j + 1 < ev.length ? ev[j + 1].t : f * n) - e.t) // cut short if something follows right away
      out.push([len, pure(e.v)])
      pos = e.t + len
    })
    if (pos < f * n) out.push([f * n - pos, silence])
    return timeCat(...out).slow(n / crowd)
  }
  return (ms, ml, crowd, xs, xl, t, shift = 0, emb = 0, twirl = 1) => {
    let u = getUsePi()
    let args = [ms, ml, crowd, xs, xl, t, shift, emb, twirl]
    return u === 'alt'
      ? slowcat(build(piPool, ...args), build(ePool, ...args)) // each pool only advances on its own bars
      : build(u ? piPool : ePool, ...args)
  }
}

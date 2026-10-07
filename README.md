# Paradise Circus

Character book, MC script and songs for the fire show at Paradise Circus, Pai.

| Page | What it holds |
| --- | --- |
| [`index.html`](index.html) | **The menu.** Landing page linking to everything else. Public. |
| [`disguise.html`](disguise.html) | **Disguise** — the looping song, with chords over the words and an auto-scroll for playing it live. Public. |
| [`book.html`](book.html) | **Circus ideas.** Characters and acts, the full MC script, and tonight's running order. **Password protected.** |

## The password

`book.html` sits behind HTTP basic auth, enforced by [`middleware.js`](middleware.js).
Set these in Vercel under **Project Settings → Environment Variables**:

| Variable | |
| --- | --- |
| `BOOK_PASSWORD` | required — the password |
| `BOOK_USER` | optional — defaults to `pio` |

Without `BOOK_PASSWORD` the book returns 503 rather than serving, so a missing
variable can't accidentally leave it open. Changing either variable needs a
redeploy to take effect.

Both are single self-contained HTML files. No build, no install — open one in a
browser, or push to `main` and Vercel serves it.

## Using it on stage

- Every act in the book has an **Open** button that gives it a full screen of
  its own, with auto-scroll and a text-size control.
- Deep links work: `index.html#act=the-box` goes straight to that act.
- There's a search across all three pages, and a light/dark toggle.
- The song page has a setup checklist that remembers what you've ticked.

## Editing

See [`CLAUDE.md`](CLAUDE.md) — it covers the colour conventions (white is
Pio's, gold is proposed, red is a stage cue) and the rules the song follows.

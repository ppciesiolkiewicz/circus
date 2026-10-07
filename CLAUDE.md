# Paradise Circus — working notes

Pio's character book, MC script and songs for Paradise Circus in Pai, Thailand.
He performs fire, plays the looping song, and MCs the whole night.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The menu. A small landing page linking to the others. Public. |
| `book.html` | The book. Three pages in one file: **Characters**, **MC script**, **Tonight**. Behind basic auth. |
| `disguise.html` | Standalone page for the song *Disguise* — chords, roster, setup checklist, auto-scroll. Public. |
| `middleware.js` | Basic auth on `book.html`, from `BOOK_PASSWORD` / `BOOK_USER`. Fails closed. |

All three pages share the same three faces (Newsreader, Archivo, DM Mono) so
they read as one site, but each has its own accent: ember on the menu, ember
on the book, moss green on the song.

No build step. No dependencies. Open either file in a browser and it works.
Fonts come from Google Fonts; everything else is inline.

## The colour code — this matters more than anything else here

| Colour | Class | Means |
| --- | --- | --- |
| **White / default** | — | **Pio's own words.** Do not touch without being asked. |
| **Gold** | `.add`, `.new-inline`, `.script.add` | Proposed by Claude. Pio accepts, rewrites or deletes it. |
| **Red** | `.cue` | A stage cue — a physical action, not something said aloud. |

When you write a new line, a new joke, a new stanza: **make it gold.** Never
promote your own writing into white. Pio decides what becomes his.

## How to work with Pio

- **He writes in fragments and his English is not native.** "Logan is tall and
  play sickest tunes" is what he wants, not a typo to fix. Transcribe him
  verbatim. If something looks like a slip, put the line in and mention it in
  one line afterwards — never silently correct it.
- **He sends corrections in bursts**, often mid-task, often repeating himself.
  If a message repeats something already done, say it's done; don't redo it.
- **Offer alternates.** After writing a line, give one or two other versions.
  He picks fast and this saves a round trip.
- **Don't add content he didn't ask for.** He has said this explicitly. Small
  fixes and a line of direction are welcome; paragraphs of invented material
  are not.
- Keep replies short. He is usually on a phone, often shortly before a show.

## Editing the HTML

Edit by exact-string replacement and assert the match count first, so a silent
near-miss can't corrupt the file:

```python
s = open(p, encoding='utf-8').read()
assert s.count(old) == 1, s.count(old)
open(p, 'w', encoding='utf-8').write(s.replace(old, new))
```

Watch for these:

- `&rsquo;` is used for apostrophes throughout. Match it, don't type `'`.
- Several lines appear in more than one place. Scope the search to the right
  region before replacing (slice the string, then replace inside the slice).
- Never use `sed` on these files — it has mangled entities here before.

After any edit to a `<script>` block, extract and syntax-check it:

```bash
python3 -c "
import re; s=open('book.html',encoding='utf-8').read()
open('/tmp/chk.js','w').write('\n;\n'.join(re.findall(r'<script>(.*?)</script>', s, re.S)))"
node --check /tmp/chk.js
```

## book.html — structure

Three pages, switched by the `.pager` buttons; each is a `.page[data-page]`.

- `characters` — `#cast` (the acts that exist, grouped Movement & fire / Voice /
  Music), then `#fire`, `#voice`, `#voiceover`, `#music`, `#puppets`,
  `#interactive`, `#bank`, `#staging` (proposed acts).
- `mc` — `#prep`, `#open`, `#between` (grouped Crowd control games / Stories /
  Tricks / Competitive games / Other), `#close`, `#gaps`.
- `tonight` — `#t-before`, `#t-open`, `#t-first`, `#t-second`, `#t-close`.

Each act is a `<details class="char">`. The JS gives every one an **Open**
button in its `<summary>` that opens a full-screen perform view at
`#act=<slug>` with auto-scroll, speed and text size. That view strips notes,
descriptions and spec lists — it shows the script only.

State (current page, open sections, scroll, theme, speed, size) persists in
`localStorage` under `pc-*` keys.

## Disguise — the song

Lives in both files. **They are separate copies; a change to one does not
follow to the other.** Change both, every time.

Rules Pio has set:

- The loop is **D A G G**, 56 bpm. Chords sit above the word they land on
  (`<span class="cw"><span class="ch">D</span><span class="w">word</span></span>`),
  in normal flow — never absolutely positioned.
- **"This is the circus and show must go on" is always the last line.**
- **PiJoe's line is always the last shoutout line**, closing the final
  shoutout stanza.
- Shoutout stanzas run 1–9 and are a living section — people arrive and leave.
  Each person gets **one** line. Two people can share a line
  ("Keto and Kim", "Cassie flies on a pole, while Ben fixes it all").
- Above the lyrics is a roster of everyone named, each chip tagged with its
  shoutout stanza number. **If you move someone between stanzas, renumber the
  chip.** The count in the heading must match.
- "Still to include" lists people with no line yet.

## Deploy

Pushing to `main` deploys. Nothing to build — Vercel serves the files as they
are, and runs `middleware.js` on the book.

Both the book and the song carry `noindex`: the deploy URL is reachable by
anyone holding it, and the book names 40 real performers.

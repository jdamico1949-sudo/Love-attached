# Love Attached

*So they'll hold the memory, not just the treasure.*

A simple, voice-first way to pass treasured belongings to loved ones, with a story and a
personal note attached to each one. A standalone companion to **Answer Key**, built from its
Personal Property & Collectibles tab — see `BRIEF.md` for the full build brief this app was
built from (copy, data model, layouts, visual identity).

## Running it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build (dist/)
npm run preview   # serve the production build locally
```

This is a private, single-user app for v1 — everything (treasures, people, photos, voice
recordings) is stored only on this device, in IndexedDB. There's no account, no server, and
no sync yet (see "Later" in `BRIEF.md` section 10 for what that would take).

## How it's organized

- `src/types.ts` — the data model (Treasure, Person, Finalization).
- `src/store.tsx` — app state + autosave to IndexedDB (`src/storage/db.ts`).
- `src/components/TreasureForm.tsx` — the Snap / Tell / Give flow for adding or editing a treasure.
- `src/components/VoiceRecorder.tsx` — the voice-first "tap to talk" field (records audio
  everywhere; live transcription only where the browser's Speech Recognition API exists,
  which excludes iOS Safari today — she can always type or edit the words either way).
- `src/components/GiftBooklet.tsx` / `FamilyList.tsx` — the two printable outputs, built the
  same way Answer Key prints: browser print / "Save as PDF", no PDF library needed.
- `src/components/FinalizeScreen.tsx` — date-stamp and lock, with a typed signature.

## What's not built yet

Per `BRIEF.md` section 10 ("Later"): sharing a locked family link, QR codes on booklet pages,
releasing booklets through a trusted person after death, local print-shop ordering, and linking
a treasure into Answer Key's own net-worth tracker. None of these need v1's data model to
change — they're additive.

## Open questions before going further

See `BRIEF.md` section 10's checklist — whether this shares data with Answer Key or stays
fully standalone, living-gift timing, the transcription/audio-storage approach at scale, and
pricing are all still open.

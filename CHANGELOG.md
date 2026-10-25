# Changelog

## v1 — first build (2026-10-25)

Built from `BRIEF.md`, the Claude Code build brief, covering the brief's full v1 scope:

- Welcome screen with the exact copy and three-step (Snap/Tell/Give) explanation.
- The treasure form as three steps — Snap (photos, name, category), Tell (voice-first story,
  whose it was, where it's kept, optional value/notes), Give (person/donate/sell, backup
  recipient, voice-first note with auto-filled greeting, signed-as).
- Voice recording everywhere (audio capture via MediaRecorder); live transcription where the
  browser supports Speech Recognition, with a plain note and a typable field where it doesn't
  (this excludes iOS Safari today — flagged rather than silently missing).
- Multiple photos per treasure, one marked as the main photo for cards and booklet covers.
- People list, reused across treasures, added inline from the Give step.
- Home screen: a photo-card grid, "Still deciding" / "Has a home" status, and All
  treasures / By person views (the same grouping idea as Answer Key's "Group by recipient").
- Gift booklet (one per person, cover + one page per treasure) and Family list (grouped by
  recipient, practical detail for whoever settles things) — both print/Save-as-PDF, matching
  Answer Key's own print approach.
- Finalize: date-stamp, typed signature, lock/unlock, with the brief's exact wording and the
  same "this is a safeguard, not account security" framing Answer Key uses for its own
  Personal Property finalize feature.
- Visual identity applied throughout: the gift-tag-and-heart logo mark, Rose/Blush/Linen/Ink/
  Stone/Line palette, Lora + Source Sans 3 + Caveat (for her handwritten-style notes), and a
  PWA manifest/icons so it can be added to the home screen.

All data (treasures, people, photos, voice recordings) is stored on-device only, in
IndexedDB — no account or server yet (see `BRIEF.md` section 10, "Later").

Verified end to end with the brief's own sample content (a cameo brooch, gifted to a
granddaughter) via an automated browser test: add a treasure through all three steps
including a photo, confirm it shows "Has a home" on the home grid, print the gift booklet and
family list and confirm both contain the right name/story/note content, then finalize and
confirm the lock state shows correctly.

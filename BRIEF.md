# Love Attached — Claude Code Build Brief

*As of October 24, 2026. This file is self-contained: everything needed to build v1 is here, including copy, data model, layouts, logo and colors.*

---

## 1. What we're building

Build **Love Attached**, a standalone companion app to **Answer Key** (our private family-records app). It turns Answer Key's existing **Personal Property & Collectibles** tab into a simple, voice-first way to pass treasured belongings to loved ones, with a story and a personal note attached to each one.

- **Name:** Love Attached
- **Tagline:** So they'll hold the memory, not just the treasure.
- **Companion line:** Answer Key leaves them the answers. Love Attached leaves them the memories.
- **Primary user:** an older woman, often a mother or grandmother, with treasures (some inherited from her own mother) that she wants to go to specific children, grandchildren and great-grandchildren. Today she uses sticky notes and partial lists that whoever settles her estate can't piece together.
- **Core idea:** capture now, decide later. She photographs a treasure, tells its story out loud, and chooses who it's for whenever she's ready.
- **Starting point:** reuse the data model and logic from Answer Key's Personal Property & Collectibles tab (summary page, Group by recipient, Finalize), reorganized and renamed as described below.
- **Look:** match Answer Key's family resemblance: Linen background (#FBF7EF) and Lora serif headlines. Full identity in section 9.

---

## 2. Voice and wording

All wording should sound like a warm, capable friend talking to a grandmother, never like an estate-planning or insurance tool. A focus group of women was clear: the app must not feel aimed at wealthy people. "A gift of love" was the phrase they used unprompted.

- **Use:** treasure, story, note, gift, who it's for, loved ones, your own words, your own voice.
- **Avoid in the main flow:** inventory, asset, item, bequest, beneficiary, memorandum, estate.
- **Money comes last:** estimated value is optional and tucked away; never the first thing she sees.
- **Legal language only at the end:** the Finalize step may mention the will and an attorney, gently.
- **Accessibility for older users:** large type (body at least 17px on screen), tap targets at least 48px, high contrast, one main action per screen. Many users are poor typists, so voice is the default for anything longer than a few words.
- **Rewrite all labels and helper text** from the original Answer Key tab to match this voice. Use the labels in section 4.

---

## 3. Welcome screen

Show on first launch; keep it reachable later from a "How it works" link. Use this copy as written:

> # Welcome to Love Attached
>
> You have treasures you want to pass on to the people you love. Love Attached helps make sure each one goes to the right person, along with its story and a note from you.
>
> **Snap** a photo of something you treasure.
> **Tell** its story. Just tap the microphone and talk; we'll write it down for you.
> **Give** it to someone whenever you're ready, with a note in your own voice.
>
> There's no rush. Add one treasure today and come back anytime. When you're ready, print a booklet for each person and finalize your list so your wishes are clear.
>
> **[Add your first treasure]**

Show the logo above the heading and the three steps with simple line icons (camera, microphone, gift tag).

---

## 4. Input template (the treasure form)

Reorganize the original 19 fields into three steps, **Snap, Tell, Give**, matching how she thinks. Only a photo **or** a name is required to save; everything else can be added later. The **story** (about the treasure, for anyone) and the **note** (to one person) are separate fields.

| Step | Field label | Type and behavior | Change from Answer Key |
| --- | --- | --- | --- |
| Snap | Photos | Several per treasure; camera or photo library; one marked as **main photo** for printing (first photo by default) | Was one photo |
| Snap | What is it? | Short name, e.g. "Cameo brooch" | New |
| Snap | Category | Same curated list with sub-options and remembered custom entries, reordered (see below) | Reordered, new categories |
| Tell | The story | Voice-first: recording + editable transcript. Prompt: "Where did it come from? Why does it matter?" | Replaces Description |
| Tell | Whose was it? | Free text, e.g. "Was Grandma Ruth's, then mine" | New |
| Tell | Where is it kept? | Free text, e.g. "Jewelry box, top dresser drawer" | Same as Current location |
| Tell | More details (collapsed) | Estimated value (optional, currency); general notes | Value and Notes moved out of the main flow |
| Give | Who is it for? | Pick a person from the shared people list (type-ahead, "Add someone new"), or choose **Donate** or **Sell** | Replaces Gift/Donate To and the Sell checkbox |
| Give | If they can't take it | Backup person (same picker) | Same as Alternate recipient |
| Give | If no one wants it | Free text | Same |
| Give | Note to them | Voice-first: recording + editable transcript. Greeting auto-fills "Dear {first name}," and is editable | Replaces Addressed as, Name to use, Note to recipient |
| Give | Signed | One field, e.g. "Love, Grandma"; remembered as the default for next time | Replaces Sign off and Sign as |

**Category order:** Jewelry, Watches, Family photos & keepsake papers, Recipes & family traditions (new), Quilts & linens (new), China, silver & kitchenware, Coins & collectibles, Sports memorabilia, Records & music, Art & décor, Furniture, Military & service, Religious & cultural, Musical instruments, Books & writings, Clothing & accessories, Tools & hobby equipment, Firearms & outdoor, Other.

**Remove from the treasure form:**
- Gift recipient's address → stored once on the person in the people list.
- Will status → covered by Finalize.
- Delivered to recipient → later, family side.
- No note checkbox → a note is simply optional.

**Data model sketch:**

```json
{
  "Treasure": {
    "id": "uuid",
    "photos": [{ "id": "uuid", "uri": "...", "isMain": true }],
    "name": "Cameo brooch",
    "category": "Jewelry",
    "subcategory": "Brooch",
    "story": { "text": "...", "audioId": "uuid|null" },
    "provenance": "Was Grandma Ruth's, then mine",
    "location": "Jewelry box, top dresser drawer",
    "estimatedValue": null,
    "notes": "",
    "recipient": { "type": "person|donate|sell", "personId": "uuid|null", "detail": "" },
    "backupPersonId": "uuid|null",
    "ifUnclaimed": "",
    "note": { "greeting": "Dear Emma,", "text": "...", "audioId": "uuid|null" },
    "signedAs": "Love, Grandma",
    "createdAt": "iso", "updatedAt": "iso"
  },
  "Person": {
    "id": "uuid", "name": "Emma", "relationship": "Granddaughter",
    "address": { "street": "", "city": "", "state": "", "zip": "" },
    "email": ""
  },
  "Recording": { "id": "uuid", "fileUri": "...", "durationSec": 42, "createdAt": "iso" },
  "Finalization": { "finalizedAt": "iso|null", "signedName": "", "locked": true }
}
```

Status is derived, not stored: **Has a home** when `recipient` is set, otherwise **Still deciding**.

---

## 5. Voice recordings

The story and the note are filled by talking. One large microphone button records her voice, saves the audio, and writes the words into the field for her to review.

1. Tap the microphone; a clear "Recording…" state shows with a large **Stop** button and a timer.
2. On stop, save the audio with the treasure and transcribe it into the field.
3. She can play it back, edit the text by typing, or re-record. Re-recording asks before replacing the old audio.
4. The edited text is what prints. The audio is kept so family can someday hear her voice.
5. Optional assist: offer to pull the treasure's name, whose it was, and where it's kept out of a spoken story, shown as suggestions she confirms, never filled silently.

**Decide in build:** transcription approach (on-device speech recognition vs. a cloud service) and audio storage. In v1, recordings stay private to her device or account.

---

## 6. Home screen and statuses

- A grid of her treasures as photo cards (main photo, name, and who it's for), with one large **Add a treasure** button always visible.
- **Two gentle statuses** as small labels on each card: **Still deciding** and **Has a home**. Never "incomplete" or warning colors.
- **Two views:** **All treasures**, and **By person** (the existing Group by recipient feature): one section per loved one with everything meant for them, plus a "Still deciding" section.
- **Quick add:** photo first, then an optional microphone prompt, then save. She can stop after any step.
- **People:** loved ones are added once (name, relationship, address, email) and reused across treasures.

---

## 7. Outputs: gift booklet, family list, Finalize

Two printable outputs come from the same data. Both export as PDF to print or email. Printing is essential for this audience; many users don't have easy home printing, so make PDFs easy to email to themselves or a family member.

### 7a. Gift booklet (one per person)

Letter size (8.5 × 11 in), portrait, Linen background, 0.6 in margins.

**Cover page**
- Logo (small) at top.
- Large heading: "For Emma" (Lora, "Emma" in italic Rose).
- Subheading: "Treasures from Grandma" (uses the Signed name).
- A simple list of the treasures in this booklet, with page numbers.
- Footer: "Finalized [date]" if finalized.

**One page per treasure** (top to bottom):
1. **Running head:** "For Emma" on the left; small logo and "Love Attached" on the right; thin rule below.
2. **Main photo:** fills roughly the top 40% of the page (about 4.2 in tall, full content width), rounded corners, cropped to fill.
3. **Treasure block:** category in small uppercase Rose letters; treasure name in Lora, about 26pt; "whose it was" in Lora italic, Stone color.
4. **The story:** small uppercase label "The story", then the story text in Source Sans 3, 12pt, line height 1.5.
5. **The note:** a white rounded card with a thin border containing "Dear Emma," then the note text in **Caveat** (about 18pt), then the signature ("Love, Grandma") right-aligned in Caveat, Rose color.
6. **Footer:** "From Grandma · Finalized [date]" on the left, "Page 2 of 6" on the right, thin rule above.

**Do not show** where it's kept or its value on booklet pages. Skip the note card if there's no note, and skip the story block if there's no story.

### 7b. Family list (one document)

The plainer, practical version for whoever settles the estate (the existing summary page and Group by recipient view): everything grouped by person, one bordered box per person, each treasure with a small photo, name, whose it was, where it's kept, backup person, and what happens if no one wants it. Include "Still deciding" treasures at the end, Donate and Sell groups, the finalized date, and her typed signature.

### 7c. Finalize

Keep the existing Finalize behavior: date-stamp and lock the list against accidental changes, with an unlock option (not account security). Add a field to type her full name as a signature. Use this wording:

> **Make it official.** Finalize, date, and sign to help ensure your wishes are carried out (consult with your attorney).

Helper text: "Many states let a will refer to a dated, signed list like this one. Rules vary, so ask your attorney how to connect it to your will." Never promise the list is legally binding.

---

## 8. Marketing one-pager copy (for reference and an About screen)

- **Headline:** The story should go *with the gift.*
- **Tagline:** So they'll hold the memory, not just the treasure.
- **Intro:** You have treasures you want to pass on to the people you love when you're gone. Maybe you've started a list, or put a sticky note on the back of a few things. But whoever carries out your wishes may not be able to piece it all together, and the stories behind your treasures could be lost.
  **Love Attached makes it simple.** Snap a photo of each treasure, tell its story out loud, and decide, whenever you're ready, who it's for. Add a note in your own voice so they'll always know why.
- **How it works:** 1. Snap — Take a photo of the ring, the quilt, the recipe box. 2. Tell — Tap the microphone and say where it came from. 3. Give — When you're ready, choose who it's for and add a note.
- **The things that matter most:** Jewelry, Watches, Family photos, Recipes, Quilts & linens, China & silver, Coins, Sports memorabilia, Records, Furniture, Mother's keepsakes, and more.
- **Why it works:** Talk, don't type — your words are written down for you. No rush — capture now; decide who later. A booklet for each person — print their gifts and notes together. Make it official — finalize, date, and sign to help ensure your wishes are carried out (consult with your attorney).
- **Closing:** One of the kindest gifts you can leave.

---

## 9. Visual identity

### Logo mark (SVG)

A gift tag outline with a string that ends in a small filled heart. Use `currentColor` so it can be Rose on light backgrounds and Linen on Rose.

```svg
<svg viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Love Attached">
  <path d="M32 14 H62 a4 4 0 0 1 4 4 V46 a4 4 0 0 1 -4 4 H32 L18 32 Z" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
  <circle cx="29" cy="32" r="3" stroke="currentColor" stroke-width="2.6"/>
  <path d="M26 32 C 17 32, 12 29, 12 23" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M12 23 C 4 17, 5 8, 12 11.5 C 19 8, 20 17, 12 23 Z" fill="currentColor"/>
</svg>
```

- **Wordmark:** "Love *Attached*" in Lora 500; "Attached" in italic, Rose.
- **App icon:** the mark in Linen, centered on a Rose rounded square (corner radius about 22% of the size).

### Colors

| Name | Hex | Use |
| --- | --- | --- |
| Rose | #9A3A4C | Accent, primary buttons, logo, links |
| Blush | #F2DEDD | Soft fills, icon circles, highlight bands |
| Linen | #FBF7EF | Page background (shared with Answer Key) |
| Ink | #2B2522 | Body text |
| Stone | #5E544E | Secondary text, labels |
| Line | #E4D9CB | Borders and rules |

### Type (Google Fonts)

| Typeface | Use |
| --- | --- |
| Lora (400, 500, 600, italic) | Headlines and wordmark (shared with Answer Key) |
| Source Sans 3 (400, 600) | Body text, labels, buttons |
| Caveat (500) | Her notes to recipients only, on screen and in print |

---

## 10. Scope: v1 and later

V1 is the private, single-user app with voice capture and PDF outputs. Anything that needs family accounts or online sharing waits for v2.

| Feature | v1 | Later |
| --- | --- | --- |
| Welcome screen, Snap / Tell / Give form, people list | Yes | |
| Multiple photos, voice recording + editable transcript | Yes | |
| Home grid, statuses, By person view | Yes | |
| Gift booklet PDF and family list PDF (print or email) | Yes | |
| Finalize with date and typed signature | Yes | |
| Private family link: recipients view their booklet and play recordings | | v2 |
| QR code on booklet pages: "Scan to hear Grandma say it" | | v2 (needs the family link) |
| Release booklets after death through a trusted person (executor) | | v2 |
| Print through a local service (e.g. Staples) | | Later |
| Link a treasure into Answer Key's net-worth tracker | | Later |
| Reminders to revisit after life events (new grandchild, a death in the family) | | Later |

### Open questions

- [ ] Will Love Attached share data (people list, executor) with Answer Key, or stand alone in v1?
- [ ] Delivery timing: should she be able to give a booklet now, as a living gift, as well as after she's gone?
- [ ] Transcription and audio storage approach, given privacy expectations.
- [ ] Pricing: free, one-time purchase, or bundled with Answer Key.

---

## 11. Sample content for testing

Use this sample treasure so the booklet can be checked end to end:

- **Name:** Cameo brooch · **Category:** Jewelry · **Whose was it:** Was Grandma Ruth's, then mine
- **Story:** My father gave this cameo to my mother, Ruth, on their tenth anniversary. She pinned it to her coat every Easter Sunday. After she passed, I wore it to church each Easter too, and it always felt like she was sitting beside me.
- **For:** Emma (granddaughter)
- **Note:** Dear Emma, You used to sit on my lap at Easter and trace the lady's face with your finger. Wear it on the days you want to feel close to us both. Now it's yours, sweetheart.
- **Signed:** Love, Grandma

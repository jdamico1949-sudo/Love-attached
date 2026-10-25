import { useEffect, useState } from "react";
import type { Person, Treasure, RecipientType } from "../types";
import { useStore } from "../store";
import { TREASURE_CATEGORIES, TREASURE_CATEGORY_NAMES } from "../data/categories";
import { PhotoPicker } from "./PhotoPicker";
import { VoiceField } from "./VoiceRecorder";
import { PersonPicker } from "./PersonPicker";
import { useBlobUrl } from "../utils/useBlobUrl";

type Step = "snap" | "tell" | "give";
const STEPS: { id: Step; label: string }[] = [
  { id: "snap", label: "Snap" },
  { id: "tell", label: "Tell" },
  { id: "give", label: "Give" },
];

export function TreasureForm({ treasure, onDone }: { treasure: Treasure; onDone: () => void }) {
  const { updateTreasure, state, setLastSignedAs } = useStore();
  const [step, setStep] = useState<Step>("snap");
  const [showMore, setShowMore] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  function patch(p: Partial<Treasure>) {
    updateTreasure(treasure.id, p);
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const categoryGroup = TREASURE_CATEGORIES.find((c) => c.name === treasure.category);

  function firstName(personId: string | null): string {
    if (!personId) return "them";
    const p = state.people.find((x) => x.id === personId);
    return p ? p.name.split(" ")[0] : "them";
  }

  function chooseRecipientType(type: RecipientType) {
    const greeting = type === "person" ? treasure.note.greeting : "";
    patch({ recipient: { ...treasure.recipient, type }, note: { ...treasure.note, greeting } });
  }

  // Auto-fills the greeting once the chosen person is actually resolvable
  // from state.people. Doing this in an effect (rather than inline in
  // PersonPicker's onChange, where it used to live) avoids a stale-data
  // race: "+ Add someone new" creates the person and picks them in the
  // same click, and state.people here can still be the pre-add snapshot
  // at that exact moment -- which silently produced "Dear them," instead
  // of the real name. The effect re-runs once state.people catches up.
  // Only fills a still-blank greeting, so it never overwrites something
  // already typed or dictated.
  useEffect(() => {
    if (treasure.recipient.type !== "person" || !treasure.recipient.personId || treasure.note.greeting) return;
    const name = firstName(treasure.recipient.personId);
    if (name !== "them") patch({ note: { ...treasure.note, greeting: `Dear ${name},` } });
  }, [treasure.recipient.type, treasure.recipient.personId, state.people]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 100px" }}>
      {!reviewing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
                background: i === stepIndex ? "var(--rose)" : "var(--blush)",
                color: i === stepIndex ? "var(--linen)" : "var(--rose)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {reviewing && <ReviewPanel treasure={treasure} people={state.people} />}

      {!reviewing && step === "snap" && (
        <section>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>What's the treasure?</h2>
          <div style={{ marginBottom: 20 }}>
            <label>Photos</label>
            <PhotoPicker photos={treasure.photos} onChange={(photos) => patch({ photos })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>What is it?</label>
            <input
              value={treasure.name}
              placeholder="e.g. Cameo brooch"
              onChange={(e) => patch({ name: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Category</label>
            <select value={treasure.category} onChange={(e) => patch({ category: e.target.value, subcategory: "" })}>
              <option value="" disabled>
                Choose a category…
              </option>
              {TREASURE_CATEGORY_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          {categoryGroup && (
            <div style={{ marginBottom: 20 }}>
              <label>More specifically</label>
              <select value={treasure.subcategory} onChange={(e) => patch({ subcategory: e.target.value })}>
                <option value="" disabled>
                  Choose one…
                </option>
                {categoryGroup.items.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>
      )}

      {!reviewing && step === "tell" && (
        <section>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Tell its story</h2>
          <VoiceField
            label="The story"
            prompt="Where did it come from? Why does it matter?"
            text={treasure.story.text}
            audioId={treasure.story.audioId}
            onChange={(text, audioId) => patch({ story: { text, audioId } })}
            placeholder="Tap to talk, or type here"
          />
          <div style={{ marginBottom: 20 }}>
            <label>Whose was it?</label>
            <input
              value={treasure.provenance}
              placeholder="e.g. Was Grandma Ruth's, then mine"
              onChange={(e) => patch({ provenance: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Where is it kept?</label>
            <input
              value={treasure.location}
              placeholder="e.g. Jewelry box, top dresser drawer"
              onChange={(e) => patch({ location: e.target.value })}
            />
          </div>
          <button type="button" className="btn-plain" onClick={() => setShowMore((s) => !s)} style={{ marginBottom: 12 }}>
            {showMore ? "Hide more details" : "+ More details (value, notes)"}
          </button>
          {showMore && (
            <div className="card">
              <div style={{ marginBottom: 16 }}>
                <label>Estimated value (optional)</label>
                <input
                  value={treasure.estimatedValue}
                  placeholder="$0"
                  onChange={(e) => patch({ estimatedValue: e.target.value })}
                />
              </div>
              <div>
                <label>Notes</label>
                <textarea rows={3} value={treasure.notes} onChange={(e) => patch({ notes: e.target.value })} />
              </div>
            </div>
          )}
        </section>
      )}

      {!reviewing && step === "give" && (
        <section>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Who is it for?</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {(["person", "donate", "sell"] as RecipientType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => chooseRecipientType(t)}
                className={treasure.recipient.type === t ? "btn-primary" : "btn-secondary"}
              >
                {t === "person" ? "A person" : t === "donate" ? "Donate" : "Sell"}
              </button>
            ))}
          </div>

          {treasure.recipient.type === "person" && (
            <div style={{ marginBottom: 20 }}>
              <PersonPicker
                personId={treasure.recipient.personId}
                onChange={(personId) => patch({ recipient: { ...treasure.recipient, personId } })}
              />
            </div>
          )}
          {treasure.recipient.type !== "person" && (
            <div style={{ marginBottom: 20 }}>
              <label>Any detail to add? (optional)</label>
              <input
                value={treasure.recipient.detail}
                placeholder={treasure.recipient.type === "donate" ? "Where should it go?" : "Any notes about selling it"}
                onChange={(e) => patch({ recipient: { ...treasure.recipient, detail: e.target.value } })}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <PersonPicker
              label="If they can't take it (optional)"
              personId={treasure.backupPersonId}
              onChange={(backupPersonId) => patch({ backupPersonId })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>If no one wants it (optional)</label>
            <textarea
              rows={2}
              value={treasure.ifUnclaimed}
              placeholder="What should happen then?"
              onChange={(e) => patch({ ifUnclaimed: e.target.value })}
            />
          </div>

          {treasure.recipient.type === "person" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label>Greeting</label>
                <input
                  value={treasure.note.greeting}
                  placeholder="e.g. Dear Daniel,"
                  onChange={(e) => patch({ note: { ...treasure.note, greeting: e.target.value } })}
                />
              </div>
              <VoiceField
                label="Note to them"
                prompt={`A few words for ${firstName(treasure.recipient.personId)}, in your own voice. No need to say the greeting or sign off again — those are their own boxes.`}
                text={treasure.note.text}
                audioId={treasure.note.audioId}
                onChange={(text, audioId) => patch({ note: { ...treasure.note, text, audioId } })}
                placeholder="Share why they're getting this, or any memory that goes with it"
              />
              <div style={{ marginBottom: 20 }}>
                <label>Signed</label>
                <input
                  value={treasure.signedAs}
                  placeholder="e.g. Love, Grandma"
                  onChange={(e) => {
                    patch({ signedAs: e.target.value });
                    setLastSignedAs(e.target.value);
                  }}
                />
              </div>
            </>
          )}
        </section>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--linen)",
          borderTop: "1px solid var(--line)",
          padding: 16,
          display: "flex",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        {reviewing ? (
          <>
            <button type="button" className="btn-secondary" onClick={() => setReviewing(false)}>
              ✎ Edit
            </button>
            <button type="button" className="btn-primary" onClick={onDone}>
              ✓ Done
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-plain" onClick={onDone}>
              ✓ Saved — Done
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              {stepIndex > 0 && (
                <button type="button" className="btn-secondary" onClick={() => setStep(STEPS[stepIndex - 1].id)}>
                  Back
                </button>
              )}
              {stepIndex < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
                  Next: {STEPS[stepIndex + 1].label}
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setReviewing(true)}>
                  Review
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewPanel({ treasure, people }: { treasure: Treasure; people: Person[] }) {
  const main = treasure.photos.find((p) => p.isMain) || treasure.photos[0];
  const url = useBlobUrl(main?.id);
  const recipient = treasure.recipient.personId ? people.find((p) => p.id === treasure.recipient.personId) : null;
  const backup = treasure.backupPersonId ? people.find((p) => p.id === treasure.backupPersonId) : null;

  return (
    <section>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Here's what you've got</h2>
      <p style={{ color: "var(--stone)", marginBottom: 20 }}>
        This is roughly how it'll look in the gift booklet. Tap Edit to change anything, or Done when it's ready.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        {url && (
          <img
            src={url}
            alt=""
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 14 }}
          />
        )}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--rose)", letterSpacing: 0.5 }}>
          {treasure.category || "No category yet"}
        </div>
        <h3 style={{ fontSize: 22, margin: "2px 0 6px" }}>{treasure.name || "Untitled treasure"}</h3>
        {treasure.provenance && (
          <p style={{ color: "var(--stone)", fontStyle: "italic", marginBottom: 10 }}>Whose it was: {treasure.provenance}</p>
        )}
        {treasure.story.text && <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{treasure.story.text}</p>}

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4, fontSize: 14 }}>
          <strong>Going to:</strong>{" "}
          {treasure.recipient.type === "person"
            ? recipient?.name || "(no one chosen yet)"
            : treasure.recipient.type === "donate"
            ? "Donation"
            : "Sale"}
          {backup && <> · if not them, {backup.name}</>}
        </div>

        {treasure.recipient.type === "person" && (treasure.note.greeting || treasure.note.text) && (
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 14, marginTop: 14 }}>
            {treasure.note.greeting && (
              <p style={{ fontFamily: "var(--font-hand)", fontSize: 17, margin: "0 0 10px" }}>{treasure.note.greeting}</p>
            )}
            {treasure.note.text && (
              <p style={{ fontFamily: "var(--font-hand)", fontSize: 17, whiteSpace: "pre-wrap", margin: 0 }}>
                {treasure.note.text}
              </p>
            )}
            {treasure.signedAs && (
              <p style={{ fontFamily: "var(--font-hand)", fontSize: 17, color: "var(--rose)", textAlign: "right", marginTop: 10, marginBottom: 0 }}>
                {treasure.signedAs}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

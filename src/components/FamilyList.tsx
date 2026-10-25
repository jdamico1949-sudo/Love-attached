import { useStore } from "../store";
import { groupTreasuresByRecipient } from "../utils/group";
import type { Treasure, Person } from "../types";
import { useBlobUrl } from "../utils/useBlobUrl";
import { LogoMark } from "./Logo";
import { FloatingActions } from "./FloatingActions";

export function FamilyListPage({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const groups = groupTreasuresByRecipient(state.treasures, state.people);

  return (
    <div>
      <div className="no-print" style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
        <button type="button" className="btn-plain" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <h2 style={{ marginBottom: 16 }}>Family list</h2>
        <p style={{ color: "var(--stone)", marginBottom: 16 }}>
          The practical version, for whoever settles things — everything grouped by person, with where each
          treasure is kept and what to do if someone can't take it.
        </p>
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          Print the family list
        </button>
      </div>

      <div className="familylist-page">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <LogoMark size={26} color="var(--rose)" />
          <h1 style={{ fontSize: 24 }}>Love Attached — Family List</h1>
        </div>
        <p style={{ color: "var(--stone)", fontSize: 13, marginBottom: 24 }}>
          {state.finalization.finalizedAt
            ? `Finalized ${new Date(state.finalization.finalizedAt).toLocaleDateString()} — signed ${
                state.finalization.signedName || "—"
              }.`
            : `Printed ${new Date().toLocaleDateString()} — not yet finalized, and may still change.`}
        </p>

        {groups.length === 0 && <p style={{ color: "var(--stone)" }}>No treasures added yet.</p>}

        {groups.map(([label, items]) => (
          <RecipientBox key={label} label={label} items={items} people={state.people} />
        ))}
      </div>

      <FloatingActions onBack={onBack} onPrint={() => window.print()} />
    </div>
  );
}

function RecipientBox({ label, items, people }: { label: string; items: Treasure[]; people: Person[] }) {
  return (
    <div style={{ border: "2px solid var(--ink)", borderRadius: 6, padding: "14px 18px", marginBottom: 14, pageBreakInside: "avoid" }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{label}</div>
      {items.map((t, i) => (
        <TreasureRow key={t.id} treasure={t} people={people} divider={i > 0} />
      ))}
    </div>
  );
}

function TreasureRow({ treasure, people, divider }: { treasure: Treasure; people: Person[]; divider: boolean }) {
  const main = treasure.photos.find((p) => p.isMain) || treasure.photos[0];
  const url = useBlobUrl(main?.id);
  const backup = treasure.backupPersonId ? people.find((p) => p.id === treasure.backupPersonId) : null;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingTop: divider ? 10 : 0, marginTop: divider ? 10 : 0, borderTop: divider ? "1px solid var(--line)" : "none" }}>
      {url ? (
        <img src={url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--blush)", flexShrink: 0 }} />
      )}
      <div style={{ fontSize: 13 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{treasure.name || "(untitled)"}</div>
        {treasure.provenance && <div style={{ color: "var(--stone)" }}>Whose it was: {treasure.provenance}</div>}
        {treasure.location && <div>Kept: {treasure.location}</div>}
        {backup && <div>If not {treasure.recipient.type === "person" ? "them" : "taken"}: goes to {backup.name}</div>}
        {treasure.ifUnclaimed && <div>If unclaimed: {treasure.ifUnclaimed}</div>}
      </div>
    </div>
  );
}

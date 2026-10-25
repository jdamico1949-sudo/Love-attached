import { useState } from "react";
import { useStore } from "../store";
import { TreasureCard } from "./TreasureCard";
import { groupTreasuresByRecipient } from "../utils/group";

type View = "all" | "byPerson";

export function SummaryScreen({
  onBack,
  onAdd,
  onOpen,
  onPrintBooklet,
}: {
  onBack: () => void;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onPrintBooklet: (personId?: string) => void;
}) {
  const { state, removeTreasure } = useStore();
  const [view, setView] = useState<View>("all");
  const grouped = groupTreasuresByRecipient(state.treasures, state.people);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button type="button" className="btn-plain" onClick={onBack} style={{ marginBottom: 6 }}>
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>Your treasures</h2>
            {state.treasures.length > 0 && (
              <button type="button" className="btn-secondary" onClick={() => onPrintBooklet()}>
                🖨 Print Book
              </button>
            )}
          </div>
          <p style={{ color: "var(--stone)", margin: 0 }}>
            {state.treasures.length} treasure{state.treasures.length === 1 ? "" : "s"} so far — a good place to check
            for anything still missing a home.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={onAdd}>
          + Add a treasure
        </button>
      </header>

      {state.treasures.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--stone)", marginBottom: 18 }}>No treasures added yet.</p>
          <button type="button" className="btn-primary" onClick={onAdd}>
            Add your first treasure
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <button type="button" className={view === "all" ? "btn-primary" : "btn-secondary"} onClick={() => setView("all")}>
              All treasures
            </button>
            <button
              type="button"
              className={view === "byPerson" ? "btn-primary" : "btn-secondary"}
              onClick={() => setView("byPerson")}
            >
              By person
            </button>
          </div>

          {view === "all" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {state.treasures.map((t) => (
                <TreasureCard
                  key={t.id}
                  treasure={t}
                  people={state.people}
                  onOpen={() => onOpen(t.id)}
                  onDelete={() => removeTreasure(t.id)}
                />
              ))}
            </div>
          ) : (
            <div>
              {grouped.map(([label, items]) => {
                // Only a real person has a booklet to print -- "Still
                // deciding", "To be donated" and "To be sold" aren't
                // anyone's gift booklet. Every item in one of these groups
                // shares the same recipient, so the first one tells us
                // whether this group is a real person and, if so, their id.
                const first = items[0];
                const personId = first.recipient.type === "person" ? first.recipient.personId : undefined;
                return (
                  <div key={label} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 18, margin: 0, color: "var(--rose)" }}>{label}</h3>
                      {personId && (
                        <button
                          type="button"
                          aria-label={`Print ${label}'s book`}
                          title={`Print ${label}'s book`}
                          onClick={() => onPrintBooklet(personId)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "none",
                            background: "var(--rose)",
                            color: "#fff",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          🖨
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                      {items.map((t) => (
                        <TreasureCard
                          key={t.id}
                          treasure={t}
                          people={state.people}
                          onOpen={() => onOpen(t.id)}
                          onDelete={() => removeTreasure(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

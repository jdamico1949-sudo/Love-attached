import { useState } from "react";
import { joinNames } from "../utils/signature";

// Lets someone pick one or more givers for a treasure (e.g. "Papa" and
// "Grandma" together for a joint gift) from a remembered list, instead of
// retyping a free-text signature every time -- which is why the same
// book used to show a different name on every page. New names typed
// here are remembered (via onAddOption) so they show up as a plain
// tap-to-pick option on the next treasure too.
export function SignerPicker({
  selected,
  options,
  onChange,
  onAddOption,
}: {
  selected: string[];
  options: string[];
  onChange: (names: string[]) => void;
  onAddOption: (name: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  // Always show selections in the same order as the option list, so
  // "Papa and Grandma" doesn't flip to "Grandma and Papa" depending on
  // the order they happened to be tapped.
  const orderedSelected = options.filter((o) => selected.includes(o));
  const preview = joinNames(orderedSelected);

  function toggle(name: string) {
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
  }

  function saveNewName() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddOption(trimmed);
    onChange([...selected, trimmed]);
    setNewName("");
    setAdding(false);
  }

  return (
    <div>
      <label>Who is gifting this treasure?</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {options.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className={selected.includes(name) ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px", minHeight: "auto" }}
          >
            {name}
          </button>
        ))}
        {!adding && (
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: "8px 16px", minHeight: "auto" }}
            onClick={() => setAdding(true)}
          >
            + Add another name
          </button>
        )}
      </div>

      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Mimi"
            autoFocus
            style={{ flex: "1 1 180px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveNewName();
              }
            }}
          />
          <button type="button" className="btn-primary" style={{ padding: "8px 16px", minHeight: "auto" }} onClick={saveNewName}>
            Add
          </button>
          <button
            type="button"
            className="btn-plain"
            onClick={() => {
              setAdding(false);
              setNewName("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <p style={{ fontSize: 13, color: "var(--stone)" }}>
        {preview ? `Will sign as: Love, ${preview}` : "Not signed yet — pick who it's from."}
      </p>
    </div>
  );
}

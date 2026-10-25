import { useState } from "react";
import { useStore } from "../store";

const ADD_NEW = "__add_new__";

export function PersonPicker({
  personId,
  onChange,
  label = "Who is it for?",
}: {
  personId: string | null;
  onChange: (personId: string) => void;
  label?: string;
}) {
  const { state, addPerson } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  function handleSelect(value: string) {
    if (value === ADD_NEW) {
      setAdding(true);
      return;
    }
    onChange(value);
  }

  function saveNewPerson() {
    if (!name.trim()) return;
    const p = addPerson({ name: name.trim(), relationship: relationship.trim() });
    onChange(p.id);
    setAdding(false);
    setName("");
    setRelationship("");
  }

  if (adding) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <label>Their name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma" autoFocus />
        <div style={{ height: 10 }} />
        <label>Relationship (optional)</label>
        <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Granddaughter" />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" className="btn-primary" onClick={saveNewPerson}>
            Add {name || "them"}
          </button>
          <button type="button" className="btn-plain" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label>{label}</label>
      <select value={personId || ""} onChange={(e) => handleSelect(e.target.value)}>
        <option value="" disabled>
          Choose someone…
        </option>
        {state.people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.relationship ? ` (${p.relationship})` : ""}
          </option>
        ))}
        <option value={ADD_NEW}>+ Add someone new</option>
      </select>
    </div>
  );
}

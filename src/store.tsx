import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { AppState, Person, Treasure } from "./types";
import { loadState, saveState } from "./storage/db";
import { newId, todayIso } from "./utils/id";

const EMPTY_STATE: AppState = {
  treasures: [],
  people: [],
  finalization: { finalizedAt: null, signedName: "", locked: false },
  lastSignedAs: "",
  dismissedWelcome: false,
};

interface StoreApi {
  state: AppState;
  loaded: boolean;
  addTreasure: (partial?: Partial<Treasure>) => Treasure;
  updateTreasure: (id: string, patch: Partial<Treasure>) => void;
  removeTreasure: (id: string) => void;
  addPerson: (partial?: Partial<Person>) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  setFinalization: (patch: Partial<AppState["finalization"]>) => void;
  dismissWelcome: () => void;
  setLastSignedAs: (value: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

// One-time repair for a bug that shipped briefly: the greeting and note
// body used to be merged into one editable box, and picking a
// just-created recipient could auto-fill the greeting as the literal
// "Dear them," (a stale-data race, since fixed) while note.text kept
// the OLD full merged string starting with the real "Dear <Name>,".
// After that merge was split back into two real fields, an entry saved
// under the old behavior would show both: the stale "Dear them," and
// then the real greeting again at the start of the body. "Dear them,"
// is not something a person would type themselves, so it's a safe,
// unambiguous signature to detect and repair automatically rather than
// asking anyone to hand-edit it.
const STALE_GREETING = "Dear them,";
function repairStaleGreeting(t: Treasure): Treasure {
  if (t.note.greeting !== STALE_GREETING) return t;
  const m = t.note.text.match(/^Dear\s+[^,]+,\s*/);
  if (!m) return t;
  return { ...t, note: { ...t.note, greeting: m[0].trim(), text: t.note.text.slice(m[0].length) } };
}

export function newTreasure(partial?: Partial<Treasure>): Treasure {
  const now = todayIso();
  return {
    id: newId(),
    photos: [],
    name: "",
    category: "",
    subcategory: "",
    story: { text: "", audioId: null },
    provenance: "",
    location: "",
    estimatedValue: "",
    notes: "",
    recipient: { type: "person", personId: null, detail: "" },
    backupPersonId: null,
    ifUnclaimed: "",
    note: { greeting: "", text: "", audioId: null },
    signedAs: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function newPerson(partial?: Partial<Person>): Person {
  return {
    id: newId(),
    name: "",
    relationship: "",
    address: { street: "", city: "", state: "", zip: "" },
    email: "",
    ...partial,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    loadState(EMPTY_STATE).then((s) => {
      setState({ ...s, treasures: s.treasures.map(repairStaleGreeting) });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveState(state);
    }, 400);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, loaded]);

  // Best-effort flush on hide, since a debounced save can be cut short by
  // closing the tab -- same reasoning Answer Key's own autosave uses.
  useEffect(() => {
    const flush = () => saveState(state);
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [state]);

  const api: StoreApi = {
    state,
    loaded,
    addTreasure: (partial) => {
      const t = newTreasure(partial);
      setState((prev) => ({ ...prev, treasures: [t, ...prev.treasures] }));
      return t;
    },
    updateTreasure: (id, patch) => {
      setState((prev) => ({
        ...prev,
        treasures: prev.treasures.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: todayIso() } : t)),
      }));
    },
    removeTreasure: (id) => {
      setState((prev) => ({ ...prev, treasures: prev.treasures.filter((t) => t.id !== id) }));
    },
    addPerson: (partial) => {
      const p = newPerson(partial);
      setState((prev) => ({ ...prev, people: [...prev.people, p] }));
      return p;
    },
    updatePerson: (id, patch) => {
      setState((prev) => ({
        ...prev,
        people: prev.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    setFinalization: (patch) => {
      setState((prev) => ({ ...prev, finalization: { ...prev.finalization, ...patch } }));
    },
    dismissWelcome: () => setState((prev) => ({ ...prev, dismissedWelcome: true })),
    setLastSignedAs: (value) => setState((prev) => ({ ...prev, lastSignedAs: value })),
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

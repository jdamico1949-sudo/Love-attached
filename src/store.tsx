import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { AppState, Person, Treasure } from "./types";
import { deleteBlob, loadState, saveState } from "./storage/db";
import { newId, todayIso } from "./utils/id";

const EMPTY_STATE: AppState = {
  treasures: [],
  people: [],
  finalization: { finalizedAt: null, signedName: "", locked: false },
  lastSignedBy: [],
  signerOptions: [],
  customSubcategories: {},
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
  setSkipIntro: (value: boolean) => void;
  setLastSignedBy: (names: string[]) => void;
  addSignerOption: (name: string) => void;
  addCustomSubcategory: (category: string, value: string) => void;
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

// One-time migration: "Signed" used to be a single free-text box (e.g.
// "Love, Papa" or just "Papa and Grandma"), which is why the same book
// could show a different name on every page -- whatever happened to be
// typed that time, with nothing remembered between treasures. It's now a
// real list of names (Treasure.signedBy / AppState.lastSignedBy), picked
// from a remembered list rather than retyped. A treasure or saved state
// from before this change has no signedBy/lastSignedBy at all yet --
// only the old free-text field -- so this pulls a best-effort name list
// out of that old text the same way the old display logic used to read
// it (the part after the last comma, e.g. "Love, Papa" -> "Papa"), then
// splits that on "and"/"&"/commas to recover multiple names.
function parseLegacySignedAs(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split(",");
  const namePart = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
  if (!namePart) return [];
  return namePart
    .split(/\s*(?:,|&| and )\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function migrateSignedBy(t: Treasure): Treasure {
  if (Array.isArray(t.signedBy)) return t;
  const legacy = (t as unknown as { signedAs?: string }).signedAs || "";
  return { ...t, signedBy: parseLegacySignedAs(legacy) };
}

function migrateState(s: AppState): AppState {
  const treasures = s.treasures.map(repairStaleGreeting).map(migrateSignedBy);
  const lastSignedBy = Array.isArray(s.lastSignedBy)
    ? s.lastSignedBy
    : parseLegacySignedAs((s as unknown as { lastSignedAs?: string }).lastSignedAs || "");
  // Pre-populate the remembered-names list from whatever was already in
  // use, so migrating doesn't greet anyone with a suddenly-empty picker.
  const namesInUse = new Set(Array.isArray(s.signerOptions) ? s.signerOptions : []);
  for (const t of treasures) for (const n of t.signedBy) namesInUse.add(n);
  for (const n of lastSignedBy) namesInUse.add(n);
  return {
    ...s,
    treasures,
    lastSignedBy,
    signerOptions: Array.from(namesInUse),
    customSubcategories:
      s.customSubcategories && typeof s.customSubcategories === "object" ? s.customSubcategories : {},
  };
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
    signedBy: [],
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
      setState(migrateState(s));
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
      setState((prev) => {
        const t = prev.treasures.find((x) => x.id === id);
        if (t) {
          // Clean up its blobs too, not just the record -- otherwise
          // every deleted treasure's photos and recordings would sit in
          // the blob store forever with nothing left pointing at them.
          for (const photo of t.photos) deleteBlob(photo.id);
          if (t.story.audioId) deleteBlob(t.story.audioId);
          if (t.note.audioId) deleteBlob(t.note.audioId);
        }
        return { ...prev, treasures: prev.treasures.filter((x) => x.id !== id) };
      });
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
    setSkipIntro: (value) => setState((prev) => ({ ...prev, dismissedWelcome: value })),
    setLastSignedBy: (names) => setState((prev) => ({ ...prev, lastSignedBy: names })),
    addSignerOption: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setState((prev) =>
        prev.signerOptions.includes(trimmed) ? prev : { ...prev, signerOptions: [...prev.signerOptions, trimmed] }
      );
    },
    addCustomSubcategory: (category, value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setState((prev) => {
        const existing = prev.customSubcategories[category] || [];
        if (existing.includes(trimmed)) return prev;
        return { ...prev, customSubcategories: { ...prev.customSubcategories, [category]: [...existing, trimmed] } };
      });
    },
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

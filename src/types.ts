export type RecipientType = "person" | "donate" | "sell";

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  address: Address;
  email: string;
}

export interface VoiceField {
  text: string;
  audioId: string | null;
}

export interface Photo {
  id: string;
  isMain: boolean;
}

export interface Recipient {
  type: RecipientType;
  personId: string | null;
  detail: string;
}

export interface Treasure {
  id: string;
  photos: Photo[];
  name: string;
  category: string;
  subcategory: string;
  story: VoiceField;
  provenance: string;
  location: string;
  estimatedValue: string;
  notes: string;
  recipient: Recipient;
  backupPersonId: string | null;
  ifUnclaimed: string;
  note: { greeting: string; text: string; audioId: string | null };
  // Who's giving this specific treasure, e.g. ["Papa", "Grandma"] -- one
  // or more names picked from the remembered list (AppState.signerOptions),
  // rather than free text, so "From ___" on the printed page always comes
  // from a real, visible choice instead of whatever happened to be typed.
  signedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Finalization {
  finalizedAt: string | null;
  signedName: string;
  locked: boolean;
}

export interface AppState {
  treasures: Treasure[];
  people: Person[];
  finalization: Finalization;
  // The giver names used on the most recent treasure -- prefills a
  // brand-new treasure's own signedBy (instead of starting blank every
  // time, which is why items ended up signed inconsistently) and is the
  // default "Treasures from ___" on a booklet's cover page.
  lastSignedBy: string[];
  // Every giver name ever picked or typed, remembered so it shows up as
  // a one-tap option on the next treasure instead of being retyped.
  signerOptions: string[];
  // Custom "More specifically" values typed under Other, remembered per
  // category so they become real, selectable options from then on.
  customSubcategories: Record<string, string[]>;
  dismissedWelcome: boolean;
}

export type TreasureStatus = "deciding" | "placed";

export function treasureStatus(t: Treasure): TreasureStatus {
  return t.recipient.type && (t.recipient.personId || t.recipient.type !== "person")
    ? "placed"
    : "deciding";
}

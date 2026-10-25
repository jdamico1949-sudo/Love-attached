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
  signedAs: string;
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
  lastSignedAs: string;
  dismissedWelcome: boolean;
}

export type TreasureStatus = "deciding" | "placed";

export function treasureStatus(t: Treasure): TreasureStatus {
  return t.recipient.type && (t.recipient.personId || t.recipient.type !== "person")
    ? "placed"
    : "deciding";
}

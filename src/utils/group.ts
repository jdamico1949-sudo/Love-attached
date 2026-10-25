import type { Person, Treasure } from "../types";

export function recipientLabel(t: Treasure, people: Person[]): string {
  if (t.recipient.type === "donate") return "To be donated";
  if (t.recipient.type === "sell") return "To be sold";
  if (t.recipient.type === "person" && t.recipient.personId) {
    const p = people.find((x) => x.id === t.recipient.personId);
    return p ? p.name : "Still deciding";
  }
  return "Still deciding";
}

export function groupTreasuresByRecipient(treasures: Treasure[], people: Person[]): [string, Treasure[]][] {
  const order: string[] = [];
  const map = new Map<string, Treasure[]>();
  for (const t of treasures) {
    const label = recipientLabel(t, people);
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(t);
  }
  order.sort((a, b) => {
    if (a === "Still deciding") return 1;
    if (b === "Still deciding") return -1;
    return a.localeCompare(b);
  });
  return order.map((label) => [label, map.get(label)!]);
}

// Turns a list of giver names (e.g. ["Papa", "Grandma"]) into the plain
// joined form used for "From ___" lines: one name as-is, two joined with
// "and", three or more as an Oxford-comma list.
export function joinNames(names: string[]): string {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

// The full handwritten-style closing for a note, e.g. "Love, Papa and
// Grandma". Empty when no one's been chosen yet.
export function formatSignature(names: string[]): string {
  const joined = joinNames(names);
  return joined ? `Love, ${joined}` : "";
}

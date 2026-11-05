// Fractional ordering for Kanban cards: moving a card writes one row.
export function positionBetween(before: number | undefined, after: number | undefined) {
  if (before === undefined && after === undefined) return 1024;
  if (before === undefined) return after! - 1024;
  if (after === undefined) return before + 1024;
  return (before + after) / 2;
}

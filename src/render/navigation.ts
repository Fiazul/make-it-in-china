export interface Cell { col: number; row: number }
export type Grid = boolean[][];

export function makeGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array<boolean>(size).fill(true));
}

export function worldToCell(x: number, z: number, size: number): Cell | null {
  const col = Math.floor(x + size / 2);
  const row = Math.floor(z + size / 2);
  return col >= 0 && row >= 0 && col < size && row < size ? { col, row } : null;
}

export function cellToWorld(cell: Cell, size: number): [number, number] {
  return [cell.col - size / 2 + 0.5, cell.row - size / 2 + 0.5];
}

export function findPath(grid: Grid, start: Cell, goal: Cell): Cell[] {
  if (!grid[goal.row]?.[goal.col]) return [];
  const key = ({ col, row }: Cell) => `${col},${row}`;
  const queue: Cell[] = [start];
  const previous = new Map<string, Cell | null>([[key(start), null]]);
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.col === goal.col && current.row === goal.row) break;
    for (const [dc, dr] of moves) {
      const next = { col: current.col + dc, row: current.row + dr };
      if (grid[next.row]?.[next.col] && !previous.has(key(next))) {
        previous.set(key(next), current);
        queue.push(next);
      }
    }
  }

  if (!previous.has(key(goal))) return [];
  const path: Cell[] = [];
  for (let at: Cell | null = goal; at && key(at) !== key(start); at = previous.get(key(at)) ?? null) {
    path.push(at);
  }
  return path.reverse();
}

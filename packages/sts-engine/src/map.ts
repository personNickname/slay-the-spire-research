/**
 * MapGenerator + RoomTypeAssigner, ported from the decompiled classes.
 * Size 15×7, path density 6. Row 0 monster, row 8 treasure, row 14 rest.
 */
import { StsRandom } from "./rng.js";
import type { MapNode, RoomKind, RunState } from "./types.js";

function randRange(rng: StsRandom, min: number, max: number): number {
  return rng.random(max - min) + min;
}

function getNode(nodes: MapNode[][], x: number, y: number): MapNode {
  return nodes[y]![x]!;
}

function maxEdge(edges: { x: number; y: number }[]): { x: number; y: number } {
  return edges.reduce((a, b) => (b.x > a.x ? b : a));
}
function minEdge(edges: { x: number; y: number }[]): { x: number; y: number } {
  return edges.reduce((a, b) => (b.x < a.x ? b : a));
}

function getCommonAncestor(n1: MapNode, n2: MapNode, maxDepth: number, nodes: MapNode[][]): MapNode | null {
  // Ground truth includes the `node1.x < node2.y` comparison (MapGenerator.java).
  let l = n1.x < n2.y ? n1 : n2;
  let r = n1.x < n2.y ? n2 : n1;
  for (let y = n1.y; y >= 0 && y >= n1.y - maxDepth; y--) {
    if (!l.parents.length || !r.parents.length) return null;
    const lps = l.parents.map((p) => getNode(nodes, p.x, p.y));
    const rps = r.parents.map((p) => getNode(nodes, p.x, p.y));
    l = lps.reduce((a, b) => (b.x > a.x ? b : a));
    r = rps.reduce((a, b) => (b.x < a.x ? b : a));
    if (l === r) return l;
  }
  return null;
}

function createPaths(nodes: MapNode[][], edge: { x: number; y: number }, rng: StsRandom): void {
  const current = getNode(nodes, edge.x, edge.y);
  if (edge.y + 1 >= nodes.length) return;
  const rowEnd = nodes[edge.y]!.length - 1;
  let min = -1;
  let max = 1;
  if (edge.x === 0) {
    min = 0;
    max = 1;
  } else if (edge.x === rowEnd) {
    min = -1;
    max = 0;
  }
  let newX = edge.x + randRange(rng, min, max);
  const newY = edge.y + 1;
  let candidate = getNode(nodes, newX, newY);
  const minGap = 3;
  const maxGap = 5;
  if (candidate.parents.length) {
    for (const parent of candidate.parents.map((p) => getNode(nodes, p.x, p.y))) {
      if (parent === current) continue;
      const ancestor = getCommonAncestor(parent, current, maxGap, nodes);
      if (!ancestor) continue;
      const gap = newY - ancestor.y;
      if (gap < minGap) {
        if (candidate.x > current.x) {
          newX = edge.x + randRange(rng, -1, 0);
          if (newX < 0) newX = edge.x;
        } else if (candidate.x === current.x) {
          newX = edge.x + randRange(rng, -1, 1);
          if (newX > rowEnd) newX = edge.x - 1;
          else if (newX < 0) newX = edge.x + 1;
        } else {
          newX = edge.x + randRange(rng, 0, 1);
          if (newX > rowEnd) newX = edge.x;
        }
        candidate = getNode(nodes, newX, newY);
      } else if (gap >= maxGap) {
        /* keep */
      }
    }
  }
  if (edge.x !== 0) {
    const left = nodes[edge.y]![edge.x - 1]!;
    if (left.edges.length) {
      const re = maxEdge(left.edges);
      if (re.x > newX) newX = re.x;
    }
  }
  if (edge.x < rowEnd) {
    const right = nodes[edge.y]![edge.x + 1]!;
    if (right.edges.length) {
      const le = minEdge(right.edges);
      if (le.x < newX) newX = le.x;
    }
  }
  candidate = getNode(nodes, newX, newY);
  current.edges.push({ x: newX, y: newY });
  current.edges.sort((a, b) => a.x - b.x);
  candidate.parents.push({ x: current.x, y: current.y });
  createPaths(nodes, { x: newX, y: newY }, rng);
}

function assignable(n: MapNode, room: RoomKind): boolean {
  if (n.y <= 4 && (room === "rest" || room === "elite")) return false;
  if (n.y >= 13 && room === "rest") return false;
  return true;
}

function siblingMatch(sibs: MapNode[], room: RoomKind): boolean {
  if (!["rest", "monster", "event", "elite", "shop"].includes(room)) return false;
  return sibs.some((s) => s.room === room);
}
function parentMatch(parents: MapNode[], room: RoomKind): boolean {
  if (!["rest", "treasure", "shop", "elite"].includes(room)) return false;
  return parents.some((p) => p.room === room);
}

export function generateMap(run: RunState): MapNode[][] {
  if (run.act === 4) return endingMap();
  const height = 15;
  const width = 7;
  const density = 6;
  const rng = StsRandom.fromState(run.rng.map!);
  const nodes: MapNode[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MapNode[] = [];
    for (let x = 0; x < width; x++) row.push({ x, y, edges: [], parents: [] });
    nodes.push(row);
  }
  let first = -1;
  for (let i = 0; i < density; i++) {
    let start = randRange(rng, 0, width - 1);
    if (i === 0) first = start;
    while (start === first && i === 1) start = randRange(rng, 0, width - 1);
    createPaths(nodes, { x: start, y: 0 }, rng);
  }
  // row 0 monster, row 8 treasure, row 14 rest
  for (const n of nodes[0]!) if (n.edges.length || n.parents.length) n.room = "monster";
  for (const n of nodes[0]!) if (n.edges.length) n.room = "monster";
  for (const n of nodes[8]!) n.room = n.room ?? "treasure";
  for (const n of nodes[14]!) n.room = n.room ?? "rest";

  const connected: MapNode[] = [];
  for (const row of nodes) {
    for (const n of row) {
      if (n.y === height - 2) continue;
      if (n.edges.length && !n.room) connected.push(n);
    }
  }
  const count = connected.length;
  const shopN = Math.round(count * 0.05);
  const restN = Math.round(count * 0.12);
  const eliteN = Math.round(count * 0.08 * (run.ascension >= 1 ? 1.6 : 1));
  const eventN = Math.round(count * 0.22);
  const rooms: RoomKind[] = [];
  for (let i = 0; i < shopN; i++) rooms.push("shop");
  for (let i = 0; i < restN; i++) rooms.push("rest");
  for (let i = 0; i < eliteN; i++) rooms.push("elite");
  for (let i = 0; i < eventN; i++) rooms.push("event");
  while (rooms.length < count) rooms.push("monster");
  rng.shuffle(rooms);

  for (const n of connected) {
    const parents = n.parents.map((p) => getNode(nodes, p.x, p.y));
    const sibs: MapNode[] = [];
    for (const p of parents) for (const e of p.edges) {
      const s = getNode(nodes, e.x, e.y);
      if (s !== n) sibs.push(s);
    }
    let chosen: RoomKind | undefined;
    for (const room of rooms) {
      if (!assignable(n, room)) continue;
      if (!parentMatch(parents, room) && !siblingMatch(sibs, room)) {
        chosen = room;
        break;
      }
      if (n.y === 0) {
        chosen = room;
        break;
      }
    }
    if (chosen) {
      n.room = chosen;
      rooms.splice(rooms.indexOf(chosen), 1);
    }
  }
  for (const row of nodes) for (const n of row) {
    if (n.edges.length && !n.room) n.room = "monster";
  }
  // only keep rooms on connected nodes (has edges or is destination of an edge)
  const dest = new Set<string>();
  for (const row of nodes) for (const n of row) for (const e of n.edges) dest.add(`${e.x},${e.y}`);
  for (const row of nodes) for (const n of row) {
    if (!n.edges.length && !dest.has(`${n.x},${n.y}`)) n.room = undefined;
  }
  // Boss is reached via last-row rest edges (y=14 → y=15 boss node).
  const boss: MapNode = { x: 3, y: 15, edges: [], parents: [], room: "boss" };
  const bossRow: MapNode[] = [];
  for (let x = 0; x < width; x++) bossRow.push(x === 3 ? boss : { x, y: 15, edges: [], parents: [] });
  for (const n of nodes[14]!) {
    if (n.room) {
      n.edges.push({ x: 3, y: 15 });
      boss.parents.push({ x: n.x, y: n.y });
    }
  }
  nodes.push(bossRow);

  run.rng.map = rng.toState();
  return nodes;
}

/**
 * The Ending (act 4): fixed 3-node chain rest → shop → elite (Spire Shield
 * and Spire Spear), then the Corrupt Heart boss gate. No randomness.
 */
function endingMap(): MapNode[][] {
  const rooms: RoomKind[] = ["rest", "shop", "elite"];
  const nodes: MapNode[][] = [];
  for (let y = 0; y < 3; y++) {
    const row: MapNode[] = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        x,
        y,
        edges: x === 3 && y < 2 ? [{ x: 3, y: y + 1 }] : [],
        parents: x === 3 && y > 0 ? [{ x: 3, y: y - 1 }] : [],
        room: x === 3 ? rooms[y] : undefined,
      });
    }
    nodes.push(row);
  }
  return nodes;
}

export function startingNodes(map: MapNode[][]): MapNode[] {
  return map[0]!.filter((n) => n.room && n.edges.length);
}

export function reachableFrom(map: MapNode[][], cur: { x: number; y: number } | null): MapNode[] {
  if (!cur) return startingNodes(map);
  const node = map[cur.y]![cur.x]!;
  return node.edges.map((e) => map[e.y]![e.x]!);
}

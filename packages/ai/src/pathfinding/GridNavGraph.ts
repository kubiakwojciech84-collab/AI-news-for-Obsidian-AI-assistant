export interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Vec2 {
  x: number;
  z: number;
}

interface AStarNode {
  x: number;
  z: number;
  g: number;
  f: number;
  parent: AStarNode | null;
}

/**
 * A uniform-grid navigation graph with A* search. Good enough for bot pathfinding on
 * game maps built from box obstacles (the editor's primitive-based levels) without
 * requiring a baked navmesh pipeline.
 */
export class GridNavGraph {
  private readonly cellSize: number;
  private readonly halfWidth: number;
  private readonly cols: number;
  private walkable: Uint8Array;

  constructor(worldSize = 100, cellSize = 1) {
    this.cellSize = cellSize;
    this.halfWidth = worldSize / 2;
    this.cols = Math.ceil(worldSize / cellSize);
    this.walkable = new Uint8Array(this.cols * this.cols).fill(1);
  }

  private toGrid(x: number, z: number): [number, number] {
    return [Math.floor((x + this.halfWidth) / this.cellSize), Math.floor((z + this.halfWidth) / this.cellSize)];
  }

  private toWorld(gx: number, gz: number): Vec2 {
    return { x: gx * this.cellSize - this.halfWidth + this.cellSize / 2, z: gz * this.cellSize - this.halfWidth + this.cellSize / 2 };
  }

  private inBounds(gx: number, gz: number): boolean {
    return gx >= 0 && gz >= 0 && gx < this.cols && gz < this.cols;
  }

  markObstacles(obstacles: Obstacle[]): void {
    for (const obs of obstacles) {
      const [minGx, minGz] = this.toGrid(obs.minX, obs.minZ);
      const [maxGx, maxGz] = this.toGrid(obs.maxX, obs.maxZ);
      for (let gx = Math.max(minGx, 0); gx <= Math.min(maxGx, this.cols - 1); gx++) {
        for (let gz = Math.max(minGz, 0); gz <= Math.min(maxGz, this.cols - 1); gz++) {
          this.walkable[gz * this.cols + gx] = 0;
        }
      }
    }
  }

  private isWalkable(gx: number, gz: number): boolean {
    return this.inBounds(gx, gz) && this.walkable[gz * this.cols + gx] === 1;
  }

  /** Returns a list of world-space waypoints from `from` to `to`, or an empty array if unreachable. */
  findPath(from: Vec2, to: Vec2, maxIterations = 4000): Vec2[] {
    const [startX, startZ] = this.toGrid(from.x, from.z);
    const [goalX, goalZ] = this.toGrid(to.x, to.z);
    if (!this.inBounds(startX, startZ) || !this.inBounds(goalX, goalZ)) return [];

    const open: AStarNode[] = [{ x: startX, z: startZ, g: 0, f: 0, parent: null }];
    const closed = new Set<string>();
    const key = (x: number, z: number) => `${x},${z}`;
    const neighbors = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    let iterations = 0;
    while (open.length > 0 && iterations < maxIterations) {
      iterations += 1;
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      if (current.x === goalX && current.z === goalZ) {
        return this.reconstruct(current);
      }
      closed.add(key(current.x, current.z));

      for (const [dx, dz] of neighbors) {
        const nx = current.x + dx;
        const nz = current.z + dz;
        if (!this.isWalkable(nx, nz) || closed.has(key(nx, nz))) continue;
        const cost = Math.hypot(dx, dz);
        const g = current.g + cost;
        const h = Math.hypot(goalX - nx, goalZ - nz);
        const existing = open.find((n) => n.x === nx && n.z === nz);
        if (existing && existing.g <= g) continue;
        if (existing) {
          existing.g = g;
          existing.f = g + h;
          existing.parent = current;
        } else {
          open.push({ x: nx, z: nz, g, f: g + h, parent: current });
        }
      }
    }
    return [];
  }

  private reconstruct(node: AStarNode): Vec2[] {
    const path: Vec2[] = [];
    let cur: AStarNode | null = node;
    while (cur) {
      path.unshift(this.toWorld(cur.x, cur.z));
      cur = cur.parent;
    }
    return path;
  }
}

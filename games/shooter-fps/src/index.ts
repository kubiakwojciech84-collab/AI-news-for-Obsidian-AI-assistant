import type { GameScene, SceneNode } from "@nova/shared";
import { createEmptyScene } from "@nova/shared";

let nextId = 0;
function id(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

function box(name: string, position: [number, number, number], scale: [number, number, number], color: string, isStatic = true): SceneNode {
  return {
    id: id("box"),
    name,
    type: "box",
    position,
    rotation: [0, 0, 0],
    scale,
    color,
    physics: { enabled: true, isStatic, shape: "box", mass: isStatic ? 0 : 10 },
    children: [],
  };
}

function spawn(name: string, position: [number, number, number], team: "a" | "b" | "bot"): SceneNode {
  return {
    id: id("spawn"),
    name,
    type: "spawn",
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    metadata: { team },
    children: [],
  };
}

function pickup(name: string, position: [number, number, number], kind: "ammo" | "health"): SceneNode {
  return {
    id: id("pickup"),
    name,
    type: "trigger",
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    metadata: { kind },
    children: [],
  };
}

/**
 * Builds a symmetrical FPS arena: an open ground plane ringed by walls, a scatter of cover
 * boxes, two player spawn clusters facing each other, extra "bot" spawns for the AI patrol
 * bots, and ammo/health pickups. The game-server loads this exact JSON to build both the
 * physics colliders (via @nova/physics BodyFactory) and the AI bot navigation grid.
 */
export function buildShooterScene(): GameScene {
  const scene = createEmptyScene("shooter-fps");
  const children: SceneNode[] = [];

  children.push(box("Ground", [0, -0.5, 0], [40, 1, 40], "#7c8b6f"));
  children.push(box("Wall North", [0, 2, 20], [40, 5, 1], "#5d6d7e"));
  children.push(box("Wall South", [0, 2, -20], [40, 5, 1], "#5d6d7e"));
  children.push(box("Wall East", [20, 2, 0], [1, 5, 40], "#5d6d7e"));
  children.push(box("Wall West", [-20, 2, 0], [1, 5, 40], "#5d6d7e"));

  const coverPositions: Array<[number, number, number]> = [
    [-8, 0.75, -8], [8, 0.75, -8], [-8, 0.75, 8], [8, 0.75, 8],
    [0, 0.75, -12], [0, 0.75, 12], [-14, 0.75, 0], [14, 0.75, 0],
    [-4, 0.75, 4], [4, 0.75, -4],
  ];
  coverPositions.forEach(([x, y, z], i) => {
    children.push(box(`Cover ${i + 1}`, [x, y, z], [2, 1.5, 2], "#8d6e63"));
  });

  children.push(spawn("Team A Spawn 1", [-17, 1, -17], "a"));
  children.push(spawn("Team A Spawn 2", [-17, 1, -14], "a"));
  children.push(spawn("Team B Spawn 1", [17, 1, 17], "b"));
  children.push(spawn("Team B Spawn 2", [17, 1, 14], "b"));
  children.push(spawn("Bot Patrol 1", [0, 1, 0], "bot"));
  children.push(spawn("Bot Patrol 2", [10, 1, -10], "bot"));
  children.push(spawn("Bot Patrol 3", [-10, 1, 10], "bot"));

  children.push(pickup("Ammo Crate 1", [-4, 1, 4], "ammo"));
  children.push(pickup("Ammo Crate 2", [4, 1, -4], "ammo"));
  children.push(pickup("Health Kit 1", [0, 1, -12], "health"));
  children.push(pickup("Health Kit 2", [0, 1, 12], "health"));

  scene.root.children = children;
  scene.skyColor = "#2b2f38";
  return scene;
}

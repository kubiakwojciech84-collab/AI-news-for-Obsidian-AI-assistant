import type { GameScene, SceneNode } from "@nova/shared";
import { createEmptyScene } from "@nova/shared";

let nextId = 0;
function id(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

function platform(name: string, position: [number, number, number], scale: [number, number, number], color: string): SceneNode {
  return {
    id: id("platform"),
    name,
    type: "box",
    position,
    rotation: [0, 0, 0],
    scale,
    color,
    physics: { enabled: true, isStatic: true, shape: "box", mass: 0 },
    children: [],
  };
}

function checkpoint(index: number, position: [number, number, number]): SceneNode {
  return {
    id: id("checkpoint"),
    name: `Checkpoint ${index}`,
    type: "checkpoint",
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    metadata: { index },
    children: [],
  };
}

/**
 * Procedurally builds the "Tower of Trials" obby: a spiraling stack of platforms that get
 * progressively narrower/further apart, with a checkpoint every 4 jumps. This mirrors how
 * obby maps are actually authored in the platform's own editor (a tree of primitive
 * SceneNodes with physics colliders) - the editor could load and re-save this exact JSON.
 */
export function buildObbyScene(): GameScene {
  const scene = createEmptyScene("obby");
  const children: SceneNode[] = [];

  children.push(platform("Ground", [0, -0.5, 0], [12, 1, 12], "#4caf50"));
  children.push({
    id: id("spawn"),
    name: "Spawn",
    type: "spawn",
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    children: [],
  });

  const totalSteps = 24;
  let angle = 0;
  let radius = 6;
  let height = 1;
  for (let i = 0; i < totalSteps; i++) {
    angle += 0.45;
    radius += 0.15;
    height += 1.1;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size: [number, number, number] = i % 5 === 4 ? [3, 0.5, 3] : [1.6, 0.5, 1.6];
    const color = i % 5 === 4 ? "#ffb300" : i % 2 === 0 ? "#42a5f5" : "#ab47bc";
    children.push(platform(`Step ${i + 1}`, [x, height, z], size, color));
    if (i % 5 === 4) {
      children.push(checkpoint(Math.floor(i / 5) + 1, [x, height + 1, z]));
    }
  }

  height += 2;
  children.push(platform("Victory Platform", [0, height, 0], [5, 0.5, 5], "#ffd700"));
  children.push(checkpoint(99, [0, height + 1, 0]));

  scene.root.children = children;
  scene.skyColor = "#bde6ff";
  return scene;
}

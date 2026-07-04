import type { GameScene, SceneNode } from "@nova/shared";

let counter = 0;
export function generateNodeId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export function createDefaultNode(type: SceneNode["type"]): SceneNode {
  const base: SceneNode = {
    id: generateNodeId(type),
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#8899aa",
    children: [],
  };
  if (["box", "sphere", "cylinder", "plane"].includes(type)) {
    base.physics = { enabled: true, isStatic: true, shape: type === "plane" ? "plane" : (type as "box" | "sphere" | "cylinder"), mass: 0 };
  }
  return base;
}

function mapTree(node: SceneNode, fn: (n: SceneNode) => SceneNode): SceneNode {
  const mapped = fn(node);
  return { ...mapped, children: mapped.children.map((c) => mapTree(c, fn)) };
}

export function updateNodeInScene(scene: GameScene, nodeId: string, patch: Partial<SceneNode>): GameScene {
  return { ...scene, root: mapTree(scene.root, (n) => (n.id === nodeId ? { ...n, ...patch } : n)) };
}

export function addChildToScene(scene: GameScene, parentId: string, child: SceneNode): GameScene {
  return {
    ...scene,
    root: mapTree(scene.root, (n) => (n.id === parentId ? { ...n, children: [...n.children, child] } : n)),
  };
}

export function removeNodeFromScene(scene: GameScene, nodeId: string): GameScene {
  function filterChildren(node: SceneNode): SceneNode {
    return { ...node, children: node.children.filter((c) => c.id !== nodeId).map(filterChildren) };
  }
  return { ...scene, root: filterChildren(scene.root) };
}

export function findNode(scene: GameScene, nodeId: string): SceneNode | null {
  function search(node: SceneNode): SceneNode | null {
    if (node.id === nodeId) return node;
    for (const child of node.children) {
      const found = search(child);
      if (found) return found;
    }
    return null;
  }
  return search(scene.root);
}

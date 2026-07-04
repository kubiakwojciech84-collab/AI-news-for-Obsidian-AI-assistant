import type { SceneNode } from "@nova/shared";

export function flattenSceneNodes(root: SceneNode): SceneNode[] {
  const out: SceneNode[] = [];
  const walk = (node: SceneNode) => {
    out.push(node);
    for (const child of node.children) walk(child);
  };
  walk(root);
  return out;
}

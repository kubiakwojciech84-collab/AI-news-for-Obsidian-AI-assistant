import * as CANNON from "cannon-es";
import type { SceneNode } from "@nova/shared";

/** Builds a cannon-es body from a SceneNode's `physics` config produced by the editor. */
export function createBodyFromNode(node: SceneNode): CANNON.Body | null {
  const physics = node.physics;
  if (!physics?.enabled) return null;

  let shape: CANNON.Shape;
  const [sx, sy, sz] = node.scale;
  switch (physics.shape) {
    case "sphere":
      shape = new CANNON.Sphere(Math.max(sx, sy, sz) * 0.5);
      break;
    case "cylinder":
      shape = new CANNON.Cylinder(sx * 0.5, sx * 0.5, sy, 16);
      break;
    case "plane":
      shape = new CANNON.Plane();
      break;
    case "box":
    default:
      shape = new CANNON.Box(new CANNON.Vec3(sx * 0.5, sy * 0.5, sz * 0.5));
  }

  const body = new CANNON.Body({
    mass: physics.isStatic ? 0 : physics.mass,
    type: physics.isStatic ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
    shape,
    position: new CANNON.Vec3(...node.position),
  });
  const [rx, ry, rz] = node.rotation;
  body.quaternion.setFromEuler(rx, ry, rz);
  return body;
}

export function createGroundBody(size = 200): CANNON.Body {
  const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC, shape: new CANNON.Box(new CANNON.Vec3(size, 0.5, size)) });
  body.position.set(0, -0.5, 0);
  return body;
}

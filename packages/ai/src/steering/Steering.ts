export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

/** Direction (normalized) and yaw needed to seek a target position on the XZ plane. */
export function seek(from: Vec3Like, to: Vec3Like): { x: number; z: number; yaw: number; distance: number } {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 1e-4) return { x: 0, z: 0, yaw: 0, distance: 0 };
  const yaw = Math.atan2(dx, dz);
  return { x: dx / distance, z: dz / distance, yaw, distance };
}

export interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
}

/**
 * Blends a desired direction with a repulsion force from nearby circular obstacles,
 * giving bots a cheap local-avoidance behaviour on top of their A* path.
 */
export function avoidObstacles(
  position: Vec3Like,
  desiredDirX: number,
  desiredDirZ: number,
  obstacles: CircleObstacle[],
  lookaheadRadius = 3
): { x: number; z: number } {
  let avoidX = 0;
  let avoidZ = 0;
  for (const obs of obstacles) {
    const dx = position.x - obs.x;
    const dz = position.z - obs.z;
    const dist = Math.hypot(dx, dz);
    const threshold = obs.radius + lookaheadRadius;
    if (dist > 0 && dist < threshold) {
      const strength = (threshold - dist) / threshold;
      avoidX += (dx / dist) * strength;
      avoidZ += (dz / dist) * strength;
    }
  }
  const blendedX = desiredDirX + avoidX * 1.5;
  const blendedZ = desiredDirZ + avoidZ * 1.5;
  const len = Math.hypot(blendedX, blendedZ) || 1;
  return { x: blendedX / len, z: blendedZ / len };
}

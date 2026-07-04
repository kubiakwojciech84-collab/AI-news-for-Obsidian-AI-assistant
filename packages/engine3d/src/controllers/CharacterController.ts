import * as THREE from "three";

export interface CharacterControllerOptions {
  moveSpeed?: number;
  jumpSpeed?: number;
  gravity?: number;
  groundY?: (x: number, z: number) => number;
}

/**
 * Lightweight kinematic character controller used for client-side prediction.
 * The game-server runs the authoritative equivalent; this exists so movement feels
 * instant locally while we reconcile against server snapshots.
 */
export class CharacterController {
  readonly position = new THREE.Vector3();
  velocityY = 0;
  grounded = true;

  private moveSpeed: number;
  private jumpSpeed: number;
  private gravity: number;
  private groundY: (x: number, z: number) => number;

  constructor(options: CharacterControllerOptions = {}) {
    this.moveSpeed = options.moveSpeed ?? 6;
    this.jumpSpeed = options.jumpSpeed ?? 8;
    this.gravity = options.gravity ?? -22;
    this.groundY = options.groundY ?? (() => 0);
  }

  jump(): void {
    if (this.grounded) {
      this.velocityY = this.jumpSpeed;
      this.grounded = false;
    }
  }

  update(dt: number, axisX: number, axisZ: number, yaw: number): void {
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const forwardX = -sin * axisZ;
    const forwardZ = -cos * axisZ;
    const rightX = cos * axisX;
    const rightZ = -sin * axisX;

    this.position.x += (forwardX + rightX) * this.moveSpeed * dt;
    this.position.z += (forwardZ + rightZ) * this.moveSpeed * dt;

    this.velocityY += this.gravity * dt;
    this.position.y += this.velocityY * dt;

    const floor = this.groundY(this.position.x, this.position.z);
    if (this.position.y <= floor) {
      this.position.y = floor;
      this.velocityY = 0;
      this.grounded = true;
    }
  }
}

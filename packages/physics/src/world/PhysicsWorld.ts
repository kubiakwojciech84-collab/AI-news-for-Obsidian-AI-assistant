import * as CANNON from "cannon-es";

export interface PhysicsWorldOptions {
  gravity?: [number, number, number];
}

/**
 * Thin wrapper around cannon-es used both server-side (authoritative simulation in
 * apps/game-server) and client-side (local prediction / editor preview in apps/editor
 * and apps/frontend). Has zero rendering dependencies so it can run headless on the server.
 */
export class PhysicsWorld {
  readonly world: CANNON.World;
  private fixedStep = 1 / 60;
  private accumulator = 0;

  constructor(options: PhysicsWorldOptions = {}) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(...(options.gravity ?? [0, -9.81, 0])),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    (this.world.solver as CANNON.GSSolver).iterations = 10;
  }

  addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  /** Steps physics at a fixed 60Hz tick regardless of the caller's frame rate. */
  step(deltaSeconds: number): void {
    this.accumulator += deltaSeconds;
    let steps = 0;
    while (this.accumulator >= this.fixedStep && steps < 5) {
      this.world.step(this.fixedStep);
      this.accumulator -= this.fixedStep;
      steps += 1;
    }
  }
}

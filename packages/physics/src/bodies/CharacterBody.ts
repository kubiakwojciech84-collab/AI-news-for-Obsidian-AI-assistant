import * as CANNON from "cannon-es";

export interface CharacterBodyOptions {
  radius?: number;
  height?: number;
  moveSpeed?: number;
  jumpSpeed?: number;
  position?: [number, number, number];
}

/**
 * Authoritative physics body for a player or AI bot, used server-side in apps/game-server.
 * Modelled as a capsule (cylinder + sphere caps) with locked rotation so it never tips over,
 * matching the classic "kinematic-feeling but physically simulated" character used by Roblox-likes.
 */
export class CharacterBody {
  readonly body: CANNON.Body;
  private moveSpeed: number;
  private jumpSpeed: number;
  private groundContacts = 0;

  constructor(options: CharacterBodyOptions = {}) {
    const radius = options.radius ?? 0.4;
    const height = options.height ?? 1.8;
    this.moveSpeed = options.moveSpeed ?? 6;
    this.jumpSpeed = options.jumpSpeed ?? 8;

    const cylinder = new CANNON.Cylinder(radius, radius, height - radius * 2, 8);
    const sphereTop = new CANNON.Sphere(radius);
    const sphereBottom = new CANNON.Sphere(radius);

    this.body = new CANNON.Body({ mass: 5, fixedRotation: true, linearDamping: 0.9 });
    this.body.addShape(cylinder);
    this.body.addShape(sphereTop, new CANNON.Vec3(0, height / 2 - radius, 0));
    this.body.addShape(sphereBottom, new CANNON.Vec3(0, -(height / 2 - radius), 0));

    const [x, y, z] = options.position ?? [0, 2, 0];
    this.body.position.set(x, y, z);

    this.body.addEventListener("collide", (event: { contact: CANNON.ContactEquation }) => {
      const contactNormalY = event.contact.ni.y;
      if (Math.abs(contactNormalY) > 0.5) this.groundContacts += 1;
    });
  }

  get isGrounded(): boolean {
    return this.groundContacts > 0;
  }

  /** Call once per fixed physics step before world.step(); resets ground detection for next tick. */
  beginStep(): void {
    this.groundContacts = 0;
  }

  setMoveInput(axisX: number, axisZ: number, yaw: number): void {
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const forwardX = -sin * axisZ;
    const forwardZ = -cos * axisZ;
    const rightX = cos * axisX;
    const rightZ = -sin * axisX;
    this.body.velocity.x = (forwardX + rightX) * this.moveSpeed;
    this.body.velocity.z = (forwardZ + rightZ) * this.moveSpeed;
  }

  jump(): void {
    if (this.isGrounded) {
      this.body.velocity.y = this.jumpSpeed;
    }
  }

  get position(): [number, number, number] {
    return [this.body.position.x, this.body.position.y, this.body.position.z];
  }

  teleport(position: [number, number, number]): void {
    this.body.position.set(...position);
    this.body.velocity.set(0, 0, 0);
  }
}

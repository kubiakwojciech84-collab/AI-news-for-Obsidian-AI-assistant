import * as THREE from "three";

export interface ThirdPersonCameraOptions {
  distance?: number;
  height?: number;
  sensitivity?: number;
}

/** Simple mouse-look follow camera used by the third-person games (Obby, Survival, RPG, Sandbox). */
export class ThirdPersonCamera {
  yaw = 0;
  pitch = -0.25;
  private distance: number;
  private height: number;
  private sensitivity: number;

  constructor(private camera: THREE.PerspectiveCamera, options: ThirdPersonCameraOptions = {}) {
    this.distance = options.distance ?? 6;
    this.height = options.height ?? 2;
    this.sensitivity = options.sensitivity ?? 0.0025;
  }

  applyLookDelta(dx: number, dy: number): void {
    this.yaw -= dx * this.sensitivity;
    this.pitch -= dy * this.sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.2, 0.9);
  }

  update(target: THREE.Vector3): void {
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance,
      Math.sin(this.pitch) * -this.distance + this.height,
      Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance
    );
    this.camera.position.copy(target).add(offset);
    this.camera.lookAt(target.x, target.y + this.height * 0.5, target.z);
  }
}

/** First-person head camera used by the Shooter FPS game. */
export class FirstPersonCamera {
  yaw = 0;
  pitch = 0;
  private sensitivity: number;

  constructor(private camera: THREE.PerspectiveCamera, sensitivity = 0.0022) {
    this.sensitivity = sensitivity;
  }

  applyLookDelta(dx: number, dy: number): void {
    this.yaw -= dx * this.sensitivity;
    this.pitch -= dy * this.sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
  }

  get forward(): THREE.Vector3 {
    return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
  }

  update(eyePosition: THREE.Vector3): void {
    this.camera.position.copy(eyePosition);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotateY(this.yaw);
    this.camera.rotateX(this.pitch);
  }
}

export interface PointerDelta {
  dx: number;
  dy: number;
}

/** Tracks keyboard + mouse state for character controllers and the editor camera. */
export class InputManager {
  private keys = new Set<string>();
  private pointerLocked = false;
  private accumulatedDelta: PointerDelta = { dx: 0, dy: 0 };
  private frameDelta: PointerDelta = { dx: 0, dy: 0 };
  private mouseButtons = new Set<number>();
  private justPressedKeys = new Set<string>();
  private clickedButtons = new Set<number>();

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (!this.keys.has(e.code)) this.justPressedKeys.add(e.code);
    this.keys.add(e.code);
  };
  private readonly onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private readonly onMouseMove = (e: MouseEvent) => {
    if (this.pointerLocked) {
      this.accumulatedDelta.dx += e.movementX;
      this.accumulatedDelta.dy += e.movementY;
    }
  };
  private readonly onMouseDown = (e: MouseEvent) => {
    this.mouseButtons.add(e.button);
    this.clickedButtons.add(e.button);
    this.element.requestPointerLock?.();
  };
  private readonly onMouseUp = (e: MouseEvent) => this.mouseButtons.delete(e.button);
  private readonly onLockChange = () => {
    this.pointerLocked = document.pointerLockElement === this.element;
  };

  constructor(private element: HTMLElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    element.addEventListener("mousemove", this.onMouseMove);
    element.addEventListener("mousedown", this.onMouseDown);
    element.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("pointerlockchange", this.onLockChange);
  }

  /** Call once per frame after game logic read the previous frame's deltas. */
  update(): void {
    this.frameDelta = this.accumulatedDelta;
    this.accumulatedDelta = { dx: 0, dy: 0 };
    this.justPressedKeys.clear();
    this.clickedButtons.clear();
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  wasJustPressed(code: string): boolean {
    return this.justPressedKeys.has(code);
  }

  isMouseDown(button = 0): boolean {
    return this.mouseButtons.has(button);
  }

  wasClicked(button = 0): boolean {
    return this.clickedButtons.has(button);
  }

  get lookDelta(): PointerDelta {
    return this.frameDelta;
  }

  get isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  /** Movement axis in [-1, 1] built from WASD / arrow keys. */
  get moveAxis(): { x: number; z: number } {
    let x = 0;
    let z = 0;
    if (this.isDown("KeyW") || this.isDown("ArrowUp")) z -= 1;
    if (this.isDown("KeyS") || this.isDown("ArrowDown")) z += 1;
    if (this.isDown("KeyA") || this.isDown("ArrowLeft")) x -= 1;
    if (this.isDown("KeyD") || this.isDown("ArrowRight")) x += 1;
    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }
    return { x, z };
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mousedown", this.onMouseDown);
    this.element.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("pointerlockchange", this.onLockChange);
  }
}

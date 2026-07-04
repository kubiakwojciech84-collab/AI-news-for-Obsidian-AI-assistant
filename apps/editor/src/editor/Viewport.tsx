import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { buildScene } from "@nova/engine3d";
import { PhysicsWorld, CharacterBody, createBodyFromNode } from "@nova/physics";
import type { GameScene, SceneNode } from "@nova/shared";
import { flattenSceneNodes } from "./flatten";

export type GizmoMode = "translate" | "rotate" | "scale";

interface ViewportProps {
  scene: GameScene;
  selectedId: string | null;
  gizmoMode: GizmoMode;
  testPlay: boolean;
  onSelect: (id: string | null) => void;
  onTransformChange: (id: string, patch: Partial<Pick<SceneNode, "position" | "rotation" | "scale">>) => void;
}

interface TestPlayState {
  world: PhysicsWorld;
  body: CharacterBody;
}

const keysDown = new Set<string>();

function findByNodeId(root: THREE.Object3D, nodeId: string): THREE.Object3D | undefined {
  let found: THREE.Object3D | undefined;
  root.traverse((obj) => {
    if (!found && obj.userData.nodeId === nodeId) found = obj;
  });
  return found;
}

export function Viewport({ scene, selectedId, gizmoMode, testPlay, onSelect, onTransformChange }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    orbit: OrbitControls;
    transform: TransformControls;
    levelRoot: THREE.Group | null;
    raycaster: THREE.Raycaster;
  } | null>(null);
  const testPlayStateRef = useRef<TestPlayState | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.code);
      if (e.code === "Space") testPlayStateRef.current?.body.jump();
    };
    const onKeyUp = (e: KeyboardEvent) => keysDown.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const container = containerRef.current!;
    const scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color("#1a1d2b");
    scene3d.add(new THREE.GridHelper(80, 80, "#3a3f5c", "#2a2e45"));
    scene3d.add(new THREE.HemisphereLight(0xffffff, 0x33344d, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(20, 30, 10);
    scene3d.add(sun);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 1, 0);

    const transform = new TransformControls(camera, renderer.domElement);
    transform.addEventListener("dragging-changed", (event) => {
      orbit.enabled = !event.value;
    });
    scene3d.add(transform as unknown as THREE.Object3D);

    const raycaster = new THREE.Raycaster();
    threeRef.current = { scene: scene3d, camera, renderer, orbit, transform, levelRoot: null, raycaster };

    const onClick = (event: MouseEvent) => {
      if (testPlayStateRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const root = threeRef.current?.levelRoot;
      if (!root) return;
      const hits = raycaster.intersectObjects(root.children, true);
      const hit = hits.find((h) => h.object.userData.nodeId);
      onSelect(hit ? (hit.object.userData.nodeId as string) : null);
    };
    renderer.domElement.addEventListener("click", onClick);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const play = testPlayStateRef.current;
      if (play) {
        let axisX = 0;
        let axisZ = 0;
        if (keysDown.has("KeyW") || keysDown.has("ArrowUp")) axisZ -= 1;
        if (keysDown.has("KeyS") || keysDown.has("ArrowDown")) axisZ += 1;
        if (keysDown.has("KeyA") || keysDown.has("ArrowLeft")) axisX -= 1;
        if (keysDown.has("KeyD") || keysDown.has("ArrowRight")) axisX += 1;
        const yaw = orbit.getAzimuthalAngle();
        play.body.beginStep();
        play.body.setMoveInput(axisX, axisZ, yaw);
        play.world.step(dt);

        const [x, y, z] = play.body.position;
        const newTarget = new THREE.Vector3(x, y, z);
        const delta = newTarget.clone().sub(orbit.target);
        camera.position.add(delta);
        orbit.target.copy(newTarget);
      }
      orbit.update();
      renderer.render(scene3d, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      transform.dispose();
      orbit.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      threeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the rendered level whenever the authored scene changes.
  useEffect(() => {
    const ctx = threeRef.current;
    if (!ctx) return;
    let cancelled = false;
    (async () => {
      const built = await buildScene(scene);
      if (cancelled || !threeRef.current) return;
      if (threeRef.current.levelRoot) threeRef.current.scene.remove(threeRef.current.levelRoot);
      threeRef.current.scene.add(built.root);
      threeRef.current.levelRoot = built.root;
    })();
    return () => {
      cancelled = true;
    };
  }, [scene]);

  // Keep the transform gizmo attached to the selected object (disabled during test play).
  useEffect(() => {
    const ctx = threeRef.current;
    if (!ctx || testPlay) {
      ctx?.transform.detach();
      return;
    }
    ctx.transform.setMode(gizmoMode);

    const target = selectedId && ctx.levelRoot ? findByNodeId(ctx.levelRoot, selectedId) : undefined;
    if (target) ctx.transform.attach(target);
    else ctx.transform.detach();

    const onChange = () => {
      if (!target || !selectedId) return;
      onTransformChange(selectedId, {
        position: [target.position.x, target.position.y, target.position.z],
        rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
        scale: [target.scale.x, target.scale.y, target.scale.z],
      });
    };
    ctx.transform.addEventListener("objectChange", onChange);
    return () => ctx.transform.removeEventListener("objectChange", onChange);
  }, [selectedId, gizmoMode, testPlay, scene, onTransformChange]);

  // Enter / exit local physics test-play (no server involved - a quick single-player sanity check).
  useEffect(() => {
    if (testPlay) {
      const world = new PhysicsWorld({ gravity: scene.gravity });
      for (const node of flattenSceneNodes(scene.root)) {
        const body = createBodyFromNode(node);
        if (body) world.addBody(body);
      }
      const spawn = flattenSceneNodes(scene.root).find((n) => n.type === "spawn");
      const body = new CharacterBody({ position: spawn ? spawn.position : [0, 3, 0] });
      world.addBody(body.body);
      testPlayStateRef.current = { world, body };
    } else {
      testPlayStateRef.current = null;
    }
  }, [testPlay, scene]);

  return <div className="viewport" ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

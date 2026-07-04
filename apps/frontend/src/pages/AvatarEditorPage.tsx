import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { UsersApi, ShopApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import type { InventoryEntry } from "@nova/shared";

export function AvatarEditorPage() {
  const { user, refreshUser } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bodyMeshRef = useRef<THREE.Mesh | null>(null);
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const [bodyColor, setBodyColor] = useState(user?.avatar.bodyColor ?? "#2e86de");
  const [headColor, setHeadColor] = useState(user?.avatar.headColor ?? "#ffcd94");
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);

  useEffect(() => {
    ShopApi.inventory().then(setInventory);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1b1e2f");
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 4);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.1));
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1, 4, 8), new THREE.MeshStandardMaterial({ color: bodyColor }));
    body.position.y = 0.7;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), new THREE.MeshStandardMaterial({ color: headColor }));
    head.position.y = 1.55;
    scene.add(body, head);
    bodyMeshRef.current = body;
    headMeshRef.current = head;

    let raf = 0;
    const animate = () => {
      body.rotation.y += 0.006;
      head.rotation.y += 0.006;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    (bodyMeshRef.current?.material as THREE.MeshStandardMaterial | undefined)?.color.set(bodyColor);
  }, [bodyColor]);
  useEffect(() => {
    (headMeshRef.current?.material as THREE.MeshStandardMaterial | undefined)?.color.set(headColor);
  }, [headColor]);

  const save = async () => {
    await UsersApi.updateProfile({ avatar: { bodyColor, headColor } } as any);
    await refreshUser();
  };

  return (
    <main className="page">
      <h1>Edytor Awatara</h1>
      <div className="grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="avatar-preview card" ref={containerRef} />
        <div className="card stack" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label>
            Kolor ciala
            <input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} />
          </label>
          <label>
            Kolor glowy
            <input type="color" value={headColor} onChange={(e) => setHeadColor(e.target.value)} />
          </label>
          <button className="btn" onClick={save}>
            Zapisz awatar
          </button>
          <h3>Twoje przedmioty</h3>
          {inventory.length === 0 && <p style={{ color: "var(--text-muted)" }}>Kup przedmioty w sklepie, aby je tu zobaczyc.</p>}
          <ul>
            {inventory.map((entry) => (
              <li key={entry.id}>
                {entry.item.name} {entry.equipped ? "(zalozone)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

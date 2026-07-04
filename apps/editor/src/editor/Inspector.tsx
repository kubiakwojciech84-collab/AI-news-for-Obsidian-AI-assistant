import type { SceneNode } from "@nova/shared";
import { UploadsApi } from "../api/endpoints";

interface InspectorProps {
  node: SceneNode | null;
  onChange: (patch: Partial<SceneNode>) => void;
  onOpenScript: () => void;
}

function Vector3Input({ label, value, onChange }: { label: string; value: [number, number, number]; onChange: (v: [number, number, number]) => void }) {
  return (
    <div>
      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</label>
      <div style={{ display: "flex", gap: "0.3rem" }}>
        {(["x", "y", "z"] as const).map((axis, i) => (
          <input
            key={axis}
            type="number"
            step={0.1}
            value={value[i]}
            onChange={(e) => {
              const next: [number, number, number] = [...value];
              next[i] = parseFloat(e.target.value) || 0;
              onChange(next);
            }}
            style={{ width: "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function Inspector({ node, onChange, onOpenScript }: InspectorProps) {
  if (!node) {
    return (
      <div className="card" style={{ height: "100%" }}>
        <p style={{ color: "var(--text-muted)" }}>Wybierz obiekt na scenie lub w drzewie, aby edytowac jego wlasciwosci.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <label>
        Nazwa
        <input value={node.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>

      <Vector3Input label="Pozycja" value={node.position} onChange={(position) => onChange({ position })} />
      <Vector3Input label="Rotacja (rad)" value={node.rotation} onChange={(rotation) => onChange({ rotation })} />
      <Vector3Input label="Skala" value={node.scale} onChange={(scale) => onChange({ scale })} />

      {node.color !== undefined && (
        <label>
          Kolor
          <input type="color" value={node.color} onChange={(e) => onChange({ color: e.target.value })} />
        </label>
      )}

      {node.type === "model" && (
        <label>
          Model (.glb/.gltf)
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const { url } = await UploadsApi.upload(file);
              onChange({ modelUrl: url });
            }}
          />
          {node.modelUrl && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{node.modelUrl}</p>}
        </label>
      )}

      {node.physics && (
        <fieldset style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0.5rem" }}>
          <legend>Fizyka</legend>
          <label>
            <input type="checkbox" checked={node.physics.enabled} onChange={(e) => onChange({ physics: { ...node.physics!, enabled: e.target.checked } })} />
            Wlaczona
          </label>
          <label style={{ display: "block" }}>
            <input type="checkbox" checked={node.physics.isStatic} onChange={(e) => onChange({ physics: { ...node.physics!, isStatic: e.target.checked } })} />
            Statyczna (nieruchoma)
          </label>
          {!node.physics.isStatic && (
            <label style={{ display: "block" }}>
              Masa
              <input
                type="number"
                value={node.physics.mass}
                onChange={(e) => onChange({ physics: { ...node.physics!, mass: parseFloat(e.target.value) || 0 } })}
              />
            </label>
          )}
        </fieldset>
      )}

      <button className="btn secondary" onClick={onOpenScript}>
        {node.script ? "Edytuj skrypt" : "Dodaj skrypt"}
      </button>
    </div>
  );
}

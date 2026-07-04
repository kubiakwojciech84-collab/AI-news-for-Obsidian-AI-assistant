import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { GameScene, SceneNode } from "@nova/shared";
import { GamesApi } from "../api/endpoints";
import { SceneTree } from "./SceneTree";
import { Viewport, GizmoMode } from "./Viewport";
import { Inspector } from "./Inspector";
import { ScriptEditorModal } from "./ScriptEditorModal";
import { addChildToScene, createDefaultNode, findNode, removeNodeFromScene, updateNodeInScene } from "./sceneState";

const PRIMITIVE_TYPES: SceneNode["type"][] = ["box", "sphere", "cylinder", "plane", "spawn", "checkpoint", "light", "trigger", "model"];

export function EditorWorkspace() {
  const { slug } = useParams();
  const [gameId, setGameId] = useState<string | null>(null);
  const [scene, setScene] = useState<GameScene | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>("translate");
  const [testPlay, setTestPlay] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    GamesApi.get(slug).then((game) => {
      setGameId(game.id);
      setScene(game.scene);
    });
  }, [slug]);

  const patchNode = useCallback(
    (patch: Partial<SceneNode>) => {
      if (!scene || !selectedId) return;
      setScene(updateNodeInScene(scene, selectedId, patch));
    },
    [scene, selectedId]
  );

  const addPrimitive = (type: SceneNode["type"]) => {
    if (!scene) return;
    const node = createDefaultNode(type);
    setScene(addChildToScene(scene, "root", node));
    setSelectedId(node.id);
  };

  const deleteSelected = (id: string) => {
    if (!scene) return;
    setScene(removeNodeFromScene(scene, id));
    if (selectedId === id) setSelectedId(null);
  };

  const publish = async () => {
    if (!scene || !gameId) return;
    setStatus("Publikowanie...");
    await GamesApi.publish(gameId, scene);
    setStatus("Opublikowano! Gra jest teraz grywalna.");
  };

  if (!scene) return <main className="page">Ladowanie projektu...</main>;

  const selectedNode = selectedId ? findNode(scene, selectedId) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="card" style={{ display: "flex", gap: "0.5rem", alignItems: "center", borderRadius: 0, flexWrap: "wrap" }}>
        <strong>NovaStudio</strong>
        <span style={{ color: "var(--text-muted)" }}>/ {slug}</span>
        <select onChange={(e) => e.target.value && addPrimitive(e.target.value as SceneNode["type"])} value="">
          <option value="">+ Dodaj obiekt</option>
          {PRIMITIVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {(["translate", "rotate", "scale"] as GizmoMode[]).map((mode) => (
            <button key={mode} className={`btn ${gizmoMode === mode ? "" : "secondary"}`} onClick={() => setGizmoMode(mode)}>
              {mode}
            </button>
          ))}
        </div>
        <button className={`btn ${testPlay ? "danger" : "secondary"}`} onClick={() => setTestPlay((v) => !v)}>
          {testPlay ? "Zatrzymaj test" : "Testuj gre (WASD + Spacja)"}
        </button>
        <div className="spacer" style={{ flex: 1 }} />
        {status && <span style={{ color: "var(--text-muted)" }}>{status}</span>}
        <button className="btn" onClick={publish}>
          Publikuj
        </button>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "240px 1fr 300px", minHeight: 0 }}>
        <div className="card" style={{ borderRadius: 0 }}>
          <SceneTree root={scene.root} selectedId={selectedId} onSelect={setSelectedId} onDelete={deleteSelected} />
        </div>
        <Viewport
          scene={scene}
          selectedId={selectedId}
          gizmoMode={gizmoMode}
          testPlay={testPlay}
          onSelect={setSelectedId}
          onTransformChange={(id, patch) => setScene((prev) => (prev ? updateNodeInScene(prev, id, patch) : prev))}
        />
        <div style={{ padding: "0.5rem" }}>
          <Inspector node={selectedNode} onChange={patchNode} onOpenScript={() => setScriptOpen(true)} />
        </div>
      </div>

      {scriptOpen && selectedNode && (
        <ScriptEditorModal initialScript={selectedNode.script ?? ""} onSave={(script) => patchNode({ script })} onClose={() => setScriptOpen(false)} />
      )}
    </div>
  );
}

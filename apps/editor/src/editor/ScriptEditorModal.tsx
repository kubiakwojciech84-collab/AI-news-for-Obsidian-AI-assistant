import { useState } from "react";
import { EXAMPLE_SCRIPT } from "@nova/engine3d";

interface ScriptEditorModalProps {
  initialScript: string;
  onSave: (script: string) => void;
  onClose: () => void;
}

export function ScriptEditorModal({ initialScript, onSave, onClose }: ScriptEditorModalProps) {
  const [code, setCode] = useState(initialScript || EXAMPLE_SCRIPT);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div className="card" style={{ width: "min(700px, 90vw)", height: "min(500px, 80vh)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h3>Skrypt obiektu</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Dostepne w skrypcie: <code>onStart(api)</code>, <code>onUpdate(api)</code>, gdzie <code>api</code> daje dostep do{" "}
          <code>object3D</code>, <code>time</code>, <code>deltaTime</code>, <code>input.isDown(code)</code>, <code>emit(name, payload)</code>.
        </p>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, fontFamily: "monospace", fontSize: "0.85rem", resize: "none" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button className="btn secondary" onClick={onClose}>
            Anuluj
          </button>
          <button
            className="btn"
            onClick={() => {
              onSave(code);
              onClose();
            }}
          >
            Zapisz skrypt
          </button>
        </div>
      </div>
    </div>
  );
}

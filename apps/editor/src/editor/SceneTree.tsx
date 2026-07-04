import type { SceneNode } from "@nova/shared";

interface SceneTreeProps {
  root: SceneNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function TreeItem({ node, depth, selectedId, onSelect, onDelete }: SceneTreeProps & { depth: number }) {
  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        style={{
          paddingLeft: depth * 14 + 8,
          padding: "0.25rem 0.5rem",
          cursor: "pointer",
          background: selectedId === node.id ? "var(--accent)" : "transparent",
          borderRadius: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
        }}
      >
        <span>
          {iconFor(node.type)} {node.name}
        </span>
        {node.id !== "root" && (
          <button
            className="btn danger"
            style={{ padding: "0 0.4rem", fontSize: "0.7rem" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            x
          </button>
        )}
      </div>
      {node.children.map((child) => (
        <TreeItem key={child.id} root={child} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

function iconFor(type: SceneNode["type"]): string {
  switch (type) {
    case "box":
      return "🧊";
    case "sphere":
      return "🔵";
    case "cylinder":
      return "🛢️";
    case "plane":
      return "▭";
    case "model":
      return "📦";
    case "spawn":
      return "🚩";
    case "checkpoint":
      return "🏁";
    case "light":
      return "💡";
    case "trigger":
      return "⚡";
    default:
      return "📁";
  }
}

export function SceneTree({ root, selectedId, onSelect, onDelete }: SceneTreeProps) {
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <TreeItem root={root} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} depth={0} />
    </div>
  );
}

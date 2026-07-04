import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { ProjectPickerPage } from "./pages/ProjectPickerPage";
import { EditorWorkspace } from "./editor/EditorWorkspace";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <ProjectPickerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/editor/:slug"
        element={
          <RequireAuth>
            <EditorWorkspace />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

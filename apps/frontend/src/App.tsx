import { Routes, Route } from "react-router-dom";
import { UserRole } from "@nova/shared";
import { Navbar } from "./components/Navbar";
import { ChatWidget } from "./components/ChatWidget";
import { RequireAuth } from "./auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GamesListPage } from "./pages/GamesListPage";
import { GamePlayPage } from "./pages/GamePlayPage";
import { FriendsPage } from "./pages/FriendsPage";
import { GroupsPage } from "./pages/GroupsPage";
import { AvatarEditorPage } from "./pages/AvatarEditorPage";
import { InventoryPage } from "./pages/InventoryPage";
import { ShopPage } from "./pages/ShopPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { ModeratorPanelPage } from "./pages/ModeratorPanelPage";
import { DocsPage } from "./pages/DocsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/games" element={<GamesListPage />} />
        <Route
          path="/games/:slug"
          element={
            <RequireAuth>
              <GamePlayPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route
          path="/friends"
          element={
            <RequireAuth>
              <FriendsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/groups"
          element={
            <RequireAuth>
              <GroupsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/avatar"
          element={
            <RequireAuth>
              <AvatarEditorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/inventory"
          element={
            <RequireAuth>
              <InventoryPage />
            </RequireAuth>
          }
        />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={[UserRole.ADMIN]}>
              <AdminPanelPage />
            </RequireAuth>
          }
        />
        <Route
          path="/moderator"
          element={
            <RequireAuth roles={[UserRole.MODERATOR, UserRole.ADMIN]}>
              <ModeratorPanelPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ChatWidget />
    </div>
  );
}

import { Link } from "react-router-dom";
import { UserRole } from "@nova/shared";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        NovaWorlds
      </Link>
      <nav>
        <Link to="/games">Gry</Link>
        <Link to="/shop">Sklep</Link>
        <Link to="/inventory">Ekwipunek</Link>
        <Link to="/avatar">Awatar</Link>
        <Link to="/achievements">Osiagniecia</Link>
        <Link to="/leaderboard">Ranking</Link>
        <Link to="/friends">Znajomi</Link>
        <Link to="/groups">Grupy</Link>
        <Link to="/docs">Dokumentacja</Link>
        {user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN ? <Link to="/moderator">Moderacja</Link> : null}
        {user?.role === UserRole.ADMIN ? <Link to="/admin">Admin</Link> : null}
      </nav>
      <div className="spacer" />
      {user ? (
        <>
          <span className="coins">{user.coins} monet</span>
          <Link to="/profile">{user.displayName || user.username}</Link>
          <button className="btn secondary" onClick={logout}>
            Wyloguj
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Zaloguj</Link>
          <Link to="/register" className="btn">
            Zarejestruj
          </Link>
        </>
      )}
    </header>
  );
}

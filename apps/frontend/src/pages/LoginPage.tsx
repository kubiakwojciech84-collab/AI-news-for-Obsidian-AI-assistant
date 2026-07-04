import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Nie udalo sie zalogowac");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <h1>Logowanie</h1>
      <form className="stack" onSubmit={onSubmit}>
        <input placeholder="Nazwa uzytkownika lub email" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} required />
        <input placeholder="Haslo" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <span style={{ color: "var(--danger)" }}>{error}</span>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logowanie..." : "Zaloguj"}
        </button>
      </form>
      <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
        Domyslne konta demo: <code>admin / Admin123!</code> oraz <code>moderator / Moderator123!</code>
      </p>
    </main>
  );
}

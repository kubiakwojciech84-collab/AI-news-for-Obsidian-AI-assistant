import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(usernameOrEmail, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Logowanie nie powiodlo sie");
    }
  };

  return (
    <main className="page">
      <h1>NovaStudio - logowanie</h1>
      <form className="stack" onSubmit={onSubmit}>
        <input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="Nazwa uzytkownika" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Haslo" />
        {error && <span style={{ color: "var(--danger)" }}>{error}</span>}
        <button className="btn" type="submit">
          Zaloguj
        </button>
      </form>
      <p style={{ color: "var(--text-muted)" }}>
        Uzyj tego samego konta co na glownej platformie, np. <code>admin / Admin123!</code>
      </p>
    </main>
  );
}

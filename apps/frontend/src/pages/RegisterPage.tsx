import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Nie udalo sie zarejestrowac");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <h1>Rejestracja</h1>
      <form className="stack" onSubmit={onSubmit}>
        <input placeholder="Nazwa uzytkownika" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Haslo (min. 8 znakow)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <span style={{ color: "var(--danger)" }}>{error}</span>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Tworzenie konta..." : "Zarejestruj"}
        </button>
      </form>
    </main>
  );
}

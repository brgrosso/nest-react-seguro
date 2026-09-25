import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth-context";

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@seguro.local");
  const [password, setPassword] = useState("ChangeMe_Admin1!");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const user = await api.login(email, password);
      setUser(user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar");
    }
  }

  return (
    <main className="page">
      <h2>Entrar</h2>
      <p>
        La sesión va en cookies httpOnly. El JS no puede leer el token; por eso
        no hay nada en localStorage.
      </p>
      <form className="card" onSubmit={(event) => void onSubmit(event)}>
        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tenés cuenta? <Link to="/register">Crear una</Link>
      </p>
    </main>
  );
}

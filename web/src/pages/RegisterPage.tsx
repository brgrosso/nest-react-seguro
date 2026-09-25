import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.register(email, password);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    }
  }

  return (
    <main className="page">
      <h2>Crear cuenta</h2>
      <p>
        Mínimo 10 caracteres, con mayúscula, minúscula y número. El hash se
        guarda con scrypt; la contraseña nunca entra al log de auditoría.
      </p>
      <form className="card" onSubmit={(event) => void onSubmit(event)}>
        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Crear</button>
      </form>
      <p>
        ¿Ya tenés cuenta? <Link to="/login">Entrar</Link>
      </p>
    </main>
  );
}

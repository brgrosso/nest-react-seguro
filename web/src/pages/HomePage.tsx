import { useAuth } from "../auth-context";

export function HomePage() {
  const { user } = useAuth();

  return (
    <main className="page">
      <h2>Tu sesión</h2>
      <p>
        {user?.email} · rol <strong>{user?.role}</strong>
      </p>
      <ul className="notes">
        <li>Access token: cookie httpOnly, 15 minutos.</li>
        <li>Refresh token: cookie httpOnly, 7 días, rotado y hasheado en DB.</li>
        <li>Un USER no puede ver /admin ni GET /users.</li>
        <li>
          El login está limitado a 5 intentos por minuto y bloquea 15 minutos
          después de 5 fallos.
        </li>
      </ul>
    </main>
  );
}

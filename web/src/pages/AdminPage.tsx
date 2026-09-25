import { useEffect, useState } from "react";
import { api, type AuditRow } from "../api";

export function AdminPage() {
  const [users, setUsers] = useState<
    Array<{ id: string; email: string; role: string; createdAt: string }>
  >([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.users(), api.audit()])
      .then(([nextUsers, nextAudit]) => {
        setUsers(nextUsers);
        setAudit(nextAudit);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Sin permiso");
      });
  }, []);

  return (
    <main className="page">
      <h2>Admin</h2>
      <p>Solo rol ADMIN. El API responde 403 si un USER pega a estas rutas.</p>
      {error ? <p className="error">{error}</p> : null}

      <h3>Usuarios</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((row) => (
            <tr key={row.id}>
              <td>{row.email}</td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Auditoría</h3>
      <table>
        <thead>
          <tr>
            <th>Acción</th>
            <th>Email</th>
            <th>IP</th>
            <th>Cuando</th>
          </tr>
        </thead>
        <tbody>
          {audit.map((row) => (
            <tr key={row.id}>
              <td>{row.action}</td>
              <td>{row.user?.email ?? "—"}</td>
              <td>{row.ip ?? "—"}</td>
              <td>{new Date(row.createdAt).toLocaleString("es-AR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth-context";

export function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await api.logout();
    setUser(null);
    navigate("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Starter seguro por defecto</p>
          <h1>nest-react-seguro</h1>
        </div>
        <nav>
          {user ? (
            <>
              <NavLink to="/" end className={navClass}>
                Cuenta
              </NavLink>
              {user.role === "ADMIN" ? (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              ) : null}
              <button type="button" className="link-btn" onClick={() => void logout()}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Entrar
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Crear cuenta
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link active" : "nav-link";
}

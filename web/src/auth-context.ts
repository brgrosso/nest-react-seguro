import { createContext, useContext } from "react";
import type { AuthUser } from "./api";

export const AuthContext = createContext<{
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}>({ user: null, setUser: () => undefined });

export function useAuth() {
  return useContext(AuthContext);
}

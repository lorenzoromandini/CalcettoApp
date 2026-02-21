"use client";

import * as React from "react";
import { createContext, useContext } from "react";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  image: string | null;
}

interface SessionContextType {
  data: { user: SessionUser | null };
  isLoading: boolean;
  update: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  data: { user: null },
  isLoading: true,
  update: async () => {},
  logout: async () => {},
  signOut: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

function parseToken(token: string): SessionUser | null {
  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<{ user: SessionUser | null }>({ user: null });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const user = parseToken(token);
      setSession({ user });
    }
    setIsLoading(false);
  }, []);

  const update = React.useCallback(async () => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const user = parseToken(token);
      setSession({ user });
    } else {
      setSession({ user: null });
    }
  }, []);

  const logout = React.useCallback(async () => {
    localStorage.removeItem("auth-token");
    setSession({ user: null });
    window.location.href = "/";
  }, []);

  const signOut = logout;

  return (
    <SessionContext.Provider value={{ data: session, isLoading, update, logout, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

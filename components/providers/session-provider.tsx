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
  update: (userData?: { firstName?: string | null; lastName?: string | null; nickname?: string | null; image?: string | null }) => Promise<void>;
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
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const userId = decoded;
    
    return {
      id: userId,
      email: '',
      firstName: null,
      lastName: null,
      nickname: null,
      image: null,
    };
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<{ user: SessionUser | null }>({ user: null });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const userDataStr = localStorage.getItem("user-data");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setSession({ user: userData });
      } catch {
        const token = localStorage.getItem("auth-token");
        if (token) {
          const user = parseToken(token);
          setSession({ user });
        }
      }
    } else {
      const token = localStorage.getItem("auth-token");
      if (token) {
        const user = parseToken(token);
        setSession({ user });
      }
    }
    setIsLoading(false);
  }, []);

  const update = React.useCallback(async (userData?: { firstName?: string | null; lastName?: string | null; nickname?: string | null; image?: string | null }) => {
    const userDataStr = localStorage.getItem("user-data");
    let currentUser: SessionUser | null = null;
    
    if (userDataStr) {
      try {
        currentUser = JSON.parse(userDataStr);
      } catch {
        const token = localStorage.getItem("auth-token");
        if (token) {
          currentUser = parseToken(token);
        }
      }
    } else {
      const token = localStorage.getItem("auth-token");
      if (token) {
        currentUser = parseToken(token);
      }
    }
    
    if (currentUser && userData) {
      const updatedUser: SessionUser = {
        ...currentUser,
        firstName: userData.firstName ?? currentUser.firstName,
        lastName: userData.lastName ?? currentUser.lastName,
        nickname: userData.nickname ?? currentUser.nickname,
        image: userData.image ?? currentUser.image,
      };
      localStorage.setItem("user-data", JSON.stringify(updatedUser));
      setSession({ user: updatedUser });
    } else if (currentUser) {
      setSession({ user: currentUser });
    } else {
      setSession({ user: null });
    }
  }, []);

  const logout = React.useCallback(async () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
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

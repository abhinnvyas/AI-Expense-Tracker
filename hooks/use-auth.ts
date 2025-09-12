"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiLogin,
  apiRegister,
  getToken,
  setToken,
  setUser,
  getUser,
  logout,
} from "@/lib/api";
import type { LoginResponse, User } from "@/lib/types";

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    setTokenState(storedToken);
    setUserState(storedUser);
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password });
    if (res.status && res.data) {
      const { user, token } = res.data as LoginResponse;
      setToken(token);
      setUser(user);
      setTokenState(token);
      setUserState(user);
      return user;
    } else {
      throw new Error(res.message || "Login failed");
    }
  }

  async function register(input: {
    name: string;
    email: string;
    password: string;
    monthlyBudget: number;
  }) {
    const res = await apiRegister(input);
    if (res.status) {
      const data = res.data as
        | LoginResponse
        | { user: User; token?: string }
        | undefined;
      if (data && "token" in (data || {}) && data?.token) {
        setToken((data as LoginResponse).token);
        setTokenState((data as LoginResponse).token);
      }
      if (data && "user" in (data || {})) {
        setUser((data as any).user);
        setUserState((data as any).user);
      }
      return data;
    } else {
      throw new Error(res.message || "Registration failed");
    }
  }

  function signOut() {
    logout();
    setTokenState(null);
    setUserState(null);
    router.push("/");
  }

  function useAuthGuard() {
    useEffect(() => {
      if (!loading && !token) {
        router.push("/");
      }
    }, [loading, token]);

    return { isAuthenticated: !!token, loading };
  }

  return { user, token, loading, login, register, signOut, useAuthGuard };
}

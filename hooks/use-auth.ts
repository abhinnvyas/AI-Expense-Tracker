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
    console.log("[v0] useAuth login called with email:", email);
    const res = await apiLogin({ email, password });
    console.log("[v0] API login response:", res);
    if (res.status && res.data) {
      const { user, token } = res.data as LoginResponse;
      console.log("[v0] Setting token and user:", {
        user: user.name,
        token: token.substring(0, 10) + "...",
      });
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
    console.log("[v0] useAuth register called with:", {
      name: input.name,
      email: input.email,
    });
    const res = await apiRegister(input);
    console.log("[v0] API register response:", res);
    if (res.status) {
      const data = res.data as
        | LoginResponse
        | { user: User; token?: string }
        | undefined;
      if (data && "token" in (data || {}) && data?.token) {
        console.log("[v0] Registration returned token, auto-logging in");
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

  async function signOut() {
    setUser(null);
    setTokenState(null);
    setUserState(null);
    logout();
    router.refresh();
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

"use client"
import { apiLogin, apiRegister, getToken, setToken, setUser, getUser, logout } from "@/lib/api"
import type { LoginResponse, User } from "@/lib/types"

export function useAuth() {
  const user = getUser()
  const token = getToken()

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password })
    if (res.status && res.data) {
      const { user, token } = res.data as LoginResponse
      setToken(token)
      setUser(user)
      return user
    } else {
      throw new Error(res.message || "Login failed")
    }
  }

  async function register(input: {
    name: string
    email: string
    password: string
    monthlyBudget: number
  }) {
    const res = await apiRegister(input)
    if (res.status) {
      // Some APIs return token on register; if not, ask user to login.
      const data = res.data as LoginResponse | { user: User; token?: string } | undefined
      if (data && "token" in (data || {}) && data?.token) {
        setToken((data as LoginResponse).token)
      }
      if (data && "user" in (data || {})) {
        setUser((data as any).user)
      }
      return data
    } else {
      throw new Error(res.message || "Registration failed")
    }
  }

  function signOut() {
    logout()
    // allow caller to navigate
  }

  return { user, token, login, register, signOut }
}

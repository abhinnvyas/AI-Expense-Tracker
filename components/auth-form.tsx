"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [monthlyBudget, setMonthlyBudget] = useState<number>(20000)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  async function onSubmit() {
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register({ name, email, password, monthlyBudget })
      }
      router.replace("/")
    } catch (e: any) {
      alert(e?.message || "Auth error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm p-4">
      <div className="mb-4 flex items-center justify-center gap-1 rounded-full bg-[#11161C] border border-gray-800 p-1">
        <button
          className={`w-1/2 rounded-full py-1 text-sm ${mode === "login" ? "bg-blue-600 text-white" : "text-gray-400"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`w-1/2 rounded-full py-1 text-sm ${mode === "register" ? "bg-blue-600 text-white" : "text-gray-400"}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <div className="rounded-2xl bg-[#0B0F14] border border-gray-800 p-4">
        {mode === "register" && (
          <>
            <label className="text-xs text-gray-400">Name</label>
            <Input className="mt-1 mb-3 bg-transparent" value={name} onChange={(e) => setName(e.target.value)} />
          </>
        )}

        <label className="text-xs text-gray-400">Email</label>
        <Input
          className="mt-1 mb-3 bg-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <label className="text-xs text-gray-400">Password</label>
        <Input
          className="mt-1 mb-3 bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        {mode === "register" && (
          <>
            <label className="text-xs text-gray-400">Monthly Budget</label>
            <Input
              className="mt-1 mb-3 bg-transparent"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              type="number"
            />
          </>
        )}

        <Button className="w-full" onClick={onSubmit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
        </Button>
      </div>
    </div>
  )
}

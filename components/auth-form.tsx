"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(20000);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  async function onSubmit() {
    console.log("[v0] Form submit clicked, mode:", mode);
    console.log("[v0] Form values:", {
      email,
      password: password ? "***" : "empty",
      name,
    });

    if (!email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        console.log("[v0] Starting login process");
        const result = await login(email, password);
        console.log("[v0] Login successful, result:", result);
        window.location.reload();
      } else {
        console.log("[v0] Starting registration process");
        if (!name) {
          alert("Name is required for registration");
          setLoading(false);
          return;
        }
        await register({ name, email, password, monthlyBudget });
        console.log("[v0] Registration successful, switching to login mode");
        setName("");
        setPassword("");
        setMonthlyBudget(20000);
        setMode("login");
        alert(
          "Account created successfully! Please login with your credentials."
        );
      }
    } catch (e: any) {
      console.log("[v0] Auth error:", e?.message);
      alert(e?.message || "Auth error");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <div className="mx-auto max-w-sm p-4">
      <div className="mb-4 flex items-center justify-center gap-1 rounded-full bg-[#11161C] border border-gray-800 p-1">
        <button
          className={`w-1/2 rounded-full py-1 text-sm ${
            mode === "login" ? "bg-blue-600 text-white" : "text-gray-400"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`w-1/2 rounded-full py-1 text-sm ${
            mode === "register" ? "bg-blue-600 text-white" : "text-gray-400"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#0B0F14] border border-gray-800 p-4"
      >
        {mode === "register" && (
          <>
            <label className="text-xs text-gray-400">Name</label>
            <Input
              className="mt-1 mb-3 bg-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === "register"}
            />
          </>
        )}

        <label className="text-xs text-gray-400">Email</label>
        <Input
          className="mt-1 mb-3 bg-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label className="text-xs text-gray-400">Password</label>
        <Input
          className="mt-1 mb-3 bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        {mode === "register" && (
          <>
            <label className="text-xs text-gray-400">Monthly Budget</label>
            <Input
              className="mt-1 mb-3 bg-transparent"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              type="number"
              required={mode === "register"}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "login"
            ? "Login"
            : "Create account"}
        </Button>
      </form>
    </div>
  );
}

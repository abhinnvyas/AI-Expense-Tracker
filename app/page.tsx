"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { getBaseUrl } from "../lib/api";
import { TopBar } from "../components/top-bar";
import { AuthForm } from "../components/auth-form";
import { BalanceCards } from "../components/balance-cards";
import { ChatExpense } from "../components/chat-expense";

export default function HomePage() {
  const { user, token } = useAuth();

  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setApiConfigured(!!getBaseUrl());
    const i = setInterval(() => setApiConfigured(!!getBaseUrl()), 500);
    return () => clearInterval(i);
  }, []);

  if (!mounted || apiConfigured === null) {
    return (
      <main className="min-h-dvh bg-[#0B0F14] text-gray-100">
        <TopBar />
        <div
          className="mx-auto max-w-sm p-4 text-center text-sm text-gray-400"
          aria-live="polite"
        >
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#0B0F14] text-gray-100">
      <TopBar />
      {!apiConfigured ? (
        <div className="mx-auto max-w-sm p-4 text-center text-sm text-amber-300">
          Please open Settings and set your API Base URL to continue.
        </div>
      ) : !token ? (
        <div className="pt-8">
          <h1 className="text-center text-2xl font-semibold text-white">
            AI Expense Tracker
          </h1>
          <p className="mt-1 text-center text-gray-400 text-sm">
            Login or create an account to start tracking.
          </p>
          <AuthForm />
        </div>
      ) : (
        <>
          <BalanceCards />
          <ChatExpense />
        </>
      )}
    </main>
  );
}

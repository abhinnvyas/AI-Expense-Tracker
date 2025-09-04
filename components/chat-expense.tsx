"use client";

import useSWR from "swr";
import { apiCreateExpense, apiGetExpenses } from "../lib/api";
import type { Expense } from "../lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExpenseAIBubble, ExpenseUserBubble } from "./expense-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mutate as globalMutate } from "swr";
import { ChatExpenseSkeleton } from "./skeleton-loader";

export function ChatExpense() {
  const { data, isLoading, mutate } = useSWR("expenses", apiGetExpenses, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 3000, // Prevent duplicate requests for 3 seconds
    refreshInterval: 0, // Disable automatic refresh
  });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const expenses = data?.data || [];

  const thread = useMemo(() => {
    const messages: Array<{
      role: "user" | "ai";
      expense?: Expense;
      text?: string;
      key: string;
    }> = [];

    // Reverse the expenses so we render oldest -> newest (newest at the bottom)
    const ordered = [...expenses].reverse();

    for (const exp of ordered) {
      messages.push({
        role: "user",
        text: exp.description,
        key: `${exp.id}-u`,
      });
      messages.push({ role: "ai", expense: exp, key: `${exp.id}-a` });
    }
    return messages;
  }, [expenses]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [thread.length, sending]);

  async function onSend() {
    const desc = input.trim();
    if (!desc) return;
    setSending(true);
    try {
      const res = await apiCreateExpense(desc);
      if (res.status && res.data) {
        await Promise.all([
          mutate(),
          globalMutate("balance"),
          globalMutate("budget"),
        ]);
      } else {
        alert(res.message || "Failed to create expense");
      }
    } catch (e: any) {
      alert(e?.message || "Error");
    } finally {
      setInput("");
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 pb-28">
      <div
        ref={scrollerRef}
        className="mt-4 h-[56vh] overflow-y-auto rounded-2xl bg-[#0B0F14] border border-gray-800 p-3"
      >
        {isLoading ? (
          <ChatExpenseSkeleton />
        ) : thread.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Start by typing a note like {'"1200 tripod"'} or {'"Coffee 250"'}.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {thread.map((m) =>
              m.role === "user" ? (
                <ExpenseUserBubble key={m.key} text={m.text!} />
              ) : (
                <ExpenseAIBubble
                  key={m.key}
                  expense={m.expense!}
                  onChanged={async () => {
                    await Promise.all([
                      mutate(),
                      globalMutate("balance"),
                      globalMutate("budget"),
                    ]);
                  }}
                  onDeleted={async () => {
                    await Promise.all([
                      mutate(),
                      globalMutate("balance"),
                      globalMutate("budget"),
                    ]);
                  }}
                />
              )
            )}
            {sending && (
              <>
                <ExpenseUserBubble text={input} />
                <div className="text-xs text-gray-500 px-2">AI is parsing…</div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-0 right-0">
        <div className="mx-auto max-w-xl px-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#11161C] border border-gray-800 p-2">
            <Input
              placeholder='Describe your expense (e.g., "1200 tripod")'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
              className="bg-transparent border-none text-gray-100 placeholder:text-gray-500"
            />
            <Button onClick={onSend} disabled={sending}>
              {sending ? "Adding…" : "Add"}
            </Button>
          </div>
          <div className="mt-2 text-center text-[11px] text-gray-500">
            Tip: Just type an amount + what it was. The AI extracts value and
            category automatically.
          </div>
        </div>
      </div>
    </section>
  );
}

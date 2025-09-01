"use client"

import type { Expense } from "@/lib/types"
import { formatCurrency } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { apiDeleteExpense, apiUpdateExpense } from "@/lib/api"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ExpenseUserBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full justify-end">
      <div className="max-w-[80%] rounded-2xl bg-blue-600 text-white px-3 py-2 text-sm shadow">{text}</div>
    </div>
  )
}

export function ExpenseAIBubble({
  expense,
  onChanged,
  onDeleted,
}: {
  expense: Expense
  onChanged: (exp: Expense) => void
  onDeleted: (id: string) => void
}) {
  const [saving, setSaving] = useState(false)

  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[80%] rounded-2xl bg-[#0F151B] border border-gray-800 text-gray-100 px-3 py-2 text-sm shadow w-full">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-gray-300">
              {`I logged ${formatCurrency(expense.amount)} for “${expense.description}”.`}
            </div>
            <div className="mt-1 text-xs text-emerald-400">Category: {expense.category}</div>
            <div className="mt-1 text-[10px] text-gray-500">{new Date(expense.createdAt).toLocaleString()}</div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  const next = prompt("New category", expense.category)
                  if (!next) return
                  setSaving(true)
                  const res = await apiUpdateExpense(expense.id, { category: next })
                  if (res.status && res.data) onChanged(res.data)
                  setSaving(false)
                }}
              >
                Edit category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const next = prompt("New amount", String(expense.amount))
                  const amt = Number(next)
                  if (!Number.isFinite(amt)) return
                  setSaving(true)
                  const res = await apiUpdateExpense(expense.id, { amount: amt })
                  if (res.status && res.data) onChanged(res.data)
                  setSaving(false)
                }}
              >
                Edit amount
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={async () => {
                  setSaving(true)
                  await apiDeleteExpense(expense.id)
                  onDeleted(expense.id)
                  setSaving(false)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

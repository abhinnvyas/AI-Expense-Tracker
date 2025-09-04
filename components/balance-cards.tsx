"use client";

import useSWR from "swr";
import {
  apiGetAvailableBalance,
  apiGetUserBudget,
  apiUpdateBudget,
} from "../lib/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BalanceCardsSkeleton } from "./skeleton-loader";

const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatInt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

export function BalanceCards() {
  const {
    data: balRes,
    isLoading: balLoading,
    mutate: mutateBal,
  } = useSWR("balance", apiGetAvailableBalance, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Prevent duplicate requests for 5 seconds
  });

  const {
    data: budRes,
    isLoading: budLoading,
    mutate: mutateBud,
  } = useSWR("budget", apiGetUserBudget, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const balance = balRes?.data;
  const budget = budRes?.data?.monthlyBudget ?? balance?.budget;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(budget || 0);

  const loading = balLoading || budLoading;

  if (loading) {
    return <BalanceCardsSkeleton />;
  }

  return (
    <section className="mx-auto max-w-xl px-4 pt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-[#11161C] border border-gray-800 p-4">
        <div className="text-xs text-gray-400">Available</div>
        <div
          className="mt-1 text-2xl font-semibold text-white"
          suppressHydrationWarning
        >
          {formatUSD(balance?.availableBalance || 0)}
        </div>
        <div className="mt-1 text-xs text-emerald-400" suppressHydrationWarning>
          Spent {formatUSD(balance?.totalExpenses || 0)} this period
        </div>
      </div>

      <div className="rounded-2xl bg-[#11161C] border border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">Budget</div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="bg-[#1F2937] text-gray-100 h-6 px-2 text-xs"
              >
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Monthly Budget</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    await apiUpdateBudget(value);
                    await Promise.all([mutateBud(), mutateBal()]);
                    setOpen(false);
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div
          className="mt-1 text-2xl font-semibold text-white"
          suppressHydrationWarning
        >
          {formatUSD(budget || 0)}
        </div>
        <div className="mt-1 text-xs text-blue-400" suppressHydrationWarning>
          {formatInt(
            Math.max(0, (budget || 0) - (balance?.totalExpenses || 0))
          )}{" "}
          left to allocate
        </div>
      </div>
    </section>
  );
}

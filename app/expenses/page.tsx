"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopBar } from "@/components/top-bar";
import {
  apiGetExpensesByDate,
  formatCurrency,
  apiDeleteExpense,
  apiUpdateExpense,
} from "@/lib/api";
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { mutate as globalMutate } from "swr";
import Link from "next/link";
import type { Expense } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function ExpensesPage() {
  const { useAuthGuard } = useAuth();
  const { isAuthenticated, loading: authLoading } = useAuthGuard();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const [hasFilters, setHasFilters] = useState(false);

  const { data: categoriesData } = useSWR(
    "available-categories",
    () => apiGetExpensesByDate({}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const availableCategories = categoriesData?.data?.categories || [];

  useEffect(() => {
    setHasFilters(
      Boolean(startDate || endDate || selectedCategory !== "all" || searchTerm)
    );
  }, [startDate, endDate, selectedCategory, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, mutate } = useSWR(
    shouldFetch || hasFilters
      ? [
          "expenses-by-date",
          startDate,
          endDate,
          selectedCategory,
          debouncedSearch,
        ]
      : null,
    () => {
      console.log("[v0] Fetching expenses with params:", {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
      });
      return apiGetExpensesByDate({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onSuccess: (data) => {
        console.log("[v0] API Response:", data);
        console.log("[v0] Expenses found:", data?.data?.expenses?.length || 0);
        if (debouncedSearch) {
          console.log("[v0] Search term:", debouncedSearch);
          console.log(
            "[v0] Matching expenses:",
            data?.data?.expenses?.map((e) => ({
              description: e.description,
              category: e.category,
            }))
          );
        }
      },
      onError: (error) => {
        console.error("[v0] API Error:", error);
      },
    }
  );

  const expensesData = data?.data;
  const expenses = expensesData?.expenses || [];

  const handleExpenseDelete = async (id: string) => {
    try {
      await apiDeleteExpense(id);
      await Promise.all([
        mutate(),
        globalMutate("balance"),
        globalMutate("budget"),
        globalMutate("today-expenses"),
        globalMutate("expenses"),
      ]);
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleExpenseUpdate = async (id: string) => {
    setUpdateLoading(true);
    try {
      const response = await apiUpdateExpense(id, {
        amount: Number(editAmount),
        category: editCategory,
      });
      if (response.status) {
        await Promise.all([
          mutate(),
          globalMutate("balance"),
          globalMutate("budget"),
          globalMutate("today-expenses"),
          globalMutate("expenses"),
        ]);
        setEditingExpense(null);
      } else {
        alert(response.message || "Failed to update expense");
      }
    } catch (error: any) {
      alert(error.message || "Error updating expense");
    } finally {
      setUpdateLoading(false);
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense.id);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category || "");
  };

  const cancelEditing = () => {
    setEditingExpense(null);
    setEditAmount("");
    setEditCategory("");
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCategory("all");
    setSearchTerm("");
    setDebouncedSearch("");
    setShouldFetch(false);
  };

  const loadAllExpenses = () => {
    setShouldFetch(true);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-dvh bg-[#0B0F14] text-gray-100">
      <TopBar />

      <div className="mx-auto max-w-xl px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">All Expenses</h1>
            <p className="text-sm text-gray-400">
              {expensesData
                ? `${expensesData.totalCount} expenses found`
                : shouldFetch || hasFilters
                ? "Loading..."
                : "Use filters or search to find expenses"}
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-transparent text-gray-300"
            >
              Back
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-[#0F151B] border border-gray-800 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters</span>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses... (try: coffee, lunch, gas, groceries)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0B0F14] border-gray-700 text-white text-sm"
              />
            </div>
            <div className="h-4 mt-1 flex items-center">
              {searchTerm && (
                <div className="text-xs text-gray-500">
                  Searching for: "{searchTerm}"
                  {debouncedSearch && data && (
                    <span className="ml-2 text-blue-400">
                      ({expenses.length} results)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                From Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
                className="bg-[#0B0F14] border-gray-700 text-white text-sm w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                To Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={today}
                className="bg-[#0B0F14] border-gray-700 text-white text-sm w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-[#0B0F14] border-gray-700 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F151B] border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="rounded-2xl bg-[#0F151B] border border-gray-800 p-4">
          {!shouldFetch && !hasFilters ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-600" />
              <p className="text-sm mb-3">
                Use the filters above to find expenses or
              </p>
              <Button
                onClick={loadAllExpenses}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Load All Expenses
              </Button>
              <div className="mt-4 text-xs text-gray-600">
                <p className="mb-1">Search examples:</p>
                <p>• "coffee" - finds coffee shop purchases</p>
                <p>• "lunch" - finds lunch expenses</p>
                <p>• "gas" or "fuel" - finds gas station visits</p>
                <p>• "grocery" - finds grocery store purchases</p>
                <p>• "uber" or "taxi" - finds ride expenses</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-800 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">
                {searchTerm ||
                startDate ||
                endDate ||
                selectedCategory !== "all"
                  ? "No expenses found with current filters"
                  : "No expenses found"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense: Expense) => (
                <div
                  key={expense.id}
                  className="p-3 rounded-lg bg-[#0B0F14] border border-gray-800"
                >
                  {editingExpense === expense.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Amount"
                          type="number"
                          className="bg-[#0F151B] border-gray-600 text-white text-sm"
                        />
                        <Input
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Category"
                          className="bg-[#0F151B] border-gray-600 text-white text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExpenseUpdate(expense.id)}
                          disabled={updateLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-600 text-gray-300 bg-transparent"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                            {expense.category || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 truncate mb-1">
                          {expense.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(expense)}
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-950"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpenseDelete(expense.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import useSWR from "swr";
import { TopBar } from "@/components/top-bar";
import { apiGetExpenses, formatCurrency } from "@/lib/api";
import type { Expense } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#6B7280",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

export default function DashboardPage() {
  const { data } = useSWR("expenses", apiGetExpenses);
  const expenses: Expense[] = data?.data || [];

  const byCategory = Object.values(
    expenses.reduce((acc: any, e) => {
      const key = e.category || "Uncategorized";
      acc[key] = acc[key] || { name: key, value: 0 };
      acc[key].value += e.amount;
      return acc;
    }, {})
  );

  const byDay = Object.values(
    expenses.reduce((acc: any, e) => {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      acc[key] = acc[key] || { date: key, amount: 0 };
      acc[key].amount += e.amount;
      return acc;
    }, {})
  ).sort((a: any, b: any) => (a.date < b.date ? -1 : 1));

  return (
    <main className="min-h-dvh bg-[#0B0F14] text-gray-100">
      <TopBar />
      <div className="mx-auto max-w-xl px-4 py-4">
        <h1 className="text-xl font-semibold text-white">Reports</h1>
        <div className="mt-4 grid gap-4">
          <section className="rounded-2xl bg-[#0F151B] border border-gray-800 p-4">
            <h2 className="text-sm text-gray-400">Spend by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.name}: ${formatCurrency(Number(entry.value))}`
                    }
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    formatter={(v: any, n: any) => [
                      formatCurrency(Number(v)),
                      n,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ color: "#E5E7EB", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl bg-[#0F151B] border border-gray-800 p-4">
            <h2 className="text-sm text-gray-400">Spend Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byDay}>
                  <defs>
                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#11161C" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#spend)"
                  />
                  <ReTooltip
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

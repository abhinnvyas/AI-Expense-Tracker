import type {
  Expense,
  APIResponse,
  LoginResponse,
  BalanceData,
  User,
} from "./types";

const TOKEN_KEY = "aet_token";
const USER_KEY = "aet_user";
const BASE_URL_KEY = "";

export function getBaseUrl(): string | null {
  if (typeof window === "undefined") return null;

  // Check localStorage first, then env variable, then default to current domain
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

export function setBaseUrl(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BASE_URL_KEY, url.replace(/\/+$/, "")); // trim trailing slash
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function logout() {
  setToken(null);
  setUser(null);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error("API base URL not set. Open Settings and configure it.");
  }
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (res.status === 401) {
    // auth expired
    logout();
    throw new Error("Unauthorized. Please log in again.");
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  return json as T;
}

// Auth
export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
  monthlyBudget: number;
}): Promise<APIResponse<LoginResponse | { user: User; token?: string }>> {
  return request(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<APIResponse<LoginResponse>> {
  return request(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// User
export async function apiGetAvailableBalance(): Promise<
  APIResponse<BalanceData>
> {
  return request(`/api/users/av/balance/`, { method: "GET" });
}

export async function apiGetUserBudget(): Promise<
  APIResponse<{ monthlyBudget: number }>
> {
  return request(`/api/users/budget/`, { method: "GET" });
}

export async function apiUpdateBudget(
  monthlyBudget: number
): Promise<APIResponse<{ monthlyBudget: number }>> {
  return request(`/api/users/budget/`, {
    method: "PUT",
    body: JSON.stringify({ monthlyBudget }),
  });
}

// Expenses
export async function apiGetExpenses(): Promise<APIResponse<Expense[]>> {
  return request(`/api/expenses/u/`, { method: "GET" });
}

export async function apiCreateExpense(
  description: string
): Promise<APIResponse<Expense>> {
  return request(`/api/expenses/`, {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export async function apiDeleteExpense(id: string): Promise<APIResponse<{}>> {
  return request(`/api/expenses/${id}`, { method: "DELETE" });
}

export async function apiUpdateExpense(
  id: string,
  updates: Partial<Pick<Expense, "amount" | "category">>
): Promise<APIResponse<Expense>> {
  return request(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function formatCurrency(
  amount: number,
  currency = getUser()?.currency || "INR",
  locale = currency === "INR" ? "en-IN" : "en-US"
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
}

export async function getUserData(): Promise<APIResponse<Expense[]>> {
  return request(`/api/users/`, { method: "GET" });
}

export async function deleteUserAccount(): Promise<APIResponse<{}>> {
  return request(`/api/users/`, { method: "DELETE" });
}

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBaseUrl, setBaseUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { MoreVerticalIcon } from "lucide-react";

export function TopBar() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // const [apiBase, setApiBase] = useState(getBaseUrl() || "");
  const [apiBase, setApiBase] = useState(getBaseUrl() || "");

  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-800 bg-[#0B0F14]/80 backdrop-blur">
      <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white text-pretty">
          AI Expense Tracker
          <span className="sr-only">AI Expense Tracker</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`text-sm ${
              pathname === "/" ? "text-white" : "text-gray-400"
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm ${
              pathname?.startsWith("/dashboard")
                ? "text-white"
                : "text-gray-400"
            }`}
          >
            Dashboard
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="bg-[#1F2937] text-gray-100"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* <DropdownMenuLabel>API Base URL</DropdownMenuLabel>
              <div className="px-2 pb-2">
                <input
                  className="w-full rounded bg-[#0B0F14] border border-gray-700 px-2 py-1 text-sm text-gray-100 outline-none"
                  placeholder="https://your-api.example.com"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                />
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setBaseUrl(apiBase);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  router.replace("/");
                }}
                className="text-red-400"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

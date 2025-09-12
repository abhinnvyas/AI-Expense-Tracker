"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function TopBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut();
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-800 bg-[#0B0F14]/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white text-lg sm:text-xl">
          AI Expense Tracker
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {user && (
            <>
              {/* Navigation links - hidden on very small screens, shown in dropdown */}
              <nav className="hidden sm:flex items-center gap-4">
                <Link
                  href="/"
                  className={`text-sm transition-colors ${
                    pathname === "/"
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm transition-colors ${
                    pathname?.startsWith("/dashboard")
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/expenses"
                  className={`text-sm transition-colors ${
                    pathname?.startsWith("/expenses")
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Expenses
                </Link>
              </nav>
            </>
          )}

          {/* Mobile dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0F151B] border-gray-700"
            >
              {user && (
                <>
                  {/* Mobile navigation - shown on small screens */}
                  <div className="sm:hidden">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        className={`w-full ${
                          pathname === "/"
                            ? "text-white bg-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className={`w-full ${
                          pathname?.startsWith("/dashboard")
                            ? "text-white bg-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/expenses"
                        className={`w-full ${
                          pathname?.startsWith("/expenses")
                            ? "text-white bg-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        Expenses
                      </Link>
                    </DropdownMenuItem>
                    <div className="border-t border-gray-700 my-1"></div>
                  </div>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

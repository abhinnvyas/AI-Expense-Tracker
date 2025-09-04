import type React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/50", className)}
      {...props}
    />
  );
}

export function BalanceCardsSkeleton() {
  return (
    <section className="mx-auto max-w-xl px-4 pt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-[#11161C] border border-gray-800 p-4">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="rounded-2xl bg-[#11161C] border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-10" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    </section>
  );
}

export function ChatExpenseSkeleton() {
  return (
    <section className="mx-auto max-w-xl px-4 pb-28">
      <div className="mt-4 h-[56vh] overflow-y-auto rounded-2xl bg-[#0B0F14] border border-gray-800 p-3">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <Skeleton className="h-8 w-32 rounded-2xl" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-16 w-48 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

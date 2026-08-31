// components/ui/skeleton.tsx
//
// 2026-08-30: written rather than copied, because NO repo in the org has a
// skeleton.tsx — I checked craudiovizai and javari-admin. This is the stock shadcn
// implementation, unmodified, so when a shared UI package eventually exists this
// file is a drop-in replacement rather than a variant to reconcile.

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

import type { Metadata } from "next"

// 2026-08-20: app/dashboard/specialties/page.tsx became a client component - a
// client component cannot export metadata, and Next fails the build on it. The
// page keeps its interactivity; this server layout carries the SEO contract.
export const metadata: Metadata = {
  title: 'My Specialties | CR Realtor Platform',
  description: 'Choose your social impact specialties to receive targeted leads',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

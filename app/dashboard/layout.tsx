'use client';

// Dashboard layout is now handled by MainLayout in root layout
// This layout just passes through children to avoid double layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
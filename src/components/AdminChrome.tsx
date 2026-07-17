"use client";

import RoleChrome from "@/components/RoleChrome";

interface AdminChromeProps {
  children: React.ReactNode;
  userName: string;
}

/**
 * Keeps immersive, self-contained admin tools out of the standard dashboard
 * shell while preserving the server-side authorization handled by AdminLayout.
 */
export default function AdminChrome({ children, userName }: AdminChromeProps) {
  return (
    <RoleChrome role="admin" userName={userName}>
      {children}
    </RoleChrome>
  );
}

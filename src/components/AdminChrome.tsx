"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface AdminChromeProps {
  children: React.ReactNode;
  userName: string;
}

const FULLSCREEN_ADMIN_ROUTES = new Set(["/admin/noorani-qaida"]);

/**
 * Keeps immersive, self-contained admin tools out of the standard dashboard
 * shell while preserving the server-side authorization handled by AdminLayout.
 */
export default function AdminChrome({ children, userName }: AdminChromeProps) {
  const pathname = usePathname();

  if (FULLSCREEN_ADMIN_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <Sidebar role="admin" userName={userName} />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}

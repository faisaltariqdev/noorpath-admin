"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import type { Role } from "@/types/database";

interface RoleChromeProps {
  role: Role;
  userName: string;
  children: React.ReactNode;
}

/** Immersive Qaida routes that must not sit inside the portal sidebar shell. */
const FULLSCREEN_ROUTES: Record<Role, Set<string>> = {
  admin: new Set(["/admin/noorani-qaida", "/admin/islamic-knowledge"]),
  tutor: new Set(["/tutor/qaida", "/tutor/islamic-knowledge"]),
  parent: new Set(["/parent/qaida", "/parent/islamic-knowledge"]),
};

export default function RoleChrome({ role, userName, children }: RoleChromeProps) {
  const pathname = usePathname();
  if (FULLSCREEN_ROUTES[role]?.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <Sidebar role={role} userName={userName} />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}

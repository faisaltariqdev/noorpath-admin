"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types/database";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  DollarSign, Bell, MessageSquare, Settings, LogOut, GraduationCap,
  FileText, Clock, Star, Home
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/students", label: "All Students", icon: GraduationCap },
  { href: "/admin/sessions", label: "All Sessions", icon: Calendar },
  { href: "/admin/fees", label: "Fee Management", icon: DollarSign },
  { href: "/admin/reports", label: "Progress Reports", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const TUTOR_LINKS = [
  { href: "/tutor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tutor/classes", label: "Today's Classes", icon: Calendar },
  { href: "/tutor/students", label: "My Students", icon: GraduationCap },
  { href: "/tutor/reports", label: "Progress Reports", icon: ClipboardList },
  { href: "/tutor/homework", label: "Homework Templates", icon: BookOpen },
  { href: "/tutor/attendance", label: "Attendance", icon: Clock },
  { href: "/tutor/earnings", label: "My Earnings", icon: DollarSign },
  { href: "/tutor/messages", label: "Messages", icon: MessageSquare },
];

const PARENT_LINKS = [
  { href: "/parent", label: "Home", icon: Home },
  { href: "/parent/progress", label: "Child Progress", icon: Star },
  { href: "/parent/sessions", label: "Classes & Schedule", icon: Calendar },
  { href: "/parent/homework", label: "Homework", icon: BookOpen },
  { href: "/parent/attendance", label: "Attendance", icon: Clock },
  { href: "/parent/fees", label: "Fees & Payments", icon: DollarSign },
  { href: "/parent/reports", label: "Reports", icon: FileText },
  { href: "/parent/messages", label: "Messages", icon: MessageSquare },
];

const LINKS: Record<Role, typeof ADMIN_LINKS> = {
  admin: ADMIN_LINKS,
  tutor: TUTOR_LINKS,
  parent: PARENT_LINKS,
};

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin Panel",
  tutor: "Tutor Panel",
  parent: "Parent Portal",
};

interface SidebarProps {
  role: Role;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const links = LINKS[role];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="sidebar flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#c9a84c" }}>
            <BookOpen size={16} color="#fff" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">NoorPath</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--emerald)", color: "#fff" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white text-xs font-medium truncate max-w-[140px]">{userName}</div>
            <div className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{role}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" + role && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`sidebar-link ${isActive ? "active" : ""}`}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout} className="sidebar-link w-full text-left" style={{ color: "rgba(255,100,100,0.8)" }}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

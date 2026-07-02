"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types/database";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  DollarSign, Bell, MessageSquare, Settings, LogOut,
  GraduationCap, FileText, Clock, Star, Home, ChevronRight,
  BarChart2, Mic, Map, Sparkles,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { href: string; label: string; icon: any; exact?: boolean };
type NavSection = { section: string; items: NavItem[] };

const ADMIN_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { section: "Management", items: [
    { href: "/admin/users",         label: "Users & Tutors",    icon: Users },
    { href: "/admin/students",      label: "Students",          icon: GraduationCap },
    { href: "/admin/courses",       label: "Course Management", icon: BookOpen },
    { href: "/admin/sessions",      label: "All Sessions",      icon: Calendar },
    { href: "/admin/fees",          label: "Fee Management",    icon: DollarSign },
    { href: "/admin/earnings",      label: "Tutor Earnings",    icon: Star },
    { href: "/admin/reports",       label: "Progress Reports",  icon: FileText },
  ]},
  { section: "Analytics", items: [
    { href: "/admin/analytics",     label: "Analytics & Graphs",icon: BarChart2 },
  ]},
  { section: "Communication", items: [
    { href: "/admin/messages",      label: "Messages",          icon: MessageSquare },
    { href: "/admin/notifications", label: "Notifications",     icon: Bell },
  ]},
  { section: "System", items: [
    { href: "/admin/profile",       label: "My Profile",        icon: GraduationCap },
    { href: "/admin/settings",      label: "Settings & Reminders", icon: Settings },
  ]},
];

const TUTOR_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/tutor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { section: "Classes", items: [
    { href: "/tutor/classes",       label: "Today's Classes",   icon: Calendar },
    { href: "/tutor/attendance",    label: "Attendance",        icon: Clock },
  ]},
  { section: "Students", items: [
    { href: "/tutor/students",      label: "My Students",       icon: GraduationCap },
    { href: "/tutor/reports",       label: "Progress Reports",  icon: ClipboardList },
    { href: "/tutor/homework",      label: "Homework",          icon: BookOpen },
  ]},
  { section: "Planning", items: [
    { href: "/tutor/roadmap",       label: "Course Roadmap",    icon: Map },
  ]},
  { section: "AI Tools", items: [
    { href: "/tutor/voice-tracker", label: "AI Voice Tracker",  icon: Mic },
  ]},
  { section: "Account", items: [
    { href: "/tutor/earnings",      label: "My Earnings",       icon: DollarSign },
    { href: "/tutor/messages",      label: "Messages",          icon: MessageSquare },
    { href: "/tutor/profile",       label: "My Profile",        icon: GraduationCap },
  ]},
];

const PARENT_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/parent", label: "Home", icon: Home, exact: true },
  ]},
  { section: "My Child", items: [
    { href: "/parent/progress",     label: "Progress & Reports",  icon: Star },
    { href: "/parent/sessions",     label: "Classes & Schedule",  icon: Calendar },
    { href: "/parent/attendance",   label: "Attendance",          icon: Clock },
    { href: "/parent/homework",     label: "Homework",            icon: BookOpen },
  ]},
  { section: "Learning Journey", items: [
    { href: "/parent/journey",      label: "Learning Journey",    icon: Sparkles },
    { href: "/parent/roadmap",      label: "Course Roadmap",      icon: BarChart2 },
    { href: "/parent/mushaf",       label: "Mushaf Tracker",      icon: Map },
    { href: "/parent/timeline",     label: "Class Timeline",      icon: LayoutDashboard },
  ]},
  { section: "Account", items: [
    { href: "/parent/fees",         label: "Fees & Payments",     icon: DollarSign },
    { href: "/parent/messages",     label: "Messages",            icon: MessageSquare },
    { href: "/parent/profile",      label: "My Profile",          icon: GraduationCap },
  ]},
];

const LINKS: Record<Role, NavSection[]> = {
  admin: ADMIN_LINKS, tutor: TUTOR_LINKS, parent: PARENT_LINKS,
};

const ROLE_CONFIG: Record<Role, { label: string; badgeClass: string }> = {
  admin:  { label: "Admin Panel",   badgeClass: "badge-admin" },
  tutor:  { label: "Tutor Panel",   badgeClass: "badge-tutor" },
  parent: { label: "Parent Portal", badgeClass: "badge-parent" },
};

interface SidebarProps { role: Role; userName: string; }

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const sections = LINKS[role];
  const { label, badgeClass } = ROLE_CONFIG[role];

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) setDisplayName(profile.full_name);
    }
    loadProfile();
  }, []);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">
              <Image src="/favicon.svg" alt="NoorPath" width={44} height={44} style={{ objectFit: "cover" }} />
            </div>
            <div>
              <div className="sidebar-brand-name">
                <span className="noor">Noor</span><span className="path">Path</span>
              </div>
              <div className={`role-badge ${badgeClass}`}>{label}</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: "8px 12px 4px" }}>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: "#fff", fontSize: "0.82rem", fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{displayName}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", textTransform: "capitalize" }}>{role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.section}>
              <div className="nav-label">{section.section}</div>
              {section.items.map(({ href, label: lbl, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${isActive(href, exact) ? "active" : ""}`}
                >
                  <Icon size={15} style={{ flexShrink: 0, opacity: isActive(href, exact) ? 1 : 0.7 }} />
                  <span style={{ flex: 1 }}>{lbl}</span>
                  {isActive(href, exact) && (
                    <ChevronRight size={12} style={{ opacity: 0.4 }} />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ color: "rgba(248,113,113,0.75)" }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

// Exposed for TopBar to use
export function useSidebarToggle() {
  function toggle() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  }
  return toggle;
}

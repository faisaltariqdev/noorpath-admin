"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types/database";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  DollarSign, MessageSquare, Settings, LogOut,
  GraduationCap, FileText, Clock, Home, ChevronRight,
  BarChart2, Sparkles, Map,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { href: string; label: string; icon: any; exact?: boolean };
type NavSection = { section: string; items: NavItem[] };

const ADMIN_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { section: "People", items: [
    { href: "/admin/students",      label: "Students",          icon: GraduationCap },
    { href: "/admin/teachers",      label: "Teachers",          icon: Users },
    { href: "/admin/parents",       label: "Parents",           icon: Home },
  ]},
  { section: "Learning", items: [
    { href: "/admin/courses",       label: "Courses",           icon: BookOpen },
    { href: "/admin/noorani-qaida", label: "Noorani Qaida",     icon: Sparkles },
    { href: "/admin/assignments",   label: "Assignments",       icon: ClipboardList },
  ]},
  { section: "Operations", items: [
    { href: "/admin/live-classes",  label: "Live Classes",      icon: Calendar },
    { href: "/admin/attendance",    label: "Attendance",        icon: Clock },
    { href: "/admin/payments",      label: "Payments",          icon: DollarSign },
    { href: "/admin/reports",       label: "Reports",           icon: BarChart2 },
  ]},
  { section: "Communication", items: [
    { href: "/admin/messages",      label: "Messages",          icon: MessageSquare },
  ]},
  { section: "System", items: [
    { href: "/admin/permissions",   label: "Permissions",       icon: ClipboardList },
    { href: "/admin/settings",      label: "Settings",          icon: Settings },
  ]},
];

const TUTOR_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/tutor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { section: "Teaching", items: [
    { href: "/tutor/students",      label: "Students",          icon: GraduationCap },
    { href: "/tutor/classes",       label: "Live Classes",      icon: Calendar },
    { href: "/tutor/homework",      label: "Assignments",       icon: BookOpen },
    { href: "/tutor/attendance",    label: "Attendance",        icon: Clock },
    { href: "/tutor/reports",       label: "Reports",           icon: ClipboardList },
    { href: "/tutor/qaida",         label: "Noorani Qaida",     icon: Sparkles },
  ]},
  { section: "Account", items: [
    { href: "/tutor/earnings",      label: "Payments",          icon: DollarSign },
    { href: "/tutor/messages",      label: "Messages",          icon: MessageSquare },
    { href: "/tutor/profile",       label: "Settings",          icon: Settings },
  ]},
];

const PARENT_LINKS: NavSection[] = [
  { section: "Overview", items: [
    { href: "/parent", label: "Home", icon: Home, exact: true },
  ]},
  { section: "My Children", items: [
    { href: "/parent/progress",     label: "Children & Progress", icon: GraduationCap },
    { href: "/parent/sessions",     label: "Live Classes",        icon: Calendar },
    { href: "/parent/homework",     label: "Assignments",         icon: BookOpen },
    { href: "/parent/attendance",   label: "Attendance",          icon: Clock },
    { href: "/parent/roadmap",      label: "Learning Roadmap",    icon: Map },
    { href: "/parent/qaida",        label: "Noorani Qaida",       icon: Sparkles },
  ]},
  { section: "Account", items: [
    { href: "/parent/fees",         label: "Payments",            icon: DollarSign },
    { href: "/parent/messages",     label: "Messages",            icon: MessageSquare },
    { href: "/parent/profile",      label: "Settings",            icon: Settings },
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
  const [qaidaEnabled, setQaidaEnabled] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const { label, badgeClass } = ROLE_CONFIG[role];
  const sections = LINKS[role]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (role === "parent" && item.href === "/parent/qaida" && !qaidaEnabled) return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const toggle = () => {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen((current) => !current);
    };
    window.addEventListener("noorpath:sidebar-toggle", toggle);
    return () => window.removeEventListener("noorpath:sidebar-toggle", toggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      returnFocusRef.current?.focus();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, qaida_enabled, role")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) setDisplayName(profile.full_name);
      if (role === "parent") setQaidaEnabled(Boolean(profile?.qaida_enabled));
    }
    loadProfile();
  }, [role]);

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
      <button
        type="button"
        aria-label="Close sidebar"
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        id="portal-sidebar"
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : ""}`}
        aria-label={`${label} navigation`}
        aria-hidden={!open ? undefined : false}
      >
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
      </aside>
    </>
  );
}

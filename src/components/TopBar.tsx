"use client";
import { useState, useEffect } from "react";
import { Menu, X, Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [open, setOpen] = useState(false);

  function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const isOpen = sidebar?.classList.contains("open");
    if (isOpen) {
      sidebar?.classList.remove("open");
      overlay?.classList.remove("open");
      setOpen(false);
    } else {
      sidebar?.classList.add("open");
      overlay?.classList.add("open");
      setOpen(true);
    }
  }

  useEffect(() => {
    function onClose() { setOpen(false); }
    document.querySelector(".sidebar-overlay")?.addEventListener("click", onClose);
    return () => document.querySelector(".sidebar-overlay")?.removeEventListener("click", onClose);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={toggleSidebar} aria-label="Menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div>
          <div className="topbar-page-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Search">
          <Search size={16} />
        </button>
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #1b5e42, #c9a84c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: "0.8rem",
          cursor: "pointer", flexShrink: 0,
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>N</div>
      </div>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { BookMarked, BookOpen, Search, Shield, Users } from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";

type Tab = "learning" | "roles";

interface ParentRow {
  id: string;
  full_name: string;
  email: string;
  country?: string | null;
  qaida_enabled: boolean;
  islamic_knowledge_enabled: boolean;
  student_count: number;
}

type RoleKey = "tutor" | "parent" | "admin";

const ROLE_FEATURE_LABELS: Record<RoleKey, { key: string; label: string }[]> = {
  tutor: [
    { key: "attendance", label: "Mark student attendance" },
    { key: "reports", label: "Submit progress reports" },
    { key: "earnings", label: "View earnings / payments" },
    { key: "qaida", label: "Noorani Qaida teaching tools" },
    { key: "islamic_knowledge", label: "Islamic Knowledge teaching tools" },
    { key: "messages", label: "Messages" },
  ],
  parent: [
    { key: "sessions", label: "Classes & schedule" },
    { key: "fees", label: "Fees & invoices" },
    { key: "attendance", label: "View attendance" },
    { key: "homework", label: "Homework" },
    { key: "messages", label: "Messages" },
    { key: "qaida_default", label: "Noorani Qaida default for new parents" },
    { key: "islamic_knowledge_default", label: "Islamic Knowledge default for new parents" },
  ],
  admin: [
    { key: "all", label: "Full admin access" },
  ],
};

const DEFAULT_PERMISSIONS: Record<RoleKey, Record<string, boolean>> = {
  tutor: {
    attendance: true,
    reports: true,
    earnings: true,
    qaida: true,
    islamic_knowledge: true,
    messages: true,
  },
  parent: {
    sessions: true,
    fees: true,
    attendance: true,
    homework: true,
    messages: true,
    qaida_default: false,
    islamic_knowledge_default: false,
  },
  admin: { all: true },
};

export default function PermissionsPage() {
  const [tab, setTab] = useState<Tab>("learning");
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState<RoleKey>("parent");

  async function load() {
    setLoading(true);
    setMessage("");
    const [{ data: parentRows }, { data: students }, { data: settings }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, country, qaida_enabled, islamic_knowledge_enabled")
        .eq("role", "parent")
        .order("full_name"),
      supabase.from("students").select("id, parent_id").eq("is_active", true),
      supabase.from("app_settings").select("value").eq("key", "role_permissions").maybeSingle(),
    ]);

    const countByParent: Record<string, number> = {};
    for (const student of students || []) {
      if (!student.parent_id) continue;
      countByParent[student.parent_id] = (countByParent[student.parent_id] || 0) + 1;
    }

    setParents(
      (parentRows || []).map((row: {
        id: string;
        full_name?: string;
        email?: string;
        country?: string | null;
        qaida_enabled?: boolean;
        islamic_knowledge_enabled?: boolean;
      }) => ({
        id: row.id,
        full_name: row.full_name || "Parent",
        email: row.email || "",
        country: row.country,
        qaida_enabled: Boolean(row.qaida_enabled),
        islamic_knowledge_enabled: Boolean(row.islamic_knowledge_enabled),
        student_count: countByParent[row.id] || 0,
      })),
    );

    if (settings?.value && typeof settings.value === "object") {
      const saved = settings.value as Record<RoleKey, Record<string, boolean>>;
      setPermissions({
        tutor: { ...DEFAULT_PERMISSIONS.tutor, ...saved.tutor },
        parent: { ...DEFAULT_PERMISSIONS.parent, ...saved.parent },
        admin: { ...DEFAULT_PERMISSIONS.admin, ...saved.admin },
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredParents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || (p.country || "").toLowerCase().includes(q),
    );
  }, [parents, search]);

  async function toggleFlag(
    parentId: string,
    field: "qaida_enabled" | "islamic_knowledge_enabled",
    enabled: boolean,
  ) {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: enabled })
      .eq("id", parentId)
      .eq("role", "parent");
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setParents((prev) => prev.map((p) => (p.id === parentId ? { ...p, [field]: enabled } : p)));
    const label = field === "qaida_enabled" ? "Noorani Qaida" : "Islamic Knowledge";
    setMessage(enabled ? `${label} enabled for parent.` : `${label} disabled for parent.`);
  }

  async function setAllFlag(
    field: "qaida_enabled" | "islamic_knowledge_enabled",
    enabled: boolean,
  ) {
    setSaving(true);
    setMessage("");
    const ids = filteredParents.map((p) => p.id);
    if (!ids.length) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: enabled })
      .in("id", ids)
      .eq("role", "parent");
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const idSet = new Set(ids);
    setParents((prev) => prev.map((p) => (idSet.has(p.id) ? { ...p, [field]: enabled } : p)));
    const label = field === "qaida_enabled" ? "Qaida" : "Islamic Knowledge";
    setMessage(enabled ? `Enabled ${label} for filtered parents.` : `Disabled ${label} for filtered parents.`);
  }

  async function saveRolePermissions() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("app_settings").upsert({
      key: "role_permissions",
      value: permissions,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Role permissions saved.");
  }

  const qaidaCount = parents.filter((p) => p.qaida_enabled).length;
  const ikCount = parents.filter((p) => p.islamic_knowledge_enabled).length;

  return (
    <>
      <TopBar title="Roles & Permissions" subtitle="Control Qaida and Islamic Knowledge visibility" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Roles & Permissions</h1>
        <p className="page-subtitle">
          Assign Noorani Qaida and Islamic Knowledge to specific parents, and manage role-level defaults.
        </p>
      </div>

      <div className="page-body">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn ${tab === "learning" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("learning")}
          >
            <BookOpen size={14} /> Parent learning access
          </button>
          <button
            type="button"
            className={`btn ${tab === "roles" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("roles")}
          >
            <Shield size={14} /> Role permissions
          </button>
        </div>

        {message && (
          <p
            style={{
              marginBottom: 12,
              fontSize: "0.85rem",
              color: message.toLowerCase().includes("error") || message.includes("violat") ? "#dc2626" : "#15803d",
            }}
          >
            {message}
          </p>
        )}

        {loading ? (
          <div className="empty-state">
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #e2e8f0",
                borderTopColor: "#1b5e42",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : tab === "learning" ? (
          <div className="card">
            <div className="card-header" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <h3 className="card-title">
                <Users size={15} /> Parents · learning apps
              </h3>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Qaida {qaidaCount}/{parents.length} · Islamic Knowledge {ikCount}/{parents.length}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <label className="search-field" style={{ minWidth: 220 }}>
                  <Search size={14} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parent…" />
                </label>
                <button type="button" className="btn btn-ghost btn-sm" disabled={saving} onClick={() => setAllFlag("qaida_enabled", true)}>
                  Allow all Qaida
                </button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={saving} onClick={() => setAllFlag("islamic_knowledge_enabled", true)}>
                  Allow all IK
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {filteredParents.length === 0 ? (
                <div className="empty-state">
                  <Users size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
                  <h3>No parents found</h3>
                </div>
              ) : (
                <div className="table-shell">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parent</th>
                        <th>Country</th>
                        <th>Students</th>
                        <th>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <BookOpen size={13} /> Noorani Qaida
                          </span>
                        </th>
                        <th>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <BookMarked size={13} /> Islamic Knowledge
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParents.map((parent) => (
                        <tr key={parent.id}>
                          <td>
                            <strong>{parent.full_name}</strong>
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{parent.email}</div>
                          </td>
                          <td style={{ color: "#64748b" }}>{parent.country || "—"}</td>
                          <td>{parent.student_count}</td>
                          <td>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={parent.qaida_enabled}
                                disabled={saving}
                                onChange={(e) => toggleFlag(parent.id, "qaida_enabled", e.target.checked)}
                              />
                              {parent.qaida_enabled ? "Allowed" : "Hidden"}
                            </label>
                          </td>
                          <td>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={parent.islamic_knowledge_enabled}
                                disabled={saving}
                                onChange={(e) =>
                                  toggleFlag(parent.id, "islamic_knowledge_enabled", e.target.checked)
                                }
                              />
                              {parent.islamic_knowledge_enabled ? "Allowed" : "Hidden"}
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <h3 className="card-title">
                <Shield size={15} /> Role feature defaults
              </h3>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {(["parent", "tutor", "admin"] as RoleKey[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`btn btn-sm ${roleTab === role ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setRoleTab(role)}
                  >
                    {role}
                  </button>
                ))}
                <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={saveRolePermissions}>
                  {saving ? "Saving…" : "Save permissions"}
                </button>
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 16 }}>
                Parent Qaida / Islamic Knowledge still need an explicit allow per parent above (unless you turn on the
                matching “default for new parents” when creating accounts). Tutor Islamic Knowledge uses the tutor role toggle.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ROLE_FEATURE_LABELS[roleTab].map((feature) => (
                  <label
                    key={feature.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      cursor: roleTab === "admin" ? "not-allowed" : "pointer",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{feature.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[roleTab]?.[feature.key])}
                      disabled={roleTab === "admin" || saving}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          [roleTab]: { ...prev[roleTab], [feature.key]: e.target.checked },
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

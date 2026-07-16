"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Lock, Save, User } from "lucide-react";
import TopBar from "@/components/TopBar";
import { LoadingState, PageHeader, SectionCard, StatusBadge } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  timezone: string;
  role: string;
}

const timezones = [
  "UTC", "Europe/London", "Europe/Paris", "America/New_York", "America/Chicago",
  "America/Los_Angeles", "Asia/Karachi", "Asia/Dubai", "Asia/Riyadh", "Asia/Kolkata",
  "Australia/Sydney",
];

const countries = [
  "Pakistan", "United Kingdom", "United States", "Canada", "Australia", "UAE",
  "Saudi Arabia", "Qatar", "Germany", "France", "India", "Other",
];

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [password, setPassword] = useState({ value: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ value: false, confirm: false });
  const [passwordState, setPasswordState] = useState({ saving: false, success: "", error: "" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        country: profile.country,
        timezone: profile.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.value !== password.confirm) {
      setPasswordState({ saving: false, success: "", error: "The passwords do not match." });
      return;
    }
    if (password.value.length < 8) {
      setPasswordState({ saving: false, success: "", error: "Use at least eight characters." });
      return;
    }
    setPasswordState({ saving: true, success: "", error: "" });
    const { error } = await supabase.auth.updateUser({ password: password.value });
    if (error) {
      setPasswordState({ saving: false, success: "", error: error.message });
      return;
    }
    setPassword({ value: "", confirm: "" });
    setPasswordState({ saving: false, success: "Password changed successfully.", error: "" });
  }

  return (
    <>
      <TopBar title="Settings" subtitle="Profile and account security" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          description="Manage your profile information, timezone, contact details, and password."
        />

        {loading ? <LoadingState label="Loading account settings…" /> : (
          <div className="portal-account-layout">
            <aside className="portal-account-nav" aria-label="Settings sections">
              <div className="portal-account-identity">
                <span className="portal-account-avatar">{profile?.full_name?.charAt(0) || "?"}</span>
                <strong>{profile?.full_name}</strong>
                <StatusBadge tone="info">{profile?.role || "account"}</StatusBadge>
              </div>
              <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")} aria-pressed={tab === "profile"}>
                <User size={15} aria-hidden="true" /> Profile
              </button>
              <button type="button" className={tab === "password" ? "active" : ""} onClick={() => setTab("password")} aria-pressed={tab === "password"}>
                <Lock size={15} aria-hidden="true" /> Security
              </button>
            </aside>

            {tab === "profile" ? (
              <SectionCard title="Profile information" description="Your academy contact and regional settings" className="portal-section-card--full">
                <form className="portal-settings-form" onSubmit={saveProfile}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-name">Full name</label>
                    <input id="profile-name" className="form-input" value={profile?.full_name || ""} onChange={(event) => setProfile((current) => current ? { ...current, full_name: event.target.value } : current)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-email">Email address</label>
                    <input id="profile-email" className="form-input" value={profile?.email || ""} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">Phone</label>
                    <input id="profile-phone" className="form-input" value={profile?.phone || ""} onChange={(event) => setProfile((current) => current ? { ...current, phone: event.target.value } : current)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-whatsapp">WhatsApp</label>
                    <input id="profile-whatsapp" className="form-input" value={profile?.whatsapp || ""} onChange={(event) => setProfile((current) => current ? { ...current, whatsapp: event.target.value } : current)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-country">Country</label>
                    <select id="profile-country" className="form-input form-select" value={profile?.country || ""} onChange={(event) => setProfile((current) => current ? { ...current, country: event.target.value } : current)}>
                      <option value="">Select country</option>
                      {countries.map((country) => <option key={country}>{country}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-timezone">Timezone</label>
                    <select id="profile-timezone" className="form-input form-select" value={profile?.timezone || "UTC"} onChange={(event) => setProfile((current) => current ? { ...current, timezone: event.target.value } : current)}>
                      {timezones.map((timezone) => <option key={timezone}>{timezone}</option>)}
                    </select>
                  </div>
                  <div className="portal-settings-actions">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> {saving ? "Saving…" : "Save changes"}</>}
                    </button>
                  </div>
                </form>
              </SectionCard>
            ) : (
              <SectionCard title="Account security" description="Choose a strong password unique to NoorPath" className="portal-section-card--full">
                <form className="portal-password-form" onSubmit={changePassword}>
                  {(["value", "confirm"] as const).map((field) => (
                    <div className="form-group" key={field}>
                      <label className="form-label" htmlFor={`password-${field}`}>{field === "value" ? "New password" : "Confirm password"}</label>
                      <div className="portal-password-input">
                        <input
                          id={`password-${field}`}
                          type={showPassword[field] ? "text" : "password"}
                          className="form-input"
                          value={password[field]}
                          onChange={(event) => setPassword((current) => ({ ...current, [field]: event.target.value }))}
                          minLength={8}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword((current) => ({ ...current, [field]: !current[field] }))} aria-label={`${showPassword[field] ? "Hide" : "Show"} ${field === "value" ? "new" : "confirmation"} password`}>
                          {showPassword[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {passwordState.error && <p className="alert alert-error" role="alert">{passwordState.error}</p>}
                  {passwordState.success && <p className="alert alert-success" role="status">{passwordState.success}</p>}
                  <button className="btn btn-primary" type="submit" disabled={passwordState.saving}>
                    <Lock size={14} /> {passwordState.saving ? "Changing…" : "Change password"}
                  </button>
                </form>
              </SectionCard>
            )}
          </div>
        )}
      </main>
    </>
  );
}

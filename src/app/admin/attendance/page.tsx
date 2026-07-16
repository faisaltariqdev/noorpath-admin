"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  PortalGrid,
  SectionCard,
  StatusBadge,
} from "@/components/ui/PortalUI";

export const dynamic = "force-dynamic";

interface AttendanceRecord {
  id: string;
  status: string;
  late_minutes?: number;
  session_date?: string;
  marked_at?: string;
  notes?: string;
  student_name: string;
  tutor_name: string;
}

const statusTone = (status: string): "success" | "warning" | "danger" | "info" | "neutral" => {
  if (status === "present") return "success";
  if (status === "late") return "warning";
  if (status === "absent") return "danger";
  if (status === "leave") return "info";
  return "neutral";
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("attendance")
        .select("id,status,late_minutes,session_date,marked_at,notes,student:students(full_name),tutor:profiles(full_name)")
        .order("session_date", { ascending: false });
      setRecords((data || []).map((row: any) => ({
        ...row,
        student_name: row.student?.full_name || "Unknown student",
        tutor_name: row.tutor?.full_name || "Unassigned",
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const date = record.session_date || record.marked_at || "";
      return date.startsWith(month)
        && (!query || record.student_name.toLowerCase().includes(query) || record.tutor_name.toLowerCase().includes(query));
    });
  }, [month, records, search]);

  const present = filtered.filter((record) => record.status === "present").length;
  const late = filtered.filter((record) => record.status === "late").length;
  const absent = filtered.filter((record) => record.status === "absent").length;
  const rate = filtered.length ? Math.round(((present + late) / filtered.length) * 100) : 0;

  return (
    <>
      <TopBar title="Attendance" subtitle="Monthly attendance operations" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Operations"
          title="Attendance"
          description="Review attendance records across students and teachers with a simple monthly view."
          actions={<input type="month" className="form-input" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Attendance month" />}
        />

        <PortalGrid className="mb-6">
          <MetricCard label="Attendance Rate" value={`${rate}%`} helper={`${filtered.length} monthly records`} icon={CalendarCheck2} />
          <MetricCard label="Present" value={present} helper="On-time attendance" icon={CheckCircle2} tone="blue" />
          <MetricCard label="Late" value={late} helper="Attended after start" icon={Clock3} tone="gold" />
          <MetricCard label="Absent" value={absent} helper="Missed classes" icon={XCircle} tone={absent ? "red" : "green"} />
        </PortalGrid>

        <SectionCard
          title="Monthly register"
          description={`${filtered.length} attendance records`}
          className="portal-section-card--full"
          action={(
            <label className="search-field" aria-label="Search attendance">
              <Search size={15} aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or teacher…" />
            </label>
          )}
        >
          {loading ? <LoadingState label="Loading attendance…" /> : filtered.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="No attendance records" description="No records match this month and search." />
          ) : (
            <div className="portal-table-scroll">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Student</th><th>Teacher</th><th>Status</th><th>Late</th><th>Notes</th></tr></thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.session_date || record.marked_at || "").toLocaleDateString("en-GB")}</td>
                      <td><strong>{record.student_name}</strong></td>
                      <td>{record.tutor_name}</td>
                      <td><StatusBadge tone={statusTone(record.status)}>{record.status}</StatusBadge></td>
                      <td>{record.late_minutes ? `${record.late_minutes} min` : "—"}</td>
                      <td>{record.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </main>
    </>
  );
}

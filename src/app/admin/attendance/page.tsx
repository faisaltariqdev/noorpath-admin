"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types/database";
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

type Tab = "teachers" | "students";
type MarkStatus = AttendanceStatus;

interface TeacherRow {
  id: string;
  full_name: string;
  email?: string;
}

interface StudentRow {
  id: string;
  full_name: string;
  tutor_id?: string | null;
  tutor_name: string;
}

interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  tutor_id?: string | null;
  status: MarkStatus;
  late_minutes?: number;
  session_date?: string;
  notes?: string;
}

interface TeacherAttendanceRecord {
  id: string;
  tutor_id: string;
  status: MarkStatus;
  late_minutes?: number;
  session_date: string;
  notes?: string;
}

const TODAY = new Date().toISOString().slice(0, 10);
const STATUSES: MarkStatus[] = ["present", "absent", "late", "leave"];

const STATUS_STYLE: Record<MarkStatus, { bg: string; color: string; border: string }> = {
  present: { bg: "#1b5e42", color: "#fff", border: "#1b5e42" },
  absent: { bg: "#dc2626", color: "#fff", border: "#dc2626" },
  late: { bg: "#d97706", color: "#fff", border: "#d97706" },
  leave: { bg: "#2563eb", color: "#fff", border: "#2563eb" },
};

const statusTone = (status: string): "success" | "warning" | "danger" | "info" | "neutral" => {
  if (status === "present") return "success";
  if (status === "late") return "warning";
  if (status === "absent") return "danger";
  if (status === "leave") return "info";
  return "neutral";
};

function blankMarks(ids: string[]): Record<string, MarkStatus> {
  return Object.fromEntries(ids.map((id) => [id, "present" as MarkStatus]));
}

export default function AttendancePage() {
  const [tab, setTab] = useState<Tab>("teachers");
  const [date, setDate] = useState(TODAY);
  const [month, setMonth] = useState(TODAY.slice(0, 7));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [studentRecords, setStudentRecords] = useState<StudentAttendanceRecord[]>([]);
  const [historyStudents, setHistoryStudents] = useState<(StudentAttendanceRecord & { student_name: string; tutor_name: string })[]>([]);
  const [historyTeachers, setHistoryTeachers] = useState<(TeacherAttendanceRecord & { tutor_name: string })[]>([]);

  const [teacherStatus, setTeacherStatus] = useState<Record<string, MarkStatus>>({});
  const [teacherNotes, setTeacherNotes] = useState<Record<string, string>>({});
  const [teacherLate, setTeacherLate] = useState<Record<string, string>>({});
  const [studentStatus, setStudentStatus] = useState<Record<string, MarkStatus>>({});
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [studentLate, setStudentLate] = useState<Record<string, string>>({});

  async function loadPeople() {
    const [{ data: tutorRows }, { data: studentRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "tutor")
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("students")
        .select("id, full_name, tutor_id, tutor:profiles!students_tutor_id_fkey(full_name)")
        .eq("is_active", true)
        .order("full_name"),
    ]);

    const teacherList = (tutorRows || []) as TeacherRow[];
    const studentList = (studentRows || []).map((row: any) => ({
      id: row.id as string,
      full_name: row.full_name as string,
      tutor_id: row.tutor_id as string | null,
      tutor_name: row.tutor?.full_name || "Unassigned",
    })) as StudentRow[];

    setTeachers(teacherList);
    setStudents(studentList);
    return { teacherList, studentList };
  }

  async function loadDayMarks(teacherList: TeacherRow[], studentList: StudentRow[], day: string) {
    const [{ data: tAtt }, { data: sAtt }] = await Promise.all([
      supabase
        .from("teacher_attendance")
        .select("id, tutor_id, status, late_minutes, session_date, notes")
        .eq("session_date", day),
      supabase
        .from("attendance")
        .select("id, student_id, tutor_id, status, late_minutes, session_date, notes")
        .eq("session_date", day),
    ]);

    const teacherAtt = (tAtt || []) as TeacherAttendanceRecord[];
    const studentAtt = (sAtt || []) as StudentAttendanceRecord[];
    setTeacherRecords(teacherAtt);
    setStudentRecords(studentAtt);

    const nextTeacherStatus = blankMarks(teacherList.map((t) => t.id));
    const nextTeacherNotes: Record<string, string> = {};
    const nextTeacherLate: Record<string, string> = {};
    for (const teacher of teacherList) {
      const existing = teacherAtt.find((row) => row.tutor_id === teacher.id);
      nextTeacherStatus[teacher.id] = existing?.status || "present";
      nextTeacherNotes[teacher.id] = existing?.notes || "";
      nextTeacherLate[teacher.id] = existing?.late_minutes ? String(existing.late_minutes) : "";
    }
    setTeacherStatus(nextTeacherStatus);
    setTeacherNotes(nextTeacherNotes);
    setTeacherLate(nextTeacherLate);

    const nextStudentStatus = blankMarks(studentList.map((s) => s.id));
    const nextStudentNotes: Record<string, string> = {};
    const nextStudentLate: Record<string, string> = {};
    for (const student of studentList) {
      const existing = studentAtt.find((row) => row.student_id === student.id);
      nextStudentStatus[student.id] = existing?.status || "present";
      nextStudentNotes[student.id] = existing?.notes || "";
      nextStudentLate[student.id] = existing?.late_minutes ? String(existing.late_minutes) : "";
    }
    setStudentStatus(nextStudentStatus);
    setStudentNotes(nextStudentNotes);
    setStudentLate(nextStudentLate);
  }

  async function loadHistory(monthKey: string, studentList: StudentRow[], teacherList: TeacherRow[]) {
    const monthStart = `${monthKey}-01`;
    const end = new Date(`${monthKey}-01T00:00:00`);
    end.setMonth(end.getMonth() + 1);
    const monthEnd = end.toISOString().slice(0, 10);

    const [{ data: sHist }, { data: tHist }] = await Promise.all([
      supabase
        .from("attendance")
        .select("id, student_id, tutor_id, status, late_minutes, session_date, notes")
        .gte("session_date", monthStart)
        .lt("session_date", monthEnd)
        .order("session_date", { ascending: false }),
      supabase
        .from("teacher_attendance")
        .select("id, tutor_id, status, late_minutes, session_date, notes")
        .gte("session_date", monthStart)
        .lt("session_date", monthEnd)
        .order("session_date", { ascending: false }),
    ]);

    const teacherName = Object.fromEntries(teacherList.map((t) => [t.id, t.full_name]));
    const studentName = Object.fromEntries(studentList.map((s) => [s.id, s.full_name]));
    const studentTutor = Object.fromEntries(studentList.map((s) => [s.id, s.tutor_name]));

    setHistoryStudents(
      ((sHist || []) as StudentAttendanceRecord[]).map((row) => ({
        ...row,
        student_name: studentName[row.student_id] || "Unknown student",
        tutor_name: studentTutor[row.student_id] || teacherName[row.tutor_id || ""] || "Unassigned",
      }))
    );
    setHistoryTeachers(
      ((tHist || []) as TeacherAttendanceRecord[]).map((row) => ({
        ...row,
        tutor_name: teacherName[row.tutor_id] || "Unknown teacher",
      }))
    );
  }

  async function reload() {
    setLoading(true);
    setMessage("");
    const { teacherList, studentList } = await loadPeople();
    await Promise.all([
      loadDayMarks(teacherList, studentList, date),
      loadHistory(month, studentList, teacherList),
    ]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, month]);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => t.full_name.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
  }, [search, teachers]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.full_name.toLowerCase().includes(q) || s.tutor_name.toLowerCase().includes(q)
    );
  }, [search, students]);

  const historyFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (tab === "teachers") {
      return historyTeachers.filter((row) => !q || row.tutor_name.toLowerCase().includes(q));
    }
    return historyStudents.filter(
      (row) =>
        !q
        || row.student_name.toLowerCase().includes(q)
        || row.tutor_name.toLowerCase().includes(q)
    );
  }, [historyStudents, historyTeachers, search, tab]);

  const markStats = useMemo(() => {
    const source = tab === "teachers" ? Object.values(teacherStatus) : Object.values(studentStatus);
    const present = source.filter((s) => s === "present").length;
    const late = source.filter((s) => s === "late").length;
    const absent = source.filter((s) => s === "absent").length;
    const leave = source.filter((s) => s === "leave").length;
    const total = source.length;
    const rate = total ? Math.round(((present + late) / total) * 100) : 0;
    return { present, late, absent, leave, total, rate };
  }, [studentStatus, tab, teacherStatus]);

  async function saveTeacherAttendance() {
    setSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    const errors: string[] = [];

    for (const teacher of teachers) {
      const payload = {
        tutor_id: teacher.id,
        session_date: date,
        status: teacherStatus[teacher.id] || "present",
        late_minutes: teacherStatus[teacher.id] === "late" ? Number(teacherLate[teacher.id] || 0) : 0,
        notes: teacherNotes[teacher.id]?.trim() || null,
        marked_by: user?.id || null,
        updated_at: new Date().toISOString(),
      };
      const existing = teacherRecords.find((row) => row.tutor_id === teacher.id);
      const { error } = existing
        ? await supabase.from("teacher_attendance").update(payload).eq("id", existing.id)
        : await supabase.from("teacher_attendance").insert(payload);
      if (error) errors.push(`${teacher.full_name}: ${error.message}`);
    }

    setSaving(false);
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }
    setMessage("Teacher attendance saved.");
    await reload();
  }

  async function saveStudentAttendance() {
    setSaving(true);
    setMessage("");
    const errors: string[] = [];

    for (const student of students) {
      const payload = {
        student_id: student.id,
        tutor_id: student.tutor_id || null,
        session_date: date,
        status: studentStatus[student.id] || "present",
        late_minutes: studentStatus[student.id] === "late" ? Number(studentLate[student.id] || 0) : 0,
        notes: studentNotes[student.id]?.trim() || null,
        marked_at: new Date().toISOString(),
      };
      const existing = studentRecords.find((row) => row.student_id === student.id);
      const { error } = existing
        ? await supabase.from("attendance").update(payload).eq("id", existing.id)
        : await supabase.from("attendance").insert(payload);
      if (error) errors.push(`${student.full_name}: ${error.message}`);
    }

    setSaving(false);
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }
    setMessage("Student attendance saved.");
    await reload();
  }

  function markAll(status: MarkStatus) {
    if (tab === "teachers") {
      setTeacherStatus(Object.fromEntries(teachers.map((t) => [t.id, status])));
      return;
    }
    setStudentStatus(Object.fromEntries(students.map((s) => [s.id, status])));
  }

  const rows = tab === "teachers" ? filteredTeachers : filteredStudents;

  return (
    <>
      <TopBar title="Attendance" subtitle="Mark teacher and student attendance" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Operations"
          title="Attendance"
          description="Admin can mark teacher attendance. Teachers mark student attendance; admins can override both."
          actions={(
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Attendance date"
              />
              <input
                type="month"
                className="form-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                aria-label="History month"
              />
            </div>
          )}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {([
            { id: "teachers" as const, label: "Teachers", count: teachers.length },
            { id: "students" as const, label: "Students", count: students.length },
          ]).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn ${tab === item.id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => { setTab(item.id); setSearch(""); setMessage(""); }}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        <PortalGrid className="mb-6">
          <MetricCard label="Attendance Rate" value={`${markStats.rate}%`} helper={`${markStats.total} marked for ${date}`} icon={CalendarCheck2} />
          <MetricCard label="Present" value={markStats.present} helper="On-time" icon={CheckCircle2} tone="blue" />
          <MetricCard label="Late" value={markStats.late} helper="Arrived late" icon={Clock3} tone="gold" />
          <MetricCard label="Absent / Leave" value={markStats.absent + markStats.leave} helper={`${markStats.leave} on leave`} icon={XCircle} tone={markStats.absent ? "red" : "green"} />
        </PortalGrid>

        <SectionCard
          title={tab === "teachers" ? "Mark teacher attendance" : "Mark student attendance"}
          description={`Date: ${date}`}
          className="portal-section-card--full"
          action={(
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label className="search-field" aria-label="Search">
                <Search size={15} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "teachers" ? "Search teacher…" : "Search student or tutor…"}
                />
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => markAll("present")}>All present</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => markAll("absent")}>All absent</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || rows.length === 0}
                onClick={tab === "teachers" ? saveTeacherAttendance : saveStudentAttendance}
              >
                {saving ? "Saving…" : "Save attendance"}
              </button>
            </div>
          )}
        >
          {message && (
            <p style={{ marginBottom: 12, fontSize: "0.85rem", color: message.includes("saved") ? "#15803d" : "#dc2626" }}>
              {message}
            </p>
          )}

          {loading ? (
            <LoadingState label="Loading attendance…" />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title={tab === "teachers" ? "No active teachers" : "No active students"}
              description="Add people first, then mark attendance here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(tab === "teachers" ? filteredTeachers : filteredStudents).map((person, index, list) => {
                const id = person.id;
                const statusMap = tab === "teachers" ? teacherStatus : studentStatus;
                const notesMap = tab === "teachers" ? teacherNotes : studentNotes;
                const lateMap = tab === "teachers" ? teacherLate : studentLate;
                const setStatus = tab === "teachers" ? setTeacherStatus : setStudentStatus;
                const setNotes = tab === "teachers" ? setTeacherNotes : setStudentNotes;
                const setLate = tab === "teachers" ? setTeacherLate : setStudentLate;
                const subtitle = tab === "teachers"
                  ? (person as TeacherRow).email || "Teacher"
                  : `Tutor: ${(person as StudentRow).tutor_name}`;

                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      padding: "14px 4px",
                      borderBottom: index < list.length - 1 ? "1px solid #f1f5f9" : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem", flexShrink: 0 }}>
                      {person.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{person.full_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{subtitle}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {STATUSES.map((st) => {
                        const active = statusMap[id] === st;
                        const style = STATUS_STYLE[st];
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatus((prev) => ({ ...prev, [id]: st }))}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: `1px solid ${active ? style.border : "#e2e8f0"}`,
                              background: active ? style.bg : "transparent",
                              color: active ? style.color : "#64748b",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              textTransform: "capitalize",
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    {statusMap[id] === "late" && (
                      <input
                        type="number"
                        min={1}
                        className="form-input"
                        style={{ width: 90, fontSize: "0.78rem", padding: "6px 8px" }}
                        placeholder="Mins"
                        value={lateMap[id] || ""}
                        onChange={(e) => setLate((prev) => ({ ...prev, [id]: e.target.value }))}
                      />
                    )}
                    <input
                      className="form-input"
                      style={{ width: 200, fontSize: "0.78rem", padding: "6px 10px" }}
                      placeholder="Note (optional)"
                      value={notesMap[id] || ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [id]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={tab === "teachers" ? "Teacher register (month)" : "Student register (month)"}
          description={`${historyFiltered.length} records in ${month}`}
          className="portal-section-card--full"
        >
          {loading ? (
            <LoadingState label="Loading register…" />
          ) : historyFiltered.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="No records this month" description="Saved attendance will appear here." />
          ) : (
            <div className="portal-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {tab === "students" ? <th>Student</th> : null}
                    <th>{tab === "teachers" ? "Teacher" : "Teacher"}</th>
                    <th>Status</th>
                    <th>Late</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tab === "teachers"
                    ? (historyFiltered as (TeacherAttendanceRecord & { tutor_name: string })[]).map((row) => (
                        <tr key={row.id}>
                          <td>{new Date(row.session_date).toLocaleDateString("en-GB")}</td>
                          <td><strong>{row.tutor_name}</strong></td>
                          <td><StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge></td>
                          <td>{row.late_minutes ? `${row.late_minutes} min` : "—"}</td>
                          <td>{row.notes || "—"}</td>
                        </tr>
                      ))
                    : (historyFiltered as (StudentAttendanceRecord & { student_name: string; tutor_name: string })[]).map((row) => (
                        <tr key={row.id}>
                          <td>{row.session_date ? new Date(row.session_date).toLocaleDateString("en-GB") : "—"}</td>
                          <td><strong>{row.student_name}</strong></td>
                          <td>{row.tutor_name}</td>
                          <td><StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge></td>
                          <td>{row.late_minutes ? `${row.late_minutes} min` : "—"}</td>
                          <td>{row.notes || "—"}</td>
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

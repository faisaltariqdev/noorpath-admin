import { supabase } from "@/lib/supabase";
import { unwrapOne } from "@/lib/currency";
import type {
  ChildCardData,
  FamilyChild,
  FamilyMetrics,
  HubAttendance,
  HubHomework,
  HubReport,
  HubSession,
} from "./types";

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function calcStreak(presentDates: string[]): number {
  if (!presentDates.length) return 0;
  const set = new Set(presentDates);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function loadFamilyData(parentId: string) {
  const { data: studentRows } = await supabase
    .from("students")
    .select("id, full_name, age, level, course, country, tutor_id, tutor:profiles!students_tutor_id_fkey(full_name)")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("full_name");

  const children: FamilyChild[] = (studentRows || []).map((s: any) => {
    const tutor = unwrapOne<{ full_name?: string }>(s.tutor);
    return {
      id: s.id,
      full_name: s.full_name,
      age: s.age,
      level: s.level,
      course: s.course,
      tutor_id: s.tutor_id,
      tutor_name: tutor?.full_name || "Not assigned",
      country: s.country,
      avatar_initial: (s.full_name || "?").charAt(0).toUpperCase(),
    };
  });

  const ids = children.map((c) => c.id);
  if (!ids.length) {
    return {
      children,
      metrics: emptyMetrics(),
      cards: [] as ChildCardData[],
      homework: [] as HubHomework[],
      attendance: [] as HubAttendance[],
      reports: [] as HubReport[],
      sessions: [] as HubSession[],
      todaySessions: [] as HubSession[],
    };
  }

  const nameById = Object.fromEntries(children.map((c) => [c.id, c.full_name]));
  const courseById = Object.fromEntries(children.map((c) => [c.id, c.course || "—"]));
  const now = new Date().toISOString();

  const [
    { data: hw },
    { data: att },
    { data: reps },
    { data: sessions },
    { data: roadmaps },
  ] = await Promise.all([
    supabase
      .from("homework_logs")
      .select("id, student_id, title, homework_text, subject, due_date, is_completed, status, teacher_feedback, submitted_at, marks, max_marks, attachments, created_at, is_published, archived_at")
      .in("student_id", ids)
      .or("is_published.is.null,is_published.eq.true")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("attendance")
      .select("id, student_id, session_date, status, notes, late_minutes, class_label, scheduled_at, actual_join_at, actual_duration_minutes, session_id")
      .in("student_id", ids)
      .order("session_date", { ascending: false })
      .limit(120),
    supabase
      .from("progress_reports")
      .select("id, student_id, report_kind, overall_rating, tajweed_stars, surah_covered, pages_covered, topics_covered, tutor_notes, homework, mistakes, reading_quality, behaviour, participation, next_lesson_plan, created_at, tutor:profiles(full_name)")
      .in("student_id", ids)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("class_sessions")
      .select("id, student_id, scheduled_at, duration_minutes, status, meeting_link, notes, tutor:profiles!class_sessions_tutor_id_fkey(full_name)")
      .in("student_id", ids)
      .order("scheduled_at", { ascending: false })
      .limit(80),
    supabase
      .from("course_roadmaps")
      .select("student_id, title, status, planned_date")
      .in("student_id", ids)
      .order("planned_date", { ascending: true }),
  ]);

  const homework: HubHomework[] = (hw || []).map((row: any) => ({
    ...row,
    student_name: nameById[row.student_id] || "—",
  }));

  const attendance: HubAttendance[] = (att || []).map((row: any) => ({
    ...row,
    student_name: nameById[row.student_id] || "—",
    course: courseById[row.student_id],
    tutor_name: children.find((c) => c.id === row.student_id)?.tutor_name,
  }));

  const reports: HubReport[] = (reps || []).map((row: any) => ({
    ...row,
    student_name: nameById[row.student_id] || "—",
    tutor_name: unwrapOne<{ full_name?: string }>(row.tutor)?.full_name || "—",
  }));

  const allSessions: HubSession[] = (sessions || []).map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    student_name: nameById[row.student_id] || "—",
    scheduled_at: row.scheduled_at,
    duration_minutes: row.duration_minutes,
    status: row.status,
    meeting_link: row.meeting_link,
    notes: row.notes,
    tutor_name: unwrapOne<{ full_name?: string }>(row.tutor)?.full_name
      || children.find((c) => c.id === row.student_id)?.tutor_name
      || "—",
    course: courseById[row.student_id],
  }));

  const todaySessions = allSessions.filter((s) => {
    const t = new Date(s.scheduled_at).getTime();
    return t >= new Date(startOfTodayIso()).getTime() && t <= new Date(endOfTodayIso()).getTime();
  });

  const completedLessons = allSessions.filter((s) => s.status === "completed").length
    + reports.filter((r) => r.report_kind !== "weekly" && r.report_kind !== "monthly").length;

  const pendingHomework = homework.filter((h) => !h.is_completed && h.status !== "archived").length;
  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const averageAttendance = attendance.length
    ? Math.round((present / attendance.length) * 100)
    : 0;

  const roadmapRows = roadmaps || [];
  const roadmapDone = roadmapRows.filter((r: any) => r.status === "completed").length;
  const overallProgress = roadmapRows.length
    ? Math.round((roadmapDone / roadmapRows.length) * 100)
    : Math.min(100, Math.round((completedLessons / Math.max(children.length * 10, 1)) * 100));

  const scores = reports
    .map((r) => Number(r.tajweed_stars || 0))
    .filter((n) => n > 0);
  const averageScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20)
    : 0;

  const overallStreak = calcStreak(
    attendance
      .filter((a) => a.status === "present" || a.status === "late")
      .map((a) => (a.session_date || "").slice(0, 10))
      .filter(Boolean)
  );

  const badgesEarned =
    (overallStreak >= 7 ? 1 : 0)
    + (averageAttendance >= 90 ? 1 : 0)
    + (pendingHomework === 0 && homework.length > 0 ? 1 : 0)
    + (averageScore >= 80 ? 1 : 0)
    + (overallProgress >= 50 ? 1 : 0);

  const metrics: FamilyMetrics = {
    totalChildren: children.length,
    todaysClasses: todaySessions.filter((s) => s.status === "scheduled" || s.status === "completed").length,
    completedLessons,
    pendingHomework,
    averageAttendance,
    overallProgress,
    overallStreak,
    averageScore,
    badgesEarned,
  };

  const cards: ChildCardData[] = children.map((child) => {
    const childAtt = attendance.filter((a) => a.student_id === child.id);
    const childPresent = childAtt.filter((a) => a.status === "present" || a.status === "late").length;
    const childHw = homework.filter((h) => h.student_id === child.id);
    const pending = childHw.filter((h) => !h.is_completed).length;
    const childRoad = roadmapRows.filter((r: any) => r.student_id === child.id);
    const current = childRoad.find((r: any) => r.status === "in_progress" || r.status === "pending");
    const childSessions = allSessions.filter((s) => s.student_id === child.id);
    const lastDone = childSessions.find((s) => s.status === "completed");
    const nextUp = childSessions
      .filter((s) => s.status === "scheduled" && s.scheduled_at >= now)
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
    const childReports = reports.filter((r) => r.student_id === child.id);
    const progressPct = childRoad.length
      ? Math.round((childRoad.filter((r: any) => r.status === "completed").length / childRoad.length) * 100)
      : Math.min(100, childReports.length * 8);

    return {
      ...child,
      currentLesson: current?.title || childReports[0]?.surah_covered || child.course || "Getting started",
      attendanceRate: childAtt.length ? Math.round((childPresent / childAtt.length) * 100) : 0,
      homeworkStatus: pending === 0 ? "All clear" : `${pending} pending`,
      progressPct,
      lastClass: lastDone
        ? new Date(lastDone.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
        : "—",
      nextClass: nextUp
        ? new Date(nextUp.scheduled_at).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    };
  });

  return {
    children,
    metrics,
    cards,
    homework,
    attendance,
    reports,
    sessions: allSessions,
    todaySessions,
  };
}

function emptyMetrics(): FamilyMetrics {
  return {
    totalChildren: 0,
    todaysClasses: 0,
    completedLessons: 0,
    pendingHomework: 0,
    averageAttendance: 0,
    overallProgress: 0,
    overallStreak: 0,
    averageScore: 0,
    badgesEarned: 0,
  };
}

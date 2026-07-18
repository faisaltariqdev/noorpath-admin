export type ChildFilter = "all" | string;
export type HubSection =
  | "overview"
  | "homework"
  | "progress"
  | "attendance"
  | "history"
  | "today"
  | "reports";

export interface FamilyChild {
  id: string;
  full_name: string;
  age?: number | null;
  level?: string | null;
  course?: string | null;
  tutor_name: string;
  tutor_id?: string | null;
  country?: string | null;
  avatar_initial: string;
}

export interface FamilyMetrics {
  totalChildren: number;
  todaysClasses: number;
  completedLessons: number;
  pendingHomework: number;
  averageAttendance: number;
  overallProgress: number;
  overallStreak: number;
  averageScore: number;
  badgesEarned: number;
}

export interface ChildCardData extends FamilyChild {
  currentLesson: string;
  attendanceRate: number;
  homeworkStatus: string;
  progressPct: number;
  lastClass: string;
  nextClass: string;
}

export interface HubHomework {
  id: string;
  student_id: string;
  student_name: string;
  title?: string | null;
  homework_text: string;
  subject?: string | null;
  due_date?: string | null;
  is_completed: boolean;
  status?: string | null;
  teacher_feedback?: string | null;
  submitted_at?: string | null;
  marks?: number | null;
  max_marks?: number | null;
  attachments?: unknown;
  created_at: string;
}

export interface HubAttendance {
  id: string;
  student_id: string;
  student_name: string;
  session_date?: string | null;
  status: string;
  notes?: string | null;
  late_minutes?: number | null;
  class_label?: string | null;
  scheduled_at?: string | null;
  actual_join_at?: string | null;
  actual_duration_minutes?: number | null;
  tutor_name?: string;
  course?: string;
  duration_minutes?: number;
}

export interface HubReport {
  id: string;
  student_id: string;
  student_name: string;
  report_kind?: string | null;
  overall_rating?: string | null;
  tajweed_stars?: number | null;
  surah_covered?: string | null;
  pages_covered?: string | null;
  topics_covered?: string | null;
  tutor_notes?: string | null;
  homework?: string | null;
  mistakes?: string | null;
  reading_quality?: string | null;
  behaviour?: string | null;
  participation?: string | null;
  next_lesson_plan?: string | null;
  created_at: string;
  tutor_name?: string;
}

export interface HubSession {
  id: string;
  student_id: string;
  student_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  meeting_link?: string | null;
  notes?: string | null;
  tutor_name?: string;
  course?: string;
}

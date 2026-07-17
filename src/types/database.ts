export type Role = "admin" | "tutor" | "parent";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type FeeStatus = "pending" | "paid" | "overdue" | "waived";
export type TrialStatus = "booked" | "attended" | "converted" | "lost";
export type OverallRating = "excellent" | "good" | "average" | "needs_improvement";
export type EarningStatus = "pending" | "paid";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  timezone: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  parent_id?: string;
  tutor_id?: string;
  full_name: string;
  age?: number;
  gender?: "male" | "female";
  country?: string;
  timezone: string;
  course?: string;
  level: "beginner" | "intermediate" | "advanced";
  source?: "google" | "facebook" | "referral" | "organic" | "whatsapp" | "other";
  trial_status: TrialStatus;
  is_active: boolean;
  enrolled_at: string;
  notes?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: CourseLevel;
  duration_weeks?: number;
  price_amount?: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClassSession {
  id: string;
  student_id: string;
  tutor_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  meeting_link?: string;
  notes?: string;
  session_group_id?: string;
  created_at: string;
  student?: Student;
  tutor?: Profile;
}

export interface Attendance {
  id: string;
  session_id?: string;
  student_id: string;
  status: AttendanceStatus;
  late_minutes?: number;
  marked_at?: string;
  tutor_id?: string;
  notes?: string;
  session_date?: string;
}

export interface ProgressReport {
  id: string;
  session_id?: string;
  student_id: string;
  tutor_id?: string;
  pages_covered?: string;
  surah_covered?: string;
  tajweed_rules?: string[];
  mistakes?: string;
  audio_note_url?: string;
  overall_rating?: OverallRating;
  tajweed_stars?: number;
  homework?: string;
  tutor_notes?: string;
  created_at: string;
  student?: Student;
}

export interface HomeworkLog {
  id: string;
  report_id?: string;
  student_id: string;
  tutor_id?: string;
  homework_text: string;
  title?: string;
  subject?: string;
  due_date?: string;
  status?: string;
  is_completed: boolean;
  completed_at?: string;
  parent_notes?: string;
  created_at: string;
}

export type CourseRoadmapStatus = "pending" | "in_progress" | "completed" | "skipped";
export type LessonType = "lesson" | "revision" | "test" | "milestone" | "holiday";

export interface CourseRoadmap {
  id: string;
  student_id: string;
  tutor_id?: string;
  title: string;
  description?: string;
  surah?: string;
  lesson_type: LessonType;
  planned_date?: string;
  completed_date?: string;
  order_index: number;
  status: CourseRoadmapStatus;
  duration_minutes: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DailyWorkNoteStatus = "pending" | "completed";

export interface DailyWorkNote {
  id: string;
  student_id: string;
  tutor_id?: string;
  work_date: string;
  work_text: string;
  status: DailyWorkNoteStatus;
  completed_at?: string;
  created_at: string;
  student?: Student;
  tutor?: Profile;
}

export interface HomeworkTemplate {
  id: string;
  tutor_id: string;
  title: string;
  content?: string;
  subject?: string;
  level?: string;
  description?: string;
  created_at: string;
}

export interface Fee {
  id: string;
  student_id: string;
  parent_id?: string;
  amount: number;
  currency: string;
  period_month: number;
  period_year: number;
  due_date: string;
  paid_date?: string;
  status: FeeStatus;
  payment_method?: string;
  stripe_payment_id?: string;
  notes?: string;
  created_at: string;
  student?: Student;
}

export interface Notification {
  id: string;
  recipient_id?: string;
  type: string;
  title: string;
  message: string;
  body?: string;
  sender_id?: string;
  target_role?: string;
  sent_via?: string[];
  is_read: boolean;
  created_at: string;
}

export interface LegacyMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  student_id?: string;
  message: string;
  attachment_url?: string;
  is_read: boolean;
  flagged: boolean;
  created_at: string;
  sender?: Profile;
}

export interface ChatMessage {
  id: string;
  sender_id?: string;
  body: string;
  created_at: string;
  sender?: Profile;
}

export interface TutorEarning {
  id: string;
  tutor_id: string;
  month: number;
  year: number;
  total_classes: number;
  total_hours: number;
  rate_per_hour: number;
  total_amount: number;
  currency: string;
  status: EarningStatus;
  paid_date?: string;
  invoice_generated?: boolean;
  created_at: string;
}

// Supabase Database type wrapper
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course> };
      students: { Row: Student; Insert: Partial<Student>; Update: Partial<Student> };
      class_sessions: { Row: ClassSession; Insert: Partial<ClassSession>; Update: Partial<ClassSession> };
      attendance: { Row: Attendance; Insert: Partial<Attendance>; Update: Partial<Attendance> };
      progress_reports: { Row: ProgressReport; Insert: Partial<ProgressReport>; Update: Partial<ProgressReport> };
      course_roadmaps: { Row: CourseRoadmap; Insert: Partial<CourseRoadmap>; Update: Partial<CourseRoadmap> };
      daily_work_notes: { Row: DailyWorkNote; Insert: Partial<DailyWorkNote>; Update: Partial<DailyWorkNote> };
      homework_logs: { Row: HomeworkLog; Insert: Partial<HomeworkLog>; Update: Partial<HomeworkLog> };
      homework_templates: { Row: HomeworkTemplate; Insert: Partial<HomeworkTemplate>; Update: Partial<HomeworkTemplate> };
      fees: { Row: Fee; Insert: Partial<Fee>; Update: Partial<Fee> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      messages: { Row: LegacyMessage; Insert: Partial<LegacyMessage>; Update: Partial<LegacyMessage> };
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage>; Update: Partial<ChatMessage> };
      tutor_earnings: { Row: TutorEarning; Insert: Partial<TutorEarning>; Update: Partial<TutorEarning> };
    };
  };
}

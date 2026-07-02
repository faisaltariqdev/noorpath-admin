export type Role = "admin" | "tutor" | "parent";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type FeeStatus = "pending" | "paid" | "overdue" | "waived";
export type TrialStatus = "booked" | "attended" | "converted" | "lost";
export type OverallRating = "excellent" | "good" | "average" | "needs_improvement";

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

export interface ClassSession {
  id: string;
  student_id: string;
  tutor_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  student?: Student;
  tutor?: Profile;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  late_minutes: number;
  marked_at: string;
}

export interface ProgressReport {
  id: string;
  session_id: string;
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
  report_id: string;
  student_id: string;
  homework_text: string;
  is_completed: boolean;
  completed_at?: string;
  parent_notes?: string;
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
  notes?: string;
  created_at: string;
  student?: Student;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  student_id?: string;
  message: string;
  attachment_url?: string;
  is_read: boolean;
  flagged: boolean;
  created_at: string;
  sender?: Profile;
}

// Supabase Database type wrapper
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      students: { Row: Student; Insert: Partial<Student>; Update: Partial<Student> };
      class_sessions: { Row: ClassSession; Insert: Partial<ClassSession>; Update: Partial<ClassSession> };
      attendance: { Row: Attendance; Insert: Partial<Attendance>; Update: Partial<Attendance> };
      progress_reports: { Row: ProgressReport; Insert: Partial<ProgressReport>; Update: Partial<ProgressReport> };
      homework_logs: { Row: HomeworkLog; Insert: Partial<HomeworkLog>; Update: Partial<HomeworkLog> };
      fees: { Row: Fee; Insert: Partial<Fee>; Update: Partial<Fee> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
    };
  };
}

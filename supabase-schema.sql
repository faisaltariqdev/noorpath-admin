-- ============================================================
-- NoorPath Admin Panel — Complete Database Schema
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'parent')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  course TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  source TEXT CHECK (source IN ('google', 'facebook', 'referral', 'organic', 'whatsapp', 'other')),
  referral_by UUID REFERENCES profiles(id),
  trial_status TEXT DEFAULT 'booked' CHECK (trial_status IN ('booked', 'attended', 'converted', 'lost')),
  is_active BOOLEAN DEFAULT TRUE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASS SESSIONS (schedule)
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
  late_minutes INT DEFAULT 0,
  marked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROGRESS REPORTS (tutor submits after each class)
CREATE TABLE progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  pages_covered TEXT,
  surah_covered TEXT,
  tajweed_rules TEXT[],
  mistakes TEXT,
  audio_note_url TEXT,
  overall_rating TEXT CHECK (overall_rating IN ('excellent', 'good', 'average', 'needs_improvement')),
  tajweed_stars INT CHECK (tajweed_stars BETWEEN 1 AND 5),
  homework TEXT,
  homework_template_id UUID,
  tutor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HOMEWORK TRACKING
CREATE TABLE homework_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES progress_reports(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  homework_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  parent_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HOMEWORK TEMPLATES (reusable by tutors)
CREATE TABLE homework_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FEE MANAGEMENT
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'bank_transfer', 'paypal', 'cash', 'other')),
  stripe_payment_id TEXT,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TUTOR EARNINGS
CREATE TABLE tutor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  total_classes INT DEFAULT 0,
  total_hours DECIMAL(5,2) DEFAULT 0,
  rate_per_hour DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_date DATE,
  invoice_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TUTOR AVAILABILITY
CREATE TABLE tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE
);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('class_reminder', 'fee_due', 'progress_report', 'homework', 'announcement', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_via TEXT[], -- ['email', 'whatsapp', 'in_app']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MESSAGES (admin-monitored tutor-parent chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin sees everything
CREATE POLICY "Admin full access - profiles" ON profiles FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Tutor sees own profile + students they teach
CREATE POLICY "Tutor sees own profile" ON profiles FOR SELECT USING (
  id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Parent sees own profile
CREATE POLICY "Parent sees own profile" ON profiles FOR SELECT USING (
  id = auth.uid()
);

-- Tutor sees their own students
CREATE POLICY "Tutor sees own students" ON students FOR SELECT USING (
  tutor_id = auth.uid() OR parent_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Parent sees own children
CREATE POLICY "Parent sees own children" ON students FOR SELECT USING (
  parent_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'tutor')
);

-- Tutor manages own sessions
CREATE POLICY "Sessions access" ON class_sessions FOR ALL USING (
  tutor_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Parent sees sessions for their children
CREATE POLICY "Parent sees sessions" ON class_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = class_sessions.student_id AND parent_id = auth.uid())
);

-- Fees: parent sees own, admin sees all
CREATE POLICY "Fees access" ON fees FOR SELECT USING (
  parent_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Notifications: own only
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Own notifications update" ON notifications FOR UPDATE USING (recipient_id = auth.uid());

-- Messages: sender or recipient
CREATE POLICY "Own messages" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- HELPER FUNCTION: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX idx_students_tutor ON students(tutor_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_sessions_tutor ON class_sessions(tutor_id);
CREATE INDEX idx_sessions_student ON class_sessions(student_id);
CREATE INDEX idx_sessions_scheduled ON class_sessions(scheduled_at);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_progress_student ON progress_reports(student_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, is_read);

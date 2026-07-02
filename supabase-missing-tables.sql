-- ============================================================
-- NoorPath Admin — Missing Tables (run in Supabase SQL Editor)
-- ============================================================

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
  target_role TEXT DEFAULT 'all',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can read notifications" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update is_read" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');

-- MESSAGES (group chat / broadcast)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can read messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- HOMEWORK TEMPLATES (tutor-owned reusable templates)
CREATE TABLE IF NOT EXISTS homework_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT DEFAULT 'Quran Recitation',
  level TEXT DEFAULT 'All Levels',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE homework_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can manage own templates" ON homework_templates FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Admins can view all templates" ON homework_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- HOMEWORK LOGS (assigned homework per student)
CREATE TABLE IF NOT EXISTS homework_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES homework_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT DEFAULT 'Quran Recitation',
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE homework_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors manage student homework" ON homework_logs FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Parents view child homework" ON homework_logs FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
);
CREATE POLICY "Parents update homework status" ON homework_logs FOR UPDATE USING (
  student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
);
CREATE POLICY "Admins view all homework" ON homework_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TUTOR EARNINGS
CREATE TABLE IF NOT EXISTS tutor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  hours_worked NUMERIC(5,1),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tutor_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors view own earnings" ON tutor_earnings FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Admins manage all earnings" ON tutor_earnings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ensure attendance table has tutor_id
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_homework_student ON homework_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_earnings_tutor ON tutor_earnings(tutor_id);

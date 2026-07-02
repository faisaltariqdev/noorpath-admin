-- Course Roadmap Table
CREATE TABLE IF NOT EXISTS course_roadmaps (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  tutor_id        UUID REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  surah           TEXT,
  lesson_type     TEXT DEFAULT 'lesson'
                  CHECK (lesson_type IN ('lesson','revision','test','milestone','holiday')),
  planned_date    DATE,
  completed_date  DATE,
  order_index     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','in_progress','completed','skipped')),
  duration_minutes INTEGER DEFAULT 30,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast student queries
CREATE INDEX IF NOT EXISTS idx_roadmap_student ON course_roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tutor   ON course_roadmaps(tutor_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_date    ON course_roadmaps(planned_date);

-- RLS
ALTER TABLE course_roadmaps ENABLE ROW LEVEL SECURITY;

-- Tutors can manage their own roadmaps
CREATE POLICY "Tutors manage own roadmaps"
ON course_roadmaps FOR ALL
TO authenticated
USING (tutor_id = auth.uid())
WITH CHECK (tutor_id = auth.uid());

-- Parents can view their child's roadmap
CREATE POLICY "Parents view child roadmap"
ON course_roadmaps FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM students WHERE parent_id = auth.uid()
  )
);

-- Admins can view all
CREATE POLICY "Admins view all roadmaps"
ON course_roadmaps FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

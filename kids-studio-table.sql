-- ============================================================
-- NoorPath Admin — Kids Studio Feature
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Kids Studio Assignments
-- Tracks which students have access to the animated Noorani Qaida game
-- and which tutor is managing their studio progress.
CREATE TABLE IF NOT EXISTS kids_studio_assignments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lesson_unlocked_up_to INT  NOT NULL DEFAULT 1,   -- Admin controls lesson access
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Kids Studio Progress
-- Tracks each student's progress per lesson (stars earned, completion, XP)
CREATE TABLE IF NOT EXISTS kids_studio_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id    INT  NOT NULL,                        -- 1 to 18
  stars_earned INT  NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  xp_earned    INT  NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts     INT  NOT NULL DEFAULT 0,
  last_played  TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ks_assignments_student ON kids_studio_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_ks_assignments_tutor   ON kids_studio_assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_ks_progress_student    ON kids_studio_progress(student_id);

-- 4. RLS Policies

-- Assignments: Admin can read/write all, Tutors can read their own, Parents can read their child's
ALTER TABLE kids_studio_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on ks_assignments"
  ON kids_studio_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Tutor read own ks_assignments"
  ON kids_studio_assignments FOR SELECT
  USING (tutor_id = auth.uid());

CREATE POLICY "Parent read child ks_assignments"
  ON kids_studio_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_id AND s.parent_id = auth.uid()
  ));

-- Progress: Admin full, Tutor read own, Parent read/write child's
ALTER TABLE kids_studio_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on ks_progress"
  ON kids_studio_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Tutor read progress for their students"
  ON kids_studio_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM kids_studio_assignments ksa
    WHERE ksa.student_id = student_id AND ksa.tutor_id = auth.uid()
  ));

CREATE POLICY "Parent read and update child progress"
  ON kids_studio_progress FOR ALL
  USING (EXISTS (
    SELECT 1 FROM students s WHERE s.id = student_id AND s.parent_id = auth.uid()
  ));

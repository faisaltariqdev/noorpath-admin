-- ══════════════════════════════════════════════════════
-- NoorPath Admin — Full Demo Data
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- IDs from existing database:
-- Tutor Sara Ahmed:   565948d7-1a15-4e69-8ca6-acd71cd9a142
-- Tutor Yusuf Khan:   0c1af19f-66de-4350-8288-6aea36292811
-- Parent Ali Hassan:  8af50642-a3e3-4ed2-bc62-b7a37e19870b
-- Parent Maria Riaz:  868a8cc7-40f7-46e4-b5ad-7e36e51f185e
-- Student Aisha Hassan:  10831d9c-588f-4294-9ead-f597c2690d79  (Noorani Qaida)
-- Student Omar Hassan:   7e05a21e-16bd-46e6-ad6a-7929e457b5f6  (Quran Recitation)
-- Student Fatima Hassan: 8db4a560-5391-40c1-a652-17c8034ac87d  (Noorani Qaida)
-- Student Zara Riaz:     39be228f-5f3f-45c0-ba92-7e3d65aa0391  (Noorani Qaida)
-- Student Ibrahim Riaz:  0bf9f048-87d8-4817-bed9-bf4f99bc7940  (Hifz Program)

-- ══════════════════════════════════════════════════════
-- 1. COURSE ROADMAPS (for Tutor Sara — Aisha Hassan)
-- ══════════════════════════════════════════════════════
INSERT INTO course_roadmaps (student_id, tutor_id, title, description, surah, lesson_type, planned_date, status, duration_minutes, order_index, notes, completed_date) VALUES

-- Aisha Hassan — Noorani Qaida roadmap
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Arabic Alphabet Introduction', 'Learn all 28 Arabic letters, their shapes and basic sounds', 'Huroof e Tahajji', 'lesson',
 (CURRENT_DATE - INTERVAL '30 days')::date, 'completed', 30, 1, 'Student picked up letters very quickly!', (CURRENT_DATE - INTERVAL '29 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Harakaat — Short Vowels', 'Fatha, Kasra, Damma — practice with each letter', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '25 days')::date, 'completed', 30, 2, NULL, (CURRENT_DATE - INTERVAL '24 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Tanween & Sukoon', 'Double vowels and resting letters', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '20 days')::date, 'completed', 45, 3, NULL, (CURRENT_DATE - INTERVAL '19 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Revision — Chapters 1-3', 'Full revision of harakaat, tanween, sukoon', NULL, 'revision',
 (CURRENT_DATE - INTERVAL '14 days')::date, 'completed', 30, 4, 'Very good retention', (CURRENT_DATE - INTERVAL '13 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Madd Letters — Alif, Waw, Ya', 'Introduction to long vowels', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '7 days')::date, 'completed', 45, 5, NULL, (CURRENT_DATE - INTERVAL '6 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Milestone: Noorani Qaida Part 1 Complete!', 'Student has mastered the basics of Arabic reading', NULL, 'milestone',
 (CURRENT_DATE - INTERVAL '5 days')::date, 'completed', 30, 6, 'Excellent progress — ready for Quran reading!', (CURRENT_DATE - INTERVAL '5 days')::date),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Noon Sakinah Rules', 'Izhar, Idgham, Iqlab, Ikhfa', NULL, 'lesson',
 CURRENT_DATE, 'in_progress', 45, 7, 'Today focus on Izhar letters only'),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Meem Sakinah Rules', 'Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi', NULL, 'lesson',
 (CURRENT_DATE + INTERVAL '3 days')::date, 'pending', 45, 8, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah Al-Fatiha Reading', 'Apply all rules to read Al-Fatiha with full Tajweed', 'Al-Fatiha', 'lesson',
 (CURRENT_DATE + INTERVAL '7 days')::date, 'pending', 60, 9, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Test — Tajweed Rules', 'Formal test on Noon Sakinah and Meem Sakinah', NULL, 'test',
 (CURRENT_DATE + INTERVAL '14 days')::date, 'pending', 30, 10, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah Al-Ikhlas Memorization', 'Memorize and recite with correct Tajweed', 'Al-Ikhlas', 'lesson',
 (CURRENT_DATE + INTERVAL '21 days')::date, 'pending', 45, 11, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Eid Break 🌙', 'No class — Eid holiday', NULL, 'holiday',
 (CURRENT_DATE + INTERVAL '28 days')::date, 'pending', 0, 12, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah Al-Falaq & An-Nas', 'Complete Muawwadhatain with Tajweed', 'Al-Falaq', 'lesson',
 (CURRENT_DATE + INTERVAL '35 days')::date, 'pending', 45, 13, NULL),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Milestone: First Surahs Memorized!', 'Aisha has memorized her first 3 short Surahs', NULL, 'milestone',
 (CURRENT_DATE + INTERVAL '42 days')::date, 'pending', 30, 14, NULL),

-- Omar Hassan — Quran Recitation roadmap
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Juz Amma — Overview & Surah An-Naba', 'Start Juz 30 with An-Naba', 'An-Naba', 'lesson',
 (CURRENT_DATE - INTERVAL '21 days')::date, 'completed', 45, 1, NULL, (CURRENT_DATE - INTERVAL '21 days')::date),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah An-Nazi''at & Abasa', 'Two surahs with full Tajweed', 'An-Naziat', 'lesson',
 (CURRENT_DATE - INTERVAL '14 days')::date, 'completed', 45, 2, NULL, (CURRENT_DATE - INTERVAL '14 days')::date),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah At-Takwir to Al-Infitar', 'Focus on Qalqalah letters', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '7 days')::date, 'completed', 45, 3, 'Great improvement in Qalqalah', (CURRENT_DATE - INTERVAL '7 days')::date),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Revision — An-Naba to Al-Infitar', 'Full revision of 4 Surahs', NULL, 'revision',
 CURRENT_DATE, 'in_progress', 60, 4, 'Revision session — check fluency'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Surah Al-Mutaffifin to Al-Inshiqaq', NULL, NULL, 'lesson',
 (CURRENT_DATE + INTERVAL '5 days')::date, 'pending', 45, 5, NULL),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Milestone: Juz Amma 50% Complete', 'Omar has recited 57 Surahs of Juz 30', NULL, 'milestone',
 (CURRENT_DATE + INTERVAL '30 days')::date, 'pending', 30, 6, NULL),

-- Ibrahim Riaz — Hifz Program roadmap (Yusuf Khan)
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Al-Mulk — Memorization', 'Verse by verse memorization of Al-Mulk (30 verses)', 'Al-Mulk', 'lesson',
 (CURRENT_DATE - INTERVAL '30 days')::date, 'completed', 60, 1, 'Strong memorization ability', (CURRENT_DATE - INTERVAL '28 days')::date),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Al-Mulk Revision — Fluency Check', 'Recite full surah with correct maqam', 'Al-Mulk', 'revision',
 (CURRENT_DATE - INTERVAL '21 days')::date, 'completed', 45, 2, NULL, (CURRENT_DATE - INTERVAL '21 days')::date),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Al-Qalam — First Half', 'Verses 1-26', 'Al-Qalam', 'lesson',
 (CURRENT_DATE - INTERVAL '14 days')::date, 'completed', 60, 3, NULL, (CURRENT_DATE - INTERVAL '13 days')::date),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Al-Qalam — Second Half', 'Verses 27-52', 'Al-Qalam', 'lesson',
 (CURRENT_DATE - INTERVAL '7 days')::date, 'completed', 60, 4, 'Excellent retention!', (CURRENT_DATE - INTERVAL '6 days')::date),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Test — Al-Mulk & Al-Qalam', 'Formal Hifz test for both Surahs', NULL, 'test',
 CURRENT_DATE, 'in_progress', 45, 5, 'Today is the formal test — well prepared'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Nuh — Memorization', '28 verses', 'Nuh', 'lesson',
 (CURRENT_DATE + INTERVAL '5 days')::date, 'pending', 60, 6, NULL),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Milestone: 3 Surahs Memorized!', 'Al-Mulk, Al-Qalam, Nuh — Ibrahim is making amazing progress', NULL, 'milestone',
 (CURRENT_DATE + INTERVAL '21 days')::date, 'pending', 30, 7, NULL),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Al-Muzzammil', '20 verses', 'Al-Muzzammil', 'lesson',
 (CURRENT_DATE + INTERVAL '28 days')::date, 'pending', 60, 8, NULL),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Surah Al-Muddaththir', '56 verses — longer surah', 'Al-Muddaththir', 'lesson',
 (CURRENT_DATE + INTERVAL '42 days')::date, 'pending', 60, 9, NULL),

-- Zara Riaz — Noorani Qaida (Yusuf Khan)
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Arabic Letters — Groups 1-3', 'Ba, Ta, Tha / Jim, Ha, Kha / Dal, Dhal', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '14 days')::date, 'completed', 30, 1, NULL, (CURRENT_DATE - INTERVAL '14 days')::date),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Arabic Letters — Groups 4-6', 'Ra, Zay / Sin, Shin / Sad, Dad', NULL, 'lesson',
 (CURRENT_DATE - INTERVAL '7 days')::date, 'completed', 30, 2, 'Some difficulty with Sad vs Sin — needs more practice', (CURRENT_DATE - INTERVAL '7 days')::date),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Arabic Letters — Groups 7-9', 'Ta, Dha / Ain, Ghain / Fa, Qaf', NULL, 'lesson',
 CURRENT_DATE, 'pending', 30, 3, NULL),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Full Alphabet Review', 'Test all 28 letters', NULL, 'test',
 (CURRENT_DATE + INTERVAL '7 days')::date, 'pending', 30, 4, NULL),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Short Vowels — Harakaat', NULL, NULL, 'lesson',
 (CURRENT_DATE + INTERVAL '14 days')::date, 'pending', 30, 5, NULL);


-- ══════════════════════════════════════════════════════
-- 2. ADDITIONAL PROGRESS REPORTS (with Tajweed stars & rules)
-- ══════════════════════════════════════════════════════
INSERT INTO progress_reports (student_id, tutor_id, surah_covered, pages_covered, overall_rating, tajweed_stars, tutor_notes, mistakes, homework, tajweed_rules, created_at) VALUES

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Al-Fatiha', '1 page', 'excellent', 5,
 'MashaAllah! Aisha read Al-Fatiha beautifully today. Her Makharij is excellent for a beginner.',
 'Minor hesitation on Ghain in Al-Ghayr', 'Recite Al-Fatiha 5 times before next class',
 ARRAY['Makharij - Excellent', 'Harakaat - Very Good']::text[], NOW() - INTERVAL '28 days'),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Al-Ikhlas', '1 page', 'good', 4,
 'Good recitation of Al-Ikhlas. Tajweed is improving week by week.',
 'Needs to hold Madd in Ahad longer', 'Practice Al-Ikhlas daily — focus on the long vowels',
 ARRAY['Madd - Needs work']::text[], NOW() - INTERVAL '21 days'),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Al-Falaq', '1 page', 'excellent', 5,
 'Superb session today! Aisha is showing remarkable improvement. The Qalqalah in Al-Falaq was near perfect.',
 NULL, 'Memorize Al-Falaq by next class',
 ARRAY['Qalqalah - Excellent']::text[], NOW() - INTERVAL '14 days'),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'An-Nas', '1 page', 'good', 4,
 'An-Nas recited with good rhythm. Slight rush at the end — patience needed.',
 'Do not rush the last 3 verses', 'Practice slow recitation — quality over speed',
 ARRAY['Waqf - Needs improvement']::text[], NOW() - INTERVAL '7 days'),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Noon Sakinah Rules', NULL, 'good', 4,
 'Good understanding of Izhar rules. Idgham needs more practice.',
 'Idgham with ghunnah — letters Ya and Waw causing confusion',
 'Practice Idgham examples from worksheet',
 ARRAY['Noon Sakinah - Idgham needs work']::text[], NOW() - INTERVAL '1 day'),

-- Omar Hassan reports
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'An-Naba', '2 pages', 'excellent', 5,
 'Omar is a natural Quran reciter. An-Naba was recited with beautiful melody and perfect Tajweed.',
 NULL, 'Revise An-Naba daily — prepare for Surah An-Nazi''at',
 ARRAY['Makharij - Excellent', 'Madd - Perfect', 'Qalqalah - Excellent']::text[], NOW() - INTERVAL '20 days'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'An-Naziat', '2 pages', 'good', 4,
 'Good progress on An-Nazi''at. Some Makharij correction needed for heavy letters.',
 'Heavy letters Ta and Dha need more emphasis', 'Listen to Sheikh Mishary recitation of An-Naziat daily',
 ARRAY['Sifaat - Heavy letters need work']::text[], NOW() - INTERVAL '13 days'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Abasa & At-Takwir', '2 pages', 'excellent', 5,
 'Two surahs in one session — Omar handled it brilliantly! Qalqalah letters are his strong point.',
 NULL, 'Memorize key verses from At-Takwir',
 ARRAY['Qalqalah - Excellent', 'Waqf - Very Good']::text[], NOW() - INTERVAL '6 days'),

-- Ibrahim Riaz reports (Hifz)
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Al-Mulk (1-15)', '1.5 pages', 'excellent', 5,
 'Ibrahim memorized the first half of Al-Mulk flawlessly. His retention is exceptional for his age.',
 NULL, 'Revise verses 1-15 of Al-Mulk 10 times before next class',
 ARRAY['Makharij - Excellent', 'Madd - Perfect']::text[], NOW() - INTERVAL '27 days'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Al-Mulk (16-30)', '1.5 pages', 'excellent', 5,
 'Complete Al-Mulk memorized! Ibrahim should be very proud. Parents - mashaAllah for your support!',
 NULL, 'Full Al-Mulk revision daily for 2 weeks',
 ARRAY['Makharij - Excellent', 'Madd - Excellent', 'Waqf - Very Good']::text[], NOW() - INTERVAL '20 days'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Al-Qalam (1-26)', '2 pages', 'good', 4,
 'Good start on Al-Qalam. More difficult than Al-Mulk but Ibrahim is pushing through well.',
 'Verses 11-16 need more work — complex vocabulary', 'Extra revision of verses 11-16',
 ARRAY['Makharij - Good', 'Fluency needs improvement in verses 11-16']::text[], NOW() - INTERVAL '12 days'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Al-Qalam (27-52)', '2 pages', 'excellent', 5,
 'Al-Qalam complete! Ibrahim is progressing faster than expected. MashaAllah!',
 NULL, 'Full Al-Qalam revision — prepare for formal Hifz test',
 ARRAY['Makharij - Excellent', 'Fluency - Excellent']::text[], NOW() - INTERVAL '5 days'),

-- Zara Riaz reports (Yusuf Khan)
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Arabic Alphabet Groups 1-3', NULL, 'good', 3,
 'Zara is a shy but determined learner. Good first session with the alphabet groups.',
 'Kha vs Ha confusion — needs drilling', 'Practice Kha and Ha sounds daily using the recording',
 ARRAY['Makharij - Kha and Ha confusion']::text[], NOW() - INTERVAL '13 days'),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Arabic Alphabet Groups 4-6', NULL, 'average', 3,
 'Some confusion between Sad and Sin — very common for beginners. Extra practice needed.',
 'Sad/Dad heavy letters vs Sin/Zay light letters', 'Use the mirror exercise to feel Makharij difference',
 ARRAY['Makharij - Sad vs Sin confusion', 'Sifaat - Heavy vs light letters']::text[], NOW() - INTERVAL '6 days');


-- ══════════════════════════════════════════════════════
-- 3. ATTENDANCE — Recent records with varied status
-- ══════════════════════════════════════════════════════
INSERT INTO attendance (student_id, tutor_id, status, late_minutes, session_date, notes) VALUES

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '28 days')::date, 'Very enthusiastic today'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '21 days')::date, NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'late', 8,
 (CURRENT_DATE - INTERVAL '14 days')::date, 'Joined 8 minutes late — internet issue'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '7 days')::date, NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 CURRENT_DATE, 'Doing great today'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '21 days')::date, NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'absent', 0,
 (CURRENT_DATE - INTERVAL '14 days')::date, 'Sick — informed in advance'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '7 days')::date, NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '1 day')::date, NULL),

('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 (CURRENT_DATE - INTERVAL '14 days')::date, NULL),
('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'late', 15,
 (CURRENT_DATE - INTERVAL '7 days')::date, 'Joined 15 minutes late — parent forgot'),
('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0,
 CURRENT_DATE, NULL),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 (CURRENT_DATE - INTERVAL '27 days')::date, 'Perfect attendance!'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 (CURRENT_DATE - INTERVAL '20 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 (CURRENT_DATE - INTERVAL '13 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 (CURRENT_DATE - INTERVAL '6 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 CURRENT_DATE, 'Hifz test day — student is ready'),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0,
 (CURRENT_DATE - INTERVAL '14 days')::date, NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'late', 10,
 (CURRENT_DATE - INTERVAL '7 days')::date, 'Zara joined 10 minutes late'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'leave', 0,
 CURRENT_DATE, 'Zara is on leave today — family event');


-- ══════════════════════════════════════════════════════
-- 4. HOMEWORK LOGS — Active tasks for parents to see
-- ══════════════════════════════════════════════════════
INSERT INTO homework_logs (student_id, tutor_id, homework_text, title, subject, due_date, status, is_completed) VALUES

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Recite Al-Fatiha 5 times with correct pronunciation. Record yourself on phone and listen back.',
 'Al-Fatiha Daily Recitation', 'Quran',
 (CURRENT_DATE + INTERVAL '2 days')::date, 'pending', false),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Practice Noon Sakinah rules — Izhar letters (Hamza, Ha, Kha, Ain, Ghain, Ha). Write 5 examples of each.',
 'Noon Sakinah Practice', 'Tajweed',
 (CURRENT_DATE + INTERVAL '3 days')::date, 'pending', false),

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Memorize Al-Ikhlas with meaning. Write the translation in English.',
 'Al-Ikhlas Memorization', 'Quran', 
 (CURRENT_DATE - INTERVAL '3 days')::date, 'completed', true),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Revise An-Naba and An-Naziat — recite to a parent or family member.',
 'Juz Amma Revision', 'Quran',
 (CURRENT_DATE + INTERVAL '1 day')::date, 'pending', false),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'Listen to Sheikh Mishary recitation of At-Takwir and repeat verse by verse.',
 'At-Takwir Listening Practice', 'Quran',
 (CURRENT_DATE + INTERVAL '4 days')::date, 'pending', false),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Full revision of Al-Mulk 10 times. Focus on fluency and correct stopping points.',
 'Al-Mulk Daily Revision', 'Hifz',
 (CURRENT_DATE + INTERVAL '1 day')::date, 'pending', false),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Revise Al-Qalam verses 11-16 — the difficult verses. Practice 20 times each.',
 'Al-Qalam Difficult Verses', 'Hifz',
 CURRENT_DATE, 'pending', false),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 'Write out Al-Mulk from memory — test yourself without looking at Quran.',
 'Al-Mulk Memory Test', 'Hifz',
 (CURRENT_DATE - INTERVAL '5 days')::date, 'completed', true),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 'Practice distinguishing Sad (ص) and Sin (س) — use the mirror to feel the difference in tongue position.',
 'Sad vs Sin Exercise', 'Tajweed',
 (CURRENT_DATE + INTERVAL '2 days')::date, 'pending', false);


-- ══════════════════════════════════════════════════════
-- 5. UPCOMING CLASS SESSIONS
-- ══════════════════════════════════════════════════════
INSERT INTO class_sessions (student_id, tutor_id, scheduled_at, duration_minutes, status, meeting_link, notes) VALUES

('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 NOW() + INTERVAL '2 hours', 30, 'scheduled',
 'https://meet.google.com/noor-aisha-class',
 'Noon Sakinah rules — Izhar practice'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 NOW() + INTERVAL '4 hours', 45, 'scheduled',
 'https://meet.google.com/noor-omar-class',
 'Revision class — An-Naba to Al-Infitar'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 NOW() + INTERVAL '1 hour', 45, 'scheduled',
 'https://meet.google.com/noor-ibrahim-hifz',
 'Formal Hifz test for Al-Mulk and Al-Qalam'),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811',
 NOW() + INTERVAL '6 hours', 30, 'scheduled',
 'https://meet.google.com/noor-zara-class',
 'Noorani Qaida — alphabet groups 7-9'),

-- Next week sessions
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142',
 NOW() + INTERVAL '3 days', 45, 'scheduled',
 'https://meet.google.com/noor-aisha-class',
 'Meem Sakinah rules introduction'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811',
 NOW() + INTERVAL '4 days', 60, 'scheduled',
 'https://meet.google.com/noor-ibrahim-hifz',
 'Surah Nuh — starting memorization');


-- ══════════════════════════════════════════════════════
-- 6. TUTOR EARNINGS
-- ══════════════════════════════════════════════════════
INSERT INTO tutor_earnings (tutor_id, month, year, total_amount, total_hours, status, notes) VALUES

('565948d7-1a15-4e69-8ca6-acd71cd9a142', 4, 2026, 320.00, 16, 'paid', 'April earnings — 3 students'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 5, 2026, 360.00, 18, 'paid', 'May earnings — 3 students, extra sessions'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 6, 2026, 400.00, 20, 'paid', 'June earnings — full month'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 7, 2026, 180.00, 9,  'pending', 'July so far — in progress'),

('0c1af19f-66de-4350-8288-6aea36292811', 4, 2026, 280.00, 14, 'paid', 'April — 2 students'),
('0c1af19f-66de-4350-8288-6aea36292811', 5, 2026, 300.00, 15, 'paid', 'May earnings'),
('0c1af19f-66de-4350-8288-6aea36292811', 6, 2026, 340.00, 17, 'paid', 'June — Hifz student extra sessions'),
('0c1af19f-66de-4350-8288-6aea36292811', 7, 2026, 160.00, 8,  'pending', 'July so far');


-- ══════════════════════════════════════════════════════
-- 7. FEES — Mix of paid and pending
-- ══════════════════════════════════════════════════════
INSERT INTO fees (student_id, amount, currency, status, period_month, period_year, payment_method, notes) VALUES

('10831d9c-588f-4294-9ead-f597c2690d79', 40, 'GBP', 'paid',    4, 2026, 'bank_transfer', 'April fee — paid on time'),
('10831d9c-588f-4294-9ead-f597c2690d79', 40, 'GBP', 'paid',    5, 2026, 'bank_transfer', NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', 40, 'GBP', 'paid',    6, 2026, 'paypal',        NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', 40, 'GBP', 'pending', 7, 2026, NULL,            'July fee due'),

('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', 50, 'GBP', 'paid',    5, 2026, 'bank_transfer', NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', 50, 'GBP', 'paid',    6, 2026, 'bank_transfer', NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', 50, 'GBP', 'pending', 7, 2026, NULL,            'July fee overdue'),

('0bf9f048-87d8-4817-bed9-bf4f99bc7940', 80, 'GBP', 'paid',    4, 2026, 'paypal',        'Hifz program — April'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', 80, 'GBP', 'paid',    5, 2026, 'paypal',        NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', 80, 'GBP', 'paid',    6, 2026, 'paypal',        NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', 80, 'GBP', 'pending', 7, 2026, NULL,            NULL),

('39be228f-5f3f-45c0-ba92-7e3d65aa0391', 35, 'USD', 'paid',    5, 2026, 'bank_transfer', NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', 35, 'USD', 'paid',    6, 2026, 'bank_transfer', NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', 35, 'USD', 'overdue', 7, 2026, NULL,            'Overdue by 5 days — follow up needed');


-- ══════════════════════════════════════════════════════
-- 8. NOTIFICATIONS — System notifications
-- ══════════════════════════════════════════════════════
INSERT INTO notifications (recipient_id, title, body, type, target_role, is_read) VALUES

('8af50642-a3e3-4ed2-bc62-b7a37e19870b',
 'New Progress Report Available',
 'Ustaza Sara has submitted a progress report for Aisha Hassan. Check her performance today!',
 'report', 'parent', false),

('8af50642-a3e3-4ed2-bc62-b7a37e19870b',
 'Fee Payment Reminder',
 'Your July fee of £40 for Aisha Hassan is now due. Please arrange payment at your earliest convenience.',
 'fee', 'parent', false),

('868a8cc7-40f7-46e4-b5ad-7e36e51f185e',
 'Hifz Test Today!',
 'Ibrahim has his formal Hifz test for Al-Mulk and Al-Qalam today. Please ensure he is well rested and prepared.',
 'session', 'parent', false),

('868a8cc7-40f7-46e4-b5ad-7e36e51f185e',
 'Class Reminder — Zara',
 'Zara Riaz has a class in 1 hour. Please ensure she is ready and the internet connection is stable.',
 'reminder', 'parent', true),

('565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'June Earnings Paid',
 'Your earnings of £400 for June 2026 have been processed and sent to your bank account.',
 'earning', 'tutor', true),

('565948d7-1a15-4e69-8ca6-acd71cd9a142',
 'New Student Assigned',
 'A new student has been assigned to your class roster. Please check the Students section.',
 'system', 'tutor', false);

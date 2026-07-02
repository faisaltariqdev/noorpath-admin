-- ══════════════════════════════════════════════════════
-- NoorPath Admin — Demo Data v2 (Correct Column Names)
-- ══════════════════════════════════════════════════════

-- ── PROGRESS REPORTS ──────────────────────────────────
INSERT INTO progress_reports (student_id, tutor_id, surah_covered, pages_covered, overall_rating, tajweed_stars, tutor_notes, mistakes, homework, tajweed_rules, created_at) VALUES
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Al-Fatiha', '1 page', 'excellent', 5, 'MashaAllah! Aisha read Al-Fatiha beautifully. Her Makharij is excellent for a beginner.', 'Minor hesitation on Ghain', 'Recite Al-Fatiha 5 times before next class', ARRAY['Makharij - Excellent', 'Harakaat - Very Good']::text[], NOW() - INTERVAL '28 days'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Al-Ikhlas', '1 page', 'good', 4, 'Good recitation of Al-Ikhlas. Tajweed is improving week by week.', 'Needs to hold Madd in Ahad longer', 'Practice Al-Ikhlas daily — focus on long vowels', ARRAY['Madd - Needs work']::text[], NOW() - INTERVAL '21 days'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Al-Falaq', '1 page', 'excellent', 5, 'Superb session! Qalqalah in Al-Falaq was near perfect. Great progress!', NULL, 'Memorize Al-Falaq by next class', ARRAY['Qalqalah - Excellent']::text[], NOW() - INTERVAL '14 days'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'An-Nas', '1 page', 'good', 4, 'An-Nas recited with good rhythm. Slight rush at the end.', 'Do not rush the last 3 verses', 'Practice slow recitation — quality over speed', ARRAY['Waqf - Needs improvement']::text[], NOW() - INTERVAL '7 days'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Noon Sakinah Rules', NULL, 'good', 4, 'Good understanding of Izhar rules. Idgham needs more practice.', 'Idgham with ghunnah — Ya and Waw causing confusion', 'Practice Idgham examples from worksheet', ARRAY['Noon Sakinah - Idgham needs work']::text[], NOW() - INTERVAL '1 day'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'An-Naba', '2 pages', 'excellent', 5, 'Omar is a natural Quran reciter. An-Naba recited with beautiful melody and perfect Tajweed.', NULL, 'Revise An-Naba daily — prepare for An-Naziat next class', ARRAY['Makharij - Excellent', 'Madd - Perfect', 'Qalqalah - Excellent']::text[], NOW() - INTERVAL '20 days'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'An-Naziat', '2 pages', 'good', 4, 'Good progress on An-Naziat. Some Makharij correction needed for heavy letters.', 'Heavy letters Ta and Dha need more emphasis', 'Listen to Sheikh Mishary recitation of An-Naziat daily', ARRAY['Sifaat - Heavy letters need work']::text[], NOW() - INTERVAL '13 days'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Abasa and At-Takwir', '2 pages', 'excellent', 5, 'Two surahs in one session! Omar handled it brilliantly. Qalqalah is his strong point.', NULL, 'Memorize key verses from At-Takwir', ARRAY['Qalqalah - Excellent', 'Waqf - Very Good']::text[], NOW() - INTERVAL '6 days'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Al-Mulk 1-15', '1.5 pages', 'excellent', 5, 'Ibrahim memorized the first half of Al-Mulk flawlessly. His retention is exceptional!', NULL, 'Revise verses 1-15 of Al-Mulk 10 times before next class', ARRAY['Makharij - Excellent', 'Madd - Perfect']::text[], NOW() - INTERVAL '27 days'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Al-Mulk 16-30', '1.5 pages', 'excellent', 5, 'Complete Al-Mulk memorized! Ibrahim should be very proud. Parents — mashaAllah for your support!', NULL, 'Full Al-Mulk revision daily for 2 weeks', ARRAY['Makharij - Excellent', 'Madd - Excellent', 'Waqf - Very Good']::text[], NOW() - INTERVAL '20 days'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Al-Qalam 1-26', '2 pages', 'good', 4, 'Good start on Al-Qalam. More difficult but Ibrahim is pushing through well.', 'Verses 11-16 need more work — complex vocabulary', 'Extra revision of verses 11-16', ARRAY['Makharij - Good', 'Fluency needs improvement in verses 11-16']::text[], NOW() - INTERVAL '12 days'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Al-Qalam 27-52', '2 pages', 'excellent', 5, 'Al-Qalam complete! Ibrahim is progressing faster than expected. MashaAllah!', NULL, 'Full Al-Qalam revision — prepare for formal Hifz test', ARRAY['Makharij - Excellent', 'Fluency - Excellent']::text[], NOW() - INTERVAL '5 days'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'Arabic Alphabet Groups 1-3', NULL, 'good', 3, 'Zara is a shy but determined learner. Good first session with the alphabet groups.', 'Kha vs Ha confusion — needs drilling', 'Practice Kha and Ha sounds daily using the recording', ARRAY['Makharij - Kha and Ha confusion']::text[], NOW() - INTERVAL '13 days'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'Arabic Alphabet Groups 4-6', NULL, 'average', 3, 'Confusion between Sad and Sin — very common for beginners. Extra practice needed.', 'Sad vs Sin — heavy vs light letters', 'Use the mirror exercise to feel the Makharij difference', ARRAY['Makharij - Sad vs Sin confusion', 'Sifaat - Heavy vs light letters']::text[], NOW() - INTERVAL '6 days');

-- ── ATTENDANCE ────────────────────────────────────────
INSERT INTO attendance (student_id, tutor_id, status, late_minutes, session_date, notes) VALUES
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '28 days')::date, 'Very enthusiastic today'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '21 days')::date, NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'late', 8, (CURRENT_DATE - INTERVAL '14 days')::date, 'Joined 8 minutes late — internet issue'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '7 days')::date, NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, CURRENT_DATE, 'Doing great today'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '21 days')::date, NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'absent', 0, (CURRENT_DATE - INTERVAL '14 days')::date, 'Sick — informed in advance'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '7 days')::date, NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '1 day')::date, NULL),
('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, (CURRENT_DATE - INTERVAL '14 days')::date, NULL),
('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'late', 15, (CURRENT_DATE - INTERVAL '7 days')::date, 'Joined 15 minutes late — parent forgot'),
('8db4a560-5391-40c1-a652-17c8034ac87d', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'present', 0, CURRENT_DATE, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, (CURRENT_DATE - INTERVAL '27 days')::date, 'Perfect attendance!'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, (CURRENT_DATE - INTERVAL '20 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, (CURRENT_DATE - INTERVAL '13 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, (CURRENT_DATE - INTERVAL '6 days')::date, NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, CURRENT_DATE, 'Hifz test day — student is ready'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'present', 0, (CURRENT_DATE - INTERVAL '14 days')::date, NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'late', 10, (CURRENT_DATE - INTERVAL '7 days')::date, 'Zara joined 10 minutes late'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'leave', 0, CURRENT_DATE, 'Family event today');

-- ── HOMEWORK LOGS ─────────────────────────────────────
-- homework_logs columns: report_id, student_id, homework_text, is_completed, completed_at, parent_notes, title, subject, due_date, tutor_id, status
INSERT INTO homework_logs (student_id, tutor_id, homework_text, title, subject, due_date, status, is_completed) VALUES
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Recite Al-Fatiha 5 times with correct pronunciation. Record yourself and listen back.', 'Al-Fatiha Daily Recitation', 'Quran', (CURRENT_DATE + INTERVAL '2 days')::date, 'pending', false),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Practice Noon Sakinah Izhar letters (Hamza Ha Kha Ain Ghain Ha). Write 5 examples of each.', 'Noon Sakinah Practice', 'Tajweed', (CURRENT_DATE + INTERVAL '3 days')::date, 'pending', false),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Memorize Al-Ikhlas with meaning. Write the translation in English.', 'Al-Ikhlas Memorization', 'Quran', (CURRENT_DATE - INTERVAL '3 days')::date, 'completed', true),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Revise An-Naba and An-Naziat — recite to a parent or family member.', 'Juz Amma Revision', 'Quran', (CURRENT_DATE + INTERVAL '1 day')::date, 'pending', false),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', 'Listen to Sheikh Mishary recitation of At-Takwir and repeat verse by verse.', 'At-Takwir Listening Practice', 'Quran', (CURRENT_DATE + INTERVAL '4 days')::date, 'pending', false),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Full revision of Al-Mulk 10 times. Focus on fluency and correct stopping points.', 'Al-Mulk Daily Revision', 'Hifz', (CURRENT_DATE + INTERVAL '1 day')::date, 'pending', false),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Revise Al-Qalam verses 11-16 the difficult verses. Practice 20 times each.', 'Al-Qalam Difficult Verses', 'Hifz', CURRENT_DATE, 'pending', false),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', 'Write out Al-Mulk from memory — test yourself without looking at Quran.', 'Al-Mulk Memory Test', 'Hifz', (CURRENT_DATE - INTERVAL '5 days')::date, 'completed', true),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', 'Practice distinguishing Sad and Sin using a mirror to feel the tongue position difference.', 'Sad vs Sin Exercise', 'Tajweed', (CURRENT_DATE + INTERVAL '2 days')::date, 'pending', false);

-- ── CLASS SESSIONS ────────────────────────────────────
INSERT INTO class_sessions (student_id, tutor_id, scheduled_at, duration_minutes, status, meeting_link, notes) VALUES
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', NOW() + INTERVAL '2 hours', 30, 'scheduled', 'https://meet.google.com/noor-aisha-class', 'Noon Sakinah rules — Izhar practice'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '565948d7-1a15-4e69-8ca6-acd71cd9a142', NOW() + INTERVAL '4 hours', 45, 'scheduled', 'https://meet.google.com/noor-omar-class', 'Revision — An-Naba to Al-Infitar'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', NOW() + INTERVAL '1 hour', 45, 'scheduled', 'https://meet.google.com/noor-ibrahim-hifz', 'Formal Hifz test for Al-Mulk and Al-Qalam'),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '0c1af19f-66de-4350-8288-6aea36292811', NOW() + INTERVAL '6 hours', 30, 'scheduled', 'https://meet.google.com/noor-zara-class', 'Noorani Qaida — alphabet groups 7-9'),
('10831d9c-588f-4294-9ead-f597c2690d79', '565948d7-1a15-4e69-8ca6-acd71cd9a142', NOW() + INTERVAL '3 days', 45, 'scheduled', 'https://meet.google.com/noor-aisha-class', 'Meem Sakinah rules introduction'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '0c1af19f-66de-4350-8288-6aea36292811', NOW() + INTERVAL '4 days', 60, 'scheduled', 'https://meet.google.com/noor-ibrahim-hifz', 'Surah Nuh — starting memorization');

-- ── TUTOR EARNINGS ────────────────────────────────────
-- columns: tutor_id, month, year, total_classes, total_hours, rate_per_hour, total_amount, currency, status
INSERT INTO tutor_earnings (tutor_id, month, year, total_classes, total_hours, rate_per_hour, total_amount, currency, status) VALUES
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 4, 2026, 16, 16, 20.00, 320.00, 'GBP', 'paid'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 5, 2026, 18, 18, 20.00, 360.00, 'GBP', 'paid'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 6, 2026, 20, 20, 20.00, 400.00, 'GBP', 'paid'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 7, 2026, 9,  9,  20.00, 180.00, 'GBP', 'pending'),
('0c1af19f-66de-4350-8288-6aea36292811', 4, 2026, 14, 14, 20.00, 280.00, 'GBP', 'paid'),
('0c1af19f-66de-4350-8288-6aea36292811', 5, 2026, 15, 15, 20.00, 300.00, 'GBP', 'paid'),
('0c1af19f-66de-4350-8288-6aea36292811', 6, 2026, 17, 17, 20.00, 340.00, 'GBP', 'paid'),
('0c1af19f-66de-4350-8288-6aea36292811', 7, 2026, 8,  8,  20.00, 160.00, 'GBP', 'pending');

-- ── FEES ──────────────────────────────────────────────
-- parent IDs: Ali Hassan = 8af50642..., Maria Riaz = 868a8cc7...
INSERT INTO fees (student_id, parent_id, amount, currency, period_month, period_year, due_date, paid_date, status, payment_method, notes) VALUES
('10831d9c-588f-4294-9ead-f597c2690d79', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 40, 'GBP', 4, 2026, '2026-04-05'::date, '2026-04-04'::date, 'paid',    'bank_transfer', 'April fee — paid on time'),
('10831d9c-588f-4294-9ead-f597c2690d79', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 40, 'GBP', 5, 2026, '2026-05-05'::date, '2026-05-03'::date, 'paid',    'bank_transfer', NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 40, 'GBP', 6, 2026, '2026-06-05'::date, '2026-06-02'::date, 'paid',    'paypal',        NULL),
('10831d9c-588f-4294-9ead-f597c2690d79', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 40, 'GBP', 7, 2026, '2026-07-05'::date, NULL,               'pending', NULL,            'July fee due'),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 50, 'GBP', 5, 2026, '2026-05-05'::date, '2026-05-05'::date, 'paid',    'bank_transfer', NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 50, 'GBP', 6, 2026, '2026-06-05'::date, '2026-06-04'::date, 'paid',    'bank_transfer', NULL),
('7e05a21e-16bd-46e6-ad6a-7929e457b5f6', '8af50642-a3e3-4ed2-bc62-b7a37e19870b', 50, 'GBP', 7, 2026, '2026-07-05'::date, NULL,               'pending', NULL,            'July fee overdue'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 80, 'GBP', 4, 2026, '2026-04-05'::date, '2026-04-01'::date, 'paid',    'paypal',        'Hifz program — April'),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 80, 'GBP', 5, 2026, '2026-05-05'::date, '2026-05-02'::date, 'paid',    'paypal',        NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 80, 'GBP', 6, 2026, '2026-06-05'::date, '2026-06-03'::date, 'paid',    'paypal',        NULL),
('0bf9f048-87d8-4817-bed9-bf4f99bc7940', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 80, 'GBP', 7, 2026, '2026-07-05'::date, NULL,               'pending', NULL,            NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 35, 'USD', 5, 2026, '2026-05-05'::date, '2026-05-06'::date, 'paid',    'bank_transfer', NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 35, 'USD', 6, 2026, '2026-06-05'::date, '2026-06-05'::date, 'paid',    'bank_transfer', NULL),
('39be228f-5f3f-45c0-ba92-7e3d65aa0391', '868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 35, 'USD', 7, 2026, '2026-07-01'::date, NULL,               'overdue', NULL,            'Overdue by 5 days — follow up needed');

-- ── NOTIFICATIONS ─────────────────────────────────────
-- columns: recipient_id, type, title, body, message, is_read, target_role
INSERT INTO notifications (recipient_id, type, title, body, message, is_read, target_role) VALUES
('8af50642-a3e3-4ed2-bc62-b7a37e19870b', 'report', 'New Progress Report Available', 'Ustaza Sara has submitted a progress report for Aisha Hassan. Check her performance today!', 'Ustaza Sara has submitted a progress report for Aisha Hassan.', false, 'parent'),
('8af50642-a3e3-4ed2-bc62-b7a37e19870b', 'fee', 'Fee Payment Reminder', 'Your July fee of £40 for Aisha Hassan is now due. Please arrange payment at your earliest convenience.', 'Your July fee of £40 for Aisha Hassan is now due.', false, 'parent'),
('868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 'session', 'Hifz Test Today!', 'Ibrahim has his formal Hifz test for Al-Mulk and Al-Qalam today. Please ensure he is well rested.', 'Ibrahim has his formal Hifz test today.', false, 'parent'),
('868a8cc7-40f7-46e4-b5ad-7e36e51f185e', 'reminder', 'Class Reminder — Zara Riaz', 'Zara Riaz has a class in 1 hour. Please ensure she is ready and the internet connection is stable.', 'Zara Riaz has a class in 1 hour.', true, 'parent'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 'earning', 'June Earnings Paid', 'Your earnings of £400 for June 2026 have been processed and sent to your bank account.', 'June earnings of £400 have been processed.', true, 'tutor'),
('565948d7-1a15-4e69-8ca6-acd71cd9a142', 'system', 'New Student Assigned', 'A new student has been assigned to your class roster. Please check the Students section.', 'A new student has been assigned to your roster.', false, 'tutor');

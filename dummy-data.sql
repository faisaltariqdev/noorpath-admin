-- =========================================================
-- NoorPath Dummy Test Data (corrected column names)
-- =========================================================
-- admin:   c70c31ff-5f0c-442f-ab13-db65641bede2  (Faisal Tariq)
-- tutor1:  565948d7-1a15-4e69-8ca6-acd71cd9a142  (Sara Ahmed)
-- tutor2:  0c1af19f-66de-4350-8288-6aea36292811  (Yusuf Khan)
-- parent1: 8af50642-a3e3-4ed2-bc62-b7a37e19870b  (Ali Hassan)
-- parent2: 868a8cc7-40f7-46e4-b5ad-7e36e51f185e  (Maria Riaz)

-- Update profiles with details
UPDATE profiles SET phone='+447700111222', country='United Kingdom', timezone='Europe/London' WHERE id='565948d7-1a15-4e69-8ca6-acd71cd9a142';
UPDATE profiles SET phone='+923001234567', country='Pakistan',        timezone='Asia/Karachi'  WHERE id='0c1af19f-66de-4350-8288-6aea36292811';
UPDATE profiles SET phone='+447700333444', country='United Kingdom', timezone='Europe/London'  WHERE id='8af50642-a3e3-4ed2-bc62-b7a37e19870b';
UPDATE profiles SET phone='+923009876543', country='Pakistan',        timezone='Asia/Karachi'  WHERE id='868a8cc7-40f7-46e4-b5ad-7e36e51f185e';

-- ==================== STUDENTS ====================
INSERT INTO students (parent_id, tutor_id, full_name, age, gender, country, course, level, is_active, enrolled_at) VALUES
  ('8af50642-a3e3-4ed2-bc62-b7a37e19870b','565948d7-1a15-4e69-8ca6-acd71cd9a142','Aisha Hassan',  9, 'female','United Kingdom','Noorani Qaida',   'beginner',     TRUE, NOW()-INTERVAL '3 months'),
  ('8af50642-a3e3-4ed2-bc62-b7a37e19870b','565948d7-1a15-4e69-8ca6-acd71cd9a142','Omar Hassan',  12, 'male',  'United Kingdom','Quran Recitation','intermediate', TRUE, NOW()-INTERVAL '6 months'),
  ('868a8cc7-40f7-46e4-b5ad-7e36e51f185e','0c1af19f-66de-4350-8288-6aea36292811','Zara Riaz',     8, 'female','Pakistan',      'Noorani Qaida',   'beginner',     TRUE, NOW()-INTERVAL '2 months'),
  ('868a8cc7-40f7-46e4-b5ad-7e36e51f185e','0c1af19f-66de-4350-8288-6aea36292811','Ibrahim Riaz', 14, 'male',  'Pakistan',      'Hifz Program',    'advanced',     TRUE, NOW()-INTERVAL '1 year'),
  ('8af50642-a3e3-4ed2-bc62-b7a37e19870b','565948d7-1a15-4e69-8ca6-acd71cd9a142','Fatima Hassan', 7, 'female','United Kingdom','Noorani Qaida',   'beginner',     TRUE, NOW()-INTERVAL '1 month');

DO $$
DECLARE
  s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
  t1 UUID := '565948d7-1a15-4e69-8ca6-acd71cd9a142';
  t2 UUID := '0c1af19f-66de-4350-8288-6aea36292811';
  p1 UUID := '8af50642-a3e3-4ed2-bc62-b7a37e19870b';
  p2 UUID := '868a8cc7-40f7-46e4-b5ad-7e36e51f185e';
  adm UUID := 'c70c31ff-5f0c-442f-ab13-db65641bede2';
BEGIN
  SELECT id INTO s1 FROM students WHERE full_name='Aisha Hassan'  LIMIT 1;
  SELECT id INTO s2 FROM students WHERE full_name='Omar Hassan'   LIMIT 1;
  SELECT id INTO s3 FROM students WHERE full_name='Zara Riaz'     LIMIT 1;
  SELECT id INTO s4 FROM students WHERE full_name='Ibrahim Riaz'  LIMIT 1;
  SELECT id INTO s5 FROM students WHERE full_name='Fatima Hassan' LIMIT 1;

  -- ==================== CLASS SESSIONS ====================
  -- columns: student_id, tutor_id, scheduled_at, duration_minutes, status, meeting_link, notes
  INSERT INTO class_sessions (student_id, tutor_id, scheduled_at, duration_minutes, status, meeting_link, notes) VALUES
    (s1,t1,NOW()+INTERVAL '1 hour',   30,'scheduled', 'https://zoom.us/j/111111','Noorani Qaida - Lesson 6'),
    (s1,t1,NOW()-INTERVAL '2 days',   30,'completed', 'https://zoom.us/j/111111','Noorani Qaida - Lesson 5'),
    (s1,t1,NOW()-INTERVAL '4 days',   30,'completed', 'https://zoom.us/j/111111','Noorani Qaida - Lesson 4'),
    (s1,t1,NOW()-INTERVAL '6 days',   30,'no_show',   'https://zoom.us/j/111111','Student was absent'),
    (s2,t1,NOW()+INTERVAL '2 hours',  45,'scheduled', 'https://zoom.us/j/222222','Quran - Surah Baqarah v.6'),
    (s2,t1,NOW()-INTERVAL '1 day',    45,'completed', 'https://zoom.us/j/222222','Quran - Surah Baqarah v.5'),
    (s2,t1,NOW()-INTERVAL '3 days',   45,'completed', 'https://zoom.us/j/222222','Quran - Surah Baqarah v.3'),
    (s3,t2,NOW()+INTERVAL '3 hours',  30,'scheduled', 'https://zoom.us/j/333333','Noorani Qaida - Lesson 4'),
    (s3,t2,NOW()-INTERVAL '2 days',   30,'completed', 'https://zoom.us/j/333333','Noorani Qaida - Lesson 3'),
    (s4,t2,NOW()+INTERVAL '30 minutes',60,'scheduled','https://zoom.us/j/444444','Hifz - Al-Kahf v.60-70'),
    (s4,t2,NOW()-INTERVAL '1 day',    60,'completed', 'https://zoom.us/j/444444','Hifz - Al-Kahf v.50-60'),
    (s4,t2,NOW()-INTERVAL '2 days',   60,'completed', 'https://zoom.us/j/444444','Hifz - Al-Kahf v.40-50'),
    (s4,t2,NOW()-INTERVAL '3 days',   60,'completed', 'https://zoom.us/j/444444','Hifz - Al-Kahf v.30-40'),
    (s5,t1,NOW()+INTERVAL '4 hours',  30,'scheduled', 'https://zoom.us/j/555555','Noorani Qaida - Lesson 2'),
    (s5,t1,NOW()-INTERVAL '5 days',   30,'cancelled', 'https://zoom.us/j/555555','Cancelled by parent');

  -- ==================== PROGRESS REPORTS ====================
  -- columns: student_id, tutor_id, pages_covered, surah_covered, tajweed_rules, mistakes, overall_rating, tajweed_stars(1-5), homework, tutor_notes
  INSERT INTO progress_reports (student_id, tutor_id, surah_covered, tajweed_rules, mistakes, overall_rating, tajweed_stars, homework, tutor_notes, created_at) VALUES
    (s1,t1,'Lesson 5 - Ba, Ta, Tha', ARRAY['Qalqala'],               'Minor Qalqala errors',           'good',      4, 'Revise Ba-Jeem',           'Aisha making steady progress. Pronunciation improving.',  NOW()-INTERVAL '2 days'),
    (s1,t1,'Lesson 4 - Alif, Ba',    ARRAY[]::text[],                'None',                           'excellent', 5, 'Revise Alif and Ba',       'Excellent! She memorized the letters perfectly.',          NOW()-INTERVAL '9 days'),
    (s2,t1,'Surah Al-Baqarah v.5',   ARRAY['Madd Tabii','Idgham'],   'Madd length inconsistent',       'good',      4, 'Practice Madd - 10 egs',  'Omar progressing well. More Madd practice needed.',       NOW()-INTERVAL '1 day'),
    (s2,t1,'Surah Al-Baqarah v.3',   ARRAY['Ikhfaa','Qalqala'],      'Ikhfaa incomplete 3 places',     'average',   3, 'Ikhfaa worksheet',         'Homework not completed. Revision needed.',                 NOW()-INTERVAL '8 days'),
    (s3,t2,'Lesson 3 - Ta, Tha',     ARRAY[]::text[],                'None',                           'excellent', 5, 'Revise Ta-Tha daily',      'Zara is a fast learner. Excellent pronunciation.',         NOW()-INTERVAL '2 days'),
    (s4,t2,'Surah Al-Kahf v.50-60',  ARRAY['Waqf','Madd Lazim'],     'Very minor Sifaat issues',       'excellent', 5, 'Revise v50-60 no mushaf',  'Ibrahim recited flawlessly! Hifz at impressive rate.',    NOW()-INTERVAL '1 day'),
    (s4,t2,'Surah Al-Kahf v.40-50',  ARRAY['Madd Munfasil','Iqlab'], 'Minor Tajweed error x1',         'excellent', 5, 'Revise v40-50 x10',        'Strong session. Very minor errors only.',                  NOW()-INTERVAL '8 days'),
    (s5,t1,'Lesson 2 - Alif',        ARRAY['Pronunciation'],         'Pronunciation of Ain needs work','good',      3, 'Trace Alif 5 times',       'Fatima is young but motivated. Pronunciation needed.',     NOW()-INTERVAL '5 days');

  -- ==================== FEES ====================
  -- columns: student_id, parent_id, amount, currency, period_month, period_year, due_date, paid_date, status, payment_method
  INSERT INTO fees (student_id, parent_id, amount, currency, period_month, period_year, due_date, paid_date, status, payment_method) VALUES
    (s1,p1,40,'GBP',6,2026,CURRENT_DATE-INTERVAL '30 days',NOW()-INTERVAL '28 days','paid',   'bank_transfer'),
    (s1,p1,40,'GBP',7,2026,CURRENT_DATE,                   NULL,                    'pending', NULL),
    (s2,p1,40,'GBP',6,2026,CURRENT_DATE-INTERVAL '30 days',NOW()-INTERVAL '26 days','paid',   'paypal'),
    (s2,p1,40,'GBP',7,2026,CURRENT_DATE,                   NULL,                    'pending', NULL),
    (s5,p1,35,'GBP',6,2026,CURRENT_DATE-INTERVAL '30 days',NOW()-INTERVAL '25 days','paid',   'bank_transfer'),
    (s5,p1,35,'GBP',7,2026,CURRENT_DATE,                   NULL,                    'pending', NULL),
    (s3,p2,3500,'PKR',6,2026,CURRENT_DATE-INTERVAL '30 days',NOW()-INTERVAL '27 days','paid', 'bank_transfer'),
    (s3,p2,3500,'PKR',7,2026,CURRENT_DATE,                   NULL,                  'pending', NULL),
    (s4,p2,5000,'PKR',6,2026,CURRENT_DATE-INTERVAL '30 days',NOW()-INTERVAL '22 days','paid', 'bank_transfer'),
    (s4,p2,5000,'PKR',7,2026,CURRENT_DATE+INTERVAL '5 days', NULL,                  'pending', NULL);

  -- ==================== ATTENDANCE ====================
  -- columns: student_id, tutor_id, session_date, status, notes
  INSERT INTO attendance (student_id, tutor_id, session_date, status, notes) VALUES
    (s1,t1,CURRENT_DATE-14,'present',''),
    (s1,t1,CURRENT_DATE-12,'present',''),
    (s1,t1,CURRENT_DATE-10,'late',   'Joined 5 minutes late'),
    (s1,t1,CURRENT_DATE-8, 'present',''),
    (s1,t1,CURRENT_DATE-6, 'absent', 'Parent reported sick'),
    (s1,t1,CURRENT_DATE-4, 'present',''),
    (s1,t1,CURRENT_DATE-2, 'present',''),
    (s2,t1,CURRENT_DATE-14,'present',''),
    (s2,t1,CURRENT_DATE-12,'present',''),
    (s2,t1,CURRENT_DATE-10,'present',''),
    (s2,t1,CURRENT_DATE-8, 'present',''),
    (s2,t1,CURRENT_DATE-6, 'present',''),
    (s2,t1,CURRENT_DATE-4, 'absent', 'No show'),
    (s2,t1,CURRENT_DATE-2, 'present',''),
    (s3,t2,CURRENT_DATE-14,'present',''),
    (s3,t2,CURRENT_DATE-12,'present',''),
    (s3,t2,CURRENT_DATE-10,'present',''),
    (s3,t2,CURRENT_DATE-8, 'late',   'Slow internet connection'),
    (s3,t2,CURRENT_DATE-6, 'present',''),
    (s4,t2,CURRENT_DATE-14,'present',''),
    (s4,t2,CURRENT_DATE-12,'present',''),
    (s4,t2,CURRENT_DATE-10,'present',''),
    (s4,t2,CURRENT_DATE-8, 'present',''),
    (s4,t2,CURRENT_DATE-6, 'present',''),
    (s4,t2,CURRENT_DATE-4, 'present',''),
    (s4,t2,CURRENT_DATE-2, 'present','');

  -- ==================== TUTOR EARNINGS ====================
  INSERT INTO tutor_earnings (tutor_id,month,year,total_classes,total_hours,rate_per_hour,total_amount,currency,status,paid_date) VALUES
    (t1,'05',2026,22,11.0,12,132.00,'GBP','paid',       NOW()-INTERVAL '20 days'),
    (t1,'06',2026,24,12.0,12,144.00,'GBP','paid',       NOW()-INTERVAL '2 days'),
    (t1,'07',2026,6, 3.0, 12,36.00, 'GBP','pending',   NULL),
    (t2,'05',2026,18,18.0,10,180.00,'USD','paid',       NOW()-INTERVAL '22 days'),
    (t2,'06',2026,20,20.0,10,200.00,'USD','pending',    NULL),
    (t2,'07',2026,5, 5.0, 10,50.00, 'USD','pending',   NULL);

  -- ==================== HOMEWORK TEMPLATES ====================
  INSERT INTO homework_templates (tutor_id,title,content,subject,level) VALUES
    (t1,'Revise letters Alif to Jeem','Practice writing and reciting Alif, Ba, Ta, Tha, Jeem three times. Record voice note if possible.','Noorani Qaida','Beginner'),
    (t1,'Surah Al-Fatiha full practice','Recite Surah Al-Fatiha 5 times with proper Tajweed. Focus on Madd and stopping marks.','Quran Recitation','Intermediate'),
    (t2,'Hifz Revision - last 5 ayahs','Revise last 5 ayahs learned this week without the mushaf. Repeat 10 times.','Memorization','Advanced'),
    (t2,'Tajweed - Ikhfaa letters','Study Ikhfaa letters and find 10 examples from Surah Al-Baqarah.','Tajweed','Intermediate');

  -- ==================== HOMEWORK LOGS ====================
  INSERT INTO homework_logs (student_id, tutor_id, homework_text, subject, due_date, is_completed, completed_at) VALUES
    (s1,t1,'Revise letters Alif to Jeem — write 3 times each',                 'Noorani Qaida',   CURRENT_DATE+2,FALSE,NULL),
    (s2,t1,'Recite Surah Al-Fatiha with Tajweed, focus on Madd',               'Quran Recitation',CURRENT_DATE+1,FALSE,NULL),
    (s2,t1,'Practice Ikhfaa — 10 examples from Al-Baqarah',                    'Tajweed',         CURRENT_DATE-1,TRUE, NOW()-INTERVAL '12 hours'),
    (s3,t2,'Practice Ba and Ta sounds — record voice note',                    'Noorani Qaida',   CURRENT_DATE+3,FALSE,NULL),
    (s4,t2,'Revise Surah Al-Kahf v.40-60 without mushaf',                      'Memorization',    CURRENT_DATE,  FALSE,NULL),
    (s5,t1,'Trace Alif 5 times in the practice book',                          'Noorani Qaida',   CURRENT_DATE+2,FALSE,NULL);

  -- ==================== NOTIFICATIONS ====================
  INSERT INTO notifications (recipient_id, type, title, message, body, is_read, sender_id, target_role) VALUES
    (p1,'info',   'Class Reminder',        'Aisha has a class today at 10:00 AM with Sara Ahmed.',              'Aisha has a class today at 10:00 AM with Sara Ahmed.',              FALSE,t1, 'parent'),
    (p1,'success','Fee Payment Confirmed', 'Your June 2026 fee of £40 has been received. Thank you!',           'Your June 2026 fee of £40 has been received. Thank you!',           TRUE, adm,'parent'),
    (p2,'info',   'Progress Report Ready', 'A new progress report for Ibrahim Riaz has been submitted.',         'A new progress report for Ibrahim Riaz has been submitted.',         FALSE,t2, 'parent'),
    (p2,'warning','Fee Due Soon',          'Your July 2026 fee of PKR 5,000 is due in 5 days.',                 'Your July 2026 fee of PKR 5,000 is due in 5 days.',                 FALSE,adm,'parent'),
    (t1,'info',   'New Student Assigned',  'Fatima Hassan has been assigned to you. Please review her profile.','Fatima Hassan has been assigned to you. Please review her profile.',TRUE, adm,'tutor'),
    (t2,'success','Salary Processing',     'Your June 2026 salary of $200 is being processed.',                 'Your June 2026 salary of $200 is being processed.',                 FALSE,adm,'tutor');

  -- ==================== CHAT MESSAGES ====================
  INSERT INTO chat_messages (sender_id, body, created_at) VALUES
    (adm,'Assalamu Alaikum everyone! Welcome to NoorPath staff chat.',                NOW()-INTERVAL '5 days'),
    (t1, 'Wa Alaikum Assalam! Happy to be here.',                                     NOW()-INTERVAL '5 days'+INTERVAL '5 minutes'),
    (t2, 'Wa Alaikum Assalam! Thank you for the warm welcome.',                       NOW()-INTERVAL '5 days'+INTERVAL '10 minutes'),
    (adm,'Reminder: Please submit all student reports before Friday.',                NOW()-INTERVAL '2 days'),
    (t1, 'Understood! I will have all reports submitted by Thursday.',                NOW()-INTERVAL '2 days'+INTERVAL '30 minutes'),
    (t2, 'Same here, will submit by end of day Thursday.',                            NOW()-INTERVAL '2 days'+INTERVAL '45 minutes'),
    (adm,'Great! July fee invoices have been sent to all parents.',                   NOW()-INTERVAL '1 day'),
    (t1, 'Parents notified about the class schedule for next week as well.',          NOW()-INTERVAL '12 hours');

END $$;

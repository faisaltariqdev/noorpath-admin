-- Run this in Supabase SQL Editor to enable audio notes storage

-- 1. Create the audio-notes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-notes',
  'audio-notes',
  true,
  10485760, -- 10MB max per file
  ARRAY['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users (tutors) to upload their own audio files
CREATE POLICY "Tutors can upload audio notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-notes'
  AND auth.uid() IS NOT NULL
);

-- 3. Allow public read access for parents to listen
CREATE POLICY "Anyone can read audio notes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-notes');

-- 4. Allow tutors to delete their own audio files
CREATE POLICY "Tutors can delete own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 1. Ensure the 'tracks' storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow authenticated users to upload files to the 'tracks' bucket
-- Drop the policy if it exists to avoid errors
DROP POLICY IF EXISTS "Authenticated users can upload tracks" ON storage.objects;
CREATE POLICY "Authenticated users can upload tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tracks');

-- 3. Allow anyone to read files from the 'tracks' bucket
DROP POLICY IF EXISTS "Public can view tracks" ON storage.objects;
CREATE POLICY "Public can view tracks"
ON storage.objects FOR SELECT
USING (bucket_id = 'tracks');

-- 4. Allow authenticated users to update or delete their own tracks (optional but helpful)
DROP POLICY IF EXISTS "Users can update their own tracks" ON storage.objects;
CREATE POLICY "Users can update their own tracks"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tracks' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own tracks" ON storage.objects;
CREATE POLICY "Users can delete their own tracks"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tracks' AND owner = auth.uid());

-- 5. Just in case, double check the track_submissions table policies:
-- Ensure the policy allows insert when user_id matches authenticated user
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.track_submissions;
CREATE POLICY "Users can insert their own submissions"
ON public.track_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1. Disable RLS temporarily to ensure no hidden rules block us
ALTER TABLE public.track_submissions DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.track_submissions;
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.track_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.track_submissions;
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.track_submissions;

-- 3. Re-enable RLS on the table
ALTER TABLE public.track_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, foolproof policies for track_submissions
CREATE POLICY "Allow authenticated users to insert submissions"
ON public.track_submissions
FOR INSERT
TO authenticated
WITH CHECK (true); -- We allow the insert as long as they are authenticated. 

CREATE POLICY "Allow everyone to read submissions"
ON public.track_submissions
FOR SELECT
USING (true);

CREATE POLICY "Allow everyone to update submissions"
ON public.track_submissions
FOR UPDATE
USING (true);

-- 5. Fix Storage Policies (The tracks bucket)
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload tracks" ON storage.objects;
DROP POLICY IF EXISTS "Public can view tracks" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload tracks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tracks" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;

-- Create permissive storage policies for the tracks bucket
CREATE POLICY "Allow authenticated users to upload tracks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tracks');

CREATE POLICY "Allow public to view tracks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tracks');

-- Ensure profiles table allows public read so artist names show on track pages
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (for showing artist names publicly)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

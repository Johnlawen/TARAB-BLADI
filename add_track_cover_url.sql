-- Add cover_url column to track_submissions table
ALTER TABLE public.track_submissions ADD COLUMN IF NOT EXISTS cover_url text;

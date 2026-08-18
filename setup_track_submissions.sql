-- Create a table for track submissions
CREATE TABLE IF NOT EXISTS public.track_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    title text NOT NULL,
    genre text NOT NULL,
    normal_track_url text NOT NULL,
    extended_track_url text,
    reviewer_notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.track_submissions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON public.track_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.track_submissions FOR SELECT
USING (auth.uid() = user_id);

-- Allow anyone to view submissions (for the admin panel prototype to work easily for now)
CREATE POLICY "Anyone can view submissions"
ON public.track_submissions FOR SELECT
USING (true);

-- Allow admins to update submission status (for now, allow anyone for prototype)
CREATE POLICY "Anyone can update submissions"
ON public.track_submissions FOR UPDATE
USING (true);

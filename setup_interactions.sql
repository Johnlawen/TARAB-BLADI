-- 1. Create track_likes table
CREATE TABLE IF NOT EXISTS public.track_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    track_id uuid REFERENCES public.track_submissions(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(user_id, track_id) -- A user can only like a track once
);

-- Enable RLS for likes
ALTER TABLE public.track_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.track_likes FOR SELECT
USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can insert their own likes"
ON public.track_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own likes
CREATE POLICY "Users can delete their own likes"
ON public.track_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Create track_comments table
CREATE TABLE IF NOT EXISTS public.track_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    track_id uuid REFERENCES public.track_submissions(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL
);

-- Enable RLS for comments
ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.track_comments FOR SELECT
USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments"
ON public.track_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.track_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

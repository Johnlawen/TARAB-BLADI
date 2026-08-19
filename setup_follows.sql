-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(follower_id, following_id) -- A user can only follow another user once
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
ON public.user_follows FOR SELECT
USING (true);

-- Authenticated users can insert their own follows
CREATE POLICY "Users can insert their own follows"
ON public.user_follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- Authenticated users can delete their own follows
CREATE POLICY "Users can delete their own follows"
ON public.user_follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

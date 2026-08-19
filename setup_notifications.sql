-- Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow anyone to insert notifications (needed for the admin panel logic to work)
CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

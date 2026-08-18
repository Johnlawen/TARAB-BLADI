-- 0. Drop tables if they exist to allow clean re-runs
drop table if exists public.bookmarks cascade;
drop table if exists public.likes cascade;
drop table if exists public.comments cascade;
drop table if exists public.posts cascade;

-- 1. Create a table for blog posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create a table for post comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create a table for likes
create table public.likes (
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 4. Create a table for bookmarks
create table public.bookmarks (
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 5. Enable Row Level Security
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;

-- 6. Security Policies for Posts
create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Users can insert their own posts." on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts." on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts." on public.posts for delete using (auth.uid() = user_id);

-- 7. Security Policies for Comments
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Users can insert their own comments." on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comments." on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments." on public.comments for delete using (auth.uid() = user_id);

-- 8. Security Policies for Likes
create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Users can toggle their own likes." on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can remove their own likes." on public.likes for delete using (auth.uid() = user_id);

-- 9. Security Policies for Bookmarks
create policy "Users can view their own bookmarks." on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can add bookmarks." on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove bookmarks." on public.bookmarks for delete using (auth.uid() = user_id);

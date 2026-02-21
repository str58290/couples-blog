-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- All authenticated users can see all profiles (only 2 users)
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Users can only insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

-- All authenticated users can see all posts
create policy "posts_select_all" on public.posts
  for select using (auth.role() = 'authenticated');

-- Users can only insert their own posts
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

-- Users can only update their own posts
create policy "posts_update_own" on public.posts
  for update using (auth.uid() = user_id);

-- Users can only delete their own posts
create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = user_id);

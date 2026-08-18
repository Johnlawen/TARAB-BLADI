-- Run this if you are using an account created BEFORE the profiles table was set up.
-- It will automatically create a profile for any existing users that are missing one.

insert into public.profiles (id, display_name, full_name)
select 
  id, 
  raw_user_meta_data->>'username',
  raw_user_meta_data->>'full_name'
from auth.users
where id not in (select id from public.profiles);

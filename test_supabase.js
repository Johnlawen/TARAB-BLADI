const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id, category, title, content, created_at,
            profiles(display_name),
            likes(user_id),
            bookmarks(user_id),
            comments(id, content, created_at, profiles(display_name))
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("ERROR:", JSON.stringify(error, null, 2));
    } else {
        console.log("SUCCESS! Got", data.length, "posts.");
    }
}

test();

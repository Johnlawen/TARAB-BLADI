import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testLikes() {
    const { data: likes, error } = await supabase
        .from('track_likes')
        .select('*');
    console.log("Likes:", likes, "Error:", error);
}

testLikes();

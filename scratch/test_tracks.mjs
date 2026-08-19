import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testTracks() {
    const { data: subs, error } = await supabase
        .from('track_submissions')
        .select('*');
    console.log("Tracks:", subs.length, "Error:", error);
    for (let i = 0; i < Math.min(3, subs.length); i++) {
        console.log(subs[i].id, subs[i].normal_track_url);
    }
}

testTracks();

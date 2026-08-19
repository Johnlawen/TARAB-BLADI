import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: sub, error } = await supabase
        .from('track_submissions')
        .select('*')
        .eq('id', '8bfd9215-8f00-4301-96ec-cff50a28b630')
        .single();
    console.log("Track:", sub, "Error:", error);
}

test();

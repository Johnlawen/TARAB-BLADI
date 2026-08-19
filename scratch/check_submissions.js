const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co';
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('track_submissions')
        .select('*');
        
    console.log("Error:", error);
    console.log("Data:", data);
}
check();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co';
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    // 1. Sign in with a dummy user or sign up
    const email = 'testuser' + Math.floor(Math.random() * 1000) + '@tarabbladi.test';
    const password = 'password123';
    
    let { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });
    
    if (authError) {
        console.error("Auth error:", authError);
        return;
    }
    
    console.log("Logged in as:", authData.user.id);
    const userId = authData.user.id;
    
    // 2. Test Storage Upload
    const fileName = 'test_track.txt';
    const fileContent = 'Dummy track content';
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    console.log("Uploading file to:", filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, Buffer.from(fileContent), {
            contentType: 'text/plain',
            upsert: false
        });
        
    if (uploadError) {
        console.error("Storage upload failed:", uploadError);
    } else {
        console.log("Storage upload success:", uploadData);
    }
    
    // 3. Test Database Insert
    console.log("Testing database insert...");
    const { data: dbData, error: dbError } = await supabase.from('track_submissions').insert({
        user_id: userId,
        title: 'Test Track',
        genre: 'Other',
        normal_track_url: 'http://test.com/track.mp3',
        status: 'pending'
    });
    
    if (dbError) {
        console.error("Database insert failed:", dbError);
    } else {
        console.log("Database insert success.");
    }
}

testUpload();

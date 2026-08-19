const https = require('https');

https.get('https://tarab-bladi.vercel.app/dashboard-panel-secure.html', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Check if the script contains my unique alert
    if (data.includes('Successfully connected! Found')) {
      console.log('✅ LIVE CONTAINS LATEST FIX');
    } else {
      console.log('❌ LIVE DOES NOT CONTAIN LATEST FIX');
    }
    
    // Check if it's still using DOMContentLoaded
    if (data.includes('DOMContentLoaded')) {
      console.log('❌ STILL USING DOMContentLoaded (OLD CODE)');
    } else {
      console.log('✅ NOT USING DOMContentLoaded (NEW CODE)');
    }
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

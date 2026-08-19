const fs = require('fs');
let c = fs.readFileSync('track.html', 'utf8');
// Remove the duplicate old module script block that starts after our new </body></html>
// Our new code already has </body></html> — find first occurrence and trim everything after it
const marker = '</body>\n</html>\n\n\n';
const idx = c.indexOf(marker);
if (idx !== -1) {
    c = c.slice(0, idx + '</body>\n</html>\n'.length);
    fs.writeFileSync('track.html', c, 'utf8');
    console.log('Cleaned. Lines: ' + c.split('\n').length);
} else {
    // Try alternate ending
    const bodies = [];
    let pos = 0;
    while ((pos = c.indexOf('</body>', pos)) !== -1) { bodies.push(pos); pos++; }
    console.log('Found </body> at positions:', bodies);
}

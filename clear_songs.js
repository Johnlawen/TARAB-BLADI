const fs = require('fs');

const files = [
    "index.html",
    "browse.html",
    "charts.html",
    "profile.html"
];

const emptyState = `<div class="empty-state" style="text-align: center; padding: 50px; color: #888; width: 100%;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No tracks available</h2>
                    <p>There are no songs uploaded yet.</p>
                </div>`;

const replacements = [
    { pat: /(<div class="track-list">)[\s\S]*?(<\/div>\s*<div class="center-btn">)/, rep: `$1\n${emptyState}\n$2` },
    { pat: /(<div class="track-table-body">)[\s\S]*?(<\/div>\s*<\/div>\s*<!-- Pagination -->)/, rep: `$1\n${emptyState}\n$2` },
    { pat: /(<div class="charts-tbody">)[\s\S]*?(<\/div>\s*<div class="center-btn")/, rep: `$1\n${emptyState}\n$2` },
    { pat: /(<div class="rising-list">)[\s\S]*?(<\/div>\s*<\/div>\s*<div class="premium-card tall">)/, rep: `$1\n${emptyState}\n$2` },
    { pat: /(<div class="sc-track-list">)[\s\S]*?(<\/div>\s*<\/div>\s*<div class="sc-spotlight-col")/, rep: `$1\n${emptyState}\n$2` }
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    for (const { pat, rep } of replacements) {
        content = content.replace(pat, rep);
    }
    fs.writeFileSync(file, content);
}
console.log("Done");

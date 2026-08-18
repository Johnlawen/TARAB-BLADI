import re

html_files = [
    r"c:\Users\John\Desktop\Tarab bladi\tarab bladi web\index.html",
    r"c:\Users\John\Desktop\Tarab bladi\tarab bladi web\browse.html",
    r"c:\Users\John\Desktop\Tarab bladi\tarab bladi web\charts.html",
    r"c:\Users\John\Desktop\Tarab bladi\tarab bladi web\profile.html"
]

empty_state = '''<div class="empty-state" style="text-align: center; padding: 50px; color: #888; width: 100%;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No tracks available</h2>
                    <p>There are no songs uploaded yet.</p>
                </div>'''

replacements = [
    (r'(<div class="track-list">).*?(</div>\s*<div class="center-btn">)', r'\1\n' + empty_state + r'\n\2'),
    (r'(<div class="track-table-body">).*?(</div>\s*</div>\s*<!-- Pagination -->)', r'\1\n' + empty_state + r'\n\2'),
    (r'(<div class="charts-tbody">).*?(</div>\s*<div class="center-btn")', r'\1\n' + empty_state + r'\n\2'),
    (r'(<div class="rising-list">).*?(</div>\s*</div>\s*<div class="premium-card tall">)', r'\1\n' + empty_state + r'\n\2'),
    (r'(<div class="sc-track-list">).*?(</div>\s*</div>\s*<div class="sc-spotlight-col")', r'\1\n' + empty_state + r'\n\2')
]

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pat, repl in replacements:
        content = re.sub(pat, repl, content, flags=re.DOTALL)
        
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

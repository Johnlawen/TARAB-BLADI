const fs = require('fs');
let c = fs.readFileSync('profile.html', 'utf8');

const inject = `\n<script>\n// Standalone tab switcher\ndocument.addEventListener('DOMContentLoaded', function() {\n    var VIEWS = ['all-view','popular-view','tracks-view','posts-view','albums-view','playlists-view'];\n    function showView(id) {\n        VIEWS.forEach(function(v) {\n            var el = document.getElementById(v);\n            if (el) el.style.display = (v === id) ? 'block' : 'none';\n        });\n    }\n    var tabs = document.querySelectorAll('.sc-tabs-left .sc-tab');\n    tabs.forEach(function(tab) {\n        tab.addEventListener('click', function(e) {\n            e.preventDefault();\n            tabs.forEach(function(t) { t.classList.remove('active'); });\n            tab.classList.add('active');\n            showView(tab.getAttribute('data-target'));\n        });\n    });\n    var active = document.querySelector('.sc-tabs-left .sc-tab.active');\n    if (active) showView(active.getAttribute('data-target'));\n});\n<\/script>`;

// Insert before </body>
const bodyClose = c.lastIndexOf('</body>');
if (bodyClose !== -1) {
    c = c.slice(0, bodyClose) + inject + '\n' + c.slice(bodyClose);
    fs.writeFileSync('profile.html', c, 'utf8');
    console.log('Done. Injected tab script.');
} else {
    console.log('ERROR: </body> not found');
}

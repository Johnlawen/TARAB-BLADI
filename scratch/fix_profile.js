const fs = require('fs');
let content = fs.readFileSync('profile.html', 'utf8');

const mainStart = content.indexOf('    <!-- Main Content -->');
const mainEnd = content.indexOf('    </main>') + '    </main>'.length;

if (mainStart === -1 || mainEnd === -1) {
    console.log('ERROR: could not find main block. Start:' + mainStart + ' End:' + mainEnd);
    process.exit(1);
}

const newMain = [
'    <!-- Main Content -->',
'    <main class="sc-main-content">',
'',
'        <!-- Left Column wrapper: all views switch inside here -->',
'        <div class="sc-spotlight-col" style="min-width:0;flex:1;">',
'',
'            <!-- All View (active by default) -->',
'            <div id="all-view">',
'                <div class="sc-section-header"><h2>All</h2></div>',
'                <div class="sc-track-list">',
'                    <div style="text-align:center;padding:50px;color:#888;width:100%;">',
'                        <h2 style="font-size:1.5rem;margin-bottom:10px;color:#fff;">No tracks yet</h2>',
'                        <p>You have no approved tracks yet.</p>',
'                    </div>',
'                </div>',
'            </div>',
'',
'            <!-- Popular Tracks View -->',
'            <div id="popular-view" style="display:none;">',
'                <div class="sc-section-header"><h2>Popular tracks</h2></div>',
'                <div class="sc-track-list"></div>',
'            </div>',
'',
'            <!-- Tracks View -->',
'            <div id="tracks-view" style="display:none;">',
'                <div class="sc-section-header"><h2>Tracks</h2></div>',
'                <div class="sc-track-list"></div>',
'            </div>',
'',
'            <!-- Posts View -->',
'            <div id="posts-view" style="display:none;">',
'                <div class="sc-section-header"><h2>My Posts</h2></div>',
'                <div id="profile-post-list" class="blog-post-list" style="margin-top:20px;">',
'                    <div style="color:#888;">Loading your posts...</div>',
'                </div>',
'            </div>',
'',
'            <!-- Albums View -->',
'            <div id="albums-view" style="display:none;">',
'                <div class="sc-section-header"><h2>Albums</h2></div>',
'                <div style="text-align:center;padding:50px;color:#888;"><p>No albums available.</p></div>',
'            </div>',
'',
'            <!-- Playlists View -->',
'            <div id="playlists-view" style="display:none;">',
'                <div class="sc-section-header"><h2>Playlists</h2></div>',
'                <div style="text-align:center;padding:50px;color:#888;"><p>No playlists available.</p></div>',
'            </div>',
'',
'        </div>',
'',
'        <!-- Right Column: Sidebar (always visible) -->',
'        <div class="sc-sidebar-col">',
'            <div class="sc-sidebar-stats">',
'                <div class="sc-stat"><span class="sc-stat-label">Followers</span><span class="sc-stat-val">993</span></div>',
'                <div class="sc-stat"><span class="sc-stat-label">Following</span><span class="sc-stat-val">625</span></div>',
'                <div class="sc-stat"><span class="sc-stat-label">Tracks</span><span class="sc-stat-val">45</span></div>',
'            </div>',
'            <div class="sc-sidebar-bio">',
'                <p>World Wide DJ &#x1F30D;<br>Live DJ Sets<br>For Booking : djl.booking10@gmail.com</p>',
'            </div>',
'            <div class="sc-sidebar-socials">',
'                <a href="#">Youtube</a>',
'                <a href="#">ALL IN 1</a>',
'                <a href="#">InstGram</a>',
'            </div>',
'            <div class="sc-sidebar-likes">',
'                <div class="sc-likes-header"><h4>0 LIKES</h4></div>',
'                <div class="sc-likes-list">',
'                    <div style="padding:20px 0;color:#888;text-align:center;font-size:0.9rem;">No liked tracks yet</div>',
'                </div>',
'            </div>',
'        </div>',
'    </main>'
].join('\n');

content = content.slice(0, mainStart) + newMain + content.slice(mainEnd);
fs.writeFileSync('profile.html', content, 'utf8');
console.log('Done! profile.html updated successfully.');

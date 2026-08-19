import re

with open('profile.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the <main> block and replace it entirely
main_start = content.find('    <!-- Main Content -->')
main_end = content.find('    </main>') + len('    </main>')

new_main = '''    <!-- Main Content -->
    <main class="sc-main-content">

        <!-- Left Column wrapper: stays in layout always; views inside switch -->
        <div class="sc-spotlight-col" style="min-width:0; flex:1;">

            <!-- All View -->
            <div id="all-view">
                <div class="sc-section-header"><h2>All</h2></div>
                <div class="sc-track-list">
                    <div class="empty-state" style="text-align:center;padding:50px;color:#888;width:100%;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:15px;opacity:0.5;"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        <h2 style="font-size:1.5rem;margin-bottom:10px;color:#fff;">No tracks yet</h2>
                        <p>You have no approved tracks yet.</p>
                    </div>
                </div>
            </div>

            <!-- Popular Tracks View -->
            <div id="popular-view" style="display:none;">
                <div class="sc-section-header"><h2>Popular tracks</h2></div>
                <div class="sc-track-list"></div>
            </div>

            <!-- Tracks View -->
            <div id="tracks-view" style="display:none;">
                <div class="sc-section-header"><h2>Tracks</h2></div>
                <div class="sc-track-list"></div>
            </div>

            <!-- Posts View -->
            <div id="posts-view" style="display:none;">
                <div class="sc-section-header"><h2>My Posts</h2></div>
                <div id="profile-post-list" class="blog-post-list" style="margin-top:20px;">
                    <div style="color:#888;">Loading your posts...</div>
                </div>
            </div>

            <!-- Albums View -->
            <div id="albums-view" style="display:none;">
                <div class="sc-section-header"><h2>Albums</h2></div>
                <div style="text-align:center;padding:50px;color:#888;"><p>No albums available.</p></div>
            </div>

            <!-- Playlists View -->
            <div id="playlists-view" style="display:none;">
                <div class="sc-section-header"><h2>Playlists</h2></div>
                <div style="text-align:center;padding:50px;color:#888;"><p>No playlists available.</p></div>
            </div>

        </div>

        <!-- Right Column: Sidebar (always visible) -->
        <div class="sc-sidebar-col">
            <!-- Stats -->
            <div class="sc-sidebar-stats">
                <div class="sc-stat">
                    <span class="sc-stat-label">Followers</span>
                    <span class="sc-stat-val">993</span>
                </div>
                <div class="sc-stat">
                    <span class="sc-stat-label">Following</span>
                    <span class="sc-stat-val">625</span>
                </div>
                <div class="sc-stat">
                    <span class="sc-stat-label">Tracks</span>
                    <span class="sc-stat-val">45</span>
                </div>
            </div>
            <!-- Bio -->
            <div class="sc-sidebar-bio">
                <p>World Wide DJ &#x1F30D;<br>Live DJ Sets<br>For Booking : djl.booking10@gmail.com</p>
            </div>
            <!-- Social Links -->
            <div class="sc-sidebar-socials">
                <a href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Youtube</a>
                <a href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> ALL IN 1</a>
                <a href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> InstGram</a>
            </div>
            <!-- Likes -->
            <div class="sc-sidebar-likes">
                <div class="sc-likes-header">
                    <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> 0 LIKES</h4>
                </div>
                <div class="sc-likes-list">
                    <div style="padding:20px 0;color:#888;text-align:center;font-size:0.9rem;">No liked tracks yet</div>
                </div>
            </div>
        </div>
    </main>'''

if main_start == -1 or main_end == -1:
    print('ERROR: Could not find <main> block')
else:
    content = content[:main_start] + new_main + content[main_end:]
    with open('profile.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done! Main block replaced successfully.')

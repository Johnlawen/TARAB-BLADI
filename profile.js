import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null;

async function initProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (currentUser) {
        loadUserPosts();
        loadUserTracks();
    } else {
        document.getElementById('profile-post-list').innerHTML = '<div style="color:#e2b764;">Please log in to view your posts.</div>';
    }
    setupTabs();
}

function setupTabs() {
    const tabs = document.querySelectorAll('.sc-tabs-left .sc-tab');
    const views = ['all-view', 'popular-view', 'tracks-view', 'posts-view', 'albums-view', 'playlists-view'];

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.dataset.target;
            views.forEach(v => {
                const el = document.getElementById(v);
                if(el) el.style.display = (v === targetId) ? 'block' : 'none';
            });
        });
    });
}

let currentAudio = null;
let currentPlayBtn = null;

window.playAudio = function(audioId, btnElement) {
    const audio = document.getElementById(audioId);
    
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if(currentPlayBtn) {
            currentPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        }
    }

    if (audio.paused) {
        audio.play();
        btnElement.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        currentAudio = audio;
        currentPlayBtn = btnElement;
        
        audio.onended = function() {
            btnElement.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        };
    } else {
        audio.pause();
        btnElement.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
};

window.toggleLike = async function(trackId, btnElement) {
    if (!currentUser) return;

    btnElement.disabled = true;
    const { data: existingLike } = await supabase
        .from('track_likes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('track_id', trackId)
        .single();

    if (existingLike) {
        await supabase.from('track_likes').delete().eq('id', existingLike.id);
        btnElement.style.color = '#fff';
        btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like';
    } else {
        await supabase.from('track_likes').insert({ user_id: currentUser.id, track_id: trackId });
        btnElement.style.color = '#e74c3c';
        btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Liked';
    }
    btnElement.disabled = false;
};

window.openCommentPrompt = async function(trackId) {
    if (!currentUser) return;
    const content = prompt("Leave a comment on this track:");
    if (!content || !content.trim()) return;

    const { error } = await supabase.from('track_comments').insert({
        user_id: currentUser.id,
        track_id: trackId,
        content: content.trim()
    });

    if (error) {
        alert("Error posting comment: " + error.message);
    } else {
        alert("Comment posted successfully!");
    }
};

async function loadUserTracks() {
    const allContainer = document.querySelector('#all-view .sc-track-list');
    const popularContainer = document.querySelector('#popular-view .sc-track-list');
    const tracksContainer = document.querySelector('#tracks-view .sc-track-list');
    
    try {
        const { data: submissions, error } = await supabase
            .from('track_submissions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!submissions || submissions.length === 0) {
            const emptyHtml = `
                <div class="empty-state" style="text-align: center; padding: 50px; color: #888; width: 100%;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No tracks available</h2>
                    <p>You have not uploaded any tracks that have been approved yet.</p>
                </div>
            `;
            if (allContainer) allContainer.innerHTML = emptyHtml;
            if (popularContainer) popularContainer.innerHTML = emptyHtml;
            if (tracksContainer) tracksContainer.innerHTML = emptyHtml;
            return;
        }

        // Fetch display name
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', currentUser.id)
            .single();
            
        const artistName = profile ? profile.display_name : 'Unknown Artist';

        // Fetch user likes
        let userLikes = [];
        const { data: likes } = await supabase
            .from('track_likes')
            .select('track_id')
            .eq('user_id', currentUser.id);
            
        if (likes) {
            userLikes = likes.map(l => l.track_id);
        }

        if (allContainer) allContainer.innerHTML = '';
        if (popularContainer) popularContainer.innerHTML = '';
        if (tracksContainer) tracksContainer.innerHTML = '';

        // Determine popular tracks (sort by likes descending)
        // Since we don't have global like count easily here, we will just use the same array for now
        // For a full implementation, you'd query a view or count likes.

        submissions.forEach(sub => {
            const isLiked = userLikes.includes(sub.id);
            const likeIcon = isLiked 
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Liked'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like';
            const likeColor = isLiked ? '#e74c3c' : '#fff';

            const buildRow = (suffix) => {
                const audioId = 'audio_prof_' + sub.id + '_' + suffix;
                const row = document.createElement('div');
                row.className = 'track-row';
                row.innerHTML = `
                    <div class="track-cover-play">
                        <div style="width: 100px; height: 100px; background: #222; display: flex; align-items: center; justify-content: center; color: #e2b764;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        </div>
                        <button class="play-btn" onclick="playAudio('${audioId}', this)">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <audio id="${audioId}" src="${sub.normal_track_url}"></audio>
                    </div>
                    <div class="track-info" style="flex: 2;">
                        <h4>${sub.title}</h4>
                        <p>${artistName}</p>
                        <div style="margin-top: 8px; display: flex; gap: 15px;">
                            <button onclick="toggleLike('${sub.id}', this)" style="background: transparent; border: none; color: ${likeColor}; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.85rem;">
                                ${likeIcon}
                            </button>
                            <button onclick="openCommentPrompt('${sub.id}')" style="background: transparent; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.85rem;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Comment
                            </button>
                        </div>
                    </div>
                    <div class="track-meta" style="flex: 1;">${sub.genre}</div>
                    <div class="track-actions">
                        ${sub.extended_track_url ? \`<a href="${sub.extended_track_url}" target="_blank" class="btn-primary" style="padding: 8px 16px; font-size: 0.8rem; text-decoration: none;">EXTENDED</a>\` : \`<a href="${sub.normal_track_url}" target="_blank" class="btn-outline" style="padding: 8px 16px; font-size: 0.8rem; text-decoration: none;">DOWNLOAD</a>\`}
                    </div>
                `;
                return row;
            };

            if (allContainer) allContainer.appendChild(buildRow('all'));
            if (popularContainer) popularContainer.appendChild(buildRow('pop'));
            if (tracksContainer) tracksContainer.appendChild(buildRow('trk'));
        });

    } catch (err) {
        console.error("Error loading user tracks:", err);
        const errHtml = '<div style="color:red; text-align:center; padding: 20px;">Failed to load tracks.</div>';
        if (allContainer) allContainer.innerHTML = errHtml;
        if (popularContainer) popularContainer.innerHTML = errHtml;
        if (tracksContainer) tracksContainer.innerHTML = errHtml;
    }
}

async function loadUserPosts() {
    const postContainer = document.getElementById('profile-post-list');
    postContainer.innerHTML = '<div style="color:#888;">Loading your posts...</div>';
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id, category, title, content, created_at,
            profiles!posts_user_id_fkey(display_name),
            likes(user_id),
            bookmarks(user_id),
            comments(id)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user posts:', error);
        postContainer.innerHTML = '<div style="color:red;">Failed to load posts.</div>';
        return;
    }
    
    if (!posts || posts.length === 0) {
        postContainer.innerHTML = '<div style="color:#888;">You haven\'t created any posts yet.</div>';
        return;
    }

    renderUserPosts(posts, postContainer);
}

function renderUserPosts(posts, container) {
    container.innerHTML = '';
    
    for (const p of posts) {
        const postEl = document.createElement('div');
        postEl.className = 'blog-post';
        
        let badgeClass = 'badge-request'; 
        if (p.category === 'Releases & Edits') badgeClass = 'badge-release';
        else if (p.category === 'DJ Tips') badgeClass = 'badge-tips';
        
        let badgeHtml = p.category === 'General Discussion' ? '' : `<span class="post-badge ${badgeClass}">${p.category.toUpperCase()}</span>`;
        
        const username = p.profiles?.display_name || 'User';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
        
        postEl.innerHTML = `
            <div class="post-content-wrap">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>${badgeHtml}</div>
                    <div style="display:flex; gap:10px;">
                        <button class="edit-post-btn" style="background:transparent; border:none; color:#888; cursor:pointer;" title="Edit Post">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="delete-post-btn" style="background:transparent; border:none; color:#888; cursor:pointer;" title="Delete Post">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                <h2 class="post-title" style="margin-top: 10px;">${p.title}</h2>
                <p class="post-excerpt">${p.content}</p>
                <div class="post-footer">
                    <div class="post-author">
                        <img src="${avatarUrl}" alt="${username}">
                        <span class="author-name">${username}</span>
                        <span class="post-time">${new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="post-stats">
                        <span class="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span class="comment-count">${p.comments?.length || 0}</span>
                        </span>
                        <span class="stat-item">
                            <svg class="like-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="like-count">${p.likes?.length || 0}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="edit-form-container" style="display:none; margin-top:20px; padding:20px; background:#1a1a1a; border-radius:12px; border:1px solid #333;">
                <h3 style="color:#fff; margin-bottom:15px; font-size:16px;">Edit Post</h3>
                <input type="text" class="edit-title-input" value="${p.title}" style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; margin-bottom:10px;">
                <textarea class="edit-content-input" rows="4" style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; margin-bottom:10px;">${p.content}</textarea>
                <div style="display:flex; gap:10px;">
                    <button class="save-edit-btn btn-primary" style="padding:8px 16px;">Save Changes</button>
                    <button class="cancel-edit-btn" style="padding:8px 16px; background:transparent; border:1px solid #555; color:#fff; border-radius:24px; cursor:pointer;">Cancel</button>
                </div>
            </div>
        `;
        
        container.appendChild(postEl);
        
        // Handlers
        const deleteBtn = postEl.querySelector('.delete-post-btn');
        const editBtn = postEl.querySelector('.edit-post-btn');
        const editForm = postEl.querySelector('.edit-form-container');
        const cancelEditBtn = postEl.querySelector('.cancel-edit-btn');
        const saveEditBtn = postEl.querySelector('.save-edit-btn');
        
        deleteBtn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this post?")) {
                const { error } = await supabase.from('posts').delete().eq('id', p.id);
                if (error) {
                    alert('Failed to delete post.');
                } else {
                    postEl.remove();
                }
            }
        });
        
        editBtn.addEventListener('click', () => {
            editForm.style.display = 'block';
        });
        
        cancelEditBtn.addEventListener('click', () => {
            editForm.style.display = 'none';
        });
        
        saveEditBtn.addEventListener('click', async () => {
            const newTitle = postEl.querySelector('.edit-title-input').value.trim();
            const newContent = postEl.querySelector('.edit-content-input').value.trim();
            
            if (!newTitle || !newContent) return;
            
            saveEditBtn.textContent = 'Saving...';
            const { error } = await supabase.from('posts').update({ title: newTitle, content: newContent }).eq('id', p.id);
            saveEditBtn.textContent = 'Save Changes';
            
            if (error) {
                alert('Failed to update post.');
            } else {
                postEl.querySelector('.post-title').textContent = newTitle;
                postEl.querySelector('.post-excerpt').textContent = newContent;
                editForm.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initProfile);

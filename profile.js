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
    } else {
        document.getElementById('profile-post-list').innerHTML = '<div style="color:#e2b764;">Please log in to view your posts.</div>';
    }
    setupTabs();
}

function setupTabs() {
    const tabs = document.querySelectorAll('.sc-tabs-left .sc-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.dataset.target;
            if (targetId) {
                document.getElementById('tracks-view').style.display = targetId === 'tracks-view' ? 'block' : 'none';
                document.getElementById('posts-view').style.display = targetId === 'posts-view' ? 'block' : 'none';
            }
        });
    });
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

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM Elements
const postContainer = document.querySelector('.blog-post-list');
const navItems = document.querySelectorAll('.blog-nav-item');
const tags = document.querySelectorAll('.blog-tag');
const sortSelect = document.querySelector('.blog-sort select');
const searchInput = document.querySelector('.search-input-wrapper input');
const createPostBtn = document.getElementById('create-post-btn');
const createPostModal = document.getElementById('create-post-modal');
const closePostModal = document.getElementById('close-post-modal');
const createPostForm = document.getElementById('create-post-form');

let currentFilter = 'All';
let currentSort = 'Recent';
let searchQuery = '';

let allPosts = []; 
let currentUser = null;

async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    await loadPosts();
    setupEventListeners();
}

async function loadPosts() {
    postContainer.innerHTML = '<div style="text-align:center; padding: 50px; color:#fff;">Loading posts...</div>';
    
    // Fetch posts with author info and interactions
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id, category, title, content, created_at,
            profiles!posts_user_id_fkey(display_name),
            likes(user_id),
            bookmarks(user_id),
            comments(id, content, created_at, profiles(display_name))
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        postContainer.innerHTML = '<div style="color:red; text-align:center; padding: 20px;">Failed to load posts. Did you run the SQL setup?</div>';
        return;
    }

    allPosts = posts || [];
    renderPosts();
}

function renderPosts() {
    // Filter
    let visiblePosts = allPosts.filter(p => {
        let matchesCategory = false;
        if (currentFilter === 'All') {
            matchesCategory = true;
        } else if (currentFilter === 'Saved Posts') {
            matchesCategory = currentUser && p.bookmarks && p.bookmarks.some(b => b.user_id === currentUser.id);
        } else {
            matchesCategory = p.category === currentFilter;
        }

        const titleMatch = p.title.toLowerCase().includes(searchQuery);
        const contentMatch = p.content.toLowerCase().includes(searchQuery);

        return matchesCategory && (titleMatch || contentMatch);
    });

    // Sort
    visiblePosts.sort((a, b) => {
        if (currentSort === 'Popular') {
            return ((b.likes && b.likes.length) || 0) - ((a.likes && a.likes.length) || 0);
        } else {
            return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    if (visiblePosts.length === 0) {
        postContainer.innerHTML = `
            <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; color: #888; text-align: center; width: 100%;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No posts found</h2>
                <p>Be the first to start a discussion!</p>
            </div>
        `;
        return;
    }

    postContainer.innerHTML = '';
    
    for (const p of visiblePosts) {
        const postEl = document.createElement('div');
        postEl.className = 'blog-post';
        
        let badgeClass = 'badge-request'; 
        if (p.category === 'Releases & Edits') badgeClass = 'badge-release';
        else if (p.category === 'DJ Tips') badgeClass = 'badge-tips';
        
        let badgeHtml = p.category === 'General Discussion' ? '' : `<span class="post-badge ${badgeClass}">${p.category.toUpperCase()}</span>`;
        
        const username = p.profiles?.display_name || 'User';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
        
        const isLiked = currentUser && p.likes && p.likes.some(l => l.user_id === currentUser.id);
        const isBookmarked = currentUser && p.bookmarks && p.bookmarks.some(b => b.user_id === currentUser.id);
        const likeColor = isLiked ? '#e2b764' : 'currentColor';
        const likeFill = isLiked ? '#e2b764' : 'none';
        
        const bookmarkColor = isBookmarked ? '#e2b764' : '';
        const bookmarkFill = isBookmarked ? '#e2b764' : 'none';

        const comments = p.comments || [];
        const likes = p.likes || [];

        // Formatting time
        const timeAgo = formatTimeAgo(new Date(p.created_at));

        postEl.innerHTML = `
            <div class="post-content-wrap">
                ${badgeHtml}
                <h2 class="post-title">${p.title}</h2>
                <p class="post-excerpt">${p.content}</p>
                <div class="post-footer">
                    <div class="post-author">
                        <img src="${avatarUrl}" alt="${username}">
                        <span class="author-name">${username}</span>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                    <div class="post-stats">
                        <span class="stat-item comment-btn" style="cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span class="comment-count">${comments.length}</span>
                        </span>
                        <span class="stat-item like-btn" style="cursor: pointer; color: ${likeColor}">
                            <svg class="like-svg" width="16" height="16" viewBox="0 0 24 24" fill="${likeFill}" stroke="${likeColor}" stroke-width="2" style="margin-right: 4px;">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="like-count">${likes.length}</span>
                        </span>
                        <button class="icon-btn-border bookmark-btn" style="width: 32px; height: 32px; padding: 0; border-color: ${bookmarkColor}; color: ${bookmarkColor};">
                            <svg class="bookmark-svg" width="14" height="14" viewBox="0 0 24 24" fill="${bookmarkFill}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="post-comments-section" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                <div class="comments-list" style="margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                </div>
                <div class="add-comment" style="display: flex; gap: 10px;">
                    <img src="${currentUser ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user_metadata?.username || 'You')}&background=111&color=e2b764` : 'https://ui-avatars.com/api/?name=U&background=111&color=fff'}" alt="You" style="width: 32px; height: 32px; border-radius: 50%;">
                    <input type="text" class="comment-input" placeholder="Write a comment..." style="flex-grow: 1; padding: 8px 12px; background: #222; border: 1px solid #444; color: #fff; border-radius: 20px; outline: none;">
                    <button class="submit-comment-btn btn-primary" style="padding: 6px 16px; font-size: 13px; border-radius: 20px;">Post</button>
                </div>
            </div>
        `;
        
        postContainer.appendChild(postEl);
        
        // Attach Interactivity
        const likeBtn = postEl.querySelector('.like-btn');
        const likeSvg = postEl.querySelector('.like-svg');
        const likeCountSpan = postEl.querySelector('.like-count');
        const bookmarkBtn = postEl.querySelector('.bookmark-btn');
        const bookmarkSvg = postEl.querySelector('.bookmark-svg');
        const commentBtn = postEl.querySelector('.comment-btn');
        const commentCountSpan = postEl.querySelector('.comment-count');
        const commentsSection = postEl.querySelector('.post-comments-section');
        const commentsList = postEl.querySelector('.comments-list');
        const submitCommentBtn = postEl.querySelector('.submit-comment-btn');
        const commentInput = postEl.querySelector('.comment-input');
        
        // Populate initial comments
        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="color:#888; font-size:13px;">No comments yet.</div>';
        } else {
            comments.forEach(c => appendCommentUI(commentsList, c));
        }

        // Like Toggle
        likeBtn.addEventListener('click', async () => {
            if (!currentUser) return alert('Please log in to like posts.');
            if (!p.likes) p.likes = [];
            
            const currentlyLiked = p.likes.some(l => l.user_id === currentUser.id);
            if (currentlyLiked) {
                // Unlike UI
                p.likes = p.likes.filter(l => l.user_id !== currentUser.id);
                likeSvg.style.fill = 'none';
                likeSvg.style.stroke = 'currentColor';
                likeBtn.style.color = '';
                likeCountSpan.textContent = p.likes.length;
                
                // API
                await supabase.from('likes').delete().eq('post_id', p.id).eq('user_id', currentUser.id);
            } else {
                // Like UI
                p.likes.push({user_id: currentUser.id});
                likeSvg.style.fill = '#e2b764';
                likeSvg.style.stroke = '#e2b764';
                likeBtn.style.color = '#e2b764';
                likeCountSpan.textContent = p.likes.length;
                
                // API
                await supabase.from('likes').insert({ post_id: p.id, user_id: currentUser.id });
            }
        });

        // Bookmark Toggle
        bookmarkBtn.addEventListener('click', async () => {
            if (!currentUser) return alert('Please log in to save posts.');
            if (!p.bookmarks) p.bookmarks = [];
            
            const currentlyBookmarked = p.bookmarks.some(b => b.user_id === currentUser.id);
            if (currentlyBookmarked) {
                // Unbookmark UI
                p.bookmarks = p.bookmarks.filter(b => b.user_id !== currentUser.id);
                bookmarkSvg.style.fill = 'none';
                bookmarkBtn.style.color = '';
                bookmarkBtn.style.borderColor = '';
                
                if (currentFilter === 'Saved Posts') {
                    renderPosts(); // Refresh list if looking at saved posts
                }
                
                // API
                await supabase.from('bookmarks').delete().eq('post_id', p.id).eq('user_id', currentUser.id);
            } else {
                // Bookmark UI
                p.bookmarks.push({user_id: currentUser.id});
                bookmarkSvg.style.fill = '#e2b764';
                bookmarkBtn.style.color = '#e2b764';
                bookmarkBtn.style.borderColor = '#e2b764';
                
                // API
                await supabase.from('bookmarks').insert({ post_id: p.id, user_id: currentUser.id });
            }
        });

        // Comments Toggle
        commentBtn.addEventListener('click', () => {
            const isHidden = commentsSection.style.display === 'none';
            commentsSection.style.display = isHidden ? 'block' : 'none';
        });
        
        // Submit Comment
        submitCommentBtn.addEventListener('click', async () => {
            if (!currentUser) return alert('Please log in to comment.');
            const val = commentInput.value.trim();
            if (val) {
                commentInput.value = '';
                
                if (commentsList.innerHTML.includes('No comments yet')) {
                    commentsList.innerHTML = '';
                }
                
                const tempUsername = currentUser.user_metadata?.display_name || currentUser.user_metadata?.username || 'You';
                const newCommentObj = { content: val, profiles: { display_name: tempUsername }, created_at: new Date().toISOString() };
                
                appendCommentUI(commentsList, newCommentObj);
                
                if (!p.comments) p.comments = [];
                p.comments.push(newCommentObj);
                commentCountSpan.textContent = p.comments.length;
                
                // Scroll to bottom
                commentsList.scrollTop = commentsList.scrollHeight;
                
                const { error } = await supabase.from('comments').insert({
                    post_id: p.id,
                    user_id: currentUser.id,
                    content: val
                });
                
                if (error) {
                    console.error('Error posting comment:', error);
                    alert('Failed to post comment.');
                }
            }
        });
        
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitCommentBtn.click();
        });
    }
}

function appendCommentUI(container, c) {
    const cUsername = c.profiles?.display_name || 'User';
    const cAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cUsername)}&background=111&color=e2b764`;
    
    const cEl = document.createElement('div');
    cEl.style.cssText = 'display: flex; gap: 10px; margin-bottom: 12px;';
    cEl.innerHTML = `
        <img src="${cAvatar}" alt="${cUsername}" style="width: 28px; height: 28px; border-radius: 50%;">
        <div style="background: #2a2a2a; padding: 10px 14px; border-radius: 12px; font-size: 14px;">
            <div style="font-weight: 600; color: #e2b764; margin-bottom: 4px; font-size: 13px;">${cUsername}</div>
            <div>${c.content}</div>
        </div>
    `;
    container.appendChild(cEl);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

function setActiveNav(selectedText) {
    navItems.forEach(item => {
        if (item.textContent.trim() === selectedText) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    tags.forEach(tag => {
        const tagText = tag.textContent.trim();
        if (tagText === selectedText || 
            (selectedText === 'Latest Posts' && tagText === 'All') || 
            (selectedText === 'Popular' && tagText === 'All')) {
             tag.classList.add('active');
        } else {
             tag.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const text = item.textContent.trim();
            
            if (text === 'Latest Posts') {
                currentFilter = 'All';
                currentSort = 'Recent';
                sortSelect.value = 'Recent';
            } else if (text === 'Popular') {
                currentFilter = 'All';
                currentSort = 'Popular';
                sortSelect.value = 'Popular';
            } else {
                currentFilter = text;
                currentSort = 'Recent';
                sortSelect.value = 'Recent';
            }

            setActiveNav(text);
            renderPosts();
        });
    });

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const text = tag.textContent.trim();
            if (text === 'All') {
                currentFilter = 'All';
                setActiveNav('Latest Posts');
            } else {
                currentFilter = text;
                setActiveNav(text);
            }
            renderPosts();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        if (currentSort === 'Popular' && currentFilter === 'All') {
            setActiveNav('Popular');
        } else if (currentSort === 'Recent' && currentFilter === 'All') {
            setActiveNav('Latest Posts');
        }
        renderPosts();
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderPosts();
        });
    }

    if (createPostBtn && createPostModal) {
        createPostBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert("You must be logged in to create a post.");
                return;
            }
            createPostModal.style.display = 'flex';
        });

        closePostModal.addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });

        createPostModal.addEventListener('click', (e) => {
            if (e.target === createPostModal.querySelector('.sub-modal-overlay')) {
                createPostModal.style.display = 'none';
            }
        });
    }

    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const category = document.getElementById('post-category').value;
            const title = document.getElementById('post-title').value.trim();
            const content = document.getElementById('post-content').value.trim();

            if (!title || !content) return;

            const submitBtn = createPostForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Posting...';
            submitBtn.disabled = true;

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    user_id: currentUser.id,
                    category,
                    title,
                    content
                })
                .select('id, category, title, content, created_at, profiles!posts_user_id_fkey(display_name)')
                .single();

            submitBtn.textContent = 'Post';
            submitBtn.disabled = false;

            if (error) {
                console.error('Error creating post:', error);
                alert('Failed to create post.');
                return;
            }

            data.likes = [];
            data.bookmarks = [];
            data.comments = [];
            allPosts.unshift(data); // Add to top

            createPostModal.style.display = 'none';
            createPostForm.reset();
            renderPosts();
        });
    }
}

init();
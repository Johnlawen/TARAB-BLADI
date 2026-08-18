document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.blog-nav-item');
    const posts = Array.from(document.querySelectorAll('.blog-post'));
    const postContainer = document.querySelector('.blog-post-list');
    const tags = document.querySelectorAll('.blog-tag');
    const sortSelect = document.querySelector('.blog-sort select');
    const searchInput = document.querySelector('.search-input-wrapper input');

    // Add data attributes if they don't exist
    posts.forEach((post, index) => {
        post.dataset.index = index;
        
        // Extract category
        const badge = post.querySelector('.post-badge');
        if (badge) {
            if (badge.classList.contains('badge-request')) post.dataset.category = 'Song Requests';
            else if (badge.classList.contains('badge-release')) post.dataset.category = 'Releases & Edits';
            else if (badge.classList.contains('badge-tips')) post.dataset.category = 'DJ Tips';
            else post.dataset.category = 'General Discussion';
        } else {
            post.dataset.category = 'General Discussion';
        }

        // Extract likes
        const stats = post.querySelectorAll('.stat-item');
        if (stats.length >= 2) {
            const likesText = stats[1].textContent.trim();
            post.dataset.likes = parseInt(likesText, 10) || 0;
        } else {
            post.dataset.likes = 0;
        }
    });

    let currentFilter = 'All'; // 'All', 'Song Requests', etc.
    let currentSort = 'Recent'; // 'Recent', 'Popular'
    let searchQuery = '';

    function updatePosts() {
        // Filter by category and search query
        let visiblePosts = posts.filter(post => {
            let matchesCategory = false;
            if (currentFilter === 'All') {
                matchesCategory = true;
            } else if (currentFilter === 'Saved Posts') {
                matchesCategory = post.dataset.bookmarked === 'true';
            } else {
                matchesCategory = post.dataset.category === currentFilter;
            }
            
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
            const matchesSearch = title.includes(searchQuery) || excerpt.includes(searchQuery);
            
            return matchesCategory && matchesSearch;
        });

        // Sort
        visiblePosts.sort((a, b) => {
            if (currentSort === 'Popular') {
                return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
            } else {
                // Recent is by index (lower index first since they are in order of creation in HTML)
                return parseInt(a.dataset.index) - parseInt(b.dataset.index);
            }
        });

        // Clear container and append sorted/filtered posts, or show empty state
        if (visiblePosts.length === 0) {
            postContainer.innerHTML = `
                <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; color: #888; text-align: center; width: 100%;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No posts yet</h2>
                    <p>Be the first to start a discussion!</p>
                </div>
            `;
        } else {
            postContainer.innerHTML = '';
            visiblePosts.forEach(post => postContainer.appendChild(post));
        }
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

    // Event Listeners for Nav Menu
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
            updatePosts();
        });
    });

    // Event Listeners for Top Tags
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
            updatePosts();
        });
    });

    // Event Listener for Sort Select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        if (currentSort === 'Popular' && currentFilter === 'All') {
            setActiveNav('Popular');
        } else if (currentSort === 'Recent' && currentFilter === 'All') {
            setActiveNav('Latest Posts');
        }
        updatePosts();
    });

    // Event Listener for Search Input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            updatePosts();
        });
    }

    // --- INTERACTIVITY LOGIC (LIKES & BOOKMARKS) ---
    function attachInteractivity(post) {
        const bookmarkBtn = post.querySelector('.icon-btn-border');
        const stats = post.querySelectorAll('.stat-item');
        
        // 1. Like Logic (Heart Stat)
        if (stats.length >= 2) {
            let liked = false;
            let likesCountElem = stats[1].querySelector('.like-count');
            
            // Re-structure existing stats to have a span for the number if it doesn't
            if (!likesCountElem) {
                const text = stats[1].textContent.trim();
                stats[1].innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span class="like-count">${text}</span>
                `;
                likesCountElem = stats[1].querySelector('.like-count');
            }

            stats[1].style.cursor = 'pointer';
            
            stats[1].addEventListener('click', () => {
                let currentLikes = parseInt(post.dataset.likes) || 0;
                const svg = stats[1].querySelector('svg');
                if (!liked) {
                    currentLikes++;
                    svg.style.fill = '#e2b764';
                    svg.style.stroke = '#e2b764';
                    stats[1].style.color = '#e2b764';
                } else {
                    currentLikes--;
                    svg.style.fill = 'none';
                    svg.style.stroke = 'currentColor';
                    stats[1].style.color = '';
                }
                liked = !liked;
                post.dataset.likes = currentLikes;
                likesCountElem.textContent = currentLikes;
            });
        }

        // 2. Bookmark Logic (Bookmark Button)
        if (bookmarkBtn) {
            let bookmarked = post.dataset.bookmarked === 'true';
            bookmarkBtn.addEventListener('click', () => {
                bookmarked = !bookmarked;
                if (bookmarked) {
                    bookmarkBtn.style.color = '#e2b764';
                    bookmarkBtn.style.borderColor = '#e2b764';
                    bookmarkBtn.querySelector('svg').style.fill = '#e2b764';
                } else {
                    bookmarkBtn.style.color = '';
                    bookmarkBtn.style.borderColor = '';
                    bookmarkBtn.querySelector('svg').style.fill = 'none';
                }
                post.dataset.bookmarked = bookmarked.toString();
                if (currentFilter === 'Saved Posts') {
                    updatePosts();
                }
            });
        }

        // 3. Comment Logic (Message Bubble Stat)
        if (stats.length >= 1) {
            stats[0].style.cursor = 'pointer';
            
            let commentCountElem = stats[0].querySelector('.comment-count');
            if (!commentCountElem) {
                const text = stats[0].textContent.trim();
                stats[0].innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="comment-count">${text}</span>
                `;
                commentCountElem = stats[0].querySelector('.comment-count');
            }

            stats[0].addEventListener('click', () => {
                let commentsSection = post.querySelector('.post-comments-section');
                if (commentsSection) {
                    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                } else {
                    commentsSection = document.createElement('div');
                    commentsSection.className = 'post-comments-section';
                    commentsSection.style.marginTop = '20px';
                    commentsSection.style.paddingTop = '20px';
                    commentsSection.style.borderTop = '1px solid #333';
                    
                    commentsSection.innerHTML = `
                        <div class="comments-list" style="margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
                        </div>
                        <div class="add-comment" style="display: flex; gap: 10px;">
                            <img src="https://ui-avatars.com/api/?name=You&background=111&color=e2b764" alt="You" style="width: 32px; height: 32px; border-radius: 50%;">
                            <input type="text" class="comment-input" placeholder="Write a comment..." style="flex-grow: 1; padding: 8px 12px; background: #222; border: 1px solid #444; color: #fff; border-radius: 20px; outline: none;">
                            <button class="submit-comment-btn btn-primary" style="padding: 6px 16px; font-size: 13px; border-radius: 20px;">Post</button>
                        </div>
                    `;
                    post.querySelector('.post-content-wrap').appendChild(commentsSection);
                    
                    const submitBtn = commentsSection.querySelector('.submit-comment-btn');
                    const input = commentsSection.querySelector('.comment-input');
                    const commentsList = commentsSection.querySelector('.comments-list');
                    
                    submitBtn.addEventListener('click', () => {
                        const val = input.value.trim();
                        if (val) {
                            const newComment = document.createElement('div');
                            newComment.style.display = 'flex';
                            newComment.style.gap = '10px';
                            newComment.style.marginBottom = '12px';
                            newComment.innerHTML = `
                                <img src="https://ui-avatars.com/api/?name=You&background=111&color=e2b764" alt="You" style="width: 28px; height: 28px; border-radius: 50%;">
                                <div style="background: #2a2a2a; padding: 10px 14px; border-radius: 12px; font-size: 14px;">
                                    <div style="font-weight: 600; color: #e2b764; margin-bottom: 4px; font-size: 13px;">You</div>
                                    <div>${val}</div>
                                </div>
                            `;
                            commentsList.appendChild(newComment);
                            input.value = '';
                            
                            let currentCount = parseInt(commentCountElem.textContent) || 0;
                            commentCountElem.textContent = currentCount + 1;
                        }
                    });

                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') submitBtn.click();
                    });
                }
            });
        }
    }

    // Attach listeners to existing posts
    posts.forEach(attachInteractivity);

    // --- CREATE POST MODAL LOGIC ---
    const createPostBtn = document.getElementById('create-post-btn');
    const createPostModal = document.getElementById('create-post-modal');
    const closePostModal = document.getElementById('close-post-modal');
    const createPostForm = document.getElementById('create-post-form');

    if (createPostBtn && createPostModal) {
        createPostBtn.addEventListener('click', () => {
            createPostModal.style.display = 'flex';
        });

        closePostModal.addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });

        createPostModal.querySelector('.sub-modal-overlay').addEventListener('click', () => {
            createPostModal.style.display = 'none';
        });

        createPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('post-category').value;
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            let badgeClass = 'badge-request'; 
            if (category === 'Releases & Edits') badgeClass = 'badge-release';
            else if (category === 'DJ Tips') badgeClass = 'badge-tips';
            
            let badgeHtml = category === 'General Discussion' ? '' : `<span class="post-badge ${badgeClass}">${category.toUpperCase()}</span>`;

            const newPost = document.createElement('div');
            newPost.className = 'blog-post';
            newPost.dataset.category = category;
            newPost.dataset.likes = '0';
            
            // Dynamic index to make it appear first in 'Recent' view
            const minIndex = Math.min(...posts.map(p => parseInt(p.dataset.index) || 0), 0);
            newPost.dataset.index = minIndex - 1;

            newPost.innerHTML = `
                <div class="post-content-wrap">
                    ${badgeHtml}
                    <h2 class="post-title">${title}</h2>
                    <p class="post-excerpt">${content}</p>
                    <div class="post-footer">
                        <div class="post-author">
                            <img src="https://i.pravatar.cc/150?u=newuser" alt="You">
                            <span class="author-name">You</span>
                            <span class="post-time">Just now</span>
                        </div>
                        <div class="post-stats">
                            <span class="stat-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                0
                            </span>
                            <span class="stat-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="like-count">0</span>
                            </span>
                            <button class="icon-btn-border" style="width: 32px; height: 32px; padding: 0;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            attachInteractivity(newPost);
            posts.push(newPost);
            updatePosts();

            createPostModal.style.display = 'none';
            createPostForm.reset();
        });
    }

    // Initial render call to set up the default view
    updatePosts();
});
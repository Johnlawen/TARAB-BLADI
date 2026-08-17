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
            const matchesCategory = currentFilter === 'All' || post.dataset.category === currentFilter;
            
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

    // Initial render call to set up the default view
    updatePosts();
});
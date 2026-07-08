document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.blog-nav-item');
    const posts = Array.from(document.querySelectorAll('.blog-post'));
    const postContainer = document.querySelector('.blog-post-list');
    const tags = document.querySelectorAll('.blog-tag');
    const sortSelect = document.querySelector('.blog-sort select');

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

    function updatePosts() {
        // Filter
        let visiblePosts = posts.filter(post => {
            if (currentFilter === 'All') return true;
            return post.dataset.category === currentFilter;
        });

        // Sort
        visiblePosts.sort((a, b) => {
            if (currentSort === 'Popular') {
                return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
            } else {
                return parseInt(a.dataset.index) - parseInt(b.dataset.index);
            }
        });

        // Clear container and append sorted/filtered posts
        postContainer.innerHTML = '';
        visiblePosts.forEach(post => postContainer.appendChild(post));
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
            if (tag.textContent.trim() === selectedText || (selectedText === 'Latest Posts' && tag.textContent.trim() === 'All') || (selectedText === 'Popular' && tag.textContent.trim() === 'All')) {
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
                currentSort = 'Recent'; // Or keep current sort? Let's reset to recent
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
});

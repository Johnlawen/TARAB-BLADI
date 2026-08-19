
    import { supabase } from './auth.js';

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
        const sessionData = sessionStorage.getItem('tarab_user');
        if (!sessionData) {
            alert("Please log in to like this track.");
            return;
        }
        const user = JSON.parse(sessionData);

        btnElement.disabled = true;
        const { data: existingLike } = await supabase
            .from('track_likes')
            .select('*')
            .eq('user_id', user.id)
            .eq('track_id', trackId)
            .single();

        if (existingLike) {
            await supabase.from('track_likes').delete().eq('id', existingLike.id);
            btnElement.style.color = '#fff';
            btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        } else {
            await supabase.from('track_likes').insert({ user_id: user.id, track_id: trackId });
            btnElement.style.color = '#e74c3c';
            btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        }
        btnElement.disabled = false;
    };

    window.openCommentPrompt = async function(trackId) {
        const sessionData = sessionStorage.getItem('tarab_user');
        if (!sessionData) {
            alert("Please log in to comment.");
            return;
        }
        const user = JSON.parse(sessionData);

        const content = prompt("Leave a comment on this track:");
        if (!content || !content.trim()) return;

        const { error } = await supabase.from('track_comments').insert({
            user_id: user.id,
            track_id: trackId,
            content: content.trim()
        });

        if (error) {
            alert("Error posting comment: " + error.message);
        } else {
            alert("Comment posted successfully!");
        }
    };

    async function loadBrowseTracks() {
        try {
            const { data: submissions, error } = await supabase
                .from('track_submissions')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.querySelector('.track-table-body');
            
            if (!submissions || submissions.length === 0) {
                document.getElementById('browse-empty-state').innerHTML = `
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #fff;">No tracks available</h2>
                    <p>There are no songs uploaded yet.</p>
                `;
                return;
            }

            const userIds = submissions.map(s => s.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, display_name')
                .in('id', userIds);
            
            submissions.forEach(sub => {
                const profile = profiles?.find(p => p.id === sub.user_id);
                sub.profiles = profile ? { display_name: profile.display_name } : null;
            });

            tbody.innerHTML = '';

            let userLikes = [];
            const sessionData = sessionStorage.getItem('tarab_user');
            if (sessionData) {
                const user = JSON.parse(sessionData);
                const { data: likes } = await supabase
                    .from('track_likes')
                    .select('track_id')
                    .eq('user_id', user.id);
                if (likes) userLikes = likes.map(l => l.track_id);
            }

            submissions.forEach(sub => {
                const row = document.createElement('div');
                row.className = 'track-row';
                
                const audioId = 'audio_' + sub.id;
                const artistName = sub.profiles ? sub.profiles.display_name : 'Unknown Artist';
                const dateStr = new Date(sub.created_at).toLocaleDateString();
                
                const isLiked = userLikes.includes(sub.id);
                const likeIcon = isLiked 
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
                const likeColor = isLiked ? '#e74c3c' : '#fff';

                row.innerHTML = `
                    <div class="td-track">
                        <div class="track-cover-play" style="flex-shrink: 0;">
                            <div style="width: 48px; height: 48px; background: #222; display: flex; align-items: center; justify-content: center; color: #e2b764;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                            </div>
                            <button class="play-btn-small" onclick="playAudio('${audioId}', this)">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                            <audio id="${audioId}" src="${sub.normal_track_url}"></audio>
                        </div>
                        <div class="track-info">
                            <h4>${sub.title}</h4>
                            <p>${artistName}</p>
                        </div>
                    </div>
                    <div class="td-genre"><span class="badge">${sub.genre}</span></div>
                    <div class="td-bpm">120</div>
                    <div class="td-key">Am</div>
                    <div class="td-version">Original</div>
                    <div class="td-released">${dateStr}</div>
                    <div class="td-waveform">
                        <div class="waveform-mockup" style="height: 30px;"></div>
                    </div>
                    <div class="td-actions">
                        <button class="icon-btn" onclick="toggleLike('${sub.id}', this)" style="color: ${likeColor};">${likeIcon}</button>
                        <button class="icon-btn" onclick="openCommentPrompt('${sub.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </button>
                        ${sub.extended_track_url ? `<a href="${sub.extended_track_url}" target="_blank" class="icon-btn" title="Download Extended"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></a>` : `<a href="${sub.normal_track_url}" target="_blank" class="icon-btn" title="Download"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></a>`}
                    </div>
                `;
                tbody.appendChild(row);
            });

            // Initialize filters after tracks load
            initFilters();

        } catch (err) {
            console.error("Error loading browse tracks:", err);
        }
    }

    // Move the old filter logic into a function we call after fetch
    function initFilters() {
        const filterItems = document.querySelectorAll('.filter-list li');
        
        const filterOptions = {
            'Genre': ['Arabic House', 'Afro Arabic', 'Oriental Edit', 'Dabke Remix', 'Club Edit'],
            'BPM': ['115-120', '120-125', '125-130', '130+'],
            'Key': ['A Minor', 'C Minor', 'D Minor', 'E Minor', 'G Minor'],
            'Mood': ['Energetic', 'Chill', 'Dark', 'Happy', 'Party'],
            'Language': ['Arabic', 'English', 'Instrumental'],
            'Version': ['Extended Mix', 'Edit', 'Radio Edit', 'Acapella'],
            'Artists': ['Amr Diab', 'Nancy Ajram', 'Mohamed Ramadan', 'Elissa', 'DJL'],
            'Release Date': ['This Week', 'This Month', 'This Year', 'Older']
        };

        filterItems.forEach(li => {
            const filterItem = li.querySelector('.filter-item');
            const chevron = li.querySelector('.chevron');
            const titleSpan = filterItem ? filterItem.querySelector('span') : null;
            
            if (!titleSpan) return;
            const filterName = titleSpan.innerText.trim();
            
            const header = document.createElement('div');
            header.className = 'filter-header';
            header.appendChild(filterItem);
            header.appendChild(chevron);
            li.appendChild(header);
            
            const dropdown = document.createElement('div');
            dropdown.className = 'filter-dropdown';
            
            const options = filterOptions[filterName] || ['Option 1', 'Option 2'];
            options.forEach(opt => {
                const label = document.createElement('label');
                label.className = 'filter-checkbox';
                label.innerHTML = `<input type="checkbox" value="${opt}" onchange="applyFilters()"> ${opt}`;
                dropdown.appendChild(label);
            });
            
            li.appendChild(dropdown);
            
            header.addEventListener('click', () => {
                dropdown.classList.toggle('active');
                chevron.classList.toggle('open');
            });
        });

        window.applyFilters = function() {
            const checkedBoxes = Array.from(document.querySelectorAll('.filter-checkbox input:checked')).map(cb => cb.value.toLowerCase());
            const trackRows = document.querySelectorAll('.track-table-body .track-row');
            
            const activeTab = document.querySelector('.genre-tab.active span');
            const activeGenre = activeTab ? activeTab.innerText.trim().toLowerCase() : 'all music';
            
            const searchInput = document.getElementById('global-search-input');
            const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            trackRows.forEach(row => {
                const rowText = row.innerText.toLowerCase();
                let matchesCheckboxes = true;
                if (checkedBoxes.length > 0) matchesCheckboxes = checkedBoxes.some(val => rowText.includes(val));
                
                let matchesGenre = true;
                if (activeGenre !== 'all music') {
                    let searchGenre = activeGenre.replace(' edits', ' edit').replace(' remixes', ' remix').replace(' bangers', ' banger');
                    matchesGenre = rowText.includes(searchGenre);
                }
                
                let matchesSearch = true;
                if (searchQuery !== '') matchesSearch = rowText.includes(searchQuery);
                
                row.style.display = (matchesCheckboxes && matchesGenre && matchesSearch) ? '' : 'none';
            });
        };

        const searchInputElem = document.getElementById('global-search-input');
        if (searchInputElem) searchInputElem.addEventListener('input', applyFilters);

        const genreTabs = document.querySelectorAll('.genre-tab');
        genreTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                genreTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                applyFilters();
            });
        });

        const urlParams = new URLSearchParams(window.location.search);
        const genreParam = urlParams.get('genre');
        if (genreParam) {
            const targetGenre = genreParam.toLowerCase();
            setTimeout(() => {
                genreTabs.forEach(tab => {
                    const span = tab.querySelector('span');
                    if (span && span.innerText.trim().toLowerCase() === targetGenre) {
                        tab.click();
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                });
            }, 100);
        }

        const searchParam = urlParams.get('search');
        if (searchParam && searchInputElem) {
            searchInputElem.value = searchParam;
            setTimeout(() => {
                applyFilters();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }, 100);
        }
    }

    loadBrowseTracks();

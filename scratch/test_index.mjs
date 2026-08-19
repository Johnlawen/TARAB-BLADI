
        import { supabase } from './auth.js';

        let currentAudio = null;
        let currentPlayBtn = null;

        function playAudio(audioId, btnElement) {
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
        }
        window.playAudio = playAudio;

        async function toggleLike(trackId, btnElement) {
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
                btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like';
            } else {
                await supabase.from('track_likes').insert({ user_id: user.id, track_id: trackId });
                btnElement.style.color = '#e74c3c';
                btnElement.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Liked';
            }
            btnElement.disabled = false;
        }
        window.toggleLike = toggleLike;

        async function openCommentPrompt(trackId) {
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
        }
        window.openCommentPrompt = openCommentPrompt;

        async function initLiveTracks() {
            try {
                const { data: submissions, error } = await supabase
                    .from('track_submissions')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.error("Error fetching live tracks:", error);
                    return;
                }

                const trackList = document.querySelector('.track-list');
                
                if (!submissions || submissions.length === 0) {
                    document.getElementById('index-empty-state').innerHTML = `
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

                trackList.innerHTML = '';

                let userLikes = [];
                const sessionData = sessionStorage.getItem('tarab_user');
                if (sessionData) {
                    const user = JSON.parse(sessionData);
                    const { data: likes } = await supabase
                        .from('track_likes')
                        .select('track_id')
                        .eq('user_id', user.id);
                    if (likes) {
                        userLikes = likes.map(l => l.track_id);
                    }
                }

                submissions.forEach(sub => {
                    const row = document.createElement('div');
                    row.className = 'track-row';
                    
                    const audioId = 'audio_' + sub.id;
                    const artistName = sub.profiles ? sub.profiles.display_name : 'Unknown Artist';
                    
                    const isLiked = userLikes.includes(sub.id);
                    const likeIcon = isLiked 
                        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Liked'
                        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Like';
                    const likeColor = isLiked ? '#e74c3c' : '#fff';

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
                            ${sub.extended_track_url ? `<a href="${sub.extended_track_url}" target="_blank" class="btn-primary" style="padding: 8px 16px; font-size: 0.8rem; text-decoration: none;">EXTENDED</a>` : `<a href="${sub.normal_track_url}" target="_blank" class="btn-outline" style="padding: 8px 16px; font-size: 0.8rem; text-decoration: none;">DOWNLOAD</a>`}
                        </div>
                    `;
                    trackList.appendChild(row);
                });
            } catch (err) {
                console.error("Error loading live tracks:", err);
            }
        }
        
        initLiveTracks();
    
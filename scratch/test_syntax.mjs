
        import { supabase } from './auth.js';

        function logoutAdmin() {
            sessionStorage.removeItem('tarab_admin_auth');
            window.location.href = 'index.html';
        }
        window.logoutAdmin = logoutAdmin;

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

        async function initDashboard() {
            try {
                // Fetch pending tracks with cache buster to bypass aggressive browser caches
                const { data: submissions, error } = await supabase
                    .from('track_submissions')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching submissions:", error);
                    document.querySelector('.admin-header p').innerHTML = "<span style='color:red'>Database Error: " + error.message + "</span>";
                    return;
                }
                
                // Show debug info right on the screen
                document.querySelector('.admin-header p').innerHTML = "<span style='color:#2ecc71'>Successfully connected! Found " + (submissions ? submissions.length : 0) + " pending tracks in database.</span>";

                // Fetch profiles separately
                if (submissions && submissions.length > 0) {
                    const userIds = submissions.map(s => s.user_id);
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, display_name')
                        .in('id', userIds);
                    
                    submissions.forEach(sub => {
                        const profile = profiles?.find(p => p.id === sub.user_id);
                        sub.profiles = profile ? { display_name: profile.display_name } : null;
                    });
                }

                // Update stats (mock logic for approved/declined for now, just actual pending)
                const pendingEl = document.querySelectorAll('.stat-value')[0];
                if (pendingEl) pendingEl.innerText = submissions.length;

                const trackList = document.querySelector('.track-list');
                
                if (submissions.length > 0) {
                    trackList.innerHTML = ''; // Clear empty state
                    window.allSubmissions = submissions; // Save globally for the modal
                    
                    submissions.forEach(sub => {
                        const row = document.createElement('div');
                        row.className = 'track-row admin-track-row';
                        row.dataset.id = sub.id;
                        
                        const audioId = 'audio_' + sub.id;
                        const artistName = sub.profiles ? sub.profiles.display_name : 'Unknown Artist';

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
                            <div class="track-info">
                                <h4>${sub.title}</h4>
                                <p>Submitted by: ${artistName}</p>
                                <p style="font-size: 0.75rem; color: #888; margin-top: 4px;">Notes: ${sub.reviewer_notes || 'None'}</p>
                                ${sub.extended_track_url ? `<a href="${sub.extended_track_url}" target="_blank" style="font-size: 0.75rem; color: #e2b764; text-decoration: none;">Download Extended Mix</a>` : ''}
                            </div>
                            <div class="track-meta">${sub.genre}</div>
                            <div class="track-waveform">
                                <div class="waveform-mockup"></div>
                            </div>
                            <div class="track-actions admin-actions">
                                <button class="btn-primary" onclick="openAdminModal('${sub.id}')" style="padding: 8px 16px; font-size: 0.8rem;">
                                    REVIEW TRACK
                                </button>
                            </div>
                        `;
                        trackList.appendChild(row);
                    });
                }
            } catch (err) {
                console.error("Critical JS Error in Dashboard:", err);
                alert("Critical Error rendering dashboard: " + err.message);
            }
        }
        
        // Modules run after DOM is ready, so we can just call it
        initDashboard();

        let currentSubmission = null;

        function openAdminModal(subId) {
            currentSubmission = window.allSubmissions.find(s => s.id === subId);
            if (!currentSubmission) return;
            
            document.getElementById('modal-track-title').innerText = currentSubmission.title;
            document.getElementById('modal-track-genre').value = currentSubmission.genre;
            document.getElementById('modal-track-message').value = '';
            
            document.getElementById('admin-action-modal').style.display = 'flex';
        }
        window.openAdminModal = openAdminModal;

        function closeAdminModal() {
            document.getElementById('admin-action-modal').style.display = 'none';
            currentSubmission = null;
        }
        window.closeAdminModal = closeAdminModal;

        document.getElementById('modal-btn-accept').addEventListener('click', async () => {
            if (!currentSubmission) return;
            const btn = document.getElementById('modal-btn-accept');
            btn.innerText = 'Approving...';
            btn.disabled = true;

            const newGenre = document.getElementById('modal-track-genre').value;
            const message = document.getElementById('modal-track-message').value;

            const { error } = await supabase.from('track_submissions').update({ 
                status: 'approved',
                genre: newGenre
            }).eq('id', currentSubmission.id);

            if (error) {
                alert("Error: " + error.message);
                btn.innerText = 'APPROVE';
                btn.disabled = false;
                return;
            }

            // Insert Notification (fire and forget for now, but handle safely)
            try {
                await supabase.from('notifications').insert({
                    user_id: currentSubmission.user_id,
                    title: 'Track Approved!',
                    message: `Your track "${currentSubmission.title}" has been approved.${message ? ' Reviewer note: ' + message : ''}`,
                    type: 'success'
                });
            } catch (e) { console.warn("Could not insert notification", e); }

            closeAdminModal();
            removeTrackRow(currentSubmission.id, true);
            btn.innerText = 'APPROVE';
            btn.disabled = false;
        });

        document.getElementById('modal-btn-decline').addEventListener('click', async () => {
            if (!currentSubmission) return;
            const message = document.getElementById('modal-track-message').value;
            
            if (!message.trim()) {
                alert('Please provide a reason for declining the track.');
                return;
            }

            const btn = document.getElementById('modal-btn-decline');
            btn.innerText = 'Declining...';
            btn.disabled = true;

            const { error } = await supabase.from('track_submissions').update({ 
                status: 'rejected'
            }).eq('id', currentSubmission.id);

            if (error) {
                alert("Error: " + error.message);
                btn.innerText = 'DECLINE';
                btn.disabled = false;
                return;
            }

            try {
                await supabase.from('notifications').insert({
                    user_id: currentSubmission.user_id,
                    title: 'Track Declined',
                    message: `Your track "${currentSubmission.title}" was declined. Reason: ${message}`,
                    type: 'error'
                });
            } catch (e) { console.warn("Could not insert notification", e); }

            closeAdminModal();
            removeTrackRow(currentSubmission.id, false);
            btn.innerText = 'DECLINE';
            btn.disabled = false;
        });

        function removeTrackRow(id, accepted) {
            const row = document.querySelector(`.track-row[data-id="${id}"]`);
            if (row) {
                row.style.transition = 'all 0.5s ease';
                row.style.background = accepted ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateStats(accepted);
                    checkEmptyState();
                }, 500);
            }
        }


        function checkEmptyState() {
            const trackList = document.querySelector('.track-list');
            if (trackList.querySelectorAll('.track-row').length === 0) {
                trackList.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 50px; color: #888; width: 100%;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        <h3 style="color: #ccc; margin-bottom: 10px;">No Pending Submissions</h3>
                        <p>When artists submit new music, it will appear here for you to review.</p>
                    </div>
                `;
            }
        }

        function updateStats(accepted) {
            const pendingEl = document.querySelectorAll('.stat-value')[0];
            const acceptedEl = document.querySelectorAll('.stat-value')[1];
            const declinedEl = document.querySelectorAll('.stat-value')[2];

            let pending = parseInt(pendingEl.innerText);
            if (pending > 0) pendingEl.innerText = pending - 1;

            if (accepted) {
                acceptedEl.innerText = parseInt(acceptedEl.innerText) + 1;
            } else {
                declinedEl.innerText = parseInt(declinedEl.innerText) + 1;
            }
        }
    
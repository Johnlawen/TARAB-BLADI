import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://ktrmgxixbycdapcmwcih.supabase.co'
const supabaseKey = 'sb_publishable_H01ibabwtUj6FLR-zie7Xw_74dDAmsP'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    const navActions = document.querySelector('.nav-actions');
    
    // Check if we are on login or signup pages to avoid overwriting their layout
    const isAuthPage = window.location.href.includes('login.html') || window.location.href.includes('signup.html');
    
    if (user) {
        // Fetch global profile data for navbar
        let globalProfile = null;
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            globalProfile = data;
        } catch(e) {}

        if (navActions && !isAuthPage) {
            let username = 'User';
            if (globalProfile && globalProfile.display_name) {
                username = globalProfile.display_name;
            } else if (user.user_metadata?.username) {
                username = user.user_metadata.username;
            }
            
            let navAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
            if (globalProfile && globalProfile.avatar_url) {
                navAvatarUrl = globalProfile.avatar_url;
            }
            
            navActions.innerHTML = `
                <div class="nav-bell-container" style="position: relative; display: flex; align-items: center; margin-right: 12px;">
                    <button class="nav-bell-btn" style="background: transparent; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; position: relative;" title="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #e2b764; border-radius: 50%;"></span>
                    </button>
                    <div class="nav-bell-dropdown" style="display: none; position: absolute; top: 100%; right: -10px; background: #111; border: 1px solid #333; border-radius: 8px; padding: 0; margin-top: 15px; width: 320px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        <div style="padding: 15px; border-bottom: 1px solid #333; font-weight: 600; font-size: 1rem; color: #fff;">Notifications</div>
                        <div style="max-height: 350px; overflow-y: auto;">
                            <!-- Notification 1 -->
                            <div style="padding: 12px 15px; border-bottom: 1px solid #222; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    <img src="https://ui-avatars.com/api/?name=DJ+Rami&background=222&color=fff" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div>
                                    <p style="margin: 0; font-size: 0.9rem; color: #ddd;"><strong style="color: #fff;">DJ Rami</strong> followed you.</p>
                                    <span style="font-size: 0.75rem; color: #888;">2 hours ago</span>
                                </div>
                            </div>
                            <!-- Notification 2 -->
                            <div style="padding: 12px 15px; border-bottom: 1px solid #222; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    <img src="https://ui-avatars.com/api/?name=Amir+Z&background=222&color=fff" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div>
                                    <p style="margin: 0; font-size: 0.9rem; color: #ddd;"><strong style="color: #fff;">Amir Z</strong> liked your track "Habibi (Remix)".</p>
                                    <span style="font-size: 0.75rem; color: #888;">5 hours ago</span>
                                </div>
                            </div>
                            <!-- Notification 3 -->
                            <div style="padding: 12px 15px; border-bottom: 1px solid #222; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e2b764" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                </div>
                                <div>
                                    <p style="margin: 0; font-size: 0.9rem; color: #ddd;"><strong style="color: #fff;">Sarah A</strong> downloaded your music.</p>
                                    <span style="font-size: 0.75rem; color: #888;">1 day ago</span>
                                </div>
                            </div>
                            <!-- Notification 4 -->
                            <div style="padding: 12px 15px; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e2b764" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                                </div>
                                <div>
                                    <p style="margin: 0; font-size: 0.9rem; color: #ddd;"><strong style="color: #fff;">Omar K</strong> uploaded a new track: "Dabke Fire Edit".</p>
                                    <span style="font-size: 0.75rem; color: #888;">2 days ago</span>
                                </div>
                            </div>
                        </div>
                        <a href="profile.html" target="_blank" style="display: block; padding: 12px; text-align: center; color: #e2b764; text-decoration: none; font-size: 0.85rem; font-weight: 600; border-top: 1px solid #333;">View All Notifications</a>
                    </div>
                </div>
                <div class="nav-user-menu-container" style="position: relative; display: flex; align-items: center;">
                    <div class="nav-user-menu" style="display: flex; align-items: center; gap: 8px; cursor: pointer;" title="Profile Menu">
                        <img src="${navAvatarUrl}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #e2b764;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="nav-dropdown" style="display: none; position: absolute; top: 100%; right: 70px; background: #111; border: 1px solid #333; border-radius: 8px; padding: 8px 0; margin-top: 15px; min-width: 150px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        <a href="profile.html" style="display: block; padding: 10px 20px; color: #fff; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">Profile</a>
                        <a href="likes.html" style="display: block; padding: 10px 20px; color: #fff; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">My Likes</a>
                        <a href="settings.html" target="_blank" style="display: block; padding: 10px 20px; color: #fff; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='transparent'">Settings</a>
                    </div>
                    <button id="logout-btn" style="background: transparent; border: none; color: #e2b764; cursor: pointer; margin-left: 16px; font-size: 0.85rem; font-weight: 600;">LOGOUT</button>
                </div>
            `;
            
            // Handle Profile and Bell Menus click
            const profileMenu = document.querySelector('.nav-user-menu');
            const navDropdown = document.querySelector('.nav-dropdown');
            const bellBtn = document.querySelector('.nav-bell-btn');
            const bellDropdown = document.querySelector('.nav-bell-dropdown');

            if (profileMenu && navDropdown && bellBtn && bellDropdown) {
                profileMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    bellDropdown.style.display = 'none'; // close bell
                    navDropdown.style.display = navDropdown.style.display === 'none' ? 'block' : 'none';
                });

                bellBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navDropdown.style.display = 'none'; // close profile
                    bellDropdown.style.display = bellDropdown.style.display === 'none' ? 'block' : 'none';
                    // Hide the notification dot when clicked
                    const dot = bellBtn.querySelector('span');
                    if (dot) dot.style.display = 'none';
                });
                
                // Close dropdowns when clicking outside
                document.addEventListener('click', (e) => {
                    if (!profileMenu.contains(e.target) && !navDropdown.contains(e.target)) {
                        navDropdown.style.display = 'none';
                    }
                    if (!bellBtn.contains(e.target) && !bellDropdown.contains(e.target)) {
                        bellDropdown.style.display = 'none';
                    }
                });
            }
            
            // Handle Logout
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            });
            
            // If we are on the profile page, clear out the dummy data and display empty state
            if (window.location.href.includes('profile.html')) {
                const urlParams = new URLSearchParams(window.location.search);
                const profileId = urlParams.get('id') || user.id;
                const isOwnProfile = profileId === user.id;

                const metadata = user.user_metadata || {};
                let fullName = 'Loading...';
                let username = 'User';
                let location = 'Location not set';
                let bioText = 'No bio added yet.';
                let avatarUrl = `https://ui-avatars.com/api/?name=User&background=111&color=e2b764`;

                if (isOwnProfile) {
                    fullName = metadata.full_name || 'New User';
                    username = metadata.username || 'User' + Math.floor(Math.random() * 1000);
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
                }

                // Fetch from profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', profileId)
                    .single();

                if (profile) {
                    if (profile.full_name) fullName = profile.full_name;
                    if (profile.display_name) username = profile.display_name;
                    if (profile.location) location = profile.location;
                    if (profile.bio) bioText = profile.bio;
                    if (profile.avatar_url) {
                        avatarUrl = profile.avatar_url;
                    } else {
                        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
                    }
                } else {
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111&color=e2b764`;
                }
                
                // Update profile text
                const coverText = document.querySelector('.sc-cover-text');
                if (coverText) coverText.innerHTML = fullName.replace(' ', '<br>');
                
                const displayName = document.querySelector('.sc-display-name');
                if (displayName) displayName.innerText = username;
                
                const realName = document.querySelector('.sc-real-name');
                if (realName) realName.innerText = fullName;

                const locationElem = document.querySelector('.sc-location');
                if (locationElem) locationElem.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${location}`;
                
                // Clear Avatar
                const avatar = document.querySelector('.sc-avatar');
                if (avatar) avatar.src = avatarUrl;
                
                // Update Cover Photo
                const coverImage = document.querySelector('.sc-cover-image');
                if (coverImage && profile && profile.cover_url) {
                    coverImage.style.backgroundImage = `url('${profile.cover_url}')`;
                    coverImage.style.backgroundSize = 'cover';
                    coverImage.style.backgroundPosition = 'center';
                }
                
                // Empty the track list
                const trackList = document.querySelector('.sc-track-list');
                if (trackList) trackList.innerHTML = '<p style="padding: 20px; color: #888;">No tracks uploaded yet.</p>';
                
                const sectionHeader = document.querySelector('.sc-section-header h2');
                if (sectionHeader) sectionHeader.innerText = 'Spotlight (0/5)';
                
                // Set followers, following, tracks to 0
                const statVals = document.querySelectorAll('.sc-stat-val');
                if (statVals.length >= 3) {
                    statVals[0].innerText = '0'; // Followers
                    statVals[1].innerText = '0'; // Following
                    statVals[2].innerText = '0'; // Tracks
                }
                
                // Empty Bio
                const bio = document.querySelector('.sc-sidebar-bio p');
                if (bio) bio.innerHTML = bioText;
                
                // Remove Social Links
                const socials = document.querySelector('.sc-sidebar-socials');
                if (socials) socials.innerHTML = '';
                
                if (isOwnProfile) {
                    const badge = document.querySelector('.sc-avatar-badge');
                    if (badge) badge.style.display = 'none';

                    const editAvatarPen = document.getElementById('edit-avatar-pen');
                    if (editAvatarPen) {
                        editAvatarPen.style.display = 'flex';
                        editAvatarPen.addEventListener('click', () => {
                            window.currentPhotoUploadType = 'avatar';
                            document.getElementById('photo-modal-title').innerText = 'Upload Profile Photo';
                            document.getElementById('upload-photo-modal').style.display = 'flex';
                        });
                    }
                    const editCoverPen = document.getElementById('edit-cover-pen');
                    if (editCoverPen) {
                        editCoverPen.style.display = 'flex';
                        editCoverPen.addEventListener('click', () => {
                            window.currentPhotoUploadType = 'cover';
                            document.getElementById('photo-modal-title').innerText = 'Upload Cover Photo';
                            document.getElementById('upload-photo-modal').style.display = 'flex';
                        });
                    }
                } else {
                    const editBtn = document.getElementById('edit-profile-btn');
                    if (editBtn) editBtn.style.display = 'none';
                    const uploadBtn = document.getElementById('upload-track-btn');
                    if (uploadBtn) uploadBtn.style.display = 'none';
                }
            }
        }
    } else {
        // User is NOT logged in
        if (navActions && !isAuthPage) {
            navActions.innerHTML = `
                <a href="login.html" class="btn-login">LOG IN</a>
                <a href="signup.html" class="btn-signup">SIGN UP</a>
            `;
        }
        
        // If they try to access profile.html while logged out, redirect to login
        if (window.location.href.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Handle Sign Up Form
const signupForm = document.querySelector('.signup-card .auth-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = signupForm.querySelector('input[type="email"]');
        const passwordInput = signupForm.querySelector('input[type="password"]');
        const fullNameInput = document.getElementById('full-name');
        const usernameInput = document.getElementById('dj-username');
        
        if (!emailInput || !passwordInput) return;
        
        // Show loading state on button
        const submitBtn = signupForm.querySelector('.btn-primary');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Signing up...';
        
        const { data, error } = await supabase.auth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
            options: {
                data: {
                    full_name: fullNameInput ? fullNameInput.value : '',
                    username: usernameInput ? usernameInput.value : ''
                }
            }
        });
        
        submitBtn.innerText = originalText;
        
        if (error) {
            alert('Signup Error: ' + error.message);
        } else {
            // Supabase by default requires email confirmation, but if disabled it logs them in
            alert('Signup successful!');
            window.location.href = 'profile.html';
        }
    });
}

// Handle Log In Form
const loginForm = document.querySelector('.auth-card .auth-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) return;
        
        // Show loading state on button
        const submitBtn = loginForm.querySelector('.btn-primary');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Logging in...';
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });
        
        submitBtn.innerText = originalText;
        
        if (error) {
            alert('Login Error: ' + error.message);
        } else {
            window.location.href = 'profile.html';
        }
    });
}

// Run check on page load
checkUser();

// ==========================================
// SUBSCRIPTION MODAL LOGIC (PLAY BUTTONS)
// ==========================================
async function handlePlayAction(e) {
    // Only intercept if we are not on login/signup page
    if (window.location.href.includes('login.html') || window.location.href.includes('signup.html')) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        e.preventDefault();
        e.stopPropagation();
        showSubscriptionModal();
    } else {
        // User is logged in, proceed with play action
        console.log('User is logged in. Playing track...');
    }
}

function showSubscriptionModal() {
    let modal = document.getElementById('subscription-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'subscription-modal';
        modal.className = 'sub-modal-container';
        modal.innerHTML = `
            <div class="sub-modal-overlay"></div>
            <div class="sub-modal-content">
                <button class="sub-modal-close">&times;</button>
                <h2>Subscribe to Listen</h2>
                <p>You need an active subscription to preview and download exclusive Arabic DJ tracks.</p>
                <div class="sub-plans">
                    <div class="sub-plan">
                        <h3>Monthly</h3>
                        <div class="sub-price">$19.99<span>/mo</span></div>
                        <ul class="sub-features">
                            <li>Unlimited Downloads</li>
                            <li>High Quality WAV & MP3</li>
                            <li>Exclusive DJ Edits</li>
                        </ul>
                        <a href="signup.html" class="btn-primary" style="display:block; text-align:center;">Choose Monthly</a>
                    </div>
                    <div class="sub-plan recommended">
                        <div class="sub-badge">BEST VALUE</div>
                        <h3>Yearly</h3>
                        <div class="sub-price">$199.99<span>/yr</span></div>
                        <ul class="sub-features">
                            <li>2 Months Free</li>
                            <li>Unlimited Downloads</li>
                            <li>High Quality WAV & MP3</li>
                            <li>Exclusive DJ Edits</li>
                        </ul>
                        <a href="signup.html" class="btn-primary" style="background:#e2b764; color:#000; display:block; text-align:center;">Choose Yearly</a>
                    </div>
                </div>
                <div class="sub-login-link">
                    Already subscribed? <a href="login.html">Log In</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.sub-modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.querySelector('.sub-modal-overlay').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    modal.style.display = 'flex';
}

function attachPlayListeners() {
    // Targets play buttons on Home page and Profile page
    const playBtns = document.querySelectorAll('.play-btn, .sc-play-circle, .hero-buttons .btn-primary');
    playBtns.forEach(btn => {
        // Prevent attaching multiple times
        if (!btn.dataset.playListenerAttached) {
            btn.addEventListener('click', handlePlayAction);
            btn.dataset.playListenerAttached = 'true';
        }
    });
}

// Attach listeners when DOM is fully loaded
// Attach listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', attachPlayListeners);
// Also attach immediately in case DOM is already loaded
attachPlayListeners();

// ==========================================
// PROFILE MODALS LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Edit Profile Modal
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    const displayNameInput = document.getElementById('edit-display-name');
                    const fullNameInput = document.getElementById('edit-full-name');
                    const locationInput = document.getElementById('edit-location');
                    const bioInput = document.getElementById('edit-bio');
                    const avatarInput = document.getElementById('edit-avatar-url');
                    const coverInput = document.getElementById('edit-cover-url');
                    
                    if (displayNameInput && profile.display_name) displayNameInput.value = profile.display_name;
                    if (fullNameInput && profile.full_name) fullNameInput.value = profile.full_name;
                    if (locationInput && profile.location) locationInput.value = profile.location;
                    if (bioInput && profile.bio) bioInput.value = profile.bio;
                    if (avatarInput && profile.avatar_url) avatarInput.value = profile.avatar_url;
                    if (coverInput && profile.cover_url) coverInput.value = profile.cover_url;
                }
            }
            editProfileModal.style.display = 'flex';
        });
        
        closeEditModal.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });

        editProfileModal.querySelector('.sub-modal-overlay').addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });

        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = editProfileForm.querySelector('.btn-primary');
            submitBtn.innerText = 'Saving...';
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const newDisplayName = document.getElementById('edit-display-name').value;
                const newFullName = document.getElementById('edit-full-name').value;
                const newLocation = document.getElementById('edit-location').value;
                const newBio = document.getElementById('edit-bio').value;

                // Update payload
                const updatePayload = {
                    display_name: newDisplayName,
                    full_name: newFullName,
                    location: newLocation,
                    bio: newBio
                };

                const { error } = await supabase
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', user.id);

                if (error) {
                    alert('Error updating profile: ' + error.message);
                } else {
                    alert('Profile updated successfully!');
                    editProfileModal.style.display = 'none';
                    window.location.reload();
                }
            }
            submitBtn.innerText = 'Save Changes';
        });
    }

    // Upload Track Modal
    const uploadTrackBtn = document.getElementById('upload-track-btn');
    const uploadTrackModal = document.getElementById('upload-track-modal');
    const closeUploadModal = document.getElementById('close-upload-modal');
    const uploadTrackForm = document.getElementById('upload-track-form');

    if (uploadTrackBtn && uploadTrackModal) {
        uploadTrackBtn.addEventListener('click', () => {
            uploadTrackModal.style.display = 'flex';
        });

        closeUploadModal.addEventListener('click', () => {
            uploadTrackModal.style.display = 'none';
        });

        uploadTrackModal.querySelector('.sub-modal-overlay').addEventListener('click', () => {
            uploadTrackModal.style.display = 'none';
        });

        uploadTrackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = uploadTrackForm.querySelector('.btn-primary');
            submitBtn.innerText = 'Uploading...';
            
            setTimeout(() => {
                alert('Track submitted for review successfully!');
                uploadTrackModal.style.display = 'none';
                submitBtn.innerText = 'Submit for Review';
                uploadTrackForm.reset();
            }, 1000);
        });
    }
    // Settings Modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const settingsForm = document.getElementById('settings-form');

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                const emailInput = settingsModal.querySelector('input[type="email"]');
                if (emailInput) emailInput.value = user.email;
            }
            settingsModal.style.display = 'flex';
        });

        closeSettingsModal.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });

        settingsModal.querySelector('.sub-modal-overlay').addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });

        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = settingsForm.querySelector('.btn-primary');
            submitBtn.innerText = 'Updating...';
            
            setTimeout(() => {
                alert('Account settings updated successfully!');
                settingsModal.style.display = 'none';
                submitBtn.innerText = 'Update Settings';
                settingsForm.reset();
            }, 800);
        });
    }
});

// Global Search Logic
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('global-search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');
    
    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchDropdown.style.display = 'none';
                return;
            }
            
            searchDropdown.innerHTML = '<div style="padding: 15px; color: #888; text-align: center;">Searching...</div>';
            searchDropdown.style.display = 'block';
            
            // Search profiles table for matching names
            const { data: profilesData, error: profilesErr } = await supabase
                .from('profiles')
                .select('*')
                .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%`)
                .limit(3);
                
            // Search tracks table (if it exists)
            let tracksData = [];
            try {
                const { data, error } = await supabase
                    .from('tracks')
                    .select('*')
                    .ilike('title', `%${query}%`)
                    .limit(3);
                if (data) tracksData = data;
            } catch (err) {
                console.log('Tracks table might not exist yet.');
            }
                
            searchDropdown.innerHTML = '';
            let hasResults = false;
            
            if (profilesData && profilesData.length > 0) {
                hasResults = true;
                const header = document.createElement('div');
                header.style = 'padding: 8px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; border-bottom: 1px solid #222; font-weight: 600;';
                header.innerText = 'Profiles';
                searchDropdown.appendChild(header);
                
                profilesData.forEach(profile => {
                    const div = document.createElement('div');
                    div.style = 'padding: 12px 15px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;';
                    div.onmouseover = () => div.style.background = '#1a1a1a';
                    div.onmouseout = () => div.style.background = 'transparent';
                    
                    const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'User')}&background=333&color=fff`;
                    div.innerHTML = `
                        <img src="${avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="color: #fff; font-weight: 600; font-size: 0.9rem;">${profile.display_name || 'User'}</div>
                            <div style="color: #888; font-size: 0.75rem;">${profile.full_name || 'Artist'}</div>
                        </div>
                    `;
                    div.onclick = () => {
                        window.location.href = `profile.html?id=${profile.id}`;
                    };
                    searchDropdown.appendChild(div);
                });
            }
            
            if (tracksData && tracksData.length > 0) {
                hasResults = true;
                const header = document.createElement('div');
                header.style = 'padding: 8px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; border-bottom: 1px solid #222; font-weight: 600;';
                header.innerText = 'Tracks';
                searchDropdown.appendChild(header);
                
                tracksData.forEach(track => {
                    const div = document.createElement('div');
                    div.style = 'padding: 12px 15px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;';
                    div.onmouseover = () => div.style.background = '#1a1a1a';
                    div.onmouseout = () => div.style.background = 'transparent';
                    
                    div.innerHTML = `
                        <div style="width: 36px; height: 36px; border-radius: 4px; background: #333; display: flex; align-items: center; justify-content: center; color: #e2b764;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        </div>
                        <div>
                            <div style="color: #fff; font-weight: 600; font-size: 0.9rem;">${track.title || 'Unknown Track'}</div>
                            <div style="color: #888; font-size: 0.75rem;">${track.artist || 'Unknown Artist'} • ${track.genre || 'Genre'}</div>
                        </div>
                    `;
                    div.onclick = () => {
                        window.location.href = `browse.html?search=${encodeURIComponent(track.title)}`;
                    };
                    searchDropdown.appendChild(div);
                });
            }
            
            if (!hasResults) {
                searchDropdown.innerHTML = '<div style="padding: 15px; color: #888; text-align: center; font-size: 0.9rem;">No profiles or tracks found</div>';
            }
        });
        
        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // Photo Upload Modal Logic
    const uploadPhotoModal = document.getElementById('upload-photo-modal');
    if (uploadPhotoModal) {
        const closeBtn = document.getElementById('close-photo-modal');
        const overlay = uploadPhotoModal.querySelector('.sub-modal-overlay');
        const dropzone = document.getElementById('photo-dropzone');
        const fileInput = document.getElementById('photo-file-input');
        const preview = document.getElementById('photo-preview');
        const saveBtn = document.getElementById('save-photo-btn');
        let selectedFileBase64 = null;

        const closeModal = () => {
            uploadPhotoModal.style.display = 'none';
            preview.style.display = 'none';
            preview.src = '';
            saveBtn.style.display = 'none';
            saveBtn.disabled = true;
            fileInput.value = '';
            selectedFileBase64 = null;
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#e2b764';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '#444';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#444';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        function handleFileSelect(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            // For prototype purposes, we will compress/resize the image using Canvas before saving to DB text column
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let maxWidth = window.currentPhotoUploadType === 'cover' ? 1200 : 400;
                    let maxHeight = window.currentPhotoUploadType === 'cover' ? 400 : 400;
                    
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    selectedFileBase64 = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality JPEG
                    
                    preview.src = selectedFileBase64;
                    preview.style.display = 'block';
                    saveBtn.style.display = 'block';
                    saveBtn.disabled = false;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        saveBtn.addEventListener('click', async () => {
            if (!selectedFileBase64) return;
            
            saveBtn.innerText = 'Saving...';
            saveBtn.disabled = true;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const updatePayload = {};
                if (window.currentPhotoUploadType === 'avatar') {
                    updatePayload.avatar_url = selectedFileBase64;
                } else if (window.currentPhotoUploadType === 'cover') {
                    updatePayload.cover_url = selectedFileBase64;
                }

                const { error } = await supabase
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', user.id);

                if (error) {
                    alert('Error saving photo: ' + error.message);
                    saveBtn.innerText = 'Save Photo';
                    saveBtn.disabled = false;
                } else {
                    window.location.reload();
                }
            }
        });
    }
});

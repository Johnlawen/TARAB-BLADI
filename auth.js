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
        // User is logged in
        if (navActions && !isAuthPage) {
            navActions.innerHTML = `
                <button class="nav-bell-btn" style="background: transparent; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; position: relative; margin-right: 12px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #e2b764; border-radius: 50%;"></span>
                </button>
                <div class="nav-user-menu" style="display: flex; align-items: center; gap: 8px; cursor: pointer;" title="Go to Profile">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #e2b764;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <button id="logout-btn" style="background: transparent; border: none; color: #e2b764; cursor: pointer; margin-left: 16px; font-size: 0.85rem; font-weight: 600;">LOGOUT</button>
            `;
            
            // Handle Profile Menu click
            const profileMenu = document.querySelector('.nav-user-menu');
            if (profileMenu) {
                profileMenu.addEventListener('click', () => {
                    window.location.href = 'profile.html';
                });
            }
            
            // Handle Logout
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            });
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
const signupForm = document.querySelector('.signup-layout .auth-form');
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

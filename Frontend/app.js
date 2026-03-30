// Function to hide all screens and show the target screen
/*function goToScreen(screenId) {
    // 1. Get all elements with the class 'screen'
    const screens = document.querySelectorAll('.screen');
    
    // 2. Remove the 'active' class from all of them (hiding them)
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 3. Add the 'active' class to the requested screen (showing it)
    document.getElementById(screenId).classList.add('active');
}

// Simulate the Splash Screen timeout
// Waits for 2.5 seconds, then automatically goes to the language screen
window.onload = () => {
    setTimeout(() => {
        goToScreen('language-screen');
    }, 2500);
};

// Function to handle role selection and redirect to the correct dashboard
function selectRole(roleName) {
    if (roleName === 'Farmer') {
        window.location.href = 'farmer/farmer_dashboard.html';
    } else if (roleName === 'Buyer') {
        window.location.href = 'buyer/buyer_dashboard.html';
    } else if (roleName === 'Equipment Owner') {
        window.location.href = 'equipment_owner/equipment_dashboard.html';
    }
}

// Secure Login Logic referencing Registration data
function handleLogin() {
    const mobile = document.getElementById('mobile-input').value.trim();
    if (!mobile || mobile.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }
    
    // Check if user is registered in our mock DB (localStorage)
    const users = JSON.parse(localStorage.getItem('kisan_registered_users')) || {};
    
    // Hardcode a demo farmer and buyer so the reviewer doesn't get completely locked out instantly
    users['9999999999'] = { name: "Demo Farmer", role: "Farmer" };
    users['8888888888'] = { name: "Demo Buyer", role: "Buyer" };

    if (!users[mobile]) {
        alert("Account not found! This mobile number is not registered.\nPlease create an account first.");
        window.location.href = 'registration.html';
        return;
    }
    
    // Store current login attempt
    localStorage.setItem('kisan_current_login', mobile);
    goToScreen('otp-screen');
}

function handleLoginOTP() {
    const mobile = localStorage.getItem('kisan_current_login');
    const users = JSON.parse(localStorage.getItem('kisan_registered_users')) || {};
    
    // Hardcode demo accounts
    users['9999999999'] = { name: "Demo Farmer", role: "Farmer" };
    users['8888888888'] = { name: "Demo Buyer", role: "Buyer" };

    const user = users[mobile];
    
    if (user) {
        // Skip the 'Who are you?' screen entirely and send them to their registered dashboard
        alert(`Welcome back, ${user.name}!\nLogging you into your ${user.role} Dashboard...`);
        if (user.role.includes('Farmer')) {
            window.location.href = 'farmer/farmer_dashboard.html';
        } else if (user.role.includes('Buyer')) {
            window.location.href = 'buyer/buyer_dashboard.html';
        } else {
            window.location.href = 'equipment_owner/equipment_dashboard.html';
        }
    } else {
        // Fallback (Should never hit this due to handleLogin checks)
        goToScreen('role-screen');
    }
}

function moveToNext(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        let next = current.nextElementSibling;
        if (next && next.tagName === 'INPUT') {
            next.focus();
        }
    }
}*/
// ─── KisanSetu | Auth Flow — Supabase Integration ───────────────────────────

import { supabase } from './supabase-config.js';

// Fast2SMS free API (Keep for mobile flow if needed later)
const FAST2SMS_KEY = 'YOUR_FAST2SMS_API_KEY'; 

// ── Screen navigation ─────────────────────────────────────────────────────────
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}
window.goToScreen = goToScreen;

// ── Splash → Language after 2.5s ─────────────────────────────────────────────
window.onload = () => {
    setTimeout(() => goToScreen('language-screen'), 2500);
};

// ── OTP Generator ─────────────────────────────────────────────────────────────
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString(); 
}

// ── Send OTP via Fast2SMS API ─────────────────────────────────────────────────
async function sendOTPviaSMS(mobile, otp) {
    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': FAST2SMS_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: mobile,
                flash: '0'
            })
        });

        const result = await response.json();
        return result.return === true ? { success: true } : { success: false, reason: result.message || 'SMS failed' };
    } catch (err) {
        console.error('Fast2SMS error:', err);
        return { success: false, reason: 'Network error' };
    }
}

function storeOTP(mobile, otp) {
    const payload = {
        otp,
        mobile,
        expiresAt: Date.now() + (5 * 60 * 1000) 
    };
    sessionStorage.setItem('kisansetu_pending_otp', JSON.stringify(payload));
}

function verifyStoredOTP(enteredOTP) {
    const raw = sessionStorage.getItem('kisansetu_pending_otp');
    if (!raw) return { valid: false, reason: 'No OTP found. Please request again.' };

    const payload = JSON.parse(raw);
    if (Date.now() > payload.expiresAt) {
        sessionStorage.removeItem('kisansetu_pending_otp');
        return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }

    if (enteredOTP.trim() !== payload.otp) return { valid: false, reason: 'Incorrect OTP. Please try again.' };
    sessionStorage.removeItem('kisansetu_pending_otp');
    return { valid: true, mobile: payload.mobile };
}

function getEnteredOTP() {
    const boxes = document.querySelectorAll('#otp-screen .otp-box');
    return Array.from(boxes).map(b => b.value).join('');
}

// ── LOGIN: Process Authentication ───────────────────────────────────────────
async function handleLogin() {
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;

    if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
    }

    const btn = document.querySelector('#login-screen .accent-btn');
    const originalText = btn.textContent;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    btn.disabled = true;

    try {
        // 1. Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;

        const user = authData.user;

        // 2. Fetch user profile from public.users table (NFR-5.3)
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (dbError) throw dbError;

        if (userData) {
            showToast(`Welcome back, ${userData.full_name}!`, 'success');
            
            // 3. Route based on role
            setTimeout(() => {
                if (userData.role === 'Farmer') {
                    window.location.href = 'farmer/farmer_dashboard.html';
                } else if (userData.role === 'Buyer') {
                    window.location.href = 'buyer/buyer_dashboard.html';
                } else if (userData.role === 'Administrator') {
                    window.location.href = 'admin/admin_dashboard.html';
                } else {
                    window.location.href = 'equipment_owner/equipment_dashboard.html';
                }
            }, 1200);
        } else {
            showToast('User profile not found in database.', 'error');
        }

    } catch (error) {
        console.error("Login Error:", error);
        showToast(error.message || 'Invalid email or password.', 'error');
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}
window.handleLogin = handleLogin;

// ── LOGIN: Verify OTP ─────────────────────────────────────────────────────────
function handleLoginOTP() {
    const enteredOTP = getEnteredOTP();
    if (enteredOTP.length < 4) {
        showToast('Please enter the complete 4-digit OTP.', 'error');
        return;
    }

    const result = verifyStoredOTP(enteredOTP);
    if (!result.valid) {
        showToast(result.reason, 'error');
        document.querySelector('.otp-inputs').style.animation = 'shake 0.3s ease';
        setTimeout(() => document.querySelector('.otp-inputs').style.animation = '', 300);
        return;
    }

    // OTP valid locally (for now) — find local user
    const users = JSON.parse(localStorage.getItem('kisan_registered_users')) || {};
    const user = users[result.mobile];

    if (user) {
        showToast(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => {
            if (user.role === 'Farmer') window.location.href = 'farmer/farmer_dashboard.html';
            else if (user.role === 'Buyer') window.location.href = 'buyer/buyer_dashboard.html';
            else if (user.role === 'Administrator') window.location.href = 'admin/admin_dashboard.html';
            else window.location.href = 'equipment_owner/equipment_dashboard.html';
        }, 1200);
    }
}

// ── Role selection (from role screen) ────────────────────────────────────────
function selectRole(roleName) {
    if (roleName === 'Farmer') window.location.href = 'farmer/farmer_dashboard.html';
    else if (roleName === 'Buyer') window.location.href = 'buyer/buyer_dashboard.html';
    else if (roleName === 'Administrator') window.location.href = 'admin/admin_dashboard.html';
    else if (roleName === 'Equipment Owner') window.location.href = 'equipment_owner/equipment_dashboard.html';
}
window.selectRole = selectRole;

// ── OTP box auto-tab ──────────────────────────────────────────────────────────
function moveToNext(current) {
    if (current.value.length >= current.maxLength) {
        const next = current.nextElementSibling;
        if (next && next.tagName === 'INPUT') next.focus();
    }
    if (current.value.length === 0) {
        const prev = current.previousElementSibling;
        if (prev && prev.tagName === 'INPUT') prev.focus();
    }
}
window.moveToNext = moveToNext;

// ── Toast utility ─────────────────────────────────────────────────────────────
function showToast(message, type) {
    const existing = document.getElementById('ks-toast');
    if (existing) existing.remove();

    const colors = { success: '#2e7d32', error: '#d32f2f', warning: '#e65100', info: '#1565c0' };
    const toast = document.createElement('div');
    toast.id = 'ks-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 28px; left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: #fff; padding: 13px 22px;
        border-radius: 25px; font-size: 0.85rem;
        font-family: 'Poppins', sans-serif; font-weight: 500;
        z-index: 9999; max-width: 88%; text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

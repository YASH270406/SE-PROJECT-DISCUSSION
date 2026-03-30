import { supabase } from '../supabase-config.js';

// Run checks as soon as the dashboard loads
document.addEventListener("DOMContentLoaded", async () => {
    loadUserProfile();
});

async function loadUserProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const greeting = document.querySelector('.greeting');
                if (greeting) greeting.innerText = `Welcome, ${profile.full_name.split(' ')[0]}`;
            }
        }
    } catch (err) {
        console.error("Profile load error:", err);
    }
}

// Simulate the Offline/Online Connectivity Monitor
function toggleSyncStatus() {
    const indicator = document.getElementById('sync-indicator');
    if (!indicator) return;

    if (indicator.classList.contains('online')) {
        indicator.classList.remove('online');
        indicator.classList.add('offline');
        indicator.innerHTML = '<span class="pulse-dot"></span> Offline';
        alert("Network lost. Operating locally.");
    } else {
        indicator.classList.remove('offline');
        indicator.classList.add('online');
        indicator.innerHTML = '<span class="pulse-dot"></span> Online';
        alert("Network restored. Syncing with Supabase Cloud...");
    }
}
window.toggleSyncStatus = toggleSyncStatus;

// Handle the Search/Filter FAB
function activateSearch() {
    const btn = document.getElementById('search-btn');
    if (!btn) return;

    btn.style.backgroundColor = "#e65100"; 
    
    setTimeout(() => {
        btn.style.backgroundColor = "var(--harvest-yellow)"; 
        const search = prompt("Search for specific produce (e.g., 'Basmati Rice'):");
        if(search) {
            window.location.href = `browse_produce.html?q=${encodeURIComponent(search)}`;
        }
    }, 200);
}
window.activateSearch = activateSearch;
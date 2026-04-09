/* ============================================
   equipment_dashboard.js  — v2
   KisanSetu — Equipment Owner Dashboard
   git merge feat/fleet

   Wired:
   • navigate() → all 4 tile page links
   • navigateToEarnings() → earnings tab
   • Live fleet stats from ks_owner_fleet
   • Live pending count from ks_booking_requests
   • Live earnings from this month's confirmed req
   • Dynamic alerts from pending booking requests
   • Dynamic activity from recent confirmed req
   • Session name/location from ks_owner_session
   ============================================ */

'use strict';

/* ══ STORAGE KEYS ══ */
const FLEET_KEY    = 'ks_owner_fleet';
const REQUESTS_KEY = 'ks_booking_requests';
const SESSION_KEY  = 'ks_owner_session';

/* ══ DEMO FLEET (fallback if manage_fleet not visited) ══ */
const DEMO_FLEET = [
    { id:'FL001', name:'Mahindra 575 DI',     emoji:'🚜', type:'Tractor',    status:'Available' },
    { id:'FL002', name:'Fieldking Seed Drill', emoji:'🌱', type:'Seed Drill', status:'Rented'    },
    { id:'FL003', name:'VST Power Tiller',    emoji:'⚙️', type:'Tiller',     status:'Maintenance'}
];

/* ══ DEMO REQUESTS (fallback if booking_requests not visited) ══ */
const DEMO_REQUESTS = [
    {
        id:'REQ001', bookingId:'BK1720000010',
        farmerName:'Ramesh Kumar', farmerVillage:'Sampla, Rohtak',
        equipId:'FL001', equipName:'Mahindra 575 DI', equipEmoji:'🚜',
        startDate:'2025-10-15', endDate:'2025-10-16',
        days:2, hoursPerDay:8, hourlyRate:150, totalCost:2400,
        status:'Pending',
        receivedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        deadline:   new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString()
    },
    {
        id:'REQ002', bookingId:'BK1720000011',
        farmerName:'Sunil Yadav', farmerVillage:'Bahadurgarh, Jhajjar',
        equipId:'FL001', equipName:'Mahindra 575 DI', equipEmoji:'🚜',
        startDate:'2025-10-18', endDate:'2025-10-18',
        days:1, hoursPerDay:4, hourlyRate:150, totalCost:600,
        status:'Pending',
        receivedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        deadline:   new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    },
    {
        id:'REQ003', bookingId:'BK1720000009',
        farmerName:'Deepak Singh', farmerVillage:'Meham, Rohtak',
        equipId:'FL002', equipName:'Fieldking Seed Drill', equipEmoji:'🌱',
        startDate:'2025-10-10', endDate:'2025-10-10',
        days:1, hoursPerDay:8, hourlyRate:100, totalCost:800,
        status:'Confirmed',
        actionedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id:'REQ004', bookingId:'BK1720000008',
        farmerName:'Ajay Hooda', farmerVillage:'Kalanaur, Rohtak',
        equipId:'FL003', equipName:'VST Power Tiller', equipEmoji:'⚙️',
        startDate:'2025-10-08', endDate:'2025-10-09',
        days:2, hoursPerDay:4, hourlyRate:80, totalCost:640,
        status:'Confirmed',
        actionedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
];

/* ══ DEFAULT SESSION ══ */
const DEFAULT_SESSION = {
    ownerName: 'Balram',
    ownerFullName: 'Balram Singh',
    location: 'Rohtak, Haryana'
};

/* ══ MONTH NAMES ══ */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
    wireSession();
    const fleet    = loadFleet();
    const requests = loadRequests();
    wireStats(fleet, requests);
    wireTiles(fleet, requests);
    wireAlerts(requests);
    wireActivity(requests);
});

/* ════════════════════════════════════════
   SESSION — wire name + location (FR-1.5)
════════════════════════════════════════ */
function wireSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') || DEFAULT_SESSION;

    const now  = new Date();
    const hour = now.getHours();
    const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    document.getElementById('ownerGreeting').textContent =
        `${greet}, ${session.ownerName}`;
    document.getElementById('ownerLocation').textContent = session.location;
}

/* ════════════════════════════════════════
   LOAD DATA
════════════════════════════════════════ */
function loadFleet() {
    const saved = localStorage.getItem(FLEET_KEY);
    return saved ? JSON.parse(saved) : DEMO_FLEET;
}

function loadRequests() {
    const saved = localStorage.getItem(REQUESTS_KEY);
    return saved ? JSON.parse(saved) : DEMO_REQUESTS;
}

/* ════════════════════════════════════════
   STATS STRIP — live counts
════════════════════════════════════════ */
function wireStats(fleet, requests) {
    // Fleet counts
    document.getElementById('qsAvail').textContent  = fleet.filter(a => a.status === 'Available').length;
    document.getElementById('qsRented').textContent = fleet.filter(a => a.status === 'Rented').length;
    document.getElementById('qsMaint').textContent  = fleet.filter(a => a.status === 'Maintenance').length;

    // Pending requests
    const pending = requests.filter(r => r.status === 'Pending').length;
    document.getElementById('qsPending').textContent = pending;

    // Show notification dot if any pending
    if (pending > 0) {
        document.getElementById('notifDot').style.display = 'block';
    }

    // Earnings this month (confirmed)
    const now = new Date();
    const monthEarnings = requests
        .filter(r => {
            if (r.status !== 'Confirmed') return false;
            const d = new Date(r.startDate);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, r) => sum + r.totalCost, 0);

    const monthRentals = requests.filter(r => {
        if (r.status !== 'Confirmed') return false;
        const d = new Date(r.startDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    const rentedAssets = new Set(
        fleet.filter(a => a.status === 'Rented').map(a => a.id)
    ).size;

    document.getElementById('dashEarnings').textContent =
        `₹ ${monthEarnings.toLocaleString('en-IN')}`;
    document.getElementById('dashRentals').innerHTML =
        `<i class="fa-solid fa-tractor"></i> ${monthRentals} rental${monthRentals !== 1 ? 's' : ''}`;
    document.getElementById('dashAssets').innerHTML =
        `<i class="fa-solid fa-layer-group"></i> ${rentedAssets} asset${rentedAssets !== 1 ? 's' : ''} rented`;
}

/* ════════════════════════════════════════
   TILE COUNTS — shown under each tile label
════════════════════════════════════════ */
function wireTiles(fleet, requests) {
    // Manage Fleet → total assets count
    document.getElementById('tileFleetCount').textContent =
        fleet.length > 0 ? `${fleet.length} asset${fleet.length !== 1 ? 's' : ''} in fleet` : '';

    // Booking Requests → pending count (urgent)
    const pending = requests.filter(r => r.status === 'Pending').length;
    const urgentCount = requests.filter(r => {
        if (r.status !== 'Pending') return false;
        return (new Date(r.deadline) - Date.now()) < 6 * 60 * 60 * 1000;
    }).length;

    if (pending > 0) {
        document.getElementById('tileBookingCount').textContent =
            urgentCount > 0
                ? `${pending} pending · ${urgentCount} urgent ⚠️`
                : `${pending} request${pending !== 1 ? 's' : ''} waiting`;
    }

    // Rental Calendar → booked days this month
    const now = new Date();
    const bookedThisMonth = requests.filter(r => {
        if (r.status !== 'Confirmed') return false;
        const d = new Date(r.startDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce((sum, r) => sum + r.days, 0);

    document.getElementById('tileCalCount').textContent =
        bookedThisMonth > 0
            ? `${bookedThisMonth} day${bookedThisMonth !== 1 ? 's' : ''} booked this month`
            : 'View availability';

    // Earnings Report → total this month
    const monthEarnings = requests
        .filter(r => {
            if (r.status !== 'Confirmed') return false;
            const d = new Date(r.startDate);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, r) => sum + r.totalCost, 0);

    document.getElementById('tileEarnCount').textContent =
        monthEarnings > 0
            ? `₹${monthEarnings.toLocaleString('en-IN')} this month`
            : `${MONTHS_FULL[now.getMonth()]} report`;
}

/* ════════════════════════════════════════
   ALERTS — dynamic from pending requests
════════════════════════════════════════ */
function wireAlerts(requests) {
    const alertsList = document.getElementById('alertsList');
    const pending    = requests.filter(r => r.status === 'Pending');

    if (pending.length === 0) {
        alertsList.innerHTML = `
            <div class="no-alerts">
                <i class="fa-solid fa-circle-check" style="color:var(--primary-green);font-size:1.4rem;margin-bottom:6px;display:block"></i>
                All booking requests have been reviewed. No pending actions.
            </div>`;
        return;
    }

    // Sort: most urgent (soonest deadline) first
    const sorted = [...pending].sort((a,b) =>
        new Date(a.deadline) - new Date(b.deadline)
    );

    alertsList.innerHTML = sorted.map((req, i) => {
        const msLeft    = new Date(req.deadline) - Date.now();
        const hoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
        const isUrgent  = hoursLeft < 6;
        const timeStr   = hoursLeft > 0 ? `${hoursLeft}h left` : 'Expired';
        const cls       = isUrgent ? 'danger' : 'warning';
        const icon      = isUrgent ? 'fa-triangle-exclamation' : 'fa-bell';

        return `
        <div class="alert-item ${cls}" style="animation-delay:${i * 0.08}s"
             onclick="navigate('booking_requests.html')">
            <i class="alert-icon fa-solid ${icon}"></i>
            <div class="alert-text">
                <h4>${isUrgent ? '⚠️ Urgent: ' : ''}New Booking Request</h4>
                <p>${req.equipEmoji} ${req.equipName} · ${req.farmerName} · ${formatDate(req.startDate)}
                   ${req.days > 1 ? '→ ' + formatDate(req.endDate) : ''} · ₹${req.totalCost.toLocaleString('en-IN')}</p>
            </div>
            <span class="alert-time">${timeStr}</span>
        </div>`;
    }).join('');

    // Show at most 3 on dashboard
    const allAlerts = alertsList.querySelectorAll('.alert-item');
    allAlerts.forEach((el, i) => {
        if (i >= 3) el.style.display = 'none';
    });
}

/* ════════════════════════════════════════
   RECENT ACTIVITY — from confirmed/returned
════════════════════════════════════════ */
function wireActivity(requests) {
    const actList = document.getElementById('activityList');

    const recent = [...requests]
        .filter(r => r.status === 'Confirmed' || r.status === 'Cancelled')
        .sort((a,b) => new Date(b.actionedAt || b.startDate) - new Date(a.actionedAt || a.startDate))
        .slice(0, 4);

    if (recent.length === 0) {
        actList.innerHTML = `<p style="font-size:0.78rem;color:var(--charcoal-lt);text-align:center;padding:16px 0">No recent activity yet.</p>`;
        return;
    }

    actList.innerHTML = recent.map((r, i) => {
        const isConfirmed = r.status === 'Confirmed';
        return `
        <div class="activity-item" style="animation-delay:${i * 0.07}s"
             onclick="navigate('booking_requests.html')">
            <div class="activity-emoji">${r.equipEmoji || '🚜'}</div>
            <div class="activity-info">
                <div class="activity-title">${r.farmerName} · ${r.equipName}</div>
                <div class="activity-sub">
                    ${formatDate(r.startDate)}${r.days > 1 ? ' → ' + formatDate(r.endDate) : ''}
                    &nbsp;·&nbsp;
                    <span style="color:${isConfirmed ? 'var(--primary-green)' : 'var(--danger-red)'}">
                        ${isConfirmed ? '✓ Confirmed' : '✕ Cancelled'}
                    </span>
                </div>
            </div>
            ${isConfirmed
              ? `<div class="activity-amt">+₹${r.totalCost.toLocaleString('en-IN')}</div>`
              : `<div class="activity-amt" style="color:var(--danger-red)">—</div>`
            }
        </div>`;
    }).join('');
}

/* ════════════════════════════════════════
   NAVIGATION — tile links (git wire commit)
   Manage Fleet     → manage_fleet.html
   Booking Requests → booking_requests.html
   Rental Calendar  → rental_calendar_earnings.html
   Earnings Report  → rental_calendar_earnings.html
════════════════════════════════════════ */
function navigate(page) {
    // Animate briefly then navigate
    showDashToast('info', 'Opening…', page.replace('.html','').replace(/_/g,' '));
    setTimeout(() => { window.location.href = page; }, 300);
}

function navigateToEarnings() {
    // Navigate to combined page and trigger earnings tab via hash
    showDashToast('info', 'Opening…', 'Earnings Report');
    setTimeout(() => {
        window.location.href = 'rental_calendar_earnings.html#earnings';
    }, 300);
}

/* ════════════════════════════════════════
   SYNC TOGGLE
════════════════════════════════════════ */
function toggleSyncStatus() {
    const indicator = document.getElementById('sync-indicator');
    const label     = document.getElementById('sync-label');
    const isOnline  = indicator.classList.contains('online');

    indicator.classList.toggle('online',  !isOnline);
    indicator.classList.toggle('offline',  isOnline);
    label.textContent = isOnline ? 'Offline' : 'Online';

    if (isOnline) {
        showDashToast('warning', 'Offline Mode',
            'Booking approvals queued. Syncs when reconnected.');
    } else {
        showDashToast('success', 'Back Online',
            'Syncing fleet data and notifications…');
    }
}

/* ════════════════════════════════════════
   SCROLL TO ALERTS
════════════════════════════════════════ */
function scrollToAlerts() {
    document.getElementById('alertsSection').scrollIntoView({
        behavior: 'smooth', block: 'start'
    });
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function formatDate(d) {
    if (!d) return '—';
    const [,m,day] = d.split('-');
    return `${day} ${MONTHS[parseInt(m,10)-1]}`;
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function showDashToast(type, title, msg) {
    const toast  = document.getElementById('dashToast');
    const icons  = { success:'✅', warning:'⚠️', error:'❌', info:'🔗' };
    const colors = { success:'#2e7d32', warning:'#f57f17', error:'#d32f2f', info:'#455a64' };

    document.getElementById('dashToastIcon').textContent  = icons[type]  || '✅';
    document.getElementById('dashToastTitle').textContent = title;
    document.getElementById('dashToastMsg').textContent   = msg;
    toast.style.borderLeftColor = colors[type] || '#2e7d32';

    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ════════════════════════════════════════
   HASH ROUTING — support #earnings deep link
════════════════════════════════════════ */
if (window.location.hash === '#earnings') {
    // If somehow landing back on dashboard with hash, ignore
    window.location.hash = '';
}

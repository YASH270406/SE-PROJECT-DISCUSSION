import { supabase } from '../supabase-config.js';

let LIVE_LISTINGS = [];

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    populateStateDropdown();
    await fetchLiveListings();

    // Attach event listeners for real-time filtering
    const cropFilter = document.getElementById('crop-filter');
    const stateFilter = document.getElementById('state-filter');
    const priceFilter = document.getElementById('price-filter');

    if (cropFilter) cropFilter.addEventListener('change', filterListings);
    if (stateFilter) stateFilter.addEventListener('change', filterListings);
    if (priceFilter) priceFilter.addEventListener('input', filterListings);
});

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
    };
}

async function fetchLiveListings() {
    try {
        const response = await fetch('/api/produce/list');
        const result = await response.json();
        if (result.success) {
            LIVE_LISTINGS = result.data;
            renderListings(LIVE_LISTINGS);
        }
    } catch (err) {
        console.error("Failed to load listings:", err);
        if (typeof showToast === 'function') showToast('Error connecting to marketplace.', 'error');
    }
}

function populateStateDropdown() {
    const stateSelect = document.getElementById('state-filter');
    if (!stateSelect) return;

    if (typeof window.INDIA_STATES !== 'undefined') {
        const sortedStates = Object.keys(window.INDIA_STATES).sort();
        sortedStates.forEach(state => {
            stateSelect.innerHTML += `<option value="${state}">${state}</option>`;
        });
    }
}

function renderListings(data) {
    const container = document.getElementById('listings-container');
    if (!container) return;
    container.innerHTML = ''; 

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:#757575; padding:40px;">No produce found matching your filters.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="crop-name">${item.crop_name}</h3>
                    <span class="crop-variety">${item.variety || 'General'}</span>
                </div>
                <div class="price">₹${item.expected_price.toLocaleString('en-IN')} <small style="font-size:0.7rem; color:#666;">/ kg</small></div>
            </div>
            <div class="card-body">
                <p><strong>Location:</strong> <span>${item.location || 'Verified Farm'}</span></p>
                <p><strong>Available Qty:</strong> <span>${item.quantity_kg} kg</span></p>
                <p><strong>Harvest Date:</strong> <span>${item.harvest_date || 'Ready'}</span></p>
            </div>
            <div class="card-actions">
                <button class="btn btn-buy" onclick="window.buyNow('${item.id}')"><i class="fa-solid fa-cart-shopping"></i> Buy Now</button>
                <button class="btn btn-offer" onclick="window.toggleOfferInput('${item.id}')"><i class="fa-solid fa-handshake"></i> Make Offer</button>
            </div>
            
            <div class="offer-form" id="offer-form-${item.id}">
                <input type="number" id="offer-price-${item.id}" placeholder="Your price per kg (₹)" min="1">
                <button class="btn-submit-offer" onclick="window.submitOffer('${item.id}')">Send</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterListings() {
    const cropSearch = document.getElementById('crop-filter').value;
    const stateSearch = document.getElementById('state-filter').value;
    const maxPrice = parseFloat(document.getElementById('price-filter').value);

    const filtered = LIVE_LISTINGS.filter(item => {
        const matchCrop = cropSearch === '' || item.crop_name === cropSearch;
        const matchState = stateSearch === '' || (item.location && item.location.includes(stateSearch));
        const matchPrice = isNaN(maxPrice) || item.expected_price <= maxPrice;

        return matchCrop && matchState && matchPrice;
    });

    renderListings(filtered);
}

// 5. Transaction Actions (Updated for Supabase/Backend)

async function buyNow(listingId) {
    const item = LIVE_LISTINGS.find(l => l.id === listingId);
    if (!item) return;

    try {
        const headers = await getAuthHeaders();
        // Simulate purchase flow
        if (typeof showToast === 'function') showToast('Order request sent! Awaiting payment gateway.', 'success');
        
        // Refresh listings 
        await fetchLiveListings();
    } catch (err) {
        if (typeof showToast === 'function') showToast('Purchase failed.', 'error');
    }
}
window.buyNow = buyNow;

function toggleOfferInput(listingId) {
    const form = document.getElementById(`offer-form-${listingId}`);
    if (form) {
        form.classList.toggle('active');
        if (form.classList.contains('active')) {
            const input = document.getElementById(`offer-price-${listingId}`);
            if (input) input.focus();
        }
    }
}
window.toggleOfferInput = toggleOfferInput;

async function submitOffer(listingId) {
    const item = LIVE_LISTINGS.find(l => l.id === listingId);
    if (!item) return;

    const offerInput = document.getElementById(`offer-price-${listingId}`);
    const offerPrice = parseFloat(offerInput.value);

    if (isNaN(offerPrice) || offerPrice <= 0) {
        if (typeof showToast === 'function') showToast('Please enter a valid amount.', 'error');
        return;
    }

    try {
        const headers = await getAuthHeaders();
        // Send to backend bid endpoint (Simulated for Now)
        if (typeof showToast === 'function') showToast('Offer submitted to farmer!', 'success');
        toggleOfferInput(listingId);
    } catch (err) {
        if (typeof showToast === 'function') showToast('Failed to send offer.', 'error');
    }
}
window.submitOffer = submitOffer;
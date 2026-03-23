// mock listings data
const mockListings = [
    { id: 101, farmerName: 'Ramesh Kumar', state: 'Madhya Pradesh', district: 'Sehore', crop: 'Wheat', qty: 120, unit: 'Quintal', price: 2350, harvestDate: '2026-03-25' },
    { id: 102, farmerName: 'Suresh Patil', state: 'Maharashtra', district: 'Nashik', crop: 'Onion', qty: 50, unit: 'Quintal', price: 1800, harvestDate: '2026-03-22' },
    { id: 103, farmerName: 'Amit Singh', state: 'Uttar Pradesh', district: 'Agra', crop: 'Potato', qty: 200, unit: 'Quintal', price: 950, harvestDate: '2026-03-20' },
    { id: 104, farmerName: 'Jagdish Reddy', state: 'Telangana', district: 'Medak', crop: 'Rice', qty: 80, unit: 'Quintal', price: 2800, harvestDate: '2026-03-28' },
    { id: 105, farmerName: 'Gurpreet Singh', state: 'Punjab', district: 'Ludhiana', crop: 'Wheat', qty: 300, unit: 'Quintal', price: 2400, harvestDate: '2026-04-05' },
    { id: 106, farmerName: 'Mohan Das', state: 'Gujarat', district: 'Surat', crop: 'Tomato', qty: 30, unit: 'Quintal', price: 1400, harvestDate: '2026-03-21' },
    { id: 107, farmerName: 'Kishore Kumar', state: 'Madhya Pradesh', district: 'Vidisha', crop: 'Soyabean', qty: 60, unit: 'Quintal', price: 4200, harvestDate: '2026-04-10' },
    { id: 108, farmerName: 'Vikram Singh', state: 'Haryana', district: 'Karnal', crop: 'Cauliflower', qty: 20, unit: 'Quintal', price: 1100, harvestDate: '2026-03-19' }
];

// On load
window.onload = () => {
    populateStateDropdown();
    filterListings();
};

function populateStateDropdown() {
    const stateFilter = document.getElementById('filter-state');
    if (typeof INDIA_STATES !== 'undefined') {
        const sortedStates = Object.keys(INDIA_STATES).sort();
        sortedStates.forEach(state => {
            const opt = document.createElement('option');
            opt.value = state;
            opt.textContent = state;
            stateFilter.appendChild(opt);
        });
    }
}

function filterListings() {
    const cropSearch = document.getElementById('filter-crop').value.toLowerCase();
    const stateSearch = document.getElementById('filter-state').value;
    const priceSearch = document.getElementById('filter-price').value;

    const filtered = mockListings.filter(item => {
        const matchCrop = cropSearch === '' || item.crop.toLowerCase().includes(cropSearch);
        const matchState = stateSearch === '' || item.state === stateSearch;
        const matchPrice = priceSearch === '' || item.price <= parseFloat(priceSearch);
        return matchCrop && matchState && matchPrice;
    });

    renderListings(filtered);
}

function renderListings(data) {
    const container = document.getElementById('listings-container');
    container.innerHTML = ''; // Clear hardcoded HTML

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-basket-shopping"></i>
                <h3>No listings found</h3>
                <p style="color:#888; margin-top:10px;">Try expanding your search criteria.</p>
            </div>`;
// buyer/browse_produce.js

// 1. Mock Listings Data (6-8 items as requested)
const mockListings = [
    { id: 'LST-101', farmerId: 'F-001', farmer: 'Ramesh Kumar', crop: 'Wheat', variety: 'Sharbati', price: 2800, qty: 50, unit: 'Quintal', state: 'Madhya Pradesh', district: 'Sehore', date: '2026-03-10' },
    { id: 'LST-102', farmerId: 'F-002', farmer: 'Suresh Patil', crop: 'Tomato', variety: 'Hybrid', price: 1500, qty: 20, unit: 'Quintal', state: 'Maharashtra', district: 'Pune', date: '2026-03-18' },
    { id: 'LST-103', farmerId: 'F-003', farmer: 'Amit Singh', crop: 'Potato', variety: 'Kufri', price: 1100, qty: 100, unit: 'Quintal', state: 'Uttar Pradesh', district: 'Agra', date: '2026-03-15' },
    { id: 'LST-104', farmerId: 'F-004', farmer: 'Priya Sharma', crop: 'Rice', variety: 'Basmati', price: 6500, qty: 30, unit: 'Quintal', state: 'Haryana', district: 'Karnal', date: '2026-02-28' },
    { id: 'LST-105', farmerId: 'F-005', farmer: 'Kisan Das', crop: 'Tomato', variety: 'Desi', price: 1800, qty: 15, unit: 'Quintal', state: 'Gujarat', district: 'Anand', date: '2026-03-19' },
    { id: 'LST-106', farmerId: 'F-006', farmer: 'Manoj Tiwari', crop: 'Wheat', variety: 'Lok-1', price: 2500, qty: 80, unit: 'Quintal', state: 'Punjab', district: 'Amritsar', date: '2026-03-05' },
    { id: 'LST-107', farmerId: 'F-007', farmer: 'Laxmi Devi', crop: 'Onion', variety: 'Red', price: 1900, qty: 40, unit: 'Quintal', state: 'Maharashtra', district: 'Nashik', date: '2026-03-20' }
];

window.onload = () => {
    populateStateDropdown();
    renderListings(mockListings); // Initial render

    // Attach event listeners for real-time filtering
    document.getElementById('crop-filter').addEventListener('change', filterListings);
    document.getElementById('state-filter').addEventListener('change', filterListings);
    document.getElementById('price-filter').addEventListener('input', filterListings);
};

// 2. Populate Dropdown from Shared states_data.js
function populateStateDropdown() {
    const stateSelect = document.getElementById('state-filter');
    if (typeof INDIA_STATES !== 'undefined') {
        const sortedStates = Object.keys(INDIA_STATES).sort();
        sortedStates.forEach(state => {
            stateSelect.innerHTML += `<option value="${state}">${state}</option>`;
        });
    }
}

// 3. Render Cards
function renderListings(data) {
    const container = document.getElementById('listings-container');
    container.innerHTML = ''; // Clears the static HTML example

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:#757575; padding:40px;">No produce found matching your filters.</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'listing-card';
        div.innerHTML = `
            <div class="card-header">
                <div class="farmer-info">
                    <div class="farmer-avatar"><i class="fa-solid fa-user-check"></i></div>
                    <div>
                        <div class="farmer-name">${item.farmerName}</div>
                        <div class="farmer-location"><i class="fa-solid fa-location-dot"></i> ${item.district}, ${item.state}</div>
                    </div>
                </div>
                <div class="crop-badge">${item.crop}</div>
            </div>

            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Quantity Available</span>
                    <span class="detail-value">${item.qty} ${item.unit}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Base Price</span>
                    <span class="detail-value price">₹${item.price.toLocaleString('en-IN')} / ${item.unit}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Est. Harvest Date</span>
                    <span class="detail-value">${new Date(item.harvestDate).toLocaleDateString('en-GB')}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn-buy" onclick="buyNow(${item.id})">
                    <i class="fa-solid fa-cart-shopping"></i> Buy Now
                </button>
                <button class="btn-offer" onclick="toggleOfferForm(${item.id})">
                    <i class="fa-solid fa-handshake"></i> Make Offer
                </button>
            </div>

            <div class="offer-form" id="offer-form-${item.id}">
                <label>Your Counter Offer (₹ per ${item.unit})</label>
                <div class="offer-input-row">
                    <input type="number" id="offer-input-${item.id}" placeholder="e.g. ${item.price - 100}">
                    <button onclick="makeOffer(${item.id})">Send</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function buyNow(listingId) {
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing) return;

    // Save to local storage mock logic
    const orders = JSON.parse(localStorage.getItem('buyer_orders') || '[]');
    orders.push({ ...listing, orderDate: new Date().toISOString(), status: 'Placed' });
    localStorage.setItem('buyer_orders', JSON.stringify(orders));

    showToast(`Order placed successfully for ${listing.qty} ${listing.unit} of ${listing.crop}!`);
}

function toggleOfferForm(listingId) {
    const form = document.getElementById(`offer-form-${listingId}`);
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

function makeOffer(listingId) {
    const input = document.getElementById(`offer-input-${listingId}`);
    const offerPrice = parseInt(input.value);
    
    if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
        showToast("Please enter a valid offer amount.");
        return;
    }

    const listing = mockListings.find(l => l.id === listingId);
    
    // Save bid to local storage mock logic
    const bids = JSON.parse(localStorage.getItem('buyer_bids') || '[]');
    bids.push({
        listingId,
        farmerName: listing.farmerName,
        crop: listing.crop,
        originalPrice: listing.price,
        offerPrice: offerPrice,
        bidDate: new Date().toISOString(),
        status: 'Pending'
    });
    localStorage.setItem('buyer_bids', JSON.stringify(bids));

    input.value = '';
    toggleOfferForm(listingId);
    showToast(`Offer of ₹${offerPrice} sent to ${listing.farmerName}.`);
}
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="crop-name">${item.crop}</h3>
                    <span class="crop-variety">${item.variety}</span>
                </div>
                <div class="price">₹${item.price.toLocaleString('en-IN')} <small style="font-size:0.7rem; color:#666;">/ ${item.unit}</small></div>
            </div>
            <div class="card-body">
                <p><strong>Farmer:</strong> <span>${item.farmer}</span></p>
                <p><strong>Location:</strong> <span>${item.district}, ${item.state}</span></p>
                <p><strong>Available Qty:</strong> <span>${item.qty} ${item.unit}</span></p>
                <p><strong>Harvest Date:</strong> <span>${item.date}</span></p>
            </div>
            <div class="card-actions">
                <button class="btn btn-buy" onclick="buyNow('${item.id}')"><i class="fa-solid fa-cart-shopping"></i> Buy Now</button>
                <button class="btn btn-offer" onclick="toggleOfferInput('${item.id}')"><i class="fa-solid fa-handshake"></i> Make Offer</button>
            </div>
            
            <div class="offer-form" id="offer-form-${item.id}">
                <input type="number" id="offer-price-${item.id}" placeholder="Your price per ${item.unit} (₹)" min="1">
                <button class="btn-submit-offer" onclick="submitOffer('${item.id}')">Send Offer</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. Filter Logic
function filterListings() {
    const cropSearch = document.getElementById('crop-filter').value;
    const stateSearch = document.getElementById('state-filter').value;
    const maxPrice = parseFloat(document.getElementById('price-filter').value);

    const filtered = mockListings.filter(item => {
        const matchCrop = cropSearch === '' || item.crop === cropSearch;
        const matchState = stateSearch === '' || item.state === stateSearch;
        const matchPrice = isNaN(maxPrice) || item.price <= maxPrice;

        return matchCrop && matchState && matchPrice;
    });

    renderListings(filtered);
}

// 5. Transaction Actions (Writes to LocalStorage for later cross-checking)
function buyNow(listingId) {
    const item = mockListings.find(l => l.id === listingId);

    // Create standard Order Object
    const order = {
        orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        listingId: item.id,
        farmerId: item.farmerId,
        farmerName: item.farmer,
        crop: item.crop,
        price: item.price,
        qty: item.qty,
        totalAmount: item.price * item.qty,
        status: 'Placed', // Initial status for track_orders.js
        date: new Date().toISOString()
    };

    // Save to key: kisansetu_orders
    let orders = JSON.parse(localStorage.getItem('kisansetu_orders')) || [];
    orders.push(order);
    localStorage.setItem('kisansetu_orders', JSON.stringify(orders));

    showInlineToast('Order placed successfully! Check Track Orders.', 'success');
}

function toggleOfferInput(listingId) {
    const form = document.getElementById(`offer-form-${listingId}`);
    form.classList.toggle('active');
    if (form.classList.contains('active')) {
        document.getElementById(`offer-price-${listingId}`).focus();
    }
}

function submitOffer(listingId) {
    const item = mockListings.find(l => l.id === listingId);
    const offerInput = document.getElementById(`offer-price-${listingId}`);
    const offerPrice = parseFloat(offerInput.value);

    if (isNaN(offerPrice) || offerPrice <= 0) {
        showInlineToast('Please enter a valid amount.', 'error');
        return;
    }

    // Create Bid Object mapping to Farmer's bid_inbox.js expectations
    const bid = {
        bidId: 'BID-' + Math.floor(1000 + Math.random() * 9000),
        listingId: item.id,
        buyerName: 'Current Buyer User', // Hardcoded mock logged-in user
        buyerInitials: 'CB',
        crop: item.crop,
        farmer: item.farmer,
        qty: item.qty,
        unit: item.unit,
        askingPrice: item.price,
        offeredPrice: offerPrice,
        status: 'Pending',
        timeAgo: 'Just now',
        date: new Date().toISOString()
    };

    // Save to key: kisansetu_bids
    let bids = JSON.parse(localStorage.getItem('kisansetu_bids')) || [];
    bids.push(bid);
    localStorage.setItem('kisansetu_bids', JSON.stringify(bids));

    showInlineToast('Offer submitted to farmer!', 'success');
    toggleOfferInput(listingId); // Hide input after success
    offerInput.value = ''; // Reset input
}

// 6. Temporary Inline Toast (Will be replaced by shared/toast.js in Commit 13)
function showInlineToast(message, type = 'info') {
    const existing = document.getElementById('temp-toast');
    if (existing) existing.remove();

    const colors = { success: '#2e7d32', error: '#d32f2f', info: '#1565c0' };

    const toast = document.createElement('div');
    toast.id = 'temp-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${colors[type] || colors.info}; color: white;
        padding: 12px 24px; border-radius: 8px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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

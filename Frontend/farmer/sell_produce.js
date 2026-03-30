import { supabase, uploadFile } from '../supabase-config.js';

let selectedFiles = []; // Store selected files

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Image file preview on upload
    const fileInput = document.getElementById('cropImage');
    const uploadBox = document.querySelector('.file-upload-box');

    if (fileInput && uploadBox) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                selectedFiles = files; // Store files for later upload
                
                const file = files[0];
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadBox.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 120px; border-radius: 8px; object-fit: cover;">`;
                    uploadBox.style.padding = "10px"; 
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. Form submission intercept
    const form = document.getElementById('produce-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const harvestDateInput = document.getElementById('harvestDate').value;
            const harvestDate = new Date(harvestDateInput);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

            if (harvestDate < today) {
                alert("Harvest date cannot be in the past!");
                return;
            }

            const produceData = {
                crop: document.getElementById('cropName').value,
                variety: document.getElementById('variety').value,
                quantity: document.getElementById('quantity').value,
                unit: document.getElementById('unit').value,
                price: document.getElementById('price').value,
                harvestDate: harvestDateInput
            };

            // Check connection status
            if (navigator.onLine) {
                sendLiveToDatabase(produceData); 
            } else {
                saveToOfflineQueue(produceData); 
            }
        });
    }
});

// Helper to get Auth Token
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
    };
}

function saveToOfflineQueue(data) {
    let queue = JSON.parse(localStorage.getItem('kisanSetuOfflineQueue')) || [];
    queue.push(data); // Note: Offline images are not handled in this basic version
    localStorage.setItem('kisanSetuOfflineQueue', JSON.stringify(queue));
    
    alert(`Listing saved offline. It will publish automatically when internet is restored.`);
    window.location.href = 'farmer_dashboard.html';
}

window.addEventListener('online', async function() {
    let queue = JSON.parse(localStorage.getItem('kisanSetuOfflineQueue')) || [];
    if (queue.length > 0) {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/produce/sync', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ items: queue }) 
            });

            if (response.ok) {
                localStorage.removeItem('kisanSetuOfflineQueue');
                alert("Offline listings published successfully!");
            }
        } catch (error) {
            console.error("Background sync failed:", error);
        }
    }
});

async function sendLiveToDatabase(data) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Processing Assets...";
    submitBtn.disabled = true;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Please log in first.");

        // 1. Upload Images to Supabase Storage
        let imageUrls = [];
        if (selectedFiles.length > 0) {
            submitBtn.innerText = "Uploading Photos...";
            for (const file of selectedFiles) {
                const url = await uploadFile(file, 'produce-images', session.user.id);
                imageUrls.push(url);
            }
        }

        // Add images to the payload
        data.images = imageUrls;

        const headers = await getAuthHeaders();
        submitBtn.innerText = "Publishing Listing...";
        const response = await fetch('/api/produce/add', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error("Please log in again.");
            throw new Error("Upload failed");
        }
        
        alert(`Success! Your crop has been published with ${imageUrls.length} photos.`);
        window.location.href = 'farmer_dashboard.html';
        
    } catch (error) {
        console.error("Error:", error);
        alert(error.message || "Failed to reach server.");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}
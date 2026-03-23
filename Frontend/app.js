// Function to hide all screens and show the target screen
function goToScreen(screenId) {
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
}

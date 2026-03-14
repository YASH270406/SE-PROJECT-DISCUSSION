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

// Function to handle role selection
function selectRole(roleName) {
    // In a real app, this would save the role to a database or local storage
    alert(`You selected the ${roleName} role! Redirecting to the ${roleName} Dashboard...`);
    
    // Here you would redirect them to their specific dashboard based on the SRS requirements.
    // window.location.href = 'farmer_dashboard.html'; 
}

// Quality of Life Feature: Auto-tabbing for OTP inputs
const otpBoxes = document.querySelectorAll('.otp-box');
otpBoxes.forEach((box, index) => {
    box.addEventListener('keyup', (e) => {
        if (e.target.value.length === 1 && index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus(); // Move to next box
        } else if (e.key === 'Backspace' && index > 0) {
            otpBoxes[index - 1].focus(); // Move to previous box on delete
        }
    });
});
let level;
let currentLevel;
let completedLevel = 0; // Track the highest completed level as an integer

document.addEventListener("DOMContentLoaded", () => {


    // localStorage.removeItem('completedLevel');

        // Get the highest completed level from local storage
    const storedCompletedLevel = JSON.parse(localStorage.getItem('completedLevel'));
    
    if (storedCompletedLevel !== null) {
        completedLevel = storedCompletedLevel;
        console.log("Retrieved completed level:", completedLevel);

    } else {
        console.log("No completed level found.");
    }

    // Call updateLevelDisplay initially
    updateLevelDisplay();
});




// Function to retrieve the level from the URL
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get level from  URL
level = parseInt(getParameterByName('level'), 10);
console.log("Level set to:", level);


if (isNaN(level) && !window.location.pathname.includes('home.html')) {
    window.location.href = 'home.html';
}

function setLevel(selectedLevel) {
    // Check if the selected level is allowed
    if (selectedLevel <= completedLevel + 1) {
        window.location.href = `index.html?level=${selectedLevel}`;
    } else {
        alert("You must complete the previous level first!");
    }
}

// Function to mark a level as completed
function completeLevel(level) {
    if (level > completedLevel) {
        completedLevel = level;
        localStorage.setItem('completedLevel', JSON.stringify(completedLevel)); // Store updated level in local storage
        console.log(`Level ${level} completed!`);
        updateLevelDisplay(); 
    }
}

// Update the level display based on completed levels
function updateLevelDisplay() {
    const levelItems = document.querySelectorAll('.levels li');
    levelItems.forEach((item, index) => {
        if (index > 0 && index > completedLevel) {
            item.style.opacity = 0.5; // Dim the level
            item.style.pointerEvents = 'none'; // Disable clicking
        } else {
            item.style.opacity = 1; // Reset to full opacity
            item.style.pointerEvents = 'auto'; // Enable clicking
        }
    });
}

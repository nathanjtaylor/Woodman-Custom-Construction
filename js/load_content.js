// Used to load category-specific content into projects.html


// Grab the category from the URL and update the title
const params = new URLSearchParams(window.location.search);
const category = params.get('category') || 'Projects'; // Default if no category is selected

// Update the header title with the category
document.getElementById('category-title').innerText = `${category} Projects`;
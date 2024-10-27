// DOCSTRING. Used to load category-specific content into projects.html //
const fs = require('fs');


// Grab the category from the URL and update the title
const params = new URLSearchParams(window.location.search);
const category = params.get('category') || ''; // Default if no category is selected
const contentFolder = `content/project-${category}`; // Get content project folder

// Update the header title with the category
document.getElementById('category-title').innerText = `${category} Projects`;

async function fetchProjects() {
    const projectFolder = fs.readdirSync(contentFolder)

    projectFolder.forEach((mdfile) => {
        console.log(mdfile)
    });
}

document.addEventListener("DOMContentLoaded", fetchProjects);


// Import the functions from the load_content.js file
import { parseResponse, displayGallery } from './load_content.js';


// Grab the project ID from the title
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
const [category, ...number] = projectId.split('-');
const filePath = `content/project-${category}/${category}_project${number}`;

async function loadProject(filePath) {
    try {
        const response = await fetch(filePath); // Fetch the project file
        const projectData = await parseResponse(response); // Await parseResponse to get actual project data
    
        // Project HTML elements
        const projectTitle = document.getElementById("project-title");
        const projectDescription = document.getElementById("project_description");
    
        // Fill content
        projectTitle.innerText = projectData["title"];
        projectDescription.innerText = projectData["description"];
        displayGallery(projectData["gallery"]); // Call displayGallery with the gallery data
      } catch (error) {
        console.error("Error loading project:", error); // Handle potential errors (e.g., missing files)
      }
    }

    document.addEventListener("DOMContentLoaded", () => loadProject(filePath));


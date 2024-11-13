// Grab the project ID from the title
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
const [category, ...number] = projectId.split('-');
const filePath = `content/project-${category}/${category}_project${number}.md`;

function displayGallery(galleryImages) {
    const galleryImagesOL = document.getElementById("gallery-images"); // Get gallery <ol> element
    
    galleryImages.forEach(imageSrc => {
      // Create list item and image elements
      const listItem = document.createElement("li");
      listItem.classList.add("gallery-image");
  
      const galleryImage = document.createElement("img");
      galleryImage.classList.add("gallery-image");
      galleryImage.src = imageSrc;
      galleryImage.alt = "Gallery Image"; // You can customize alt text as needed
  
      // Append the image to the list item, then the list item to the gallery
      listItem.appendChild(galleryImage);
      galleryImagesOL.appendChild(listItem);
  
      // Add a horizontal line after each image (except the last one)
      const hr = document.createElement("hr");
      galleryImagesOL.appendChild(hr);
    });
  }

async function parseResponse(response){
try {
    // Fetch the markdown file as text
    const textContent = await response.text();

    // Use regex to find the YAML frontmatter between ---
    const yamlMatch = textContent.match(/---\n([\s\S]+?)\n---/);
    if (!yamlMatch) throw new Error("No YAML frontmatter found");

    // Extract the YAML content
    const yamlContent = yamlMatch[1];

    // Manually parse YAML lines into a JavaScript object
    const projectData = {};
    let isInGallery = false; // Flag to track if we're in the gallery array

    yamlContent.split('\n').forEach(line => {
    // Trim whitespace and check if the line starts a gallery item
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("gallery:")) {
        // Initialize the gallery array
        projectData["gallery"] = [];
        isInGallery = true; // Begin processing gallery items
    } else if (isInGallery && trimmedLine.startsWith("-")) {
        // If in the gallery, push image URLs into the array
        projectData["gallery"].push(trimmedLine.slice(1).trim());
    } else {
        // If it's a regular key: value line
        isInGallery = false; // End gallery context for other fields
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts) {
        projectData[key.trim()] = valueParts.join(':').trim();
        }
    }
    });
    return projectData;

} catch (error) {
    console.error("Error fetching or parsing project data:", error);
    return null;
}
}
  

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


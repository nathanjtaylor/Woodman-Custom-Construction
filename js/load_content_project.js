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
      listItem.classList.add("gallery-image-li");
  
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
    galleryImagesOL.removeChild(galleryImagesOL.lastElementChild);
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
    let isInDescription = false; // Flag to track if we're in the multiline description array

    yamlContent.split('\n').forEach(line => {
      // Trim whitespace and check if the line starts a gallery item

      if (line.startsWith("description: >-")) {
        // Initalize the description key if description is multiline
        isInGallery = false;
        projectData["description"] = "";
        isInDescription = true;
      } else if (line.startsWith("gallery:")) {
        isInDescription = false;
        const galleryLine = line.split(':');
        if (galleryLine[1].trim() === ""){
          // Multiline gallery; Initialize the gallery array
          projectData["gallery"] = [];
          isInGallery = true; // Begin processing gallery items
        } else{
          // Single line gallery
          projectData[galleryLine[0].trim()] = [galleryLine.slice(1).join(':').trim()];
        }
      } else if (isInGallery && line.startsWith("  -")) {
        // If in the gallery, push image URLs into the array
        const trimmedLine = line.trim();
        projectData["gallery"].push(trimmedLine.slice(1).trim());
      } else if (isInDescription && (line.startsWith("  ") || line === "")) {
        // If in the multiline description, concat description line onto string
        const trimmedLine = line.trim();
        projectData["description"] = projectData["description"].concat(" ", trimmedLine);
      } else {
        // If it's a regular key: value line
        isInGallery = false; // End gallery context for other fields
        isInDescription = false;
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
      const projectHeader = document.getElementById("project_header");
      const projectDescription = document.getElementById("project_description");
  
      // Fill content
      projectHeader.innerText = projectData["title"];
      projectDescription.innerText = projectData["description"];
      displayGallery(projectData["gallery"]); // Call displayGallery with the gallery data
    } catch (error) {
      console.error("Error loading project:", error); // Handle potential errors (e.g., missing files)
    }
  }

    document.addEventListener("DOMContentLoaded", () => loadProject(filePath));


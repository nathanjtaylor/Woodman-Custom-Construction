// DOCSTRING. Used to load category-specific content into projects.html //

// Grab the category from the URL and update the title
const params = new URLSearchParams(window.location.search);
const category = params.get('category') || ''; // Default if no category is selected
const lowerCatagory = category.toLowerCase();
const filePath = `content/project-${lowerCatagory}`; // Get content project folder

// Update the header title with the category
document.getElementById('category-title').innerText = `${category} Projects`;



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
          projectData[galleryLine[0].trim()] = galleryLine[1].trim();
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


// Function to create an array of json files in catagory-specific content folder
async function createFileArray(filePath){
    var fileNum = 1; // number to access file in form project{fileNum}
    const fileArray = []; // array of json files to return
    try{
      while (true){
        // Fetch response and continue if response is ok
        const response = await fetch(`${filePath}/${lowerCatagory}_project${fileNum}.md`);
        if (!response.ok){
          break;
        }
        // Turn responses to json and push them to fileArray
        const projectData = await parseResponse(response)
        projectData.id = fileNum; // Set id to fileNum
        fileArray.push(projectData);
        fileNum += 1; // increase fileNum by 1 to check next file
        } 
    } catch(error){
        console.error(error.message);
    }
    return fileArray;
  }


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
}


async function fetchAndDisplayProjects() {
  const projects = await createFileArray(filePath); // Get array of projects
  const projectTiles = document.getElementById("project-tiles"); // Get <ol> element
  var galleryImages = []; // Array of all images to be appended to gallery

  projects.forEach(project => {
    // Project tile link
    const projectLink = document.createElement("a");
    projectLink.href = `project.html?id=${lowerCatagory}-${project.id}`;

    // Main tile container
    const projectTile = document.createElement("div");
    projectTile.classList.add("project-tile");

    // Create the cover image element
    const projectImage = document.createElement("img");
    projectImage.classList.add("project-tile-image");
    projectImage.src = project["gallery"][0];
    projectImage.alt = project["title"] || "Project Image";

    // Create the project info div
    const projectInfo = document.createElement("div");
    projectInfo.classList.add("project-info");

    // Create the title span and set text
    const projectTitle = document.createElement("span");
    projectTitle.classList.add("project-title");
    projectTitle.textContent = project["title"] || "Untitled Project";;

    // Create the image bubble for image count
    const imageBubble = document.createElement("div");
    imageBubble.classList.add("image-bubble");

    // Bubble icon image
    const bubbleIcon = document.createElement("img");
    bubbleIcon.classList.add("bubble-icon");
    bubbleIcon.src = "assets/img/img-icon-sample.png";
    bubbleIcon.alt = "Image Icon";

    // Image count span
    const bubbleNumber = document.createElement("span");
    bubbleNumber.classList.add("bubble-number");
    bubbleNumber.textContent = project["gallery"].length || 1;

    // Append elements to structure
    imageBubble.appendChild(bubbleIcon);
    imageBubble.appendChild(bubbleNumber);
    projectInfo.appendChild(projectTitle);
    projectInfo.appendChild(imageBubble);
    projectTile.appendChild(projectImage);
    projectTile.appendChild(projectInfo);
    projectLink.appendChild(projectTile);
    projectTiles.appendChild(projectLink); // Append completed tile to the <ol> list

    galleryImages = galleryImages.concat(project["gallery"]);
  });
  displayGallery(galleryImages);
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayProjects);


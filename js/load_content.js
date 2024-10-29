// DOCSTRING. Used to load category-specific content into projects.html //

// Grab the category from the URL and update the title
const params = new URLSearchParams(window.location.search);
const category = params.get('category') || ''; // Default if no category is selected
const lowerCatagory = category.toLowerCase();
const filePath = `content/project-${lowerCatagory}`; // Get content project folder

// Update the header title with the category
document.getElementById('category-title').innerText = `${category} Projects`;

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
        const json = await response.json();
        fileArray.push(json);
        fileNum += 1; // increase fileNum by 1 to check next file
        } 
    } catch(error){
        console.error(error.message);
    }
    return fileArray;
  }



async function fetchAndDisplayProjects() {
  const projects = await createFileArray(filePath); // Get array of projects
  const projectTiles = document.getElementById("project-tiles"); // Get <ol> element

  projects.forEach(project => {
    // Project tile link
    const projectLink = document.createElement("a");
    projectLink.href = "project.html"

    // Main tile container
    const projectTile = document.createElement("div");
    projectTile.classList.add("project-tile");

    // Create the cover image element
    const projectImage = document.createElement("img");
    projectImage.classList.add("project-tile-image");
    projectImage.src = project.gallery[0]; // || "assets/img/default_image.png"; // First image or default
    projectImage.alt = project.title; // || "Project Image";

    // Create the project info div
    const projectInfo = document.createElement("div");
    projectInfo.classList.add("project-info");

    // Create the title span and set text
    const projectTitle = document.createElement("span");
    projectTitle.classList.add("project-title");
    projectTitle.textContent = project.title;

    // Create the image bubble for image count
    const imageBubble = document.createElement("div");
    imageBubble.classList.add("image-bubble");

    // Bubble icon image
    const bubbleIcon = document.createElement("img");
    bubbleIcon.classList.add("bubble-icon");
    bubbleIcon.src = "assets/img/img-icon-sample.png"; // Example icon, can be updated as needed
    bubbleIcon.alt = "Image Icon";

    // Image count span
    const bubbleNumber = document.createElement("span");
    bubbleNumber.classList.add("bubble-number");
    bubbleNumber.textContent = project.gallery.length;

    // Append elements to structure
    imageBubble.appendChild(bubbleIcon);
    imageBubble.appendChild(bubbleNumber);
    projectInfo.appendChild(projectTitle);
    projectInfo.appendChild(imageBubble);
    projectTile.appendChild(projectImage);
    projectTile.appendChild(projectInfo);
    projectLink.appendChild(projectTile);
    projectTiles.appendChild(projectLink); // Append completed tile to the <ol> list

  });

  
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayProjects);


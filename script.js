const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const statusDiv = document.getElementById("status");
const resultsGrid = document.getElementById("results-grid");

// Main Function to Fetch and Render Data across all 4 States
async function searchImages() {
  const query = searchInput.value.trim();

  // 1. IDLE / VALIDATION STATE
  if (!query) {
    statusDiv.textContent = "Please type a word to search.";
    resultsGrid.innerHTML = "";
    return;
  }

  // 2. LOADING STATE
  statusDiv.innerHTML = '<span class="spinner"></span> Searching...';
  resultsGrid.innerHTML = "";

  try {
    // Wikimedia API Endpoint
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=12&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // 3. EMPTY STATE CHECK
    if (!data.query || !data.query.pages) {
      statusDiv.textContent = `No results found for "${query}". Try another search term.`;
      return;
    }

    const items = Object.values(data.query.pages);

    if (items.length === 0) {
      statusDiv.textContent = `No results found for "${query}". Try another search term.`;
      return;
    }

    // 4. RESULTS STATE
    statusDiv.textContent = `Showing ${items.length} results for "${query}".`;
    renderResults(items);

  } catch (error) {
    // ERROR STATE
    console.error("Fetch error:", error);
    statusDiv.textContent = "Something went wrong. Please check your connection and try again.";
  }
}

// Render cards into grid
function renderResults(items) {
  resultsGrid.innerHTML = items
    .map((item) => {
      const title = item.title ? item.title.replace(/^File:/, "") : "Untitled";
      const imageSrc = item.thumbnail
        ? item.thumbnail.source
        : "https://via.placeholder.com/300x200?text=No+Image";

      return `
        <div class="card">
          <img src="${imageSrc}" alt="${title}" loading="lazy" />
          <p class="card-title" title="${title}">${title}</p>
        </div>
      `;
    })
    .join("");
}

// Event Listeners
searchBtn.addEventListener("click", searchImages);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchImages();
  }
});
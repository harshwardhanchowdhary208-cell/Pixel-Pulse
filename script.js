// DOM Element References
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const statusMessage = document.getElementById("status");
const categoryChips = document.querySelectorAll(".chip");

// Task 1 & 4: Catch Search & Ignore Empty Searches
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Stop page reload
  
  const query = input.value.trim();
  if (!query) return; // Task 4: Ignore empty input

  await executeSearch(query);
});

// Helper Function: Execute Search Flow (Catch -> Fetch -> Render)
async function executeSearch(query) {
  statusMessage.textContent = `Searching for "${query}"...`;
  
  try {
    const items = await fetchImages(query);
    renderResults(items, query);
  } catch (error) {
    console.error("Search failed:", error);
    statusMessage.textContent = "Something went wrong while fetching images. Please try again.";
  }
}

// Task 2: Fetch Data from Wikimedia API
async function fetchImages(query) {
  const endpoint = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6", // File namespace
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "400",
    format: "json",
    origin: "*"
  });

  const url = `${endpoint}?${params.toString()}`;
  
  const response = await fetch(url);
  
  // Task 2 Check: Verify response.ok
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.query || !data.query.pages) {
    return [];
  }

  return Object.values(data.query.pages);
}

// Task 3: Render Results into DOM
function renderResults(items, query) {
  // Clear previous results & hide empty state banner
  resultsContainer.innerHTML = "";
  if (emptyState) {
    emptyState.style.display = "none";
  }

  if (items.length === 0) {
    statusMessage.textContent = `No results found for "${query}". Try another search.`;
    return;
  }

  // Enhancement: Result counter
  statusMessage.textContent = `Showing ${items.length} results for "${query}"`;

  items.forEach((item) => {
    const imageInfo = item.imageinfo ? item.imageinfo[0] : null;
    if (!imageInfo) return;

    // Clean up title (removes "File:" prefix and extension for display)
    const rawTitle = item.title.replace(/^File:/i, "");
    const cleanTitle = rawTitle.substring(0, rawTitle.lastIndexOf(".")) || rawTitle;

    // Build Card Structure
    const card = document.createElement("article");
    card.className = "card";

    // Enhancement: Link opens full resolution image in new tab
    const link = document.createElement("a");
    link.className = "card-link";
    link.href = imageInfo.descriptionurl || imageInfo.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = imageInfo.thumburl || imageInfo.url;
    img.alt = cleanTitle;
    img.loading = "lazy";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const caption = document.createElement("p");
    caption.className = "card-title";
    caption.textContent = cleanTitle;

    cardBody.appendChild(caption);
    link.appendChild(img);
    link.appendChild(cardBody);
    card.appendChild(link);

    // Append card to grid container
    resultsContainer.appendChild(card);
  });
}

// Enhancement: Wire Quick-pick Suggestion Chips
categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const chipQuery = chip.getAttribute("data-query");
    if (chipQuery) {
      input.value = chipQuery;
      executeSearch(chipQuery);
    }
  });
});
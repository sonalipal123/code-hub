
const JSON_SOURCE = "/json/c_programs.json";

// ---------- Global State ----------
let ALL_ITEMS = [];       // All programs from JSON
let USER_BOOKMARKS = [];
let SHOWING_BOOKMARKS_ONLY = false; // State for the "tab" view

// ---------- Utility ----------
function escapeHtml(s) {
  return String(s || "");
}
function debounce(fn, ms = 200) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}


// ---------- Rendering ----------

const listArea = document.getElementById("listArea");
const stats = document.getElementById("stats");

function renderList(items, totalCount, isFiltered) {
  listArea.innerHTML = "";

  if (!items.length) {
    listArea.innerHTML = `
      <div class="alert alert-light text-center border p-5">
        <h4>${SHOWING_BOOKMARKS_ONLY ? "No Bookmarks Yet" : "No Programs Found"
      }</h4>
        <p class="text-muted">${SHOWING_BOOKMARKS_ONLY
        ? "Go back to all programs and click the star to save them here."
        : "Try adjusting your search."
      }</p>
        ${SHOWING_BOOKMARKS_ONLY
        ? '<button class="btn btn-primary" onclick="toggleBookmarkView(false)">View All Programs</button>'
        : ""
      }
      </div>`;
    stats.textContent = "0 Programs";
    return;
  }

  if (isFiltered) {
    stats.textContent = `${items.length} Programs`;
  } else {
    stats.textContent = `${totalCount} Programs`;
}

  items.forEach((item) => {
    // Check if this item is in the MongoDB bookmarks list
    const isBookmarked = USER_BOOKMARKS.includes(item.id);

    // --- Card Construction ---
    const card = document.createElement("div");
    card.className = `card mb-3 example-card ${
      isBookmarked ? "border-warning" : ""
    }`; // Highlight bookmarked cards slightly

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Header
    const headerRow = document.createElement("div");
    headerRow.className = "d-flex justify-content-between align-items-start";

    // Left (Title)
    const left = document.createElement("div");
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.className = "example-title fs-6 text-decoration-none fw-bold";
    titleLink.textContent = item.title || "Example";
    left.appendChild(titleLink);

    if (item.desc) {
      const desc = document.createElement("div");
      desc.className = "text-muted small mt-1";
      desc.textContent = item.desc;
      left.appendChild(desc);
    }

    // Right (Buttons)
    const right = document.createElement("div");
    right.className = "d-flex gap-2 align-items-center";

    // Bookmark Button
    const bmBtn = document.createElement("button");
    bmBtn.className = isBookmarked
      ? "btn btn-sm border border-black  fw-bold btn-secondary"
      : "btn btn-sm border border-black btn-outline-warning ";
    bmBtn.innerHTML = isBookmarked
      ? '<i class="bi bi-bookmark-star"></i>'
      : '<i class="bi bi-bookmark-star"></i>';

    // View Code Button
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-sm border-1 border-info";
    viewBtn.innerHTML = '<i class="bi bi-eye-fill"></i>';

    right.appendChild(bmBtn);
    right.appendChild(viewBtn);
    headerRow.appendChild(left);
    headerRow.appendChild(right);
    cardBody.appendChild(headerRow);

    // Hidden Code Area
    const expand = document.createElement("div");
    expand.className = "mt-3";
    expand.style.display = "none";
    

    if (item.code) {
      const pre = document.createElement("pre");
      pre.className = "rounded p-3 bg-light border";
      const codeEl = document.createElement("code");
      codeEl.className = "language-c";
      codeEl.textContent = item.code;
      pre.appendChild(codeEl);
      expand.appendChild(pre);

      // Copy Button inside expand
      const copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-sm btn-outline-dark border mt-2";
      copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';

      // Revert back after 2 seconds
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(item.code);
        copyBtn.innerHTML = '<i class="bi bi-clipboard-check"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
        }, 2000);
      };
      expand.appendChild(copyBtn);
    }

    if (item.input) {
      const inputDiv = document.createElement("div");
      inputDiv.className =
        "mt-2 p-2 border-start border-4 border-info bg-light small";
      inputDiv.innerHTML = `<strong>Input:</strong> ${escapeHtml(item.input)}`;
      expand.appendChild(inputDiv);
    }
    if (item.output) {
      const outDiv = document.createElement("div");
      outDiv.className =
        "mt-2 p-2 border-start border-4 border-info bg-light small";
      outDiv.innerHTML = `<strong>Output:</strong> ${escapeHtml(item.output)}`;
      expand.appendChild(outDiv);
    }

    cardBody.appendChild(expand);
    card.appendChild(cardBody);
    listArea.appendChild(card);

    // --- Events ---

    // Toggle View
    const toggleView = () => {
      const isHidden = expand.style.display === "none";
      expand.style.display = isHidden ? "block" : "none";
      viewBtn.innerHTML = isHidden
        ? '<i class="bi bi-eye-slash-fill"></i>'
        : '<i class="bi bi-eye-fill"></i>';
      if (isHidden && window.Prism)
        Prism.highlightElement(expand.querySelector("code"));
    };
    titleLink.addEventListener("click", (e) => {
      e.preventDefault();
      toggleView();
    });
    viewBtn.addEventListener("click", toggleView);

    // Toggle Bookmark (MongoDB)
    bmBtn.addEventListener("click", async () => {
      // 1. Optimistic UI update (feels faster)
      bmBtn.disabled = true;
      bmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span>';

      // 2. Call Backend
      const updated = await toggleBookmarkAPI(item.id);
      if (updated) USER_BOOKMARKS = updated.filter(id => id.startsWith("c-"));

      // Re-render list to reflect changes 
      applyFiltersAndRender();
    });
  });
}

// Main Filter Function
function applyFiltersAndRender() {
  let filtered = ALL_ITEMS;

  // 1. Search Filter
  const q = (document.getElementById('search').value || '').trim().toLowerCase();
  if(q) {
    filtered = filtered.filter(it => {
       const hay = ((it.title||'') + ' ' + (it.code||'') + ' ' + (it.desc||'')).toLowerCase();
       return hay.includes(q);
    });
  }

  // 2. Bookmark Filter (The "New Tab" logic)
  if (SHOWING_BOOKMARKS_ONLY) {
    filtered = filtered.filter(item => USER_BOOKMARKS.includes(item.id));
  }

  let dataToShow = filtered;
  let isFiltered = false;

  if (!q && !SHOWING_BOOKMARKS_ONLY) {
    dataToShow = filtered.slice(0, 5);
  isFiltered = false;
  } else {
    isFiltered = true;
  }

  renderList(dataToShow, filtered.length, isFiltered);
  updateUIState();
}

function updateUIState() {
  const bmTabBtn = document.getElementById("btnShowBookmarks");
  if (SHOWING_BOOKMARKS_ONLY) {
    bmTabBtn.classList.remove("btn-outline-warning");
    bmTabBtn.classList.add("btn-warning");
    bmTabBtn.innerHTML = 'Back';
  } else {
    bmTabBtn.classList.add("btn-outline-warning");
    bmTabBtn.classList.remove("btn-warning");
    bmTabBtn.innerHTML = `<i class="bi bi-bookmark-star"></i> My Bookmarks (${USER_BOOKMARKS.length})`;
  }
}

// Global Toggle for the UI button
window.toggleBookmarkView = function (forceState) {
  if (typeof forceState !== "undefined") {
    SHOWING_BOOKMARKS_ONLY = forceState;
  } else {
    SHOWING_BOOKMARKS_ONLY = !SHOWING_BOOKMARKS_ONLY;
  }

  // Clear search if switching to bookmarks to ensure they see them
  if (SHOWING_BOOKMARKS_ONLY) document.getElementById("search").value = "";

  applyFiltersAndRender();
};

// ---------- Search ----------
const searchEl = document.getElementById("search");
const doSearch = debounce(() => {
  const q = (searchEl.value || "").trim().toLowerCase();
  if (!q) {
    applyFiltersAndRender();
    return;
  }
  const filtered = ALL_ITEMS.filter((it) => {
    const hay = (
      (it.title || "") +
      " " +
      (it.code || "") +
      " " +
      (it.desc || "") +
      " " +
      (it.output || "") +
      " " +
      (it.tags || []).join(" ")
    ).toLowerCase();
    return hay.includes(q);
  });
  applyFiltersAndRender();
}, 280);

searchEl.addEventListener("input", doSearch);

// ---------- Load JSON ----------
(async function load() {
  try {
    const res = await fetch(`${JSON_SOURCE}`); 
    if (!res.ok)
      throw new Error("Failed to load c_programs.json (" + res.status + ")");
    const data = await res.json();
    // support both array or object with meta/examples
    if (Array.isArray(data)) {
      ALL_ITEMS = data;
    } else {
      ALL_ITEMS = [];
    }
    ALL_ITEMS = data.map((item, index) => {
      if (!item.id) {
        // Converts "Hello World" -> "hello-world-0"
        const slug = (item.title || "prog")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        return { ...item, id: `c-${slug}-${index}` };
      }
      return item;
    });
    const allBookmarks = await fetchUserBookmarks();
    USER_BOOKMARKS = allBookmarks.filter((id) => id.startsWith("c-"));
    applyFiltersAndRender();
  } catch (err) {
    listArea.innerHTML =
      '<div class="alert alert-danger">Error loading data: ' +
      escapeHtml(err.message) +
      "</div>";
    stats.textContent = "0 Programs";
    console.error(err);
  }
})();

// 2. Logout Logic 
document.addEventListener("DOMContentLoaded", () => {
  // Class 'logoutBtn' wale saare buttons dhundo
  const logoutButtons = document.querySelectorAll(".logoutBtn");

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Token delete karein 
      localStorage.removeItem("authToken");

      // User ko home/login page par bhejein
      window.location.href = "/";
    });
  });
});

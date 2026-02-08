const BOOKMARK_API = "/api/bookmarks"; // Universal API path

async function fetchUserBookmarks() {
  const token = localStorage.getItem("authToken");
  if (!token) return [];
  try {
    const res = await fetch(BOOKMARK_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.bookmarks || [];
  } catch (e) {
    return [];
  }
}

async function toggleBookmarkAPI(programId) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Please login!");
    return null;
  }
  const res = await fetch(`${BOOKMARK_API}/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ programId }),
  });
  const data = await res.json();
  return data.bookmarks; // Updated list returns karega
}

const form = document.querySelector("#thumbnailForm");
const input = document.querySelector("#playlistUrl");
const grid = document.querySelector("#grid");
const count = document.querySelector("#count");
const status = document.querySelector("#status");
const downloadButton = document.querySelector("#downloadButton");

let currentUrl = "";
let currentVideos = [];

function setStatus(message) {
  status.textContent = message;
}

function renderVideos(videos) {
  currentVideos = videos;
  count.textContent = String(videos.length);
  downloadButton.disabled = videos.length === 0;

  if (!videos.length) {
    grid.className = "grid empty";
    grid.innerHTML = "<p>No thumbnails found.</p>";
    return;
  }

  grid.className = "grid";
  grid.innerHTML = videos
    .map(
      (video) => `
        <article class="thumb">
          <img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" alt="">
          <div class="thumbInfo">
            <strong title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</strong>
            <span>${String(video.position).padStart(3, "0")} · ${video.id}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return chars[char];
  });
}

async function analyze(url) {
  setStatus("Finding videos from that YouTube source...");
  downloadButton.disabled = true;
  const response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Could not read that YouTube source.");
  renderVideos(payload.videos);
  setStatus(`Ready to download ${payload.videos.length} thumbnail${payload.videos.length === 1 ? "" : "s"}.`);
}

async function downloadZip() {
  setStatus("Downloading high-quality thumbnails...");
  downloadButton.disabled = true;
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: currentUrl }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Could not download thumbnails.");
  }

  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "youtube-thumbnails.zip";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  setStatus(`Downloaded ${currentVideos.length} thumbnail${currentVideos.length === 1 ? "" : "s"} as a ZIP.`);
  downloadButton.disabled = currentVideos.length === 0;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  currentUrl = input.value.trim();
  if (!currentUrl) return;

  try {
    await analyze(currentUrl);
  } catch (error) {
    renderVideos([]);
    setStatus(error.message);
  }
});

downloadButton.addEventListener("click", async () => {
  try {
    await downloadZip();
  } catch (error) {
    setStatus(error.message);
    downloadButton.disabled = currentVideos.length === 0;
  }
});

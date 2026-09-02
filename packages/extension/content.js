const MUSIC_PATTERNS = [
  /open\.spotify\.com\/(track|artist|album)\//,
  /music\.apple\.com\/.*\/(album|artist|song)\//,
  /deezer\.com\/.*\/(track|artist|album)\//,
  /tidal\.com\/(browse\/)?(track|artist|album)\//,
  /youtube\.com\/watch\?v=/,
  /youtu\.be\//,
  /music\.amazon\.com\/(albums|artists)\//,
  /bandcamp\.com\/(album|track)\//,
];

function isMusicUrl(url) {
  return MUSIC_PATTERNS.some((pattern) => pattern.test(url));
}

function showBanner() {
  const existing = document.getElementById("linked-banner");
  if (existing) return;

  const banner = document.createElement("div");
  banner.id = "linked-banner";
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    " id="linked-banner-inner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <span style="color: #fff; font-size: 14px; font-weight: 500;">Open in Linked</span>
    </div>
  `;

  document.body.appendChild(banner);

  const inner = document.getElementById("linked-banner-inner");
  inner.addEventListener("mouseenter", () => {
    inner.style.background = "#2a2a3e";
    inner.style.borderColor = "#6c5ce7";
  });
  inner.addEventListener("mouseleave", () => {
    inner.style.background = "#1a1a2e";
    inner.style.borderColor = "#333";
  });

  inner.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { type: "RESOLVE_URL", url: window.location.href },
      (response) => {
        if (response?.linkedUrl) {
          window.location.href = response.linkedUrl;
        }
      }
    );
  });

  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.style.opacity = "0";
      banner.style.transform = "translateY(10px)";
      banner.style.transition = "all 0.3s ease";
      setTimeout(() => banner.remove(), 300);
    }
  }, 8000);
}

if (isMusicUrl(window.location.href)) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBanner);
  } else {
    showBanner();
  }
}

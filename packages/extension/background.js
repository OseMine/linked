const BASE_URL = "https://linkedapp.ddns.net";
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_URL") {
    sendResponse({ isMusic: isMusicUrl(request.url) });
  }

  if (request.type === "RESOLVE_URL") {
    fetch(`${BASE_URL}/api/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: request.url }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({
          success: !data.error,
          linkedUrl: data.linkedUrl
            ? `${BASE_URL}${data.linkedUrl}`
            : null,
          entity: data.entity || null,
        });
      })
      .catch(() => {
        sendResponse({ success: false, linkedUrl: null });
      });
    return true; // Keep message channel open for async response
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !isMusicUrl(tab.url)) return;

  try {
    const response = await fetch(`${BASE_URL}/api/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tab.url }),
    });
    const data = await response.json();
    if (data.linkedUrl) {
      chrome.tabs.update(tab.id, { url: `${BASE_URL}${data.linkedUrl}` });
    }
  } catch {
    // Silently fail
  }
});

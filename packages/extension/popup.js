const BASE_URL = "https://linkedapp.ddns.net";
const content = document.getElementById("content");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab?.url) {
    content.innerHTML = '<p class="not-music">No active tab found.</p>';
    return;
  }

  chrome.runtime.sendMessage(
    { type: "CHECK_URL", url: tab.url },
    (response) => {
      if (!response?.isMusic) {
        content.innerHTML = '<p class="not-music">Current page is not a supported music platform.</p>';
        return;
      }

      content.innerHTML = `
        <button class="btn" id="resolve-btn">Open in Linked</button>
        <div class="status" id="status"></div>
      `;

      document.getElementById("resolve-btn").addEventListener("click", () => {
        const btn = document.getElementById("resolve-btn");
        const status = document.getElementById("status");
        btn.disabled = true;
        status.textContent = "Resolving...";
        status.className = "status";

        chrome.runtime.sendMessage(
          { type: "RESOLVE_URL", url: tab.url },
          (res) => {
            if (res?.linkedUrl) {
              status.textContent = "Redirecting...";
              status.className = "status success";
              chrome.tabs.update(tab.id, { url: res.linkedUrl });
              setTimeout(() => window.close(), 500);
            } else {
              status.textContent = "Failed to resolve. Try again.";
              status.className = "status error";
              btn.disabled = false;
            }
          }
        );
      });
    }
  );
});

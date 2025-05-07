/**
 * Noir New Tab - Background Script
 *
 * This script runs in the background and handles extension initialization,
 * setting up default settings on installation, and responding to messages
 * from the new tab page to provide bookmarks and top sites data.
 *
 * @file background.js
 * @author mosadd1X
 */

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First time installation
    console.log("Noir New Tab installed");

    // Set default settings
    const defaultSettings = {
      theme: "classic",
      customTheme: null,
      accentColor: "#5C6BC0",
      showQuote: true,
      clockFormat: "24h",
      showSeconds: false,
      defaultSearchEngine: "google",
      clockAnimation: "fade",
    };

    chrome.storage.sync.set({ noirSettings: defaultSettings });
  } else if (details.reason === "update") {
    // Extension updated
    console.log(
      "Noir New Tab updated to version",
      chrome.runtime.getManifest().version
    );
  }
});

// Listen for messages from the new tab page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTopSites") {
    chrome.topSites.get((sites) => {
      sendResponse({ sites: sites.slice(0, 8) });
    });
    return true; // Required for async sendResponse
  }

  if (message.action === "getBookmarks") {
    chrome.bookmarks.getRecent(10, (bookmarks) => {
      sendResponse({ bookmarks });
    });
    return true; // Required for async sendResponse
  }
});

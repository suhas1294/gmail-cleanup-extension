// Content script - this runs in the Gmail page context
// Mainly used to receive messages from background script if needed

console.log('Gmail Auto Cleanup content script loaded');

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkGmailPage') {
    sendResponse({ isGmail: true });
  }
});

// Default configuration
const DEFAULT_CONFIG = {
  junkSubjects: [
    "DESIGN READY TO PRODUCTION failed for ent",
    "Extension Generation failed for ent",
    "UI Automation Results",
    "Export failed for ent",
    "Extension Updation failed for ent",
    "fullSuite API Automation",
    "tags upgrade for",
    "SC Upgrade Revert for",
    "Obsolete auto tags deletion for",
    "Your Edge extension failed to publish.",
    "tags upgrade for",
    "PRODUCTION TO DESIGN DRAFT failed for ent",
    "Obsolete auto tags deletion for "
  ],
  intervalMinutes: 15,
  enabled: true
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Gmail Auto Cleanup extension installed');

  // Set default config if not exists
  const config = await chrome.storage.sync.get(['junkSubjects', 'intervalMinutes', 'enabled']);
  if (!config.junkSubjects) {
    await chrome.storage.sync.set(DEFAULT_CONFIG);
  }

  // Setup alarm
  setupAlarm(config.intervalMinutes || DEFAULT_CONFIG.intervalMinutes);
});

// Listen for config changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.intervalMinutes) {
    setupAlarm(changes.intervalMinutes.newValue);
  }
});

// Setup periodic alarm
function setupAlarm(intervalMinutes) {
  chrome.alarms.clear('gmailCleanup', () => {
    chrome.alarms.create('gmailCleanup', {
      periodInMinutes: intervalMinutes
    });
    console.log(`Alarm set for every ${intervalMinutes} minutes`);
  });
}

// Handle alarm trigger
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'gmailCleanup') {
    console.log('Gmail cleanup alarm triggered');

    // Check if enabled
    const config = await chrome.storage.sync.get(['enabled', 'junkSubjects']);
    if (!config.enabled) {
      console.log('Cleanup is disabled');
      return;
    }

    // Find Gmail tabs
    const tabs = await chrome.tabs.query({ url: 'https://mail.google.com/*' });

    if (tabs.length === 0) {
      console.log('No Gmail tabs found');
      return;
    }

    // Execute cleanup on all Gmail tabs
    for (const tab of tabs) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: cleanupGmail,
          args: [config.junkSubjects]
        });
        console.log(`Cleanup executed on tab ${tab.id}`);
      } catch (error) {
        console.error(`Error executing cleanup on tab ${tab.id}:`, error);
      }
    }
  }
});

// The actual cleanup function that runs in the page context
function cleanupGmail(junkMailsSubjects) {
  console.log('Running Gmail cleanup with subjects:', junkMailsSubjects);

  const currentPageInboxMails = Array.from(document.querySelectorAll('span.bog>span')).map(node => {
    if (node.checkVisibility() && junkMailsSubjects.some(junkSubject => node.innerText.includes(junkSubject))) {
      node.closest('tr')?.querySelector('div[role="checkbox"]')?.click?.();
    }
  });

  const deleteElement = document.querySelector('[data-tooltip="Delete"]>div');

  if (deleteElement) {
    // Dispatch mousedown event
    deleteElement.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    // Dispatch mouseup event
    deleteElement.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    // Dispatch click event
    deleteElement.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    console.log('Delete button clicked');
  } else {
    console.log('No delete button found or no emails selected');
  }
}

// Listen for manual trigger from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'runCleanupNow') {
    chrome.alarms.get('gmailCleanup', (alarm) => {
      if (alarm) {
        // Trigger the alarm manually
        chrome.alarms.onAlarm.dispatch({ name: 'gmailCleanup' });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Alarm not set' });
      }
    });
    return true; // Keep channel open for async response
  }
});

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const config = await chrome.storage.sync.get(['junkSubjects', 'intervalMinutes', 'enabled']);

  // Set enabled toggle
  const enabledCheckbox = document.getElementById('enabled');
  enabledCheckbox.checked = config.enabled !== false; // Default to true
  updateStatusText(enabledCheckbox.checked);

  // Set interval
  document.getElementById('intervalMinutes').value = config.intervalMinutes || 15;

  // Set subjects (one per line)
  const subjects = config.junkSubjects || [];
  document.getElementById('junkSubjects').value = subjects.join('\n');
});

// Update status text based on toggle
function updateStatusText(enabled) {
  const statusText = document.getElementById('status-text');
  statusText.textContent = enabled ? 'Enabled' : 'Disabled';
  statusText.style.color = enabled ? '#4CAF50' : '#999';
}

// Listen for toggle changes
document.getElementById('enabled').addEventListener('change', (e) => {
  updateStatusText(e.target.checked);
});

// Save button handler
document.getElementById('saveBtn').addEventListener('click', async () => {
  const enabled = document.getElementById('enabled').checked;
  const intervalMinutes = parseInt(document.getElementById('intervalMinutes').value);
  const subjectsText = document.getElementById('junkSubjects').value;

  // Validate interval
  if (isNaN(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 1440) {
    showStatus('Interval must be between 1 and 1440 minutes', 'error');
    return;
  }

  // Parse subjects (one per line, remove empty lines)
  const junkSubjects = subjectsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (junkSubjects.length === 0) {
    showStatus('Please add at least one subject pattern', 'error');
    return;
  }

  // Save to storage
  try {
    await chrome.storage.sync.set({
      enabled,
      intervalMinutes,
      junkSubjects
    });

    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
});

// Run now button handler
document.getElementById('runNowBtn').addEventListener('click', async () => {
  try {
    // Check if we're on a Gmail tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('mail.google.com')) {
      showStatus('Please open Gmail in the current tab', 'error');
      return;
    }

    // Get current config
    const config = await chrome.storage.sync.get(['junkSubjects', 'enabled']);

    if (!config.enabled) {
      showStatus('Cleanup is disabled. Enable it first.', 'error');
      return;
    }

    // Execute cleanup directly
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: cleanupGmail,
      args: [config.junkSubjects]
    });

    showStatus('Cleanup executed successfully!', 'success');
  } catch (error) {
    showStatus('Error running cleanup: ' + error.message, 'error');
  }
});

// Show status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';

  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// The cleanup function (same as in background.js)
function cleanupGmail(junkMailsSubjects) {
  console.log('Running Gmail cleanup with subjects:', junkMailsSubjects);

  const currentPageInboxMails = Array.from(document.querySelectorAll('span.bog>span')).map(node => {
    if (node.checkVisibility() && junkMailsSubjects.some(junkSubject => node.innerText.includes(junkSubject))) {
      node.closest('tr')?.querySelector('div[role="checkbox"]')?.click?.();
    }
  });

  const deleteElement = document.querySelector('[data-tooltip="Delete"]>div');

  if (deleteElement) {
    deleteElement.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    deleteElement.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

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

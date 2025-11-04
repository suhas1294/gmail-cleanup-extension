# Gmail Auto Cleanup Extension

A Chrome MV3 extension that automatically deletes junk emails from Gmail based on configurable subject patterns.

## Features

- ⏰ **Scheduled Cleanup**: Runs automatically every N minutes (configurable)
- 🎯 **Pattern Matching**: Delete emails matching specific subject patterns
- ⚙️ **Configurable Settings**: Easy-to-use popup UI for configuration
- 💾 **Persistent Storage**: Settings saved using Chrome sync storage
- 🔘 **Manual Trigger**: Run cleanup on-demand with "Run Now" button
- 🔄 **Enable/Disable**: Toggle cleanup functionality on/off

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `gmail-cleanup-extension` folder
5. The extension icon should appear in your toolbar

## Usage

### Initial Setup

1. Click the extension icon in your toolbar
2. Configure your settings:
   - **Enable/Disable**: Toggle the cleanup functionality
   - **Interval**: Set how often to run cleanup (in minutes)
   - **Junk Subjects**: Add email subject patterns (one per line)
3. Click "Save Settings"

### Running Cleanup

**Automatic**: The extension will automatically run cleanup based on your configured interval when Gmail tabs are open.

**Manual**:
1. Open Gmail in your browser
2. Click the extension icon
3. Click "Run Now" button

### Adding New Junk Patterns

1. Click the extension icon
2. Add new patterns to the "Junk Mail Subjects" textarea (one per line)
3. Click "Save Settings"

## Configuration Storage

Settings are stored using `chrome.storage.sync`, which means:
- Settings persist across browser sessions
- Settings sync across devices (if Chrome sync is enabled)
- Maximum storage: 100KB for all data
- Suitable for the subject list (supports thousands of entries)

## Default Junk Subjects

The extension comes pre-configured with these patterns:
- DESIGN READY TO PRODUCTION failed for ent
- Extension Generation failed for ent
- UI Automation Results
- Export failed for ent
- Extension Updation failed for ent
- fullSuite API Automation
- tags upgrade for
- SC Upgrade Revert for
- Obsolete auto tags deletion for
- Your Edge extension failed to publish.
- PRODUCTION TO DESIGN DRAFT failed for ent

## How It Works

1. **Background Service Worker**: Manages the alarm/cron job scheduling
2. **Chrome Alarms API**: Triggers cleanup at specified intervals
3. **Content Script Injection**: Executes cleanup logic directly in Gmail page
4. **DOM Manipulation**: Finds emails matching patterns, selects checkboxes, and clicks delete button

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Permissions**:
  - `storage`: Save user preferences
  - `alarms`: Schedule periodic cleanup
  - `activeTab`: Access current tab
  - `scripting`: Inject cleanup script
- **Host Permissions**: `https://mail.google.com/*`

## Files Structure

```
gmail-cleanup-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (scheduling & cleanup logic)
├── content.js         # Content script (Gmail page context)
├── popup.html         # Settings UI
├── popup.js           # Settings logic
├── icon16.svg         # Extension icon (16x16)
├── icon48.svg         # Extension icon (48x48)
├── icon128.svg        # Extension icon (128x128)
└── README.md          # This file
```

## Troubleshooting

**Extension not running automatically:**
- Make sure it's enabled in the popup
- Check that you have Gmail tabs open
- Verify the interval is set correctly

**Delete button not working:**
- Gmail's DOM structure may have changed
- Check browser console for errors
- Try clicking "Run Now" manually

**Settings not saving:**
- Check Chrome storage quota
- Ensure you clicked "Save Settings"
- Check browser console for errors

## Notes

- The extension only works when Gmail tabs are open
- Uses Gmail's DOM selectors which may break if Gmail updates their UI
- Minimum interval is 1 minute, maximum is 1440 minutes (24 hours)
- Chrome Alarms API has a minimum interval of 1 minute

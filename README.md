# Windsurf PR Review Chrome Extension

A Chrome extension that adds a "Review in Windsurf" button to GitHub Enterprise PR pages, allowing you to quickly open the PR review workflow in your Windsurf IDE.

## Features

- 🚀 One-click PR review in Windsurf
- ⚙️ Configurable workspace path
- 🎨 Clean, modern UI
- 🔒 Works with GitHub Enterprise (code.devsnc.com)
- 📝 Written in TypeScript

## Installation

### 1. Build the Extension

```bash
npm install
npm run build
```

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `windsurf-pr-review-extension` folder
5. The extension icon should appear in your toolbar

### 3. Configure Workspace Path

1. Click the extension icon in Chrome toolbar
2. Enter your Windsurf workspace path, e.g.:
   ```
   /Users/umang.maurya/git/now/slo-apps/app-supplier-gen-ai
   ```
3. Click **Save Settings**

## Usage

1. Navigate to any PR on `code.devsnc.com`, e.g.:
   ```
   https://code.devsnc.com/dev/app-supplier-gen-ai/pull/465
   ```

2. A purple **"Review in Windsurf"** button appears in the bottom-right corner

3. Click the button to:
   - Open Windsurf with your configured workspace
   - Automatically start the `@/pr-review` workflow with the PR URL

## How It Works

The extension uses Windsurf's URL protocol handler:
```
windsurf://file/PATH?chat=COMMAND
```

When you click the button, it constructs a URL like:
```
windsurf://file//Users/umang.maurya/git/now/slo-apps/app-supplier-gen-ai?windowId=_blank&chat=@/pr-review https://code.devsnc.com/dev/app-supplier-gen-ai/pull/465
```

## Troubleshooting

### Button doesn't appear
- Make sure you're on a PR page (URL matches `https://code.devsnc.com/*/pull/*`)
- Try refreshing the page
- Check if the extension is enabled in `chrome://extensions/`

### Windsurf doesn't open
- Verify Windsurf is installed
- Check that the workspace path is correct and exists
- Make sure Windsurf URL protocol handler is registered

### Settings not saving
- Check Chrome extension permissions
- Try reinstalling the extension

## File Structure

```
windsurf-pr-review-extension/
├── manifest.json      # Extension configuration
├── content.js         # Injects button on PR pages
├── content.css        # Button styling
├── popup.html         # Settings popup UI
├── popup.css          # Popup styling
├── popup.js           # Settings logic
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## License

MIT

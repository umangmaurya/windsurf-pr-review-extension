"use strict";
(() => {
  // src/types.ts
  var PR_URL_PATTERN = /^https:\/\/code\.devsnc\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

  // src/content.ts
  var WindsurfPRReviewButton = class {
    constructor() {
      this.prInfo = null;
      this.button = null;
      this.container = null;
      this.init();
    }
    init() {
      const match = window.location.href.match(PR_URL_PATTERN);
      if (!match)
        return;
      const [, org, repo, prNumber] = match;
      this.prInfo = {
        org,
        repo,
        prNumber,
        fullUrl: window.location.href
      };
      this.createButton();
      this.observeNavigation();
    }
    createButton() {
      if (document.getElementById("windsurf-pr-review-btn"))
        return;
      this.container = document.createElement("div");
      this.container.id = "windsurf-pr-review-container";
      this.button = document.createElement("button");
      this.button.id = "windsurf-pr-review-btn";
      this.button.innerHTML = this.getButtonContent();
      this.button.title = "Open PR Review in Windsurf";
      this.button.addEventListener("click", () => this.handleClick());
      this.container.appendChild(this.button);
      document.body.appendChild(this.container);
    }
    getButtonContent(loading = false) {
      if (loading) {
        return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>Opening...</span>
      `;
      }
      return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <span>Review in Windsurf</span>
    `;
    }
    async handleClick() {
      if (!this.button || !this.prInfo)
        return;
      const originalContent = this.button.innerHTML;
      try {
        this.setLoading(true);
        const settings = await this.getStoredSettings();
        if (!settings.workspacePath && !settings.workspaceFile) {
          alert(
            "Please configure your Windsurf workspace path in the extension settings.\n\nClick the extension icon in your toolbar to configure."
          );
          this.setLoading(false);
          return;
        }
        const windsurfUrl = this.buildWindsurfUrl(settings.workspacePath, settings.workspaceFile, this.prInfo.fullUrl);
        window.location.href = windsurfUrl;
        setTimeout(() => this.setLoading(false), 2e3);
      } catch (error) {
        console.error("Error opening Windsurf:", error);
        alert("Failed to open Windsurf. Please check your settings.");
        this.setLoading(false);
      }
    }
    setLoading(loading) {
      if (!this.button)
        return;
      this.button.innerHTML = this.getButtonContent(loading);
      this.button.disabled = loading;
    }
    getStoredSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(["workspacePath", "workspaceFile", "githubHost"], (result) => {
          resolve({
            workspacePath: result.workspacePath || "",
            workspaceFile: result.workspaceFile || "",
            githubHost: result.githubHost || "code.devsnc.com"
          });
        });
      });
    }
    buildWindsurfUrl(workspacePath, workspaceFile, prUrl) {
      const targetPath = workspaceFile || workspacePath;
      const prompt = `/pr-review ${prUrl}`;
      return `windsurf-next://cascade/newChat?folder=${encodeURIComponent(targetPath)}&prompt=${encodeURIComponent(prompt)}&autoRun=true`;
    }
    observeNavigation() {
      const observer = new MutationObserver(() => {
        if (window.location.href.match(PR_URL_PATTERN)) {
          this.createButton();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new WindsurfPRReviewButton());
  } else {
    new WindsurfPRReviewButton();
  }
})();

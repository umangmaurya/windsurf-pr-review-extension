"use strict";
(() => {
  // src/types.ts
  var DEFAULT_SETTINGS = {
    workspacePath: "",
    workspaceFile: "",
    githubHost: "code.devsnc.com"
  };

  // src/popup.ts
  var SettingsPopup = class {
    constructor() {
      this.workspacePathInput = null;
      this.workspaceFilePathInput = null;
      this.workspaceFileInput = null;
      this.browseBtn = null;
      this.githubHostInput = null;
      this.saveBtn = null;
      this.statusEl = null;
      this.init();
    }
    init() {
      this.workspacePathInput = document.getElementById("workspacePath");
      this.workspaceFilePathInput = document.getElementById("workspaceFilePath");
      this.workspaceFileInput = document.getElementById("workspaceFile");
      this.browseBtn = document.getElementById("browseBtn");
      this.githubHostInput = document.getElementById("githubHost");
      this.saveBtn = document.getElementById("saveBtn");
      this.statusEl = document.getElementById("status");
      this.loadSettings();
      this.attachEventListeners();
    }
    async loadSettings() {
      const settings = await this.getStoredSettings();
      if (this.workspacePathInput && settings.workspacePath) {
        this.workspacePathInput.value = settings.workspacePath;
      }
      if (this.workspaceFilePathInput && settings.workspaceFile) {
        this.workspaceFilePathInput.value = settings.workspaceFile;
      }
      if (this.githubHostInput && settings.githubHost) {
        this.githubHostInput.value = settings.githubHost;
      }
    }
    getStoredSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(["workspacePath", "workspaceFile", "githubHost"], (result) => {
          resolve({
            workspacePath: result.workspacePath || DEFAULT_SETTINGS.workspacePath,
            workspaceFile: result.workspaceFile || DEFAULT_SETTINGS.workspaceFile,
            githubHost: result.githubHost || DEFAULT_SETTINGS.githubHost
          });
        });
      });
    }
    attachEventListeners() {
      this.saveBtn?.addEventListener("click", () => this.saveSettings());
      this.browseBtn?.addEventListener("click", () => this.openFilePicker());
      this.workspaceFileInput?.addEventListener("change", (e) => this.handleFileSelect(e));
      this.workspacePathInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.saveSettings();
        }
      });
    }
    openFilePicker() {
      this.workspaceFileInput?.click();
    }
    handleFileSelect(event) {
      const input = event.target;
      const file = input.files?.[0];
      if (!file)
        return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          const workspace = JSON.parse(content);
          if (workspace.folders && workspace.folders.length > 0) {
            const firstFolder = workspace.folders[0];
            const path = firstFolder.path || firstFolder.uri;
            if (path && this.workspacePathInput) {
              let cleanPath = path.replace(/^file:\/\//, "");
              if (!cleanPath.startsWith("/")) {
                cleanPath = `/Users/umang.maurya/${cleanPath}`;
              }
              this.workspacePathInput.value = cleanPath;
              const folderCount = workspace.folders.length;
              this.showStatus(
                `Loaded ${folderCount} folder(s). Enter the full path to ${file.name} in the Workspace File Path field.`,
                "success"
              );
              setTimeout(() => this.clearStatus(), 8e3);
            }
          } else {
            this.showStatus("No folders found in workspace file", "error");
          }
        } catch (error) {
          console.error("Error parsing workspace file:", error);
          this.showStatus("Invalid workspace file format", "error");
        }
      };
      reader.onerror = () => {
        this.showStatus("Error reading workspace file", "error");
      };
      reader.readAsText(file);
    }
    saveSettings() {
      const workspacePath = this.workspacePathInput?.value.trim() || "";
      const githubHost = this.githubHostInput?.value.trim() || DEFAULT_SETTINGS.githubHost;
      if (!workspacePath) {
        this.showStatus("Please enter a workspace path", "error");
        return;
      }
      if (!workspacePath.startsWith("/")) {
        this.showStatus("Workspace path must be an absolute path (start with /)", "error");
        return;
      }
      const workspaceFile = this.workspaceFilePathInput?.value.trim() || "";
      const settings = {
        workspacePath,
        workspaceFile,
        githubHost
      };
      chrome.storage.sync.set(settings, () => {
        this.showStatus("Settings saved successfully!", "success");
        setTimeout(() => {
          this.clearStatus();
        }, 3e3);
      });
    }
    showStatus(message, type) {
      if (!this.statusEl)
        return;
      this.statusEl.textContent = message;
      this.statusEl.className = `status ${type}`;
    }
    clearStatus() {
      if (!this.statusEl)
        return;
      this.statusEl.className = "status";
      this.statusEl.textContent = "";
    }
  };
  document.addEventListener("DOMContentLoaded", () => new SettingsPopup());
})();

import { ExtensionSettings, DEFAULT_SETTINGS } from './types';

class SettingsPopup {
  private workspacePathInput: HTMLInputElement | null = null;
  private workspaceFilePathInput: HTMLInputElement | null = null;
  private workspaceFileInput: HTMLInputElement | null = null;
  private browseBtn: HTMLButtonElement | null = null;
  private githubHostInput: HTMLInputElement | null = null;
  private saveBtn: HTMLButtonElement | null = null;
  private statusEl: HTMLDivElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.workspacePathInput = document.getElementById('workspacePath') as HTMLInputElement;
    this.workspaceFilePathInput = document.getElementById('workspaceFilePath') as HTMLInputElement;
    this.workspaceFileInput = document.getElementById('workspaceFile') as HTMLInputElement;
    this.browseBtn = document.getElementById('browseBtn') as HTMLButtonElement;
    this.githubHostInput = document.getElementById('githubHost') as HTMLInputElement;
    this.saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    this.statusEl = document.getElementById('status') as HTMLDivElement;

    this.loadSettings();
    this.attachEventListeners();
  }

  private async loadSettings(): Promise<void> {
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

  private getStoredSettings(): Promise<ExtensionSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['workspacePath', 'workspaceFile', 'githubHost'], (result) => {
        resolve({
          workspacePath: result.workspacePath || DEFAULT_SETTINGS.workspacePath,
          workspaceFile: result.workspaceFile || DEFAULT_SETTINGS.workspaceFile,
          githubHost: result.githubHost || DEFAULT_SETTINGS.githubHost
        });
      });
    });
  }

  private attachEventListeners(): void {
    this.saveBtn?.addEventListener('click', () => this.saveSettings());
    
    this.browseBtn?.addEventListener('click', () => this.openFilePicker());
    
    this.workspaceFileInput?.addEventListener('change', (e: Event) => this.handleFileSelect(e));
    
    this.workspacePathInput?.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.saveSettings();
      }
    });
  }

  private openFilePicker(): void {
    this.workspaceFileInput?.click();
  }

  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Read the .code-workspace file content
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const workspace = JSON.parse(content);
        
        // Extract folders from workspace file
        if (workspace.folders && workspace.folders.length > 0) {
          // Get the first folder path for display
          const firstFolder = workspace.folders[0];
          const path = firstFolder.path || firstFolder.uri;
          
          if (path && this.workspacePathInput) {
            // Clean up the path (remove file:// prefix if present)
            let cleanPath = path.replace(/^file:\/\//, '');
            
            // If it's a relative path, try to construct absolute path
            if (!cleanPath.startsWith('/')) {
              cleanPath = `/Users/umang.maurya/${cleanPath}`;
            }
            
            this.workspacePathInput.value = cleanPath;
            
            const folderCount = workspace.folders.length;
            this.showStatus(
              `Loaded ${folderCount} folder(s). Enter the full path to ${file.name} in the Workspace File Path field.`,
              'success'
            );
            setTimeout(() => this.clearStatus(), 8000);
          }
        } else {
          this.showStatus('No folders found in workspace file', 'error');
        }
      } catch (error) {
        console.error('Error parsing workspace file:', error);
        this.showStatus('Invalid workspace file format', 'error');
      }
    };
    
    reader.onerror = () => {
      this.showStatus('Error reading workspace file', 'error');
    };
    
    reader.readAsText(file);
  }

  private saveSettings(): void {
    const workspacePath = this.workspacePathInput?.value.trim() || '';
    const githubHost = this.githubHostInput?.value.trim() || DEFAULT_SETTINGS.githubHost;

    if (!workspacePath) {
      this.showStatus('Please enter a workspace path', 'error');
      return;
    }

    if (!workspacePath.startsWith('/')) {
      this.showStatus('Workspace path must be an absolute path (start with /)', 'error');
      return;
    }

    const workspaceFile = this.workspaceFilePathInput?.value.trim() || '';

    const settings: ExtensionSettings = { 
      workspacePath, 
      workspaceFile,
      githubHost 
    };

    chrome.storage.sync.set(settings, () => {
      this.showStatus('Settings saved successfully!', 'success');
      
      setTimeout(() => {
        this.clearStatus();
      }, 3000);
    });
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    if (!this.statusEl) return;
    this.statusEl.textContent = message;
    this.statusEl.className = `status ${type}`;
  }

  private clearStatus(): void {
    if (!this.statusEl) return;
    this.statusEl.className = 'status';
    this.statusEl.textContent = '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => new SettingsPopup());

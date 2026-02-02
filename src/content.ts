import { ExtensionSettings, PRInfo, DEFAULT_PR_URL_PATTERN, createPRUrlPattern, DEFAULT_SETTINGS } from './types';

class WindsurfPRReviewButton {
  private prInfo: PRInfo | null = null;
  private button: HTMLButtonElement | null = null;
  private container: HTMLDivElement | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const settings = await this.getStoredSettings();
    const pattern = createPRUrlPattern(settings.githubHost);
    const match = window.location.href.match(pattern);
    
    if (!match) {
      // Try default pattern for any GitHub-like URL
      const defaultMatch = window.location.href.match(DEFAULT_PR_URL_PATTERN);
      if (!defaultMatch) return;
      
      const [, , org, repo, prNumber] = defaultMatch;
      this.prInfo = {
        org,
        repo,
        prNumber,
        fullUrl: window.location.href
      };
    } else {
      const [, org, repo, prNumber] = match;
      this.prInfo = {
        org,
        repo,
        prNumber,
        fullUrl: window.location.href
      };
    }

    this.createButton();
    this.observeNavigation();
  }

  private createButton(): void {
    if (document.getElementById('windsurf-pr-review-btn')) return;

    this.container = document.createElement('div');
    this.container.id = 'windsurf-pr-review-container';

    this.button = document.createElement('button');
    this.button.id = 'windsurf-pr-review-btn';
    this.button.innerHTML = this.getButtonContent();
    this.button.title = 'Open PR Review in Windsurf';
    this.button.addEventListener('click', () => this.handleClick());

    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  private getButtonContent(loading = false): string {
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

  private async handleClick(): Promise<void> {
    if (!this.button || !this.prInfo) return;

    const originalContent = this.button.innerHTML;
    
    try {
      this.setLoading(true);

      const settings = await this.getStoredSettings();
      
      if (!settings.workspacePath && !settings.workspaceFile) {
        alert(
          'Please configure your Windsurf workspace path in the extension settings.\n\n' +
          'Click the extension icon in your toolbar to configure.'
        );
        this.setLoading(false);
        return;
      }

      // Open Windsurf with pr-review command auto-running
      const windsurfUrl = this.buildWindsurfUrl(settings.workspacePath, settings.workspaceFile, this.prInfo.fullUrl);
      window.location.href = windsurfUrl;

      setTimeout(() => this.setLoading(false), 2000);
    } catch (error) {
      console.error('Error opening Windsurf:', error);
      alert('Failed to open Windsurf. Please check your settings.');
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    if (!this.button) return;
    this.button.innerHTML = this.getButtonContent(loading);
    this.button.disabled = loading;
  }

  private getStoredSettings(): Promise<ExtensionSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['workspacePath', 'workspaceFile', 'githubHost'], (result) => {
        resolve({
          workspacePath: result.workspacePath || '',
          workspaceFile: result.workspaceFile || '',
          githubHost: result.githubHost || DEFAULT_SETTINGS.githubHost
        });
      });
    });
  }

  private buildWindsurfUrl(workspacePath: string, workspaceFile: string, prUrl: string): string {
    // If workspace file is provided, open that (contains all folders)
    // Otherwise fall back to single workspace path
    const targetPath = workspaceFile || workspacePath;
    const prompt = `/pr-review ${prUrl}`;
    
    // Open Windsurf with pr-review command auto-running
    return `windsurf-next://cascade/newChat?folder=${encodeURIComponent(targetPath)}&prompt=${encodeURIComponent(prompt)}&autoRun=true`;
  }

  private observeNavigation(): void {
    const observer = new MutationObserver(async () => {
      const settings = await this.getStoredSettings();
      const pattern = createPRUrlPattern(settings.githubHost);
      if (window.location.href.match(pattern) || window.location.href.match(DEFAULT_PR_URL_PATTERN)) {
        this.createButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new WindsurfPRReviewButton());
} else {
  new WindsurfPRReviewButton();
}

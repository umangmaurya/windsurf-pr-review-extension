export interface ExtensionSettings {
  workspacePath: string;
  workspaceFile: string;
  githubHost: string;
}

export interface PRInfo {
  org: string;
  repo: string;
  prNumber: string;
  fullUrl: string;
}

export const PR_URL_PATTERN = /^https:\/\/code\.devsnc\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  workspacePath: '',
  workspaceFile: '',
  githubHost: 'code.devsnc.com'
};

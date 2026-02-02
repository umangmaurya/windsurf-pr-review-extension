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

// Dynamic pattern - will be constructed based on configured host
export const createPRUrlPattern = (host: string): RegExp => {
  const escapedHost = host.replace(/\./g, '\\.');
  return new RegExp(`^https:\/\/${escapedHost}\/([^/]+)\/([^/]+)\/pull\/(\\d+)`);
};

export const DEFAULT_PR_URL_PATTERN = /^https:\/\/([^/]+)\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  workspacePath: '',
  workspaceFile: '',
  githubHost: 'github.com'
};

// GitHub API service - fetches repo structure and file contents without authentication

export interface GitHubFile {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
  url: string;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.trim().replace(/\/$/, "").match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function ghFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 403) throw new Error("GitHub API rate limit reached. Try again later.");
    if (res.status === 404) throw new Error("Repository not found. Make sure it's a public repo.");
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const data = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
  return { owner, repo, defaultBranch: data.default_branch };
}

export async function getRepoTree(owner: string, repo: string, branch: string): Promise<GitHubFile[]> {
  const data = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  return data.tree || [];
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const data = await ghFetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    );
    if (data.encoding === "base64" && data.content) {
      return atob(data.content.replace(/\n/g, ""));
    }
    return "";
  } catch {
    return "";
  }
}

export async function getMultipleFileContents(
  owner: string,
  repo: string,
  paths: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  // Batch in groups of 5 to avoid rate limits
  for (let i = 0; i < paths.length; i += 5) {
    const batch = paths.slice(i, i + 5);
    const contents = await Promise.all(
      batch.map((p) => getFileContent(owner, repo, p))
    );
    batch.forEach((p, idx) => {
      results[p] = contents[idx];
    });
  }
  return results;
}

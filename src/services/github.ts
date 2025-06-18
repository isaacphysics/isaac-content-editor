import { ContextType } from "react";
import Cookies from "js-cookie";
import useSWR, { Cache, mutate } from "swr";
import { authorizationURL, doAuth } from "./auth";
import { AppContext } from "../App";
import { encodeBase64 } from "../utils/base64";
import { Entry } from "../components/FileBrowser";
import { dirname, resolveRelativePath } from "../utils/strings";
import { Config, getConfig } from "./config";
import { isDefined } from "../utils/types";

export const GITHUB_TOKEN_COOKIE = "github-token";
const GITHUB_API_URL = "https://api.github.com/";

const GITHUB_REPO_KEYS = {
  content: "$REPO",
  app: "$APP_REPO",
  cdn: "$CDN_REPO",
};
export type GitHubRepository = keyof typeof GITHUB_REPO_KEYS;

const GITHUB_BASE_REPO_PATHS: { [repo in GitHubRepository]: string } = {
  content: `repos/$OWNER/${GITHUB_REPO_KEYS["content"]}/contents/`,
  app: `repos/$OWNER/${GITHUB_REPO_KEYS["app"]}/contents/public/`,
  cdn: `repos/$OWNER/${GITHUB_REPO_KEYS["cdn"]}/contents/`,
};

// GitHub cache key is used, set to now(), to ensure that users see the true repo state on refreshing a page, even if
// the content is in the browser cache (as it will be for 60s by default).
let githubCacheKey = `${Date.now()}`;
export function updateGitHubCacheKey() {
  githubCacheKey = `${Date.now()}`;
}

export function githubReplaceWithConfig(path: string) {
  const config = getConfig();
  return path.replace(/\$([A-Z_]+)/g, (_, match) => {
    return config[match as keyof Config];
  });
}

export const fetcher = async (
  path: string,
  options?: Omit<RequestInit, "body"> & { body?: Record<string, unknown> },
) => {
  const fullPath = GITHUB_API_URL + githubReplaceWithConfig(path);
  const result = await fetch(fullPath, {
    ...options,
    headers: {
      ...options?.headers,
      authorization: `token ${Cookies.get(GITHUB_TOKEN_COOKIE)}`,
    },
    body:
      options?.body &&
      JSON.stringify({
        ...options.body,
      }),
  });
  const json = await result.json();
  if (result.ok) {
    return json;
  } else {
    if (result.status === 401) {
      // Re-login is needed
      if (window.confirm("You need to login again. We'll do that in a new window so your changes aren't lost.")) {
        window.open(authorizationURL(), "_blank");
      }
    }
    throw json.message;
  }
};

export function contentsPath(path: string, branch?: string, repo: GitHubRepository = "content") {
  let fullPath = `${GITHUB_BASE_REPO_PATHS[repo]}${path}`;
  fullPath += `?cache_t=${githubCacheKey}`;
  if (branch) {
    fullPath += `&ref=${encodeURIComponent(branch)}`;
  }
  return fullPath;
}

export const useGithubContents = (
  context: ContextType<typeof AppContext>,
  path: string | false | null | undefined,
  repo?: GitHubRepository,
) => {
  return useSWR(typeof path === "string" ? contentsPath(path, context.github.branch, repo) : null);
};

export const defaultGithubContext = {
  branch: "master",
  user: { login: "invalid-user" } as User,
  cache: undefined as unknown as Cache,
};

export async function processCode(code: string | null) {
  if (code) {
    // Exchange the code for a token, put that in a cookie
    const result = await doAuth(code);
    Cookies.set(GITHUB_TOKEN_COOKIE, result.accessToken, {
      expires: 7,
      sameSite: "strict",
      secure: true,
    });

    const dest = new URL(window.location.href);
    if (dest.pathname === "" || dest.pathname === "/") {
      dest.pathname = `edit/${encodeURIComponent(defaultGithubContext.branch)}`;
    }
    // Either way, take code out of query string
    dest.searchParams.delete("code");
    window.location.replace(dest);
  }
}

export interface User {
  login: string;
}

export function githubComparisonPath(oldVersion?: string, newVersion?: string) {
  return githubReplaceWithConfig("https://github.com/$OWNER/$REPO/compare/" + oldVersion + "..." + newVersion);
}

function encodeContent(contentBody: string) {
  let content;
  try {
    content = window.btoa(contentBody);
  } catch (e) {
    content = encodeBase64(contentBody);
  }
  return content;
}

export async function githubCreate(
  context: ContextType<typeof AppContext>,
  basePath: string,
  name: string,
  initialContent: string,
  repo: GitHubRepository = "content",
) {
  const path = `${basePath}/${name}`;

  // If we have a binary file, we want to do the conversion as the binary file, so use the standard btoa
  // But if there are any >255 characters in there, this must be UTF text so we use the encoder that
  // first turns UTF-16 into UTF-8 as UTF-16 can't be encoded as base64 (since some "bytes" are > 255).
  const content = encodeContent(initialContent);
  const data = await fetcher(contentsPath(path, undefined, repo), {
    method: "PUT",
    body: {
      branch: context.github.branch,
      message: "Creating " + path,
      content,
    },
  });

  // TODO Could use mutate(...) to update filetree without a hard refresh - but remember to consider files saved in
  // parent and sub-directories

  return data;
}

export async function githubUpdate(
  context: ContextType<typeof AppContext>,
  basePath: string,
  name: string,
  initialContent: string,
  sha: string,
  repo: GitHubRepository = "content",
) {
  let wasPublished;
  try {
    wasPublished = context.editor.isAlreadyPublished();
  } catch {
    wasPublished = false;
  }
  const path = `${basePath}/${name}`;

  // If we have a binary file, we want to do the conversion as the binary file, so use the standard btoa
  // But if there are any >255 characters in there, this must be UTF text so we use the encoder that
  // first turns UTF-16 into UTF-8 as UTF-16 can't be encoded as base64 (since some "bytes" are > 255).
  const content = encodeContent(initialContent);
  const data = await fetcher(contentsPath(path, undefined, repo), {
    method: "PUT",
    body: {
      branch: context.github.branch,
      message: `${wasPublished ? "* " : ""}Replacing ${path}`,
      sha,
      content,
    },
  });
  return data;
}

export async function githubDelete(
  context: ContextType<typeof AppContext>,
  path: string,
  name: string,
  sha: string,
  repo: GitHubRepository = "content",
) {
  let wasPublished;
  try {
    wasPublished = context.editor.isAlreadyPublished();
  } catch {
    wasPublished = false;
  }
  const basePath = dirname(path);
  await fetcher(contentsPath(path, undefined, repo), {
    method: "DELETE",
    body: {
      branch: context.github.branch,
      message: `${wasPublished ? "* " : ""}Deleting ${path}`,
      sha: sha,
    },
  });

  // Let the file browser know this file is no longer there
  await mutate(
    contentsPath(basePath, context.github.branch, repo),
    (current: Entry[]) => {
      const newDir = [...current];
      const position = newDir.findIndex((entry) => {
        return name === entry.name;
      });
      if (position !== -1) {
        newDir.splice(position, 1);
        return newDir;
      }
      return current;
    },
    { revalidate: false },
  ); // github asks for aggressive disk caching, which we need to override.
}

// Adapted from this blog post: https://medium.com/@obodley/renaming-a-file-using-the-git-api-fed1e6f04188
export async function githubRename(
  context: ContextType<typeof AppContext>,
  path: string,
  name: string,
  repo: GitHubRepository = "content",
) {
  const isPublished = context.editor?.isAlreadyPublished();

  const pathSegments = path.split("/");
  const basePath = dirname(path);
  const oldName = pathSegments.at(-1);

  const targetPath = resolveRelativePath(name, path);
  const targetPathSegments = targetPath.split("/");
  const targetFilename = targetPathSegments.at(-1);
  const targetBasePath = dirname(targetPath);

  // Ensure that another file with the same name doesn't already exist, because the renaming process will overwrite
  // existing files otherwise. First we clear the cache to ensure that the file list is up-to-date (at least within
  // the last 60 seconds).
  await mutate(contentsPath(targetBasePath, context.github.branch, repo), undefined);
  const current: Entry[] =
    (await context.github.cache.get(contentsPath(targetBasePath, context.github.branch, repo))) ?? [];
  const index = current.findIndex((entry) => targetFilename === entry.name);
  if (index !== -1)
    throw Error(`A file with the name ${targetFilename} already exists in the same directory. Cannot rename!`);

  // It is now safe to rename...

  // Get the current branch commit sha - GitHub asks the browser to cache these branch requests for 60 seconds, which will
  // cause things to break if we try to rename twice in a 60 second period. To bypass this, we add a timestamp as a
  // query param to the URL, allowing us to get the freshest branch commit sha each time.
  const branch = await fetcher(
    `repos/$OWNER/${GITHUB_REPO_KEYS[repo]}/branches/${encodeURIComponent(context.github.branch)}?cache_t=${Date.now()}`,
  );
  const baseSha = branch.commit.sha;

  // Get the entire git tree at this point
  let subtree = await fetcher(`repos/$OWNER/${GITHUB_REPO_KEYS[repo]}/git/trees/${baseSha}`);
  // Find the tree node corresponding to the file we want to rename
  for (const segment of pathSegments.slice(0, -1)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextTree = subtree.tree.find((t: any) => t.path === segment);
    if (nextTree) {
      subtree = await fetcher(nextTree.url.replace(GITHUB_API_URL, ""));
    } else {
      console.error("Cannot find file in git tree - cannot rename!");
      return;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = subtree?.tree?.find((b: any) => b.path === oldName);
  if (!blob) throw Error("A file with that name does not exist on the current branch.");

  // Send the modified tree to github, with the updated path
  const newTree = await fetcher(`repos/$OWNER/${GITHUB_REPO_KEYS[repo]}/git/trees?recursive=1`, {
    method: "POST",
    body: {
      base_tree: baseSha,
      tree: [
        {
          path: targetPath,
          mode: blob.mode,
          type: blob.type,
          sha: blob.sha,
        },
        {
          path: `${basePath}/${blob.path}`,
          mode: blob.mode,
          type: blob.type,
          sha: null,
        },
      ],
    },
  });

  // Commit the new tree with a message
  const commit = await fetcher(`repos/$OWNER/${GITHUB_REPO_KEYS[repo]}/git/commits`, {
    method: "POST",
    body: {
      message: `${isPublished ? "* " : ""}Rename ${blob.path} to ${name}`,
      tree: newTree.sha,
      parents: [baseSha],
    },
  });
  // Point the current branch at the new commit
  await fetcher(`repos/$OWNER/${GITHUB_REPO_KEYS[repo]}/git/refs/heads/${encodeURIComponent(context.github.branch)}`, {
    method: "PATCH",
    body: {
      sha: commit.sha,
    },
  });

  // TODO Could use mutate(...) to update filetree without a hard refresh - but remember to consider files moved to
  // parent and sub-directories
}

export async function githubSave(context: ContextType<typeof AppContext>) {
  let isPublishedChange;
  let isContent;
  try {
    const fileJSON = context.editor.getCurrentDoc();
    const alreadyPublished = context.editor.isAlreadyPublished();
    // TODO if published changing to true, do content error checks beforehand (perhaps via an API service?)
    isPublishedChange = fileJSON.published || alreadyPublished;
    isContent = true;
  } catch {
    isPublishedChange = false;
    isContent = false;
  }
  const path = context.selection.getSelection()?.path as string;
  const initialCommitMessage = `${isPublishedChange ? "* " : ""}Edited ${path.split("/").at(-1)}`;

  const message = window.prompt("Enter your commit message", initialCommitMessage);

  if (!message) {
    return;
  }

  const { sha } = await context.github.cache.get(contentsPath(path, context.github.branch));

  const body = {
    message,
    branch: context.github.branch,
    content: encodeBase64(context.editor.getCurrentDocAsString()),
    sha: sha,
  };

  const result = await fetcher(contentsPath(path), {
    method: "PUT",
    body,
  });

  // Clear dirty and update already published flags
  context.editor.loadNewDoc(isContent ? context.editor.getCurrentDoc() : context.editor.getCurrentDocAsString());
  const newContent = { ...result.content, content: body.content };
  await mutate(contentsPath(path, context.github.branch), newContent, { revalidate: false });

  return newContent;
}

// This asks the user to confirm before replacing an existing figure. Returns `null` if the user decides to cancel the
// replacement action.
export async function githubUpload(
  context: ContextType<typeof AppContext>,
  basePath: string,
  name: string,
  content: string,
): Promise<string | null> {
  const figurePath = `${basePath}/figures`;

  let existingFigures;
  try {
    existingFigures = await fetcher(contentsPath(figurePath, context.github.branch));
  } catch (e) {
    existingFigures = [];
  }

  const figurePaths: { path: string; sha: string }[] = existingFigures.map((f: { path: string; sha: string }) => ({
    path: f.path,
    sha: f.sha,
  }));
  const figureToReplace = figurePaths.find((f) => f.path === figurePath + "/" + name);
  let result;
  if (isDefined(figureToReplace)) {
    if (
      !window.confirm(
        `This action will change other occurrences of the figure ${figurePath + "/" + name}.\nAre you sure you want to replace it?`,
      )
    )
      return null;

    result = await githubUpdate(context, figurePath, name, content, figureToReplace.sha);
  } else {
    result = await githubCreate(context, figurePath, name, content);
  }

  return `figures/${result.content.name}`;
}

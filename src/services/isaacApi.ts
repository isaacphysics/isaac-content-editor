import { getConfig } from "./config";

function makeFetcher(server: string) {
  return async function apiFetcher(path: string, options?: RequestInit) {
    const fullPath = `${server}/api/any/api/${path}`;

    const fullOptions: RequestInit = {
      ...options,
      mode: "cors",
    };
    const result = await fetch(fullPath, fullOptions);
    if (result.ok) {
      return result.json();
    } else {
      throw await result.json();
    }
  };
}

const config = getConfig();
export const StagingServer = config.apiStagingServer;
export const stagingFetcher = makeFetcher(StagingServer);
export const liveFetcher = makeFetcher(config.apiServer);

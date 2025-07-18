import {siteSpecific} from "./site";

export const LocalServer = "http://localhost:8080";

export const StagingServer = siteSpecific(
    "https://staging.isaacscience.org",
    "https://staging.adacomputerscience.org"
);

const LiveServer = siteSpecific(
    "https://isaacscience.org",
    "https://adacomputerscience.org",
);

function makeFetcher(server: string) {
    return async function apiFetcher(path: string, options?: RequestInit) {
        const fullPath = server.includes("localhost") ? `${server}/isaac-api/api/${path}` : `${server}/api/any/api/${path}`;

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

export const localFetcher = makeFetcher(LocalServer);
export const stagingFetcher = makeFetcher(StagingServer);
export const liveFetcher = makeFetcher(LiveServer);

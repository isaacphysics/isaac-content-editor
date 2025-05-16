import {siteSpecific} from "./site";

export const LocalServer = siteSpecific(
    "http://localhost:8080",
    "http://localhost:8081",
);

export const StagingServer = siteSpecific(
    "https://staging.isaacphysics.org",
    "https://staging.adacomputerscience.org"
);

export const RedesignServer = siteSpecific(
    "https://redesign.isaacphysics.org",
    "https://staging.adacomputerscience.org"
);

const LiveServer = siteSpecific(
    "https://isaacphysics.org",
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

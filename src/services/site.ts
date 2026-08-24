export type SITES = "ADA" | "PHY";

const DEFAULT_DEV_SITE: SITES = "PHY";

function getCurrentSite(): SITES {
    switch(document.location.host) {
        case "localhost:3000":
        case "localhost:8421":
            return DEFAULT_DEV_SITE;
        case "editor.isaacphysics.org": return "PHY";
        case "editor.adacomputerscience.org": return "ADA";
    }
    return DEFAULT_DEV_SITE;
}

export const SITE: SITES = getCurrentSite();

export const isPhy = SITE === "PHY";
export const isAda = SITE === "ADA";

export function siteSpecific<P, A>(phy: P, ada: A) {
    return isPhy ? phy : ada;
}

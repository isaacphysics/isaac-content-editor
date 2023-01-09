export type Config = {
    OWNER: string;
    CDN_REPO: string;
    APP_REPO: string;
    clientId: string;
    authUrl: string;
    REPO: string;
    previewServer: string;
    apiStagingServer: string;
    apiServer: string;
}

export function getConfig(): Config {
    return {
        OWNER: "isaacphysics",
        CDN_REPO: "isaac-cdn",
        APP_REPO: "isaac-react-app",
        clientId : getEnvVar("REACT_APP_CLIENT_ID") || "",
        authUrl : getEnvVar("REACT_APP_AUTH_URL") || "",
        REPO: getEnvVar("REACT_APP_CONTENT_REPO") || "isaac-content-2",
        previewServer: getEnvVar("REACT_APP_PREVIEW_HOST") || "http://localhost:3001",
        apiStagingServer: getEnvVar("REACT_APP_API_STAGING_HOST") || "https://staging.isaaccomputerscience.org",
        apiServer: getEnvVar("REACT_APP_API_HOST") || "https://isaaccomputerscience.org",
    }
}

export function isPhy(): boolean {
  return getEnvVar("REACT_APP_SITE")  === "PHY";
}

export function isCS(): boolean {
  return getEnvVar("REACT_APP_SITE")  === "CS";
}

// This will use the normal REACT_APP_... variables from process.env on local/development envs.
// For static production builds, it will leave the ENV_VAR_NAME as-is, which will be replaced
// with the actual value at runtime by the docker-entrypoint.sh script.
function getEnvVar(envVarName: string): string | undefined {
  return process.env.NODE_ENV === 'production' ? envVarName : process.env[envVarName];
}

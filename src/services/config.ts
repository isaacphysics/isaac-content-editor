export type Config = {
    OWNER: string;
    CDN_REPO: string;
    APP_REPO: string;
    REPO: string;
    clientId: string;
    authUrl: string;
    previewServer: string;
    apiStagingServer: string;
    apiServer: string;
}

export function getConfig(): Config {
    return {
        OWNER: getEnvVar("REACT_APP_GITHUB_OWNER") || "isaaccomputerscience",
        CDN_REPO: getEnvVar("REACT_APP_CDN_REPO") || "isaac-cdn",
        APP_REPO: getEnvVar("REACT_APP_APP_REPO") || "isaac-react-app",
        REPO: getEnvVar("REACT_APP_CONTENT_REPO") || "isaac-content",
        authUrl : getEnvVar("REACT_APP_AUTH_URL") || "",
        clientId : getEnvVar("REACT_APP_CLIENT_ID") || "",
        previewServer: getEnvVar("REACT_APP_PREVIEW_HOST") || "http://localhost:8003",
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

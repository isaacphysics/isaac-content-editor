import {siteSpecific} from "./site";

export interface SharedConfig {
    OWNER: string;
    CDN_REPO: string;
    APP_REPO: string;
}
const sharedConfig: SharedConfig = {
    OWNER: "isaacphysics",
    CDN_REPO: "isaac-cdn",
    APP_REPO: "isaac-react-app"
};

export type Config = SharedConfig & {
    clientId: string;
    authCode: string;
    REPO: string;
    previewServer: string;
}
const configs: { [host: string]: Config } = {
    "localhost": {
        ...sharedConfig,
        clientId: "f62f2bd4954bf930bc3f",
        authCode: "/vFaDdbb7id6+cPgsIKTdvwk4lOLBkBpBsXDdBvZsnU0U/PBLxgzxDzmUfE/0OIWWvlxh7SigvVv1JzBffbEc2364W8GPmQt9QeuVW1juAHdvdT7kRrHv8LjEuxJP9ie9+BP3tXNWpVxdg7S3sbZA5ShBFOYxdr3izjn9L+cmzDT9YVKB+Grv8hvLcEFOy7KHeixa29HPY2pqtk6XHFqiwlDP+02AWmY",
        REPO: siteSpecific("rutherford-content", "ada-content"),
        previewServer: siteSpecific("http://localhost:3002", "http://localhost:3001"),
    },
    "editor.isaacphysics.org": {
        ...sharedConfig,
        clientId : "012d68f7ffd3a99110ff",
        authCode : "j4GsAFDYXaxqwN146vTeQ4vbV7ucQtGC8B4AI7EVQPIUTQG/nz9Yfgm1o3d0FLrDlgGyig2YyxA8IMS1wVF+mZ7rCMzOZUXGIn48gDxFGzsWZKhK36kwra5PE3C6mCeRQjXx6cCyl9VRH1VR+RsjIXM6vIdD0g1JqcupsKDNmojZAcuMkPreJfl2h+bbss1DGw3CdvNLF8lwd895OTNwZfGjQxcmywIS3VIC7o6JIq3fcw==",
        OWNER: "isaacphysics",
        REPO: "rutherford-content",
        previewServer: "https://editor-preview.isaacphysics.org",
    },
    "editor.adacomputerscience.org": {
        ...sharedConfig,
        clientId : "c49d125435253a926eba",
        authCode : "rqJgz6efqvIPwMSQkDadvFN7uPfZlhl0aNdmX0/w2YGJNK2+Z8WprbtPlKEYytGr4vS8HD0w5VMNl7SqcTakRAdK/01eP+9CRZuX/7UiZMD5bIGmjq+0nLyBE36gtPpmhzIsY8P6lldnps/MBXL5Qo1ogouE6oBcoC+wvzw2AEnMyYh2UT4dlDh8Pfu7PPzJ+IVqP4GgV22XRHpF+5nPv0VpSOtFdQuCP8KPMnASJgNwGSsnfb0/vQ==",
        OWNER: "isaacphysics",
        REPO: "ada-content",
        previewServer: "https://editor-preview.adacomputerscience.org",
    },
};

export function getConfig() {
    return configs[window.location.hostname];
}

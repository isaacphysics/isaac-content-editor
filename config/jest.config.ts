const jestConfig = {
    rootDir: "../",
    testMatch: ["<rootDir>/src/**/*.test.(js|jsx|ts|tsx)"],
    transform: {
        "^.+\\.[jt]sx?$": "ts-jest",
        "^.+\\.nearley$": "<rootDir>/config/nearleyTransformer.cjs",
    },
    moduleNameMapper: {
        "^.+\\.css$": "identity-obj-proxy",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testEnvironment: "jsdom",
    setupFiles: [
        "<rootDir>/config/jest.polyfills.ts"
    ],
};

export default jestConfig;

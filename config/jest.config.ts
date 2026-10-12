const jestConfig = {
    rootDir: "../",
    testMatch: ["<rootDir>/src/**/*.test.(js|jsx|ts|tsx)"],
    transform: {
        "^.+\\.[jt]sx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testEnvironment: "jsdom",
};

export default jestConfig;

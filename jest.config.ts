import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
    transform: {
      '\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
    },
  };

export default config;

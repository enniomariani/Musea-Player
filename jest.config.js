import { pathsToModuleNameMapper } from 'ts-jest'
import tsConfig from './tests/tsconfig.json' with { type: 'json' };

export default {
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts', 'd.ts'],
    preset: "ts-jest/presets/default-esm",
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
        prefix: '<rootDir>/',
        useESM: true
    }),
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: './tests/tsconfig.json',
            useESM: true,
        }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(musea-server|@jest))',      //necesary because Musea-Server is already esm-js + has jest-imports
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],  //enable jest-use in Musea-Server-mocks without importing it
};
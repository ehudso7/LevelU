module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/src/__tests__/backend/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'app',
      testMatch: ['<rootDir>/src/__tests__/app/**/*.test.tsx'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            strict: true,
            moduleResolution: 'node',
            allowJs: true,
          },
          diagnostics: false,
        }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@sentry/react-native|posthog-react-native|@supabase/.*|react-native-url-polyfill|react-native-worklets|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^react-native$': '<rootDir>/src/__tests__/__mocks__/react-native.ts',
        '^react-native/(.*)$': '<rootDir>/src/__tests__/__mocks__/react-native.ts',
        '^react-native-safe-area-context$': '<rootDir>/src/__tests__/__mocks__/react-native-safe-area-context.tsx',
        '^react-native-reanimated$': '<rootDir>/src/__tests__/__mocks__/react-native-reanimated.ts',
        '^react-native-gesture-handler$': '<rootDir>/src/__tests__/__mocks__/react-native-gesture-handler.ts',
      },
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    },
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/supabase/functions/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};

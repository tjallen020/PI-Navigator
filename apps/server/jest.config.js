module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};

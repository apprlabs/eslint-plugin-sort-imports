export default {
    collectCoverage: true,
    coverageReporters: [
        ['text', { file: 'coverage.txt', path: './coverage/.' }]
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    preset: 'ts-jest',
    testEnvironment: 'node'
};
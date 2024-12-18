// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import fs from 'fs';
import globals from "globals";

export default [
    {
        files: ['src/**/*.ts'],

        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser
            }
        },

        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },

        rules: {
            ...eslint.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            "no-console": 'error'
        },
    },
    {
        ignores: [
            ...fs
                .readdirSync(process.cwd(), {withFileTypes: true})
                .filter((dirent) => dirent.isDirectory() && dirent.name !== 'src')
                .map((dirent) => dirent.name + '/')
        ]
    }
];
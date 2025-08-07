import globals from 'globals'
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'
import eslintPluginImport from 'eslint-plugin-import'

export default typescriptEslint.config(
    eslintConfigPrettier,
    {
        files: ['**/*.{ts,vue}'],
        extends: [
            eslint.configs.recommended,
            ...typescriptEslint.configs.recommended,
            ...eslintPluginVue.configs['flat/recommended'],
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                parser: typescriptEslint.parser,
            },
        },
        plugins: {
            vue: eslintPluginVue,
            '@stylistic': stylistic,
            import: eslintPluginImport,
        },
        rules: {
            'vue/html-indent': ['error', 4],
            'vue/no-multiple-objects-in-class': 'error',
            'vue/prefer-separate-static-class': 'error',
            'vue/no-empty-component-block': 'error',
            'vue/component-name-in-template-casing': 'error',
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/indent': ['error', 4],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/curly-newline': ['error', 'always'],
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/comma-spacing': 'error',
            'import/no-duplicates': 'error',
        },
    },
)

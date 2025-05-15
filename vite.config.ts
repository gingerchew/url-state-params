// @ts-ignore
import { dirname, resolve } from 'node:path'
// @ts-ignore
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import RollupPluginTerser from '@rollup/plugin-terser';

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [
        {
            ...RollupPluginTerser({
                mangle: {
                    properties: {
                        regex: /^_/
                    }
                }
            }),
            enforce: 'post',
            apply: 'build'
        }
    ],
    build: {
        target: 'ES2024',
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'URLStateParams',
            // the proper extensions will be added
            fileName: 'url-state-params',
        },
    },
})
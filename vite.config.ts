import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

export default {
    plugins: [
        vue(),
        svgLoader(),
    ],
    base: '/order-book/',
    resolve: {
        alias: {
            '@': '/src',
            'vue': 'vue/dist/vue.esm-bundler.js',
        },
    },
}

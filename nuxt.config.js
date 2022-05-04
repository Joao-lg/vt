export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'virtual-tour-template',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
      },
    ],
    script: [
      { src: 'https://aframe.io/releases/1.0.4/aframe.min.js' },
      { src: '/js/a-frame-touch-look-controls.js' },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/scss/app.scss',
    '@/assets/scss/animations.scss',
    '@/assets/scss/typography.scss',
    '@/assets/scss/buttons.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxt/image',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxt/image', '@nuxtjs/style-resources', '@nuxtjs/i18n'],
  styleResources: {
    scss: ['./assets/scss/*.scss'],
  },
  i18n: {
    locales: [
      { code: 'pt', file: 'pt.js' },
      { code: 'en', file: 'en.js' },
    ],
    lazy: true,
    defaultLocale: 'pt',
    langDir: 'langs/',
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}

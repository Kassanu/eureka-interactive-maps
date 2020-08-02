module.exports = {
    theme: {
        inset: {
            '0': 0,
            '-1': '-1px',
            auto: 'auto',
            '1/2': '50%',
        }
    },
    variants: {},
    plugins: [],
    purge: {
        enabled: false,
        content: [ `./public/**/*.html`, `./src/**/*.vue` ],
        defaultExtractor (content) {
          const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
          return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
        },
        whitelist: [],
        whitelistPatterns: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
    }
}
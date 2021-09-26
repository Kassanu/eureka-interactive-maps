process.env.VUE_APP_VERSION = require('./package.json').version;

const SitemapPlugin = require('sitemap-webpack-plugin').default;

const paths = [
    {
        path: '#/',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/contribute',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/changelog',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/anemos',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/anemos/editor',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/pagos',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/pagos/editor',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/pyros',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/pyros/editor',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/hydatos',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/hydatos/editor',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/bozjansouthernfront',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
    {
        path: '#/bozjansouthernfront/editor',
        lastmod: new Date().toISOString().slice(0, 10),
        priority: '0.8',
        changefreq: 'daily'
    },
];

module.exports = {
    publicPath: '/',
    css: {
        extract: true
    },
    configureWebpack: {
        plugins: [
            new SitemapPlugin('https://www.ffxiv-interactive-eureka-maps.com', paths, {
                filename: 'sitemap.xml',
                lastmod: true,
                changefreq: 'daily',
                priority: '0.8'
            })
        ]
    }
}
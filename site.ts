import { zoneSlugs } from './zones'

export const SITE_NAME = 'FFXIV Interactive Eureka Maps'
export const SITE_ORIGIN = 'https://www.ffxiv-interactive-eureka-maps.com'

// The map routes are dynamic, so the crawler cannot find them by shape. Naming them from the
// registry is what keeps a zone added there from shipping unprerendered.
export const CONTENT_PATHS = ['/', '/contribute', '/changelog', ...zoneSlugs.map(slug => `/map/${slug}`)]

// Prerendered like everything else, and deliberately absent from the sitemap: the editor is how a
// contributor produces a file, not a page to send a searcher to.
export const EDITOR_PATHS = zoneSlugs.map(slug => `/map/${slug}/edit`)

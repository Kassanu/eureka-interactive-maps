import { DEFAULT_LOCALE, LOCALES } from '../i18n/locales'
import {
  share,
  type CoverageReport,
  type Gap,
  type GameTextCoverage,
  type LocaleCoverage,
  type TranslatedTextCoverage,
} from '../model/coverage'

type Coverage = GameTextCoverage | TranslatedTextCoverage

interface Source {
  title: string
  of: (coverage: LocaleCoverage) => Coverage
}

export interface ReportOptions {
  zoneName: (slug: string) => string
  generatedAt: Date
}

const STYLE = `
:root { color-scheme: light dark; font-family: system-ui, sans-serif; }
body { max-width: 64rem; margin: 2rem auto; padding: 0 1rem; }
table { border-collapse: collapse; }
th, td { padding: 0.3rem 0.8rem; text-align: right; border-bottom: 1px solid #8884; }
th:first-child, tbody th[colspan] { text-align: left; }
tbody th[colspan] { padding-top: 1.2rem; }
td.full { background: #2e7d3233; }
td.part { background: #f9a82533; }
td.low { background: #c6282833; }
.muted, code { color: #888; }
li { margin: 0.15rem 0; }
`

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)
}

export function renderCoverage(report: CoverageReport, { zoneName, generatedAt }: ReportOptions): string {
  const zones: Source[] = Object.keys(report[DEFAULT_LOCALE].zones).map(slug => ({
    title: zoneName(slug),
    of: coverage => coverage.zones[slug]!,
  }))
  const siteWide: Source[] = [
    { title: 'Drops', of: coverage => coverage.drops },
    { title: 'Term tables', of: coverage => coverage.terms },
    { title: 'UI text', of: coverage => coverage.ui },
  ]

  const header = LOCALES
    .map(locale => `<th>${escapeHtml(locale.code)} <span class="muted">${escapeHtml(locale.name)}</span></th>`)
    .join('')

  const rows = (sources: Source[]) => sources.map(source => {
    const cells = LOCALES.map(({ code }) => cell(source.of(report[code]))).join('')
    return `<tr><th>${escapeHtml(source.title)}</th>${cells}</tr>`
  }).join('\n')

  const details = [...zones, ...siteWide].map(source => detail(report, source)).join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Translation coverage</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Translation coverage</h1>
<p class="muted">Generated ${escapeHtml(generatedAt.toISOString())}</p>
<p>Entity files and drops hold the game's own text. A gap there needs a hand fill only where the game
has no text, and waits for <code>update</code> on an entry with no gameId yet. A gap in the term
tables or the UI text is translation work waiting for a person.</p>
<table>
<thead><tr><th>Source</th>${header}</tr></thead>
<tbody>
<tr><th colspan="${LOCALES.length + 1}">Entity files, per zone</th></tr>
${rows(zones)}
<tr><th colspan="${LOCALES.length + 1}">Site-wide</th></tr>
${rows(siteWide)}
</tbody>
</table>
${details}
</body>
</html>
`
}

function cell(coverage: Coverage): string {
  const percent = share(coverage)
  const band = percent === 100 ? 'full' : percent >= 50 ? 'part' : 'low'
  return `<td class="${band}">${coverage.held}/${coverage.entries} <b>${percent}%</b></td>`
}

function gapLists(coverage: Coverage): [string, Gap[]][] {
  return 'handFill' in coverage
    ? [['Needs a hand fill', coverage.handFill], ['Waits for update', coverage.awaitingUpdate]]
    : [['Untranslated', coverage.untranslated]]
}

function detail(report: CoverageReport, source: Source): string {
  const locales = LOCALES.flatMap(({ code, name }) => {
    const lists = gapLists(source.of(report[code])).filter(([, gaps]) => gaps.length > 0)
    if (lists.length === 0) return []
    const missing = lists.reduce((sum, [, gaps]) => sum + gaps.length, 0)
    const body = lists.map(([title, gaps]) => `<h3>${escapeHtml(title)}</h3>\n<ul>\n${
      gaps.map(gap).join('\n')
    }\n</ul>`).join('\n')
    return [`<details>\n<summary>${escapeHtml(code)} ${escapeHtml(name)}: ${missing} missing</summary>\n${body}\n</details>`]
  })
  if (locales.length === 0) return ''
  return `<section>\n<h2>${escapeHtml(source.title)}</h2>\n${locales.join('\n')}\n</section>`
}

function gap({ group, key, english }: Gap): string {
  return `<li><span class="muted">${escapeHtml(group)}</span> ${escapeHtml(english)} <code>${escapeHtml(key)}</code></li>`
}

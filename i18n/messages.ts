export type Messages = { [key: string]: string | Messages }

export function flatten(messages: Messages, prefix = ''): Map<string, string> {
  const flat = new Map<string, string>()
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') flat.set(path, value)
    else for (const [nested, text] of flatten(value, path)) flat.set(nested, text)
  }
  return flat
}

// The three field operations. A zone names one of these keys and inherits the sections and
// filters its module declares.
export const operations = {
  eureka: { name: 'The Forbidden Land, Eureka', levelLabel: 'Level' },
  bozja: { name: 'Save the Queen: Blades of Gunnhildr', levelLabel: 'Level' },
  occult: { name: 'Occult Crescent', levelLabel: 'Knowledge Level' },
} as const

export type OperationKey = keyof typeof operations

export const operationKeys = Object.keys(operations) as OperationKey[]

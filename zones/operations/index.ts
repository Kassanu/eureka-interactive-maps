import type { Text } from '../../i18n/translate'

// The three field operations. A zone names one of these keys and inherits the sections and
// filters its module declares. `levelLabel` is the operation's own word for a level, which the
// Occult zones call a Knowledge Level.
export const operations = {
  eureka: {
    name: t => t('operations.eureka'),
    levelLabel: t => t('fields.level'),
  },
  bozja: {
    name: t => t('operations.bozja'),
    levelLabel: t => t('fields.level'),
  },
  occult: {
    name: t => t('operations.occult'),
    levelLabel: t => t('fields.knowledgeLevel'),
  },
} satisfies Record<string, { name: Text; levelLabel: Text }>

export type OperationKey = keyof typeof operations

export const operationKeys = Object.keys(operations) as OperationKey[]

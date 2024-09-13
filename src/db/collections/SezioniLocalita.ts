import type { CollectionConfig } from 'payload'
import { Collections } from '.'
import * as F from '@/db/fields'

export const SezioneLocalita: CollectionConfig = {
  slug: Collections.SezioneLocalita,
  labels: {
    singular: 'Sezione località',
    plural: 'Sezioni località',
  },
  admin: {
    useAsTitle: F.name.name,
  },
  access: {
    read: () => true,
  },
  fields: [F.name, F.relation('localita', 'localita')],
}

import type { CollectionConfig } from 'payload'
import { Collections } from '.'
import * as F from '@/db/fields'

export const Localita: CollectionConfig = {
  slug: Collections.Localita,
  labels: {
    singular: 'Località',
    plural: 'Località',
  },
  admin: {
    useAsTitle: F.name.name,
  },
  access: {
    read: () => true,
  },
  fields: [F.name],
}

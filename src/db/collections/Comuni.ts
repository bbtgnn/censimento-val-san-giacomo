import type { CollectionConfig } from 'payload'
import { Collections } from '.'
import * as F from '@/db/fields'

export const Comuni: CollectionConfig = {
  slug: Collections.Comuni,
  labels: {
    singular: 'Comune',
    plural: 'Comuni',
  },
  admin: {
    useAsTitle: F.name.name,
  },
  access: {
    read: () => true,
  },
  fields: [{ ...F.name, required: true }],
}

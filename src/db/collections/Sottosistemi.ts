import type { CollectionConfig } from 'payload'
import { Collections } from '.'
import * as F from '@/db/fields'

export const Sottosistemi: CollectionConfig = {
  slug: Collections.Sottosistemi,
  labels: {
    singular: 'Sottosistema',
    plural: 'Sottosistemi',
  },
  admin: {
    useAsTitle: F.name.name,
  },
  access: {
    read: () => true,
  },
  fields: [
    { ...F.name, required: true },
    { ...F.relation('comuni', 'comune'), required: true },
    F.relation('sottosistemi', 'sottosistema_storico'),
  ],
}

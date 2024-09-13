import type { CollectionConfig } from 'payload'
import { Collections } from '.'

export const Media: CollectionConfig = {
  slug: Collections.Media,
  access: {
    read: () => true,
  },
  fields: [],
  upload: true,
}

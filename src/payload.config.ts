// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './db/collections/Users'
import { Media } from './db/collections/Media'
import { Edifici } from './db/collections/Edifici'
import { Sottosistemi } from './db/collections/Sottosistemi'
import { Localita } from './db/collections/Localita'
import { SezioneLocalita } from './db/collections/SezioniLocalita'
import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Edifici, Sottosistemi, Localita, SezioneLocalita],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        [Media.slug]: {
          disableLocalStorage: true,
          prefix: 'media',
        },
      },
      disableLocalStorage: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
        endpoint: process.env.S3_ENDPOINT || '',
        region: process.env.S3_REGION || '',
      },
    }),
  ],
})

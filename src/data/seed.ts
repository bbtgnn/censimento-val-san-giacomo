import { getPayload } from 'payload'
import config from '@payload-config'
import { parse } from 'csv-parse'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const seed = async () => {
  const payload = await getPayload({ config })

  const x = parse(path.resolve(dirname, 'Località 21d4a028e5f74a73945c97425931e83f_all.csv'))

  const page = await payload.create({
    collection: 'edifici',
    data: {},
  })
}

await seed()

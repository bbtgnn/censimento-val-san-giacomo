import payload from 'payload'
import path from 'path'
import dotenv from 'dotenv'
import config from '../payload.config'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../.env'),
})

const { PAYLOAD_SECRET } = process.env

const doAction = async () => {
  if (!PAYLOAD_SECRET) return

  await payload.init({ config })

  await payload.create({
    collection: 'edifici',
    data: {
      dati_lavoro: {
        imu_2021: 'ok',
      },
    },
  })

  console.log('0ok')
}

doAction()

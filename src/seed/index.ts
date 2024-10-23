import { getPayload } from 'payload'
import config from '@payload-config'
import { createComuni } from './comuni'
import { createSottosistemi } from './sottosistemi'
import { createLocalita } from './localita'
import { createEdifici } from './edifici'
import { clearDb } from './utils'

/* Procedure */

const payload = await getPayload({ config })
await clearDb(payload)
const comuni = await createComuni(payload)
const sottosistemi = await createSottosistemi(payload, comuni)
const localita = await createLocalita(payload, sottosistemi)
const edifici = await createEdifici(payload, localita)
process.exit(0)

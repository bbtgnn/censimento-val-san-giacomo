import { Comuni } from '@/payload-types'
import { csvOptions, dataPath, parseString, readCsv } from './utils'
import { BasePayload } from 'payload'
import { pipe, Array as A } from 'effect'

//

export async function createComuni(payload: BasePayload): Promise<Comuni[]> {
  const comuni_csv = await readCsv(dataPath('Comuni.csv'), csvOptions)

  const comuni = await pipe(
    comuni_csv,
    A.map((datum) => {
      const name = parseString(datum, 'Denominazione')
      return payload.create({
        collection: 'comuni',
        data: { name },
      })
    }),
    (data) => Promise.all(data),
  )

  return comuni
}

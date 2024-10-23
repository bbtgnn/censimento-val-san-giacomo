import { Comuni, Sottosistemi } from '@/payload-types'
import { BasePayload } from 'payload'
import { csvOptions, dataPath, parseString, readCsv, removeNotionUrl } from './utils'
import { pipe, Array as A } from 'effect'

//

export async function createSottosistemi(
  payload: BasePayload,
  comuni: Comuni[],
): Promise<Sottosistemi[]> {
  const sottosistemi_csv = await readCsv(dataPath('Sottosistemi territoriali.csv'), csvOptions)

  const sottosistemi = await pipe(
    sottosistemi_csv,
    A.map((datum) => {
      const name = parseString(datum, 'Denominazione')
      const comune_nome = removeNotionUrl(parseString(datum, 'Comune'))
      const comune = comuni.find((c) => c.name == comune_nome)
      if (!comune) throw new Error('comune not found')
      return payload.create({
        collection: 'sottosistemi',
        data: { name, comune: comune.id },
      })
    }),
    (data) => Promise.all(data),
  )

  const conversioni = {
    Andossi: 'Pianazzo',
    Teggiate: 'Pianazzo',
    Rasdeglia: 'Pianazzo',
    Montespluga: 'Madesimo',
  }

  for (const [src_name, dest_name] of Object.entries(conversioni)) {
    const src = sottosistemi.find((s) => s.name == src_name)
    const dest = sottosistemi.find((s) => s.name == dest_name)
    if (src && dest) {
      await payload.update({
        collection: 'sottosistemi',
        id: src.id,
        data: {
          sottosistema_storico: dest.id,
        },
      })
    }
  }

  return sottosistemi
}

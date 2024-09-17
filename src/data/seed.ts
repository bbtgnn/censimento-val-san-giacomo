import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as csv from '@fast-csv/parse'
import { Array as A, Effect, pipe, String as S } from 'effect'
import {
  stati_censimento_1807,
  stati_conservazione,
  stati_utilizzo,
  tag_moderni,
  tag_storici_1853,
  tag_storici_1951,
} from '@/db/collections/Edifici.utils'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

//

await seed()

/* Process */

async function seed() {
  const payload = await getPayload({ config })

  // Cleanup

  await pipe(
    ['edifici', 'sottosistemi', 'localita', 'sezione_localita'] satisfies CollectionSlug[],
    A.map((slug) =>
      Effect.promise(() =>
        payload.delete({
          collection: slug,
          where: { id: { exists: true } },
        }),
      ),
    ),
    Effect.all,
    Effect.runPromise,
  )

  //

  const csvOptions: csv.ParserOptionsArgs = {
    delimiter: ';',
    headers: true,
  }

  const sottosistemi_data = await readCsv(filePath('sottosistemi.csv'), csvOptions)
  const sottosistemi_list = await pipe(
    sottosistemi_data,
    A.map((datum) => {
      const name = parseString(datum, 'Denominazione')
      return payload.create({
        collection: 'sottosistemi',
        data: { name },
      })
    }),
    (data) => Promise.all(data),
  )

  const localita_data = await readCsv(filePath('localita.csv'), csvOptions)
  const localita_list = await pipe(
    localita_data,
    A.map((datum) => {
      const name = parseString(datum, 'Denominazione').trim()
      const nome_sottosistema = removeNotionUrl(parseString(datum, 'Sottosistema'))
      const sottosistema = sottosistemi_list.find((sott) => sott.name?.trim() === nome_sottosistema)

      return payload.create({
        collection: 'localita',
        data: { name, sottosistema: sottosistema?.id },
      })
    }),
    (data) => Promise.all(data),
  )

  const edifici_data = await readCsv(filePath('edifici.csv'), csvOptions)

  const sezioni_localita_list = await pipe(
    edifici_data,
    A.map((datum) => {
      const localita = parseString(datum, 'Località')
      const sezione_localita = parseString(datum, 'sezione località')
      return { localita, sezione_localita }
    }),
    A.dedupeWith((a, b) => a.sezione_localita == b.sezione_localita),
    A.filter((datum) => S.isNonEmpty(datum.sezione_localita)),
    A.map((datum) => {
      const nome = datum.sezione_localita
      const nome_localita = removeNotionUrl(datum.localita)
      const localita = localita_list.find((l) => l.name == nome_localita)

      return payload.create({
        collection: 'sezione_localita',
        data: {
          name: nome,
          localita: localita?.id,
        },
      })
    }),
    (data) => Promise.all(data),
  )

  const edifici = await pipe(
    edifici_data,
    A.map((datum) => {
      const localita_nome = removeNotionUrl(parseString(datum, 'Località'))
      const localita = localita_list.find((loc) => loc.name === localita_nome)
      const sezione_localita_nome = parseString(datum, 'sezione località')
      const sezione_localita = sezioni_localita_list.find(
        (sez) => sez.name === sezione_localita_nome,
      )

      const destinazioni_uso_1951 = pipe(
        parseString(datum, 'dest uso 1950')
          .split(',')
          .map((s) => s.trim()),
        A.intersection(tag_storici_1951),
      )

      const destinazioni_uso_1853 = pipe(
        parseString(datum, 'dest uso 1853')
          .split(',')
          .map((s) => s.trim()),
        A.intersection(tag_storici_1853),
      )

      const destinazioni_uso_2022 = pipe(
        parseString(datum, 'destinazione_uso_attuale')
          .split(',')
          .map((s) => s.trim()),
        A.intersection(tag_moderni),
      )

      const stato_1807 = stati_censimento_1807.find((s) => s == parseString(datum, 'cat 1807'))

      const stati_conservazione_globale = pipe(
        parseString(datum, 'stato_conservazione_globale').split(',').map(S.trim),
        A.intersection(stati_conservazione),
      )

      return payload.create({
        collection: 'edifici',
        data: {
          localita: localita?.id,
          sezione_localita: sezione_localita?.id,
          anagrafica: [
            {
              anno: '2022',
              particella: parseString(datum, 'cat 2022'),
              stato_utilizzo: stati_utilizzo.find(
                (s) => s == parseString(datum, 'stato_utilizzo_attuale'),
              ),
              destinazioni_uso: destinazioni_uso_2022.map((tag_moderno) => ({ tag_moderno })),
              stato_conservazione: stati_conservazione_globale,
            },
            {
              anno: '1951',
              particella: parseString(datum, 'cat 1951'),
              destinazioni_uso: destinazioni_uso_1951.map((tag_storico) => ({ tag_storico })),
              stato: 'presente',
            },
            {
              anno: '1853',
              particella: parseString(datum, 'cat 1853'),
              destinazioni_uso: destinazioni_uso_1853.map((tag_storico) => ({ tag_storico })),
              stato: 'presente',
            },
            {
              anno: '1807',
              stato: stato_1807,
            },
          ],
        },
      })
    }),
    (data) => Promise.all(data),
  )

  process.exit(0)
}

/* -- Utils -- */

function readCsv(
  csvPath: string,
  options: csv.ParserOptionsArgs = {},
): Promise<Array<Record<string, unknown>>> {
  const data: Record<string, unknown>[] = []
  return new Promise((resolve) => {
    csv
      .parseFile(csvPath, options)
      .on('data', (localita) => data.push(localita))
      .on('end', () => resolve(data))
  })
}

function filePath(name: string) {
  return path.resolve(dirname, name)
}

function removeNotionUrl(string: string) {
  return string.split(' (').at(0)?.trim() ?? ''
}

function parseString(record: Record<string, unknown>, key: string) {
  if (!(key in record)) throw new Error('No key in record')
  return String(record[key]).trim()
}

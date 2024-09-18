import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as csv from '@fast-csv/parse'
import { Array as A, Effect, Option, pipe, String as S } from 'effect'
import {
  accessibilita_edificio,
  fenomeni_degrado_strutturali,
  materiali_strutturali,
  stati_censimento_1807,
  stati_conservazione,
  stati_utilizzo,
  tag_moderni,
  tag_storici_1853,
  tag_storici_1951,
  tecniche_costruttive_strutturali,
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

      return payload.create({
        collection: 'edifici',
        data: {
          localita: localita?.id,
          sezione_localita: sezione_localita?.id,
          anagrafica: [
            {
              anno: '2022',
              particella: parseString(datum, 'cat 2022'),
              stato_utilizzo: find(parseString(datum, 'stato_utilizzo_attuale'), stati_utilizzo),

              destinazioni_uso: intersect(
                parseStringArray(datum, 'destinazione_uso_attuale'),
                tag_moderni,
              ).map((tag_moderno) => ({ tag_moderno })),

              stato_conservazione: intersect(
                parseStringArray(datum, 'stato_conservazione_globale'),
                stati_conservazione,
              ),

              accessibilita: intersect(
                parseStringArray(datum, 'accessibilità'),
                accessibilita_edificio,
              ),
            },
            {
              anno: '1951',
              particella: parseString(datum, 'cat 1951'),
              stato: 'presente',
              destinazioni_uso: intersect(
                parseStringArray(datum, 'dest uso 1950'),
                tag_storici_1951,
              ).map((tag_storico) => ({ tag_storico })),
            },
            {
              anno: '1853',
              particella: parseString(datum, 'cat 1853'),
              stato: 'presente',
              destinazioni_uso: intersect(
                parseStringArray(datum, 'dest uso 1853'),
                tag_storici_1853,
              ).map((tag_storico) => ({ tag_storico })),
            },
            {
              anno: '1807',
              stato: find(parseString(datum, 'cat 1807'), stati_censimento_1807),
            },
          ],
          analisi_strutturale: [
            {
              componente: 'componenti strutturali verticali',
              materiali: intersect(
                parseStringArray(datum, 'componenti strutturali verticali - materiale'),
                materiali_strutturali['componenti strutturali verticali'],
              ),
              tecnica_costruttiva: find(
                parseString(datum, 'componenti verticali - tecnica costruttiva'),
                tecniche_costruttive_strutturali['componenti strutturali verticali'],
              ),
              stato_conservazione: find(
                parseString(datum, 'componenti verticali - conservazione'),
                stati_conservazione,
              ),
              fenomeni_degrado: intersect(
                parseStringArray(datum, 'componenti verticali - conservazione'),
                fenomeni_degrado_strutturali,
              ),
            },
            {
              componente: 'componenti strutturali orizzontali',
              materiali: intersect(
                parseStringArray(datum, 'componenti strutturali verticali - materiale'),
                materiali_strutturali['componenti strutturali verticali'],
              ),
              tecnica_costruttiva: find(
                parseString(datum, 'componenti verticali - tecnica costruttiva'),
                tecniche_costruttive_strutturali['componenti strutturali verticali'],
              ),
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

function parseStringArray(record: Record<string, unknown>, key: string, separator = ',') {
  return parseString(record, key).split(separator).map(S.trim)
}

function find<A extends readonly string[]>(string: string, array: A): A[number] | undefined {
  return array.find((s) => s == string)
}

function intersect<A extends readonly string[]>(strings: string[], array: A): A[number][] {
  return A.intersection(strings, array)
}

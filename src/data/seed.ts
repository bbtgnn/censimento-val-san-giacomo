import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as csv from '@fast-csv/parse'
import { Array as A, Effect, Option, pipe, String as S } from 'effect'
import {
  accessibilita_edificio,
  stati_censimento_1807,
  stati_conservazione,
  stati_utilizzo,
  destinazioni_uso_moderno,
  destinazioni_uso_1853,
  destinazioni_uso_1951,
  componenti_strutturali,
  caratteri_storico_culturali,
  componenti_architettoniche,
  pavimentazioni_esterne,
  impiantistica,
  opere_provvisionali,
  fenomeni_degrado_strutturali,
  vincoli_tutele,
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

  /* */

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

  /* */

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
                destinazioni_uso_moderno,
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
                destinazioni_uso_1951,
              ).map((tag_storico) => ({ tag_storico })),
            },
            {
              anno: '1853',
              particella: parseString(datum, 'cat 1853'),
              stato: 'presente',
              destinazioni_uso: intersect(
                parseStringArray(datum, 'dest uso 1853'),
                destinazioni_uso_1853,
              ).map((tag_storico) => ({ tag_storico })),
            },
            {
              anno: '1807',
              stato: find(parseString(datum, 'cat 1807'), stati_censimento_1807),
            },
          ],

          analisi_strutturale: [
            {
              componente: 'verticali',
              materiali: intersect(
                parseStringArray(datum, 'componenti strutturali verticali - materiale'),
                componenti_strutturali.verticali.materiali,
              ),
              tecnica_costruttiva: find(
                parseString(datum, 'componenti verticali - tecnica costruttiva'),
                componenti_strutturali.verticali.tecniche,
              ),
              stato_conservazione: find(
                parseString(datum, 'componenti verticali - conservazione'),
                stati_conservazione,
              ),
              fenomeni_degrado: intersect(
                parseStringArray(datum, 'fenomeni_degrado_strutturali_verticali'),
                fenomeni_degrado_strutturali,
              ),
            },
            {
              componente: 'coperture',
              materiali: intersect(
                parseStringArray(datum, 'componenti - coperture - materiale'),
                componenti_strutturali.coperture.materiali,
              ),
              tecnica_costruttiva: find(
                parseString(datum, 'componenti - coperture - tecnica costruttiva'),
                componenti_strutturali.coperture.tecniche,
              ),
              stato_conservazione: find(
                parseString(datum, 'componenti - coperture - conservazione'),
                stati_conservazione,
              ),
              fenomeni_degrado: intersect(
                parseStringArray(datum, 'fenomeni_degrado_strutturali_coperture'),
                fenomeni_degrado_strutturali,
              ),
            },
            {
              componente: 'orizzontali',
              materiali: intersect(
                parseStringArray(datum, 'componenti strutturali orizzontali - materiale'),
                componenti_strutturali.orizzontali.materiali,
              ),
              tecnica_costruttiva: find(
                parseString(datum, 'componenti strutturali orizzontali - tecnica costruttiva'),
                componenti_strutturali.orizzontali.tecniche,
              ),
              stato_conservazione: find(
                parseString(datum, 'componenti strutturali orizzontali - conservazione'),
                stati_conservazione,
              ),
            },
            {
              componente: 'fondazioni',
              materiali: intersect(
                parseStringArray(datum, 'componenti - fondazioni'),
                componenti_strutturali.fondazioni.materiali,
              ),
            },
          ],

          analisi_componenti_architettoniche: [
            {
              componente: 'finiture esterne',
              fronte: 'generale',
              tipologia: intersect(
                parseStringArray(datum, 'finiture esterne - tipologia'),
                componenti_architettoniche['finiture esterne'].tipologia,
              ),
              materiali: intersect(
                parseStringArray(datum, 'finiture esterne - dettaglio materiale intonaco'),
                componenti_architettoniche['finiture esterne'].materiali,
              ),
              stato_conservazione: find(
                parseString(datum, 'finiture esterne - conservazione'),
                stati_conservazione,
              ),
              fenomeni_degrado: intersect(
                parseStringArray(datum, 'fenomeni_degrado_finiture esterne'),
                componenti_architettoniche['finiture esterne'].fenomeni_degrado,
              ),
            },
          ],

          altro: {
            caratteri_storico_culturali: intersect(
              parseStringArray(datum, 'caratteri_storico_culturali'),
              caratteri_storico_culturali,
            ),

            pavimentazioni_esterne: intersect(
              parseStringArray(datum, 'pavimentazioni_esterne'),
              pavimentazioni_esterne,
            ),

            impiantistica: intersect(parseStringArray(datum, 'impiantistica'), impiantistica),

            opere_provvisionali: intersect(
              parseStringArray(datum, 'presenza_opere_provvisionali'),
              opere_provvisionali,
            ),

            vincoli_tutele: intersect(parseStringArray(datum, 'vincoli e tutele'), vincoli_tutele),
          },

          dati_lavoro: {
            altre_note: parseString(datum, 'note - da tenere'),
            imu_2021: parseStringArray(datum, 'IMU 2021 - da tenere').map((code) => ({ code })),
            tari_2021: parseString(datum, 'TARI 2021 - da tenere'),
          },

          immagini_url: parseStringArray(datum, 'Immagini_fotografie sopralluogo').map((url) => ({
            url,
          })),
        },
      })
    }),
    (data) => Promise.all(data),
  )

  /* */

  const edifici_kobo_breve_data = await readCsv(
    filePath('censimento-versione-breve.csv'),
    csvOptions,
  )

  const edifici_kobo_breve = await pipe(
    edifici_kobo_breve_data,
    A.filter((datum) => parseString(datum, 'NOTION') == 'NO'),
    A.map((datum) => {
      // TODO - Use
      const sottosistema = pipe(parseString(datum, 'sottosistema'), (nome_sottosistema) =>
        sottosistemi_list.find((sott) => sott.name == nome_sottosistema),
      )

      const particella = [
        parseString(datum, 'foglio catastale'),
        parseString(datum, 'particella catastale'),
      ].join('_')

      const destinazioni_uso = parseKoboMultiselect(
        destinazioni_uso_moderno,
        datum,
        "destinazione d'uso",
      )
      const stato_conservazione = parseKoboMultiselect(
        stati_conservazione,
        datum,
        'stato di conservazione generale',
      )
      const stato_utilizzo = parseKoboMultiselect(stati_utilizzo, datum, 'stato di utilizzo').at(0)

      return payload.create({
        collection: 'edifici',
        data: {
          anagrafica: [
            {
              anno: '2022',
              particella,
              destinazioni_uso: destinazioni_uso.map((tag_moderno) => ({ tag_moderno })),
              stato_utilizzo,
              stato_conservazione,
            },
          ],

          immagini_url: [parseString(datum, 'generale_URL')].map((url) => ({ url })),

          dati_lavoro: {
            altre_note: parseString(datum, 'note'),
          },
        },
      })
    }),
    (data) => Promise.all(data),
  )

  /* */

  // const edifici_kobo_lungo_data = await readCsv(
  //   filePath('censimento-versione-lunga.csv'),
  //   csvOptions,
  // )

  // const edifici_kobo_lungo = await pipe(
  //   edifici_kobo_lungo_data,
  //   A.map((datum) => {
  //     const particella = [
  //       parseString(datum, 'foglio catastale'),
  //       parseString(datum, 'particella catastale'),
  //     ].join('_')

  //     const [lat, lon, alt, gps] = parseString(datum, 'geolocalizzazione')
  //       .split(' ')
  //       .map(S.trim)
  //       .map(Number)

  //     const localita = pipe(parseString(datum, 'località'), (nome_localita) =>
  //       localita_list.find((loc) => loc.name == nome_localita),
  //     )

  //     // TODO - Use
  //     const sottosistema = pipe(parseString(datum, 'sottosistema'), (nome_sottosistema) =>
  //       sottosistemi_list.find((sott) => sott.name == nome_sottosistema),
  //     )

  //     const stati_utilizzo_rilevati = parseKoboMultiselect(
  //       stati_utilizzo,
  //       datum,
  //       'stato di utilizzo',
  //     )

  //     const destinazioni_uso = parseKoboMultiselect(
  //       destinazioni_uso_moderno,
  //       datum,
  //       "destinazione d'uso",
  //     )

  //     return payload.create({
  //       collection: 'edifici',
  //       data: {
  //         geolocalizzazione: {
  //           coordinate: [lat, lon],
  //           altitudine: alt,
  //           precision: gps,
  //         },

  //         localita: localita?.id,

  //         anagrafica: [
  //           {
  //             anno: '2022',
  //             particella,
  //             accessibilita: parseKoboMultiselect(accessibilita_edificio, datum, 'accessibilità'),
  //             stato_utilizzo: stati_utilizzo_rilevati.at(0),
  //             stato_utilizzo_secondario: stati_utilizzo_rilevati.at(1),
  //             destinazioni_uso: destinazioni_uso.map((tag_moderno) => ({ tag_moderno })),
  //           },
  //         ],

  //         // analisi_strutturale: [
  //         //   {
  //         //     componente: 'verticali',
  //         //     materiali: parseKoboMultiselect(
  //         //       componenti_strutturali.verticali.materiali,
  //         //       datum,
  //         //       'materiale - tipologia_strutture verticali',
  //         //     ),
  //         //     tecnica_costruttiva: parseKoboMultiselect(
  //         //       componenti_strutturali.verticali.tecniche,
  //         //       datum,
  //         //       'tecnica costruttiva',
  //         //     ).at(0), // TODO - Review
  //         //     stato_conservazione: parseKoboMultiselect(
  //         //       stati_conservazione,
  //         //       datum,
  //         //       'stato di conservazione',
  //         //     ).at(0), // TODO - Review
  //         //     fenomeni_degrado: parseKoboMultiselect(
  //         //       fenomeni_degrado_strutturali,
  //         //       datum,
  //         //       'fenomeni di degrado',
  //         //     ),
  //         //   },

  //         //   {
  //         //     componente: 'orizzontali',
  //         //     materiali: parseKoboMultiselect(
  //         //       componenti_strutturali.orizzontali.materiali,
  //         //       datum,
  //         //       'materiale - tipologia_strutture orizzontali',
  //         //     ),
  //         //     tecnica_costruttiva: parseKoboMultiselect(
  //         //       componenti_strutturali.orizzontali.tecniche,
  //         //       datum,
  //         //       'tecnica costruttiva',
  //         //       '2',
  //         //     ).at(0),
  //         //     stato_conservazione: parseKoboMultiselect(
  //         //       stati_conservazione,
  //         //       datum,
  //         //       'stato di conservazione',
  //         //       '2',
  //         //     ).at(0),
  //         //   },
  //         // ],

  //         immagini_url: [
  //           parseString(datum, 'generale_URL'),
  //           parseString(datum, 'prospetto nord_URL'),
  //           parseString(datum, 'prospetto sud_URL'),
  //           parseString(datum, 'prospetto est_URL'),
  //           parseString(datum, 'prospetto ovest_URL'),
  //           parseString(datum, 'foto 1_URL'),
  //           parseString(datum, 'foto 2_URL'),
  //           parseString(datum, 'foto 3_URL'),
  //         ].map((url) => ({ url })),

  //         altro: {
  //           impiantistica: parseKoboMultiselect(impiantistica, datum, 'impiantistica'),
  //           opere_provvisionali: parseKoboMultiselect(
  //             opere_provvisionali,
  //             datum,
  //             'presenza opere provvisionali',
  //           ),
  //         },

  //         dati_lavoro: {
  //           altre_note: parseString(datum, 'note'),
  //         },
  //       },
  //     })
  //   }),
  //   (data) => Promise.all(data),
  // )

  /* */

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
  if (!(key in record)) throw new Error(`No key in record: ${key}`)
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

//

function parseKoboMultiselect<A extends readonly string[]>(
  array: A,
  datum: Record<string, unknown>,
  field: string,
  suffix: string | undefined = undefined,
): A[number][] {
  return array.filter((arrayItem) => {
    try {
      let path = `${field}/${arrayItem}`
      if (suffix) path += ` ${suffix}`
      return parseString(datum, path) == '1'
    } catch (e) {
      console.log((e as Error).message)
      return false
    }
  })
}

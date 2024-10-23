import { Sottosistemi, Localita } from '@/payload-types'
import { BasePayload } from 'payload'
import {
  csvOptions,
  dataPath,
  intersect,
  parseNumber,
  parseString,
  parseStringArray,
  readCsv,
  removeNotionUrl,
} from './utils'
import {
  accessibilita_principale,
  reti_servizi,
  viabilita_interna_materiali,
  viabilita_interna_tipi,
} from '@/db/collections/Localita.utils'
import { assert } from 'console'

//

export async function createLocalita(payload: BasePayload, sottosistemi: Sottosistemi[]) {
  const localita_csv = await readCsv(dataPath('Località.csv'), {
    ...csvOptions,
    delimiter: ';',
  })

  const localita_1988_csv = await readCsv(dataPath('1988-NAF.csv'), {
    ...csvOptions,
    delimiter: ',',
  })

  const localita_1988 = localita_1988_csv.map(
    (datum) =>
      ({
        ...datum,
        ['Località']: removeNotionUrl(parseString(datum, 'Località')),
      }) as Record<string, unknown>,
  )

  const localita: Localita[] = []

  for (const datum of localita_csv) {
    const name = parseString(datum, 'Denominazione')

    const sottosistemi_nomi = parseStringArray(datum, 'Sottosistema').map(removeNotionUrl)
    const sottosistemi_collegati = sottosistemi
      .filter((s) => sottosistemi_nomi.includes(s.name))
      .map((s) => s.id)

    const hide = sottosistemi_collegati.length === 0

    const slm = Number(parseString(datum, 'slm'))
    const codice_localita = Number(parseString(datum, 'Codice localita'))

    const abitanti_residenti_2022 = Number(parseString(datum, 'res 2022 - da verificare'))

    const viabilita = parseStringArray(datum, 'Viabilità interna')
    const viabilita_materiali = intersect(viabilita, viabilita_interna_materiali)
    const viabilita_tipi = intersect(viabilita, viabilita_interna_tipi)

    const accessibilita = intersect(
      parseStringArray(datum, 'Accessibilità principale'),
      accessibilita_principale,
    )
    const reti_e_servizi = parseStringArray(datum, 'Reti servizi presenti')
      .map((key) => reti_servizi[key as keyof typeof reti_servizi])
      .filter(Boolean)

    // 1988

    // TODO - Complete transfer
    const sottolocalita_1988 = localita_1988.filter((loc) => parseString(loc, 'Località') == name)
    const dati_1988: Dati1988[] = sottolocalita_1988.map((datum) => ({
      edifici_civili: parseNumber(datum, 'edifici civili'),
      edifici_rovina: parseNumber(datum, 'edifici in rovina'),
      edifici_rurali: parseNumber(datum, 'edifici rurali'),
      edifici_multifunzione: parseNumber(datum, 'edifici multifunzione'),
    }))

    //

    const loc = await payload.create({
      collection: 'localita',
      data: {
        name,
        sottosistemi: sottosistemi_collegati,
        slm,
        codice_localita,
        abitanti_residenti_2022,
        viabilita_interna_materiali: viabilita_materiali,
        viabilita_interna_tipi: viabilita_tipi,
        accessibilita_principale: accessibilita,
        reti_e_servizi,
        hide,
        dati_1988: dati_1988.length === 0 ? undefined : dati_1988,
      },
    })

    localita.push(loc)
  }

  return localita
}

type Dati1988 = NonNullable<Localita['dati_1988']>[number]

/* OLD CODE - Sezioni localita */

/* */

// const sezioni_localita_list = await pipe(
//   edifici_data,
//   A.map((datum) => {
//     const localita = parseString(datum, 'Località')
//     const sezione_localita = parseString(datum, 'sezione località')
//     return { localita, sezione_localita }
//   }),
//   A.dedupeWith((a, b) => a.sezione_localita == b.sezione_localita),
//   A.filter((datum) => S.isNonEmpty(datum.sezione_localita)),
//   A.map((datum) => {
//     const nome = datum.sezione_localita
//     const nome_localita = removeNotionUrl(datum.localita)
//     const localita = localita_list.find((l) => l.name == nome_localita)

//     return payload.create({
//       collection: 'sezione_localita',
//       data: {
//         name: nome,
//         localita: localita?.id,
//       },
//     })
//   }),
//   (data) => Promise.all(data),
// )

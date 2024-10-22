import { Edifici, Localita } from '@/payload-types'
import { BasePayload } from 'payload'
import {
  csvOptions,
  dataPath,
  find,
  intersect,
  parseString,
  parseStringArray,
  readCsv,
  removeNotionUrl,
} from './utils'
import {
  accessibilita_edificio,
  caratteri_storico_culturali,
  componenti_architettoniche,
  componenti_strutturali,
  DestinazioneUsoAttuale,
  DESTINAZIONI_USO_1853,
  DESTINAZIONI_USO_ATTUALI,
  impiantistica,
  opere_provvisionali,
  ParsedDestinazioneUso1853,
  pavimentazioni_esterne,
  STATI_CONSERVAZIONE,
  STATI_UTILIZZO,
  StatoUtilizzo,
  vincoli_tutele,
} from '@/db/collections/Edifici.utils'
import assert from 'node:assert'
import { Record, String as S } from 'effect'

//

export async function createEdifici(
  payload: BasePayload,
  localita: Localita[],
): Promise<Edifici[]> {
  const edifici_csv = await readCsv(dataPath('Edifici-v2.csv'), csvOptions)

  const edifici_promises = edifici_csv.map((datum) => {
    const localita_nome = removeNotionUrl(parseString(datum, 'Località'))
    const localita_record = localita.find((loc) => loc.name === localita_nome)
    if (!localita_record) throw new Error('missing localita record')
    const sezione_localita = parseString(datum, 'sezione località')

    // dati 1853

    const dest_uso_1853_keys = intersect(
      parseStringArray(datum, 'dest uso 1853').map(S.toLowerCase),
      Record.keys(DESTINAZIONI_USO_1853).map(S.toLowerCase),
    )

    type DestinazioneUso = NonNullable<
      NonNullable<Edifici['anagrafica']>[number]['destinazioni_uso']
    >[number]

    let stato_utilizzo: StatoUtilizzo | undefined = undefined

    const dest_uso_1853: DestinazioneUso[] = dest_uso_1853_keys.map((tag_storico) => {
      const data = Object.entries(DESTINAZIONI_USO_1853).find(
        ([k, v]) => k.toLowerCase() == tag_storico,
      )
      if (!data) throw new Error('missing data 1853')
      const dato_moderno = data[1] as DestinazioneUsoAttuale | ParsedDestinazioneUso1853
      const tag_moderno = typeof dato_moderno == 'string' ? dato_moderno : dato_moderno.moderno
      const nome = typeof dato_moderno == 'object' ? dato_moderno.label : tag_storico
      if (typeof dato_moderno == 'object' && dato_moderno.utilizzo)
        stato_utilizzo = dato_moderno.utilizzo

      return {
        tag_storico,
        tag_moderno,
        nome,
      }
    })

    const dest_uso_1853_extra = parseString(datum, 'dest uso 1853 - extra')

    const extra_1853 = dest_uso_1853_extra
      .split(';')
      .filter(S.isNonEmpty)
      .map(S.trim)
      .map(S.split('\n'))
      .flat()
      .map(S.trim)
      .map((s) => s.split('-').map(S.trim))
      .map((item) => {
        if (item.at(0)?.includes(',')) {
          const destinazione = item.at(1)
          assert(destinazione)
          const particelle = item
            .at(0)
            ?.split(',')
            .map(S.trim)
            .map((particella) => [particella, destinazione] as const)
          assert(particelle)
          return particelle
        } else {
          return [item] as [string, string][]
        }
      })
      .flat()
      .map((item) => {
        if (item.at(1)?.includes('+')) {
          const particella = item.at(0)
          const destinazioni = item.at(1)?.split('+').map(S.trim)
          assert(particella)
          assert(destinazioni)
          return destinazioni.map((d) => [particella, d] as const)
        } else return [item] as [string, string][]
      })
      .flat()

    assert(extra_1853.every((item) => item?.length == 2))

    return payload.create({
      collection: 'edifici',
      data: {
        localita: localita_record.id,
        sezione_localita,

        anagrafica: [
          {
            anno: '2022',
            particella: parseString(datum, 'cat 2022'),
            stato_utilizzo: find(parseString(datum, 'stato_utilizzo_attuale'), STATI_UTILIZZO),

            destinazioni_uso: intersect(
              parseStringArray(datum, 'destinazione_uso_attuale'),
              DESTINAZIONI_USO_ATTUALI,
            ).map((tag_moderno) => ({ tag_moderno })),

            stato_conservazione: intersect(
              parseStringArray(datum, 'stato_conservazione_globale'),
              STATI_CONSERVAZIONE,
            ),

            accessibilita: intersect(
              parseStringArray(datum, 'accessibilità'),
              accessibilita_edificio,
            ),
          },
          // {
          //   anno: '1951',
          //   particella: parseString(datum, 'cat 1951'),
          //   stato: 'presente',
          //   destinazioni_uso: intersect(
          //     parseStringArray(datum, 'dest uso 1950'),
          //     destinazioni_uso_1951,
          //   ).map((tag_storico) => ({ tag_storico })),
          // },
          {
            anno: '1853',
            particella: parseString(datum, 'cat 1853'),
            stato: 'presente',
            stato_utilizzo,
            destinazioni_uso: dest_uso_1853,
          },
          // {
          //   anno: '1807',
          //   stato: find(parseString(datum, 'cat 1807'), stati_censimento_1807),
          // },
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
              STATI_CONSERVAZIONE,
            ),
            // fenomeni_degrado: intersect(
            //   parseStringArray(datum, 'fenomeni_degrado_strutturali_verticali'),
            //   fenomeni_degrado_strutturali,
            // ),
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
              STATI_CONSERVAZIONE,
            ),
            // fenomeni_degrado: intersect(
            //   parseStringArray(datum, 'fenomeni_degrado_strutturali_coperture'),
            //   fenomeni_degrado_strutturali,
            // ),
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
              STATI_CONSERVAZIONE,
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
              STATI_CONSERVAZIONE,
            ),
            // fenomeni_degrado: intersect(
            //   parseStringArray(datum, 'fenomeni_degrado_finiture esterne'),
            //   componenti_architettoniche['finiture esterne'].fenomeni_degrado,
            // ),
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
  })

  return Promise.all(edifici_promises)
}

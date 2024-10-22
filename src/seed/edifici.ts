import { Edifici, Localita } from '@/payload-types'
import { BasePayload } from 'payload'
import {
  csvOptions,
  dataPath,
  find,
  GenericRecord,
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
  DestinazioneUso1853,
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
  const edifici_csv = await readCsv(dataPath('Edifici-v3.csv'), csvOptions)
  const edifici_promises = edifici_csv.map((datum) => createEdificio(payload, datum, localita))
  return Promise.all(edifici_promises)
}

function createEdificio(
  payload: BasePayload,
  datum: Record<string, unknown>,
  localita: Localita[],
): Promise<Edifici> {
  const localita_nome = removeNotionUrl(parseString(datum, 'Località'))
  const localita_record = localita.find((loc) => loc.name === localita_nome)
  assert(localita_record, 'missing località for edificio')
  const sezione_localita = parseString(datum, 'sezione località')

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
        expandAnagraficaSemplice(anagrafica_1853_base(datum)),
        ...anagrafiche_1853_extra(datum).map(expandAnagraficaSemplice),
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
}

//

type Anagrafica = NonNullable<Edifici['anagrafica']>[number]

type DestinazioneUso = NonNullable<Anagrafica['destinazioni_uso']>[number]

type AnagraficaSemplice1853 = {
  anno: string
  particella: string
  destinazioni_uso: DestinazioneUso1853[]
}

//

function anagrafica_1853_base(datum: GenericRecord): AnagraficaSemplice1853 {
  const destinazioni_uso = intersect(
    parseStringArray(datum, 'dest uso 1853').map(S.toLowerCase),
    Record.keys(DESTINAZIONI_USO_1853),
  )

  return {
    anno: '1853',
    particella: parseString(datum, 'cat 1853'),
    destinazioni_uso,
  }
}

//

function anagrafiche_1853_extra(datum: GenericRecord): AnagraficaSemplice1853[] {
  const dest_uso_1853_extra = parseString(datum, 'dest uso 1853 - extra')

  // formato : Array< "P,P - D+D ;\n P,P - D+D" >

  const particelle_multiple_con_destinazioni_uso_multiple = dest_uso_1853_extra
    .split(';')
    .filter(S.isNonEmpty)
    .map(S.trim)
    .map(S.split('\n')) // a volte compare "\n"
    .flat()
    .filter(S.isNonEmpty)
    .map(S.trim)

  // formato : Array< "P,P - D+D" >

  const particelle_multiple_con_destinazioni_uso_array: Array<{
    particelle: string
    destinazioni: DestinazioneUso1853[]
  }> = particelle_multiple_con_destinazioni_uso_multiple
    .map((s) => s.split('-').map(S.trim))
    .map((data) => {
      assert(data.length == 2)
      return {
        particelle: data[0],
        destinazioni: data[1]
          .split('+')
          .map(S.trim)
          .map((d) => {
            const tag = d == 'F' ? 'fienile' : d == 'P F' ? 'p fienile' : d.toLowerCase()
            assert(tag in DESTINAZIONI_USO_1853, `invalid: ${d}`)
            return tag as keyof typeof DESTINAZIONI_USO_1853
          }),
      }
    })

  // formato : Array<{ particelle: "P,P" , destinazioni: "D"[] }>

  const particella_singola_con_destinazioni_uso_array: AnagraficaSemplice1853[] =
    particelle_multiple_con_destinazioni_uso_array.flatMap((data) => {
      const particelle = data.particelle.split(',').map(S.trim)
      return particelle.map((p) => ({
        anno: '1853',
        particella: p,
        destinazioni_uso: data.destinazioni,
      }))
    })

  return particella_singola_con_destinazioni_uso_array
}

//

function expandAnagraficaSemplice(anagrafica_semplice: AnagraficaSemplice1853): Anagrafica {
  const { anno, particella } = anagrafica_semplice

  let stato_utilizzo: StatoUtilizzo | undefined = undefined

  const destinazioni_uso: DestinazioneUso[] = anagrafica_semplice.destinazioni_uso.map(
    (tag_storico) => {
      const data = DESTINAZIONI_USO_1853[tag_storico] as
        | DestinazioneUsoAttuale
        | ParsedDestinazioneUso1853
      assert(data, '1853')

      const tag_moderno = typeof data == 'string' ? data : data.moderno
      const nome = typeof data == 'object' ? data.label : tag_storico
      if (typeof data == 'object' && data.utilizzo) stato_utilizzo = data.utilizzo

      return {
        tag_storico,
        tag_moderno,
        nome,
      }
    },
  )

  return {
    particella,
    anno,
    stato_utilizzo,
    destinazioni_uso,
  }
}

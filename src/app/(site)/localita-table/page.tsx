import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { Edifici, Localita, Sottosistemi } from '@/payload-types'
import {
  ComponenteStrutturale,
  DestinazioneUsoAttuale,
  DESTINAZIONI_USO_ATTUALI,
  STATI_UTILIZZO,
} from '@/db/collections/Edifici.utils'
import { relation } from '@/utils/data'
import { Array, pipe, Record, String } from 'effect'
import assert from 'node:assert'

const payload = await getPayloadHMR({ config })

export default async function Page() {
  const localita_query = await payload.find({
    collection: 'localita',
    depth: 2,
    limit: 0,
  })

  const localita = localita_query.docs.filter(
    (loc) => loc.sottosistemi && loc.sottosistemi.length >= 1,
  )

  return (
    <div>
      <nav>
        <a href="/home">{'<- Back to home'}</a>
      </nav>
      <table>
        <thead>
          <th>Localita</th>
          <th>Comune</th>
          <th>Sottosistemi</th>
          <th>Sezioni</th>
          <th>Slm</th>
          <th>COD LOC</th>
          <th>N Edifici</th>
          <th>Dest uso non rilevabile</th>
          {DESTINAZIONI_USO_ATTUALI.map((d) => (
            <th key={d}>{d} 2022</th>
          ))}
          <th>Stato utilizzo non rilevabile</th>
          {STATI_UTILIZZO.map((d) => (
            <th key={d}>{d} 2022</th>
          ))}
        </thead>
        <tbody>
          {localita.map((e) => (
            <LocalitaCard key={e.id} localita={e} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

//

async function LocalitaCard({ localita }: { localita: Localita }) {
  const localita_nome = localita?.name
  const sottosistemi = localita.sottosistemi?.map(relation)
  const comuni = sottosistemi?.map((s) => s?.comune).map(relation)

  const edifici_query = await payload.find({
    collection: 'edifici',
    where: {
      localita: {
        equals: localita.id,
      },
    },
    limit: 0,
  })

  const edifici = edifici_query.docs.map(relation)

  if (edifici.length == 0) return <p></p>

  const sezioni_localita = Array.dedupe(edifici.map((e) => e?.sezione_localita))
    .filter(String.isString)
    .filter(String.isNonEmpty)

  // 2022

  const [destinazione_rilevabile, destinazione_non_rilevabile] = Array.partition(edifici, (e) => {
    const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
    assert(anagrafica_2022)
    assert(anagrafica_2022.destinazioni_uso)
    assert(anagrafica_2022.destinazioni_uso.at(0))
    const tag_moderni = anagrafica_2022.destinazioni_uso.map((d) => d.tag_moderno)
    let non_rilevabile = tag_moderni.includes('non rilevabile')
    return non_rilevabile ?? false
  })

  const edifici_raggruppati_per_destinazione_uso = pipe(
    destinazione_rilevabile,
    Array.flatMap((e) => {
      const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
      assert(anagrafica_2022)
      assert(anagrafica_2022.destinazioni_uso)
      assert(anagrafica_2022.destinazioni_uso.at(0))
      const tag_moderni = anagrafica_2022.destinazioni_uso
        .map((d) => d.tag_moderno)
        .filter((s) => typeof s == 'string')
      const tag_moderni_peso = tag_moderni.map((t) => ({
        edificio: e,
        tag_uso: t,
        peso: 1 / tag_moderni.length,
      }))
      return tag_moderni_peso
    }),
    Array.groupBy((item) => item.tag_uso),
  )

  const percentuali_destinazione_uso = pipe(
    edifici_raggruppati_per_destinazione_uso,
    Record.map((entries) => entries.reduce((prev, curr) => prev + curr.peso, 0)),
    Record.toEntries,
    (data) => data.sort((a, b) => b[1] - a[1]),
    Array.map(([string, number]) => [string, percent(number / destinazione_rilevabile.length)]),
  )

  // const sottopercentuali_destinazione_uso = pipe(
  //   edifici_raggruppati_per_destinazione_uso,
  //   Record.map((entries) => entries.map((e) => e.edificio)),
  //   Record.map((edifici) => {
  //     edifici.map((e) => {
  //       const anagrafica_2022 = e?.anagrafica?.find((a) => (a.anno = '2022'))
  //       assert(anagrafica_2022)
  //       const { stato_conservazione, stato_utilizzo } = anagrafica_2022
  //       assert(stato_conservazione)
  //       assert(stato_utilizzo, e?.particella)
  //     })
  //   }),
  // )

  const [utilizzo_rilevabile, utilizzo_non_rilevabile] = Array.partition(edifici, (e) => {
    const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
    assert(anagrafica_2022)
    const { stato_utilizzo } = anagrafica_2022
    return (
      stato_utilizzo == 'non rilevabile' ||
      stato_utilizzo == 'non presente' ||
      !Boolean(stato_utilizzo)
    )
  })

  const percentuali_stato_utilizzo = pipe(
    utilizzo_rilevabile,
    Array.map((e) => {
      const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
      assert(anagrafica_2022)
      const stato = anagrafica_2022.stato_utilizzo
      assert(stato)
      return stato
    }),
    Array.groupBy((item) => item),
    Record.map((v) => v.length),
    Record.toEntries,
    (data) => data.sort((a, b) => b[1] - a[1]),
    Array.map(([string, number]) => [string, percent(number / utilizzo_rilevabile.length)]),
  )

  const [conservazione_rilevabile, conservazione_non_rilevabile] = Array.partition(edifici, (e) => {
    const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
    assert(anagrafica_2022)
    const { stato_conservazione } = anagrafica_2022
    return (
      stato_conservazione == 'non presente' ||
      stato_conservazione == 'non rilevabile' ||
      stato_conservazione == 'nd' ||
      !Boolean(stato_conservazione)
    )
  })

  const percentuali_conservazione = pipe(
    conservazione_rilevabile,
    Array.map((e) => {
      const anagrafica_2022 = e?.anagrafica?.find((a) => a.anno == '2022')
      assert(anagrafica_2022)
      const stato = anagrafica_2022.stato_conservazione
      assert(stato)
      return stato
    }),
    Array.groupBy((item) => item),
    Record.map((v) => v.length),
    Record.toEntries,
    (data) => data.sort((a, b) => b[1] - a[1]),
    Array.map(([string, number]) => [string, percent(number / conservazione_rilevabile.length)]),
  )

  // 1853

  const anagrafiche_1853 = edifici
    .filter((e) => {
      const anagrafiche = e?.anagrafica?.filter((a) => a.anno == '1853') ?? []
      return Boolean(anagrafiche.length)
    })
    .flatMap((e) => {
      assert(e?.anagrafica)
      const anagrafiche = e.anagrafica.filter((a) => a.anno == '1853')
      assert(anagrafiche.length)
      const destinazioni: DestinazioneUsoAttuale[] = anagrafiche.flatMap((a) => {
        assert(a.destinazioni_uso)
        if (!a.destinazioni_uso.at(0)) return ['non rilevabile']
        return a.destinazioni_uso.map((d) => {
          assert(d.tag_moderno)
          return d.tag_moderno
        })
      })
      return destinazioni.map((d) => ({ tag: d, peso: 1 / destinazioni.length }))
    })

  const percentuali_destinazione_uso_1853 = pipe(
    anagrafiche_1853,
    Array.groupBy((item) => item.tag),
    Record.map((entries) => entries.reduce((prev, curr) => prev + curr.peso, 0)),
    Record.toEntries,
    (data) => data.sort((a, b) => b[1] - a[1]),
    Array.map(([string, number]) => [string, percent(number / anagrafiche_1853.length)]),
  )

  // 1988

  let percentuali_1988: Record<string, string> | undefined = undefined

  if (localita.dati_1988) {
    const reduceBase = {
      edifici_civili: 0,
      edifici_multifunzione: 0,
      edifici_rovina: 0,
      edifici_rurali: 0,
    }

    const x: typeof reduceBase = localita.dati_1988.reduce(
      (prev, curr) => ({
        edifici_civili: prev.edifici_civili + curr.edifici_civili,
        edifici_rovina: prev.edifici_rovina + curr.edifici_rovina,
        edifici_multifunzione: prev.edifici_multifunzione + curr.edifici_multifunzione,
        edifici_rurali: prev.edifici_rurali + curr.edifici_rurali,
      }),
      reduceBase,
    )

    const totale = Record.reduce(x, 0, (prev, curr) => prev + curr)

    const data = Record.mapKeys(x, (key): DestinazioneUsoAttuale => {
      switch (key) {
        case 'edifici_civili':
          return 'residenziale'
        case 'edifici_multifunzione':
          return 'multifunzione'
        case 'edifici_rovina':
          return 'non rilevabile'
        case 'edifici_rurali':
          return 'produttivo rurale'
      }
    })

    percentuali_1988 = Record.map(data, (v) => percent(v / totale))
  }

  //

  return (
    <tr>
      <td>{localita_nome}</td>
      <td>
        {Array.dedupe(comuni ?? [])
          .map((c) => c?.name)
          .join(', ')}
      </td>
      <td>{sottosistemi?.map((s) => s?.name).join(', ')}</td>
      <td>{sezioni_localita.join(', ')}</td>
      <td>{Boolean(localita.slm) ? localita.slm : 'nd'}</td>
      <td>{Boolean(localita.codice_localita) ? localita.codice_localita : 'nd'}</td>
      <td>{edifici.length}</td>
      <td>{percent(destinazione_non_rilevabile.length / edifici.length)}</td>
      {DESTINAZIONI_USO_ATTUALI.map((d) => {
        const x = percentuali_destinazione_uso.find(([tag]) => tag == d)
        return <td key={d}>{x ? x[1] : '0%'}</td>
      })}
      <td>{percent(utilizzo_non_rilevabile.length / edifici.length)}</td>
      {STATI_UTILIZZO.map((d) => {
        const x = percentuali_stato_utilizzo.find(([tag]) => tag == d)
        return <td key={d}>{x ? x[1] : '0%'}</td>
      })}
    </tr>

    //   <div>
    //     <p>
    //       Edifici con stato di utilizzo non rilevabile: {utilizzo_non_rilevabile.length} (
    //       )
    //     </p>
    //     <p>Percentuali stato di utilizzo degli edifici rilevabili:</p>
    //     <ul>
    //       {percentuali_stato_utilizzo.map(([tag, percent]) => (
    //         <li key={tag}>
    //           {tag} - {percent}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   <div>
    //     <p>
    //       Edifici con stato di conservazione non rilevabile: {conservazione_non_rilevabile.length} (
    //       {percent(conservazione_non_rilevabile.length / edifici.length)})
    //     </p>
    //     <p>Percentuali stato di conservazione degli edifici rilevabili:</p>
    //     <ul>
    //       {percentuali_conservazione.map(([tag, percent]) => (
    //         <li key={tag}>
    //           {tag} - {percent}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   {percentuali_1988 && (
    //     <div>
    //       <h2>Censimento 1988</h2>
    //       <div>
    //         <p>Percentuali destinazione d'uso</p>
    //         <ul>
    //           {Object.entries(percentuali_1988).map(([tag, percent]) => (
    //             <li key={tag}>
    //               {tag} - {percent}
    //             </li>
    //           ))}
    //         </ul>
    //       </div>
    //     </div>
    //   )}

    //   <h2>Censimento 1853</h2>

    //   <div>
    //     <p>Percentuali destinazione d&apos;uso</p>
    //     <ul>
    //       {percentuali_destinazione_uso_1853.map(([tag, percent]) => (
    //         <li key={tag}>
    //           {tag} - {percent}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // </div>
  )
}

function percent(number: number) {
  return `${Math.round(number * 100)}%`
}

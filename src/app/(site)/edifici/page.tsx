import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { Edifici } from '@/payload-types'
import { ComponenteStrutturale } from '@/db/collections/Edifici.utils'
import { relation } from '@/utils/data'

const payload = await getPayloadHMR({ config })

export default async function Page() {
  const edifici = await payload.find({
    collection: 'edifici',
    limit: 100,
  })

  return (
    <div>
      <nav>
        <a href="/home">{'<- Back to home'}</a>
      </nav>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Sottosistema</th>
            <th>Localita</th>
            <th>Cat 2022</th>
            <th>Cat 1951</th>
            <th>Dest uso 1951</th>
            <th>Cat 1853</th>
            <th>Dest uso 1853</th>
            <th>Cat 1807</th>
            <th>Destinazione uso attuale</th>
            <th>Stato utilizzo attuale</th>
          </tr>
        </thead>
        <tbody>
          {edifici.docs.map((e) => (
            <EdificioRow key={e.id} edificio={e} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

//

function EdificioRow({ edificio }: { edificio: Edifici }) {
  const localita = relation(edificio.localita)
  const localita_nome = localita?.name

  const anagrafica_2022 = getAnagraficaByYear(edificio, '2022')
  const cat_2022 = anagrafica_2022?.particella

  const anagrafica_1951 = getAnagraficaByYear(edificio, '1951')
  const cat_1951 = anagrafica_1951?.particella
  const destinazione_1951 = anagrafica_1951?.destinazioni_uso?.map((d) => d.tag_storico).join(', ')

  const anagrafica_1853 = getAnagraficaByYear(edificio, '1853')
  const cat_1853 = anagrafica_1853?.particella
  const destinazione_1853 = anagrafica_1853?.destinazioni_uso?.map((d) => d.tag_storico).join(', ')

  const anagrafica_1807 = getAnagraficaByYear(edificio, '1807')
  const cat_1807 = anagrafica_1807?.presenza_censimento_1087

  const destinazione_attuale = anagrafica_2022?.destinazioni_uso
    ?.map((d) => d.tag_moderno)
    .join(', ')
  const stato_utilizzo = anagrafica_2022?.stato_utilizzo

  const analisi_verticale = getAnalisiStrutturale(edificio, 'verticali')

  return (
    <tr>
      <td>{edificio.id}</td>
      <td>{localita_nome}</td>
      <td>{cat_2022}</td>
      <td>{cat_1951}</td>
      <td>{destinazione_1951}</td>
      <td>{cat_1853}</td>
      <td>{destinazione_1853}</td>
      <td>{cat_1807}</td>
      <td>{destinazione_attuale}</td>
      <td>{stato_utilizzo}</td>
    </tr>
  )
}

function getAnagraficaByYear(edificio: Edifici, anno: string) {
  return edificio.anagrafica?.find((a) => a.anno === anno)
}

function getAnalisiStrutturale(edificio: Edifici, componente: ComponenteStrutturale) {
  return edificio.analisi_strutturale?.find((d) => d.componente === componente)
}

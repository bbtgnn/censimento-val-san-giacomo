import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { Edifici, Localita, Sottosistemi } from '@/payload-types'

const payload = await getPayloadHMR({ config })

export default async function Page() {
  const edifici = await payload.find({
    collection: 'edifici',
    limit: 0,
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
  const localita = (edificio.localita as Localita)?.name
  const sottosistema = ((edificio.localita as Localita)?.sottosistema as Sottosistemi)?.name

  const anagrafica_2022 = getAnagraficaByYear(edificio, '2022')
  const cat_2022 = anagrafica_2022?.particella

  const anagrafica_1951 = getAnagraficaByYear(edificio, '1951')
  const cat_1951 = anagrafica_1951?.particella
  const destinazione_1951 = anagrafica_1951?.destinazioni_uso?.map((d) => d.tag_storico).join(', ')

  const anagrafica_1853 = getAnagraficaByYear(edificio, '1853')
  const cat_1853 = anagrafica_1853?.particella
  const destinazione_1853 = anagrafica_1853?.destinazioni_uso?.map((d) => d.tag_storico).join(', ')

  const anagrafica_1807 = getAnagraficaByYear(edificio, '1807')
  const cat_1807 = anagrafica_1807?.stato

  return (
    <tr>
      <td>{edificio.id}</td>
      <td>{sottosistema}</td>
      <td>{localita}</td>
      <td>{cat_2022}</td>
      <td>{cat_1951}</td>
      <td>{destinazione_1951}</td>
      <td>{cat_1853}</td>
      <td>{destinazione_1853}</td>
      <td>{cat_1807}</td>
    </tr>
  )
}

function getAnagraficaByYear(edificio: Edifici, anno: string) {
  return edificio.anagrafica?.find((a) => a.anno === anno)
}

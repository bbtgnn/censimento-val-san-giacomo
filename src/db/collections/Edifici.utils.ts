export const STATI_UTILIZZO = [
  'uso permanente',
  'uso temporaneo',
  'disuso',
  'disuso - rudere',
  'non rilevabile',
  'non presente',
] as const

export type StatoUtilizzo = (typeof STATI_UTILIZZO)[number]

export const STATI_CONSERVAZIONE = [
  'fenomeni di degrado diffusi',
  'fenomeni di degrado superficiali',
  'modifiche sostanziali caratteri tradizionali',
  'non presente',
  'non rilevabile',
  'perdita funzionalità',
  'senza fenomeni di degrado',
  'nd',
] as const

export const DESTINAZIONI_USO_ATTUALI = [
  'commerciale',
  'luogo di culto',
  'multifunzione',
  'non rilevabile',
  'produttivo',
  'produttivo rurale',
  'residenziale',
  'servizio',
  'verde', // Not in CSV, but used for 1853 conversion
  'servizio accessorio', // Not in CSV, but used for 1853 conversion
  'nd', // Not in CSV, but used for 1853 conversion
] as const

export type DestinazioneUsoAttuale = (typeof DESTINAZIONI_USO_ATTUALI)[number]

export const DESTINAZIONI_USO_1951 = [
  'PRATO',
  'NP',
  'URBANO',
  'FA URBANO',
  'PFA RURALE',
  'FA RURALE',
] as const

export const DESTINAZIONI_USO_1853 = {
  cantina: 'produttivo rurale',
  'cantina d': {
    moderno: 'produttivo rurale',
    label: 'cantina diroccata',
    utilizzo: 'disuso - rudere',
  },
  casa: 'residenziale',
  'casa abb': { moderno: 'residenziale', label: 'casa abbandonata', utilizzo: 'disuso' },
  'casa cantoniera': 'servizio',
  'casa coadiutorale': 'residenziale',
  'casa dir': { moderno: 'residenziale', label: 'casa diroccata', utilizzo: 'disuso - rudere' },
  'casa guardiano': 'residenziale',
  'casa parro': { moderno: 'residenziale', label: 'casa parrocchiale' },
  'casa uffici postali': 'servizio',
  casello: 'servizio',
  caserma: 'servizio',
  casolare: 'multifunzione',
  'casolare a': { moderno: 'multifunzione', utilizzo: 'disuso', label: 'casolare abbandonato' },
  'casolare d': {
    moderno: 'multifunzione',
    utilizzo: 'disuso - rudere',
    label: 'casolare diroccato',
  },
  castagneto: 'verde',
  cc: { moderno: 'residenziale', label: 'casa colonica' },
  'ceppo nudo': 'verde',
  coltivo: 'verde',
  dogana: 'servizio',
  'ed religioso': { moderno: 'luogo di culto', label: 'luogo di culto' },
  fabbrica: 'produttivo',
  fienile: 'produttivo rurale',
  ls: { label: 'luogo superiore', moderno: 'produttivo rurale' },
  lt: { label: 'luogo terreno', moderno: 'produttivo rurale' },
  'lt abb': {
    label: 'luogo terreno abbandonato',
    moderno: 'produttivo rurale',
    utilizzo: 'disuso',
  },
  mulino: 'produttivo rurale',
  nd: 'nd',
  'p cantina': { label: 'porzione di cantina', moderno: 'produttivo rurale' },
  'p casa': { label: 'porzione di casa', moderno: 'residenziale' },
  'p cc': { label: 'porzione di casa colonica', moderno: 'residenziale' },
  'p fienile': { moderno: 'produttivo rurale', label: 'porzione di fienile' },
  'p lt': { moderno: 'produttivo rurale', label: 'porzione di luogo terreno' },
  'p sf': { moderno: 'produttivo rurale', label: 'porzione di stalla fienile' },
  'p stalla': { moderno: 'produttivo rurale', label: 'porzione di stalla' },
  'pasc alpe': { moderno: 'produttivo rurale', label: 'alpeggio' },
  pascolo: 'verde',
  prato: 'verde',
  'sasso n': 'verde',
  sf: { moderno: 'produttivo rurale', label: 'stalla fienile' },
  stalla: 'produttivo rurale',
  zappativo: 'verde',
  zerbo: 'verde',
} as const satisfies Record<string, DestinazioneUsoAttuale | ParsedDestinazioneUso1853>

export type DestinazioneUso1853 = keyof typeof DESTINAZIONI_USO_1853

export type ParsedDestinazioneUso1853 = {
  label?: string
  moderno: DestinazioneUsoAttuale
  utilizzo?: StatoUtilizzo
}

export const PRESENZA_CENSIMENTO_1807 = [
  'presente',
  'non presente',
  'non disponibile',
  'parziale',
] as const

/* Componenti strutturali */

export const componenti_strutturali = {
  verticali: {
    materiali: [
      'calcestruzzo armato',
      'laterizi',
      'legno',
      'non rilevabile',
      'pietra a secco',
      'pietra con legante',
    ],
    tecniche: [
      'a telaio ',
      'incardinato',
      'incardinato + basamento e/o parziale rivestimento in pietra',
      'muri portanti',
      'non rilevabile',
    ],
  },
  orizzontali: {
    materiali: [
      'calcestruzzo armato',
      'laterizi',
      'legno',
      'non presente',
      'non rilevabile',
      'pietra',
    ],
    tecniche: ['a telaio', 'volte', 'altra tecnica', 'non rilevabile', 'non presente'],
  },
  coperture: {
    materiali: [
      'calcestruzzo armato',
      'laterizi',
      'legno',
      'materiale metallico',
      'materiale plastico',
      'non presente',
      'non rilevabile',
      'pietra',
    ],
    tecniche: ['non presente', 'non rilevabile', 'tecnica moderna', 'tecnica tradizionale'],
  },
  fondazioni: {
    materiali: ['non rilevabile', 'non presente', 'altro'],
    tecniche: ['non rilevabile'],
  },
} as const satisfies Record<string, { tecniche: string[]; materiali: string[] }>

export type ComponenteStrutturale = keyof typeof componenti_strutturali

export const fenomeni_degrado_strutturali = [
  'corrosione elementi metallici',
  'corrosione componenti metallici',
  'deposito superficiale',
  'erosione / deformazione elementi strutturali lignei',
  'erosione elementi lignei strutturali',
  'erosione giunti di malta',
  'fessurazioni',
  'mancanza componenti strutturali',
  'mancanza elementi puntuali',
  'mancanza elementi singoli',
  'mancanza elementi strutturali puntuali (conci lapidei, elementi lignei)',
  'mancanza elementi strutturali',
  'marcescenza componenti strutturali lignee',
  'marcescenza elementi lignei strutturali',
  'patina biologica',
  'rappezzi cementizi',
  'umidità di risalita',
  'vegetazione infestante',
] as const

/* Componenti architettoniche */

export const componenti_architettoniche = {
  'finiture esterne': {
    tipologia: [
      'intonaco_fine',
      'intonaco_rustico',
      'intonaco_tintura',
      'non presente',
      'rivestiment in pietra (basamento)',
      'rivestimento in legno',
    ],
    materiali: [
      'malta cementizia (grigia)',
      'malta di calce (bianca - aerea)',
      'malta di calce (giallastra - idraulica)',
    ],
    fenomeni_degrado: [
      'colature',
      'corrosione elementi metallici',
      'deposito superficiale',
      'erosione malta di rivestimento',
      'disgregazione malta di rivestimento',
      'erosione giunti di malta',
      'erosione malta di rivestimento',
      'fessurazioni',
      'lacuna malta di rivestimento',
      'marcescenza legno',
      'patina biologica',
      'rappezzi cementizi',
      'umidità di risalita',
    ],
  },
  'infissi esterni': {
    tipologia: [
      'porte',
      'portone',
      'grate',
      'box auto',
      'portefinestre',
      'finestre',
      'persiane / scuri',
      'tapparelle',
    ],
    materiali: ['legno', 'materiale plastico', 'metallo'],
    fenomeni_degrado: [],
  },
  'apparati decorativi': {
    tipologia: [
      'angolari in conci lapidei',
      'architravi lapidei',
      'architravi lignei',
      'cornici lapidee o tinte',
      'dipinti - affreschi',
      'finestre a sguincio',
      'iscrizioni storiche',
      'marcapiano',
    ],
    materiali: [],
    fenomeni_degrado: [],
  },
  'collegamenti esterni': {
    tipologia: ['ballatoio', 'loggia', 'scale', 'sottopassaggio', 'balcone'],
    materiali: ['legno', 'pietra', 'metallo', 'calcestruzzo armato'],
    fenomeni_degrado: [],
  },
} as const satisfies Record<
  string,
  { tipologia: string[]; materiali: string[]; fenomeni_degrado: string[] }
>

//

export const accessibilita_edificio = [
  'sentiero',
  'vicolo pedonale',
  'strada carrabile',
  'strada in terra battuta',
] as const

export const caratteri_storico_culturali = [
  'cardèn (struttura in legno incardinata)',
  'casèl (conservazione latte)',
  'crapèna - tècc (fienile)',
  'crotto',
  'edificio rurale in pietra (stalla / fienile o gre)',
  'fienile',
  'grè (essicatoio castagne)',
  'pigna',
  'pilastri basamento',
  'scigugna / culdera (produzione casearia)',
  'solè (parziale cardèn a valle)',
  'stalla fienile',
  'stua interna',
  'tabìa (stalla / fienile con pilastri / tamponatura in legno)',
] as const

export const pavimentazioni_esterne = [
  'ceramica',
  'pietra',
  'strada carrabile',
  'terra battuta',
] as const

export const impiantistica = [
  'elettrico',
  'gas',
  'idrico sanitario',
  'idrico',
  'non presente',
  'non rilevabile',
] as const

export const opere_provvisionali = [
  'scatola muraria (tiranti, puntellature, centine)',
  'coperture provvisorie',
  'altro',
] as const

export const vincoli_tutele = [
  'I1',
  'I2',
  'I3',
  'I4',
  'I5',
  'LOCALE',
  'REGIONALE',
  'NAZIONALE',
] as const

export const stati_utilizzo = [
  'uso permanente',
  'uso temporaneo',
  'disuso',
  'disuso - rudere',
  'non rilevabile',
  'non presente',
] as const

type StatoUtilizzo = (typeof stati_utilizzo)[number]

export const stati_conservazione = [
  'fenomeni di degrado diffusi',
  'fenomeni di degrado superficiali',
  'modifiche sostanziali caratteri tradizionali',
  'non presente',
  'non rilevabile',
  'perdita funzionalità',
  'senza fenomeni di degrado',
  'nd',
] as const

export const destinazioni_uso_moderno = [
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

type DestinazioneUsoAttuale = (typeof destinazioni_uso_moderno)[number]

export const destinazioni_uso_1951 = [
  'PRATO',
  'NP',
  'URBANO',
  'FA URBANO',
  'PFA RURALE',
  'FA RURALE',
] as const

export const destinazioni_uso_1853 = {
  CANTINA: 'produttivo rurale',
  'CANTINA D': {
    moderno: 'produttivo rurale',
    label: 'cantina diroccata',
    utilizzo: 'disuso - rudere',
  },
  CASA: 'residenziale',
  'CASA ABB': { moderno: 'residenziale', label: 'casa abbandonata', utilizzo: 'disuso' },
  'casa cantoniera': 'servizio',
  'CASA COADIUTORALE': 'residenziale',
  'CASA DIR': { moderno: 'residenziale', label: 'casa diroccata', utilizzo: 'disuso - rudere' },
  'casa guardiano': 'residenziale',
  'CASA PARRO': { moderno: 'residenziale', label: 'casa parrocchiale' },
  'casa uffici postali': 'servizio',
  CASELLO: 'servizio',
  caserma: 'servizio',
  CASOLARE: 'multifunzione',
  'CASOLARE A': { moderno: 'multifunzione', utilizzo: 'disuso', label: 'casolare abbandonato' },
  'CASOLARE D': {
    moderno: 'multifunzione',
    utilizzo: 'disuso - rudere',
    label: 'casolare diroccato',
  },
  CASTAGNETO: 'verde',
  CC: { moderno: 'residenziale', label: 'casa colonica' },
  'CEPPO NUDO': 'verde',
  COLTIVO: 'verde',
  dogana: 'servizio',
  'ED RELIGIOSO': { moderno: 'luogo di culto', label: 'luogo di culto' },
  fabbrica: 'produttivo',
  FIENILE: 'produttivo rurale',
  LS: { label: 'luogo superiore', moderno: 'produttivo rurale' },
  LT: { label: 'luogo terreno', moderno: 'produttivo rurale' },
  'LT ABB': {
    label: 'luogo terreno abbandonato',
    moderno: 'produttivo rurale',
    utilizzo: 'disuso',
  },
  MULINO: 'produttivo rurale',
  nd: 'nd',
  'p cantina': { label: 'porzione di cantina', moderno: 'produttivo rurale' },
  'P CASA': { label: 'porzione di casa', moderno: 'residenziale' },
  'P CC': { label: 'porzione di casa colonica', moderno: 'residenziale' },
  'P FIENILE': { moderno: 'produttivo rurale', label: 'porzione di fienile' },
  'P LT': { moderno: 'produttivo rurale', label: 'porzione di luogo terreno' },
  'P SF': { moderno: 'produttivo rurale', label: 'porzione di stalla fienile' },
  'P STALLA': { moderno: 'produttivo rurale', label: 'porzione di stalla' },
  'PASC ALPE': { moderno: 'produttivo rurale', label: 'alpeggio' },
  PASCOLO: 'verde',
  PRATO: 'verde',
  'SASSO N': 'verde',
  SF: { moderno: 'produttivo rurale', label: 'stalla fienile' },
  STALLA: 'produttivo rurale',
  ZAPPATIVO: 'verde',
  ZERBO: 'verde',
} as const satisfies Record<
  string,
  | DestinazioneUsoAttuale
  | { label?: string; moderno: DestinazioneUsoAttuale; utilizzo?: StatoUtilizzo }
>

export const stati_censimento_1807 = [
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

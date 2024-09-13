export const stati_utilizzo = [
  'uso permanente',
  'uso temporaneo',
  'disuso',
  'disuso - rudere',
  'non rilevabile',
  'non presente',
] as const

export const stato_conservazione = [
  'perdita funzionalità',
  'fenomeni di degrado diffusi',
  'fenomeni di degrado superficiali',
  'senza fenomeni di degrado',
  'modifiche sostanziali caratteri tradizionali',
] as const

export const tag_moderni = ['RES', 'A PROD', 'COM', 'MULTI', 'nd', 'PROD', 'servizio'] as const

export const tag_storici_1951 = [
  'PRATO',
  'NP',
  'URBANO',
  'FA URBANO',
  'PFA RURALE',
  'FA RURALE',
] as const

export const tag_storici_1853 = [
  'A CASA DIR',
  'BOSCO CEDU',
  'CANTINA D',
  'CANTINA',
  'CASA ABB',
  'CASA COAD',
  'CASA DIR',
  'CASA IR',
  'CASA PARRO',
  'CASA',
  'CASELLO',
  'CASERMA',
  'CASOLARE A',
  'CASOLARE D',
  'CASOLARE',
  'CASTAGNETO',
  'CC',
  'CEPPO NUDO',
  'CHECK - ND',
  'COLTIVO',
  'DOGANA',
  'ED REL',
  'F',
  'FIENILE',
  'LT ABB',
  'LT',
  'luogo superiore',
  'MULINO',
  'P CANTINA',
  'P CASA ABB',
  'P CASA',
  'P CASELLO',
  'P CC',
  'P F',
  'P FIENILE',
  'P LT',
  'P SF',
  'P STALLA',
  'PASCOLO',
  'PRATO',
  'S',
  'SASSO N',
  'SF',
  'STALLA',
  'ZAPPATIVO',
  'ZERBO',
] as const

//

export const componenti_strutturali = [
  'componenti strutturali verticali',
  'componenti strutturali orizzontali',
  'coperture',
  'fondazioni',
] as const

type ComponenteStrutturale = (typeof componenti_strutturali)[number]

export const materiali_strutturali = {
  'componenti strutturali verticali': [
    'pietra a secco',
    'pietra con legante',
    'legno',
    'calcestruzzo armato',
    'laterizio',
    'non rilevabile',
  ],
  'componenti strutturali orizzontali': [
    'pietra',
    'legno',
    'laterizi',
    'calcestruzzo armato',
    'non rilevabile ',
  ],
  coperture: [
    'pietra',
    'legno',
    'calcestruzzo armato',
    'materiale plastico',
    'materiale metallico',
    'non rilevabile',
  ],
  fondazioni: ['non rilevabile', 'non presente', 'altro'],
} as const satisfies Record<ComponenteStrutturale, string[]>

export const tecniche_costruttive_strutturali = {
  'componenti strutturali verticali': [
    'a telaio ',
    'incardinato',
    'incardinato + basamento e/o parziale rivestimento in pietra',
    'muri portanti',
    'non rilevabile',
  ],
  'componenti strutturali orizzontali': ['a telaio', 'volte', 'altra tecnica', 'non rilevabile'],
  coperture: ['tecnica moderna', 'tecnica tradizionale', 'non rilevabile'],
  fondazioni: ['non rilevabile'],
} as const satisfies Record<ComponenteStrutturale, string[]>

export const fenomeni_degrado_strutturali = [
  'corrosione elementi metallici',
  'deposito superficiale',
  'erosione elementi lignei strutturali',
  'erosione giunti di malta',
  'fessurazioni',
  'mancanza componenti strutturali',
  'mancanza elementi singoli',
  'mancanza elementi strutturali',
  'marcescenza componenti strutturali lignee',
  'marcescenza elementi lignei strutturali',
  'patina biologica',
  'rappezzi cementizi',
  'vegetazione infestante',
  'mancanza elementi strutturali puntuali (conci lapidei, elementi lignei)',
] as const

//

export const componenti_architettoniche = {
  'finiture esterne': {
    tipologia: ['intonaco_tintura', 'intonaco_fine', 'intonaco_rustico', 'non_presente'],
    materiali: [
      'malta di calce (bianca - aerea)',
      'malta di calce (giallastra - idraulica)',
      'malta cementizia (grigia)',
    ],
    fenomeni_degrado: [
      'deposito superficiale',
      'disgregazione malta di rivestimento',
      'erosione malta di rivestimento',
      'lacuna malta di rivestimento',
      'erosione giunti di malta',
      'fessurazioni',
      'marcescenza legno',
      'patina biologica',
      'colature',
      'rappezzi cementizi',
      'umidità di risalita',
      'corrosione elementi metallici',
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
      'dipinti - affreschi',
      'iscrizioni storiche',
      'marcapiano',
      'cornici lapidee o tinte',
      'finestre a sguincio',
      'architravi lignei',
      'architravi lapidei',
      'angolari in conci lapidei',
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

export const stati_conservazione = [
  'perdita funzionalità ',
  'fenomeni di degrado diffusi',
  'fenomeni di degrado superficiali',
  'senza fenomeni di degrado',
] as const

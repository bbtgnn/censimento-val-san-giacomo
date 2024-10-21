export const reti_servizi = {
  RI: 'rete idrica',
  RE: 'rete elettrica',
  ILL: 'illuminazione pubblica',
  RT: 'rete telefonica',
  TP: 'telefono pubblico',
  C: 'cimitero',
  BT: 'bar trattoria',
  P: 'pensione',
} as const

export const viabilita_interna_tipi = ['pedonale', 'veicolare'] as const

export const viabilita_interna_materiali = [
  'acciottolato',
  'acciottolato a coltello con traversine trasversali',
  'pavimentata',
  'piode',
  'terra battuta',
] as const

export const accessibilita_principale = [
  'sentiero',
  'mulattiera',
  'strada asfaltata',
  'strada sterrata',
] as const

export const elementi_urbanistici = [
  'fontana',
  'lavatoio',
  'panche',
  'passaggi coperti',
  'soste',
  'vasca in pietra monolitica',
] as const

export const modalita_uso = ['abbandono', 'discontinuo', 'permanente', 'stagionale'] as const

export const stato_conservazione = [
  'complesso in discrete condizioni con interventi di recupero non corretti',
  'complesso in discrete condizioni di conservazione',
  'complesso in pessime condizioni di conservazione',
  'senza gravi alterazioni ma in stato di abbandono e carente di manutenzione',
] as const

import type { CollectionConfig, SelectField } from 'payload'
import { Collections } from '.'
import {
  componenti_architettoniche,
  componenti_strutturali,
  fenomeni_degrado_strutturali,
  materiali_strutturali,
  stati_censimento_1807,
  stati_conservazione,
  stati_utilizzo,
  tag_moderni,
  tag_storici_1853,
  tag_storici_1951,
  tecniche_costruttive_strutturali,
} from './Edifici.utils'
import * as F from '@/db/fields'

//

const field_conservazione: SelectField = {
  name: 'stato_conservazione',
  type: 'select',
  options: Object.values(stati_conservazione),
}

//

export const Edifici: CollectionConfig = {
  slug: Collections.Edifici,
  labels: {
    singular: 'Edificio',
    plural: 'Edifici',
  },
  access: {
    read: () => true,
  },
  fields: [
    F.relation('localita', 'localita'), // TODO - Filter options based on [sottosistema]
    F.relation('sezione_localita', 'sezione_localita'), // TODO - Filter options based on [localita]
    {
      name: 'coordinate',
      type: 'point',
    },

    //

    {
      name: 'anagrafica',
      type: 'array',
      fields: [
        {
          name: 'anno',
          type: 'text',
        },
        {
          name: 'particella',
          type: 'text',
        },
        {
          name: 'subalterno',
          type: 'text',
        },
        {
          name: 'accessibilita',
          type: 'select',
          options: ['sentiero', 'vicolo pedonale', 'strada carrabile', 'strada in terra battuta '],
        },
        {
          name: 'unita',
          type: 'array',
          fields: [
            { name: 'piani', type: 'number' },
            { name: 'sottotetto', type: 'checkbox' },
            { name: 'seminterrato', type: 'checkbox' },
            { name: 'piano_interrato', type: 'checkbox' },
          ],
        },
        {
          name: 'stato_utilizzo',
          type: 'select',
          options: Object.values(stati_utilizzo),
        },
        {
          name: 'stato_utilizzo_secondario',
          type: 'select',
          options: Object.values(stati_utilizzo),
        },
        {
          name: 'stato_conservazione',
          type: 'select',
          hasMany: true,
          options: Object.values(stati_conservazione),
        },
        {
          name: 'destinazioni_uso',
          type: 'array',
          fields: [
            {
              name: 'nome',
              type: 'text',
            },
            {
              name: 'tag_storico',
              type: 'select',
              options: [...Object.values(tag_storici_1853), ...Object.values(tag_storici_1951)],
            },
            {
              name: 'tag_moderno',
              type: 'select',
              options: Object.values(tag_moderni),
            },
          ],
        },
        {
          name: 'stato',
          type: 'select',
          options: Object.values(stati_censimento_1807),
        },
      ],
    },

    //

    {
      name: 'analisi_strutturale',
      label: 'Analisi strutturale',
      type: 'array',
      fields: [
        {
          name: 'componente',
          type: 'select',
          options: Object.values(componenti_strutturali),
        },
        {
          name: 'materiali',
          type: 'select',
          options: Object.values(materiali_strutturali).flat(),
          hasMany: true,
        },
        {
          name: 'tecnica_costruttiva',
          type: 'select',
          options: Object.values(tecniche_costruttive_strutturali).flat(),
        },
        field_conservazione,
        {
          name: 'fenomeni_degrado',
          type: 'select',
          options: Object.values(fenomeni_degrado_strutturali),
          hasMany: true,
        },
      ],
    },

    {
      name: 'analisi_componenti_architettoniche',
      type: 'array',
      fields: [
        {
          name: 'fronte',
          type: 'select',
          options: ['sud', 'nord', 'est', 'ovest', 'generale'],
        },
        {
          name: 'componente',
          type: 'select',
          options: Object.keys(componenti_architettoniche),
        },
        {
          name: 'tipologia',
          type: 'select',
          options: Object.values(componenti_architettoniche)
            .map((v) => v.tipologia)
            .flat(),
        },
        {
          name: 'materiali',
          type: 'select',
          options: Object.values(componenti_architettoniche)
            .map((v) => v.materiali)
            .flat(),
        },
        field_conservazione,
        {
          name: 'fenomeni_degrado',
          type: 'select',
          options: Object.values(componenti_architettoniche)
            .map((v) => v.fenomeni_degrado)
            .flat(),
          hasMany: true,
        },
      ],
    },

    {
      name: 'Altro',
      type: 'group',
      fields: [
        {
          name: 'pavimentazioni_esterne',
          type: 'select',
          options: ['terra battuta', 'ceramica', 'pietra', 'strada carrabile'],
          hasMany: true,
        },
        {
          name: 'smaltimento_acqua',
          type: 'select',
          options: ['metallo', 'legno', 'non rilevabile', 'non presente'],
          hasMany: true,
        },
        {
          name: 'impiantistica',
          type: 'select',
          options: [
            'idrico sanitario',
            'idrico',
            'elettrico',
            'gas',
            'non rilevabile',
            'non presente',
          ],
          hasMany: true,
        },
        {
          name: 'presenza_opere_provvisionali',
          type: 'select',
          hasMany: true,
          options: [
            'scatola muraria (tiranti, puntellature, centine)',
            'coperture provvisorie',
            'altro',
          ],
        },
        {
          name: 'vincoli_tutele',
          type: 'select',
          hasMany: true,
          options: ['I1', 'I2', 'I3', 'I4', 'I5', 'LOCALE', 'REGIONALE', 'NAZIONALE'],
        },
        {
          name: 'caratteri_storico_culturali',
          type: 'select',
          hasMany: true,
          options: [
            'cardèn (struttura in legno incardinata)',
            'solè (parziale cardèn a valle)',
            'pigna',
            'scigugna / culdera (produzione casearia)',
            'stua interna',
            'casèl (conservazione latte)',
            'tabìa (stalla / fienile con pilastri / tamponatura in legno',
            'crapèna - tècc (fienile)',
            'crotto (addossato alla montagna - sorèl)',
            'grè (essicatoio castagne)',
            'stalla fienile',
            'pilastri basamento',
            'fienile',
            'edificio rurale in pietra (stalla / fienile o gre)',
          ],
        },
      ],
    },

    {
      name: 'dati_lavoro',
      label: 'Dati di lavoro',
      type: 'group',
      fields: [
        {
          name: 'imu_2021',
          type: 'text',
        },
        {
          name: 'tari_2021',
          type: 'text',
        },
        {
          name: 'punto_gis',
          type: 'text',
        },
        {
          name: 'altre_note',
          type: 'text',
        },
        {
          name: 'informazioni_aggiuntive',
          type: 'text',
        },
      ],
    },

    {
      ...F.relation('media', 'immagini'),
      hasMany: true,
    },
  ],
}

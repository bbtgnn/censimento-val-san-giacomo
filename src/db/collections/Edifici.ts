import type { CollectionConfig, SelectField } from 'payload'
import { Collections } from '.'
import {
  accessibilita_edificio,
  componenti_architettoniche,
  componenti_strutturali,
  fenomeni_degrado_strutturali,
  PRESENZA_CENSIMENTO_1807,
  STATI_CONSERVAZIONE,
  STATI_UTILIZZO,
  DESTINAZIONI_USO_ATTUALI,
  DESTINAZIONI_USO_1853,
  DESTINAZIONI_USO_1951,
  caratteri_storico_culturali,
  pavimentazioni_esterne,
  impiantistica,
  opere_provvisionali,
  vincoli_tutele,
} from './Edifici.utils'
import * as F from '@/db/fields'
import { String } from 'effect'

//

const field_conservazione: SelectField = {
  name: 'stato_conservazione',
  type: 'select',
  options: Object.values(STATI_CONSERVAZIONE),
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
    { name: 'sezione_localita', type: 'text' },
    {
      name: 'geolocalizzazione',
      type: 'group',
      fields: [
        {
          name: 'coordinate',
          type: 'point',
        },
        {
          name: 'altitudine',
          type: 'number',
        },
        {
          name: 'precision',
          type: 'number',
        },
      ],
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
          name: 'accessibilita',
          type: 'select',
          options: Object.values(accessibilita_edificio),
          hasMany: true,
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
          options: Object.values(STATI_UTILIZZO),
        },
        {
          name: 'stato_conservazione',
          type: 'select',
          hasMany: true,
          options: Object.values(STATI_CONSERVAZIONE),
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
              options: [
                ...Object.keys(DESTINAZIONI_USO_1853).map(String.toLowerCase),
                ...Object.values(DESTINAZIONI_USO_1951),
              ],
            },
            {
              name: 'tag_moderno',
              type: 'select',
              options: Object.values(DESTINAZIONI_USO_ATTUALI),
            },
          ],
        },
        {
          name: 'presenza_censimento_1087',
          type: 'select',
          options: Object.values(PRESENZA_CENSIMENTO_1807),
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
          options: Object.keys(componenti_strutturali),
        },
        {
          name: 'materiali',
          type: 'select',
          options: Object.values(componenti_strutturali)
            .map((d) => d.materiali)
            .flat(),
          hasMany: true,
        },
        {
          name: 'tecnica_costruttiva',
          type: 'select',
          options: Object.values(componenti_strutturali)
            .map((d) => d.tecniche)
            .flat(),
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
          hasMany: true,
        },
        {
          name: 'materiali',
          type: 'select',
          options: Object.values(componenti_architettoniche)
            .map((v) => v.materiali)
            .flat(),
          hasMany: true,
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
      name: 'altro',
      type: 'group',
      fields: [
        {
          name: 'pavimentazioni_esterne',
          type: 'select',
          options: Object.values(pavimentazioni_esterne),
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
          options: Object.values(impiantistica),
          hasMany: true,
        },
        {
          name: 'opere_provvisionali',
          type: 'select',
          hasMany: true,
          options: Object.values(opere_provvisionali),
        },
        {
          name: 'vincoli_tutele',
          type: 'select',
          hasMany: true,
          options: Object.values(vincoli_tutele),
        },
        {
          name: 'caratteri_storico_culturali',
          type: 'select',
          hasMany: true,
          options: Object.values(caratteri_storico_culturali),
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
          type: 'array',
          fields: [{ name: 'code', type: 'text' }],
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
    {
      name: 'immagini_url',
      type: 'array',
      fields: [{ name: 'url', type: 'text' }],
    },
  ],
}

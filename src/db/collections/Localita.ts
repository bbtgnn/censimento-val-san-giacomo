import type { CollectionConfig, Field } from 'payload'
import { Collections } from '.'
import * as F from '@/db/fields'
import {
  accessibilita_principale,
  elementi_urbanistici,
  modalita_uso,
  reti_servizi,
  stato_conservazione,
  viabilita_interna_materiali,
  viabilita_interna_tipi,
} from './Localita.utils'

export const Localita: CollectionConfig = {
  slug: Collections.Localita,
  labels: {
    singular: 'Località',
    plural: 'Località',
  },
  admin: {
    useAsTitle: F.name.name,
  },
  access: {
    read: () => true,
  },
  fields: [
    { ...F.name, required: true },
    { ...F.relation('sottosistemi', 'sottosistemi'), hasMany: true },
    {
      name: 'slm',
      type: 'number',
      required: true,
    },
    {
      name: 'codice_localita',
      type: 'number',
      required: true,
    },
    {
      name: 'abitanti_residenti_2022',
      type: 'number',
    },
    ...field_ripetuti(),
    { name: 'elementi_urbanistici', type: 'select', options: Object.values(elementi_urbanistici) },
    {
      name: 'dati_1988',
      type: 'array',
      fields: [
        { name: 'nome_sottolocalita', type: 'text' },
        ...field_ripetuti(),
        { name: 'uso_pre', type: 'select', options: Object.values(modalita_uso) },
        { name: 'uso', type: 'select', options: Object.values(modalita_uso) },
        {
          name: 'stato_conservazione',
          type: 'select',
          options: Object.values(stato_conservazione),
        },
        { name: 'edifici_civili', type: 'number' },
        { name: 'edifici_rurali', type: 'number' },
        { name: 'edifici_multifunzione', type: 'number' },
        { name: 'edifici_rovina', type: 'number' },
      ],
    },
    {
      name: 'hide',
      type: 'checkbox',
    },
  ],
}

function field_ripetuti(): Field[] {
  return [
    {
      name: 'accessibilita_principale',
      type: 'select',
      hasMany: true,
      options: Object.values(accessibilita_principale),
    },
    {
      name: 'viabilita_interna_tipi',
      type: 'select',
      hasMany: true,
      options: Object.values(viabilita_interna_tipi),
    },
    {
      name: 'viabilita_interna_materiali',
      type: 'select',
      hasMany: true,
      options: Object.values(viabilita_interna_materiali),
    },
    {
      name: 'reti_e_servizi',
      type: 'select',
      hasMany: true,
      options: Object.values(reti_servizi),
    },
  ]
}

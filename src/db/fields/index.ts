import {
  ArrayField,
  Field,
  GroupField,
  PointField,
  RelationshipField,
  RichTextField,
  RowField,
  Tab,
  TextField,
  UIField,
} from 'payload'
import { Collection, Collections } from '@/db/collections'

// import { Divider } from './components/divider'
// import { Header } from './components/header'
// import { Gap } from './components/gap'

import { capitalizeFirstLetter } from '@/utils/strings'

//

// export const divider: UIField = {
//   name: 'divider',
//   type: 'ui',
//   admin: {
//     components: {
//       Field: Divider,
//     },
//   },
// }

// export function title(text: string): UIField {
//   return {
//     name: 'header',
//     type: 'ui',
//     admin: {
//       components: {
//         Field: () => Header(text),
//       },
//     },
//   }
// }

// export function gap(size: number): UIField {
//   return {
//     name: 'gap',
//     type: 'ui',
//     admin: {
//       components: {
//         Field: () => Gap({ size }),
//       },
//     },
//   }
// }

//

export const name: TextField = {
  name: 'name',
  type: 'text',
}

export function relation(collection: Collection, name: string): RelationshipField {
  return {
    name,
    type: 'relationship',
    relationTo: collection,
  }
}

//

export const link: TextField = {
  name: 'link',
  type: 'text',
}

export const testo: RichTextField = {
  name: 'testo',
  label: 'Testo',
  type: 'richText',
  localized: true,
}

export function plainText(name: string): TextField {
  return {
    name,
    type: 'text',
    localized: true,
  }
}

export function plainTextRequired(name: string): TextField {
  return {
    ...plainText(name),
    required: true,
  }
}

export function richText(name: string): RichTextField {
  return {
    name,
    type: 'richText',
    localized: true,
  }
}

export const posizione: PointField = {
  name: 'posizione',
  type: 'point',
}

// export const linkConNome: RowField = {
//   type: 'row',
//   fields: [nome, { ...link, required: true }],
// }

// export const linkArray: ArrayField = {
//   label: 'Link',
//   name: 'links',
//   type: 'array',
//   fields: linkConNome.fields,
// }

// export const contatti: ArrayField = {
//   name: 'contatti',
//   type: 'array',
//   fields: [
//     {
//       type: 'row',
//       fields: [nome, link],
//     },
//     {
//       type: 'row',
//       fields: [
//         {
//           name: 'email',
//           type: 'email',
//         },
//         {
//           name: 'telefono',
//           type: 'text',
//         },
//       ],
//     },
//   ],
// }

// export const media: RelationshipField = {
//   name: 'media',
//   type: 'relationship',
//   relationTo: Collections.Media,
// }

// export const servizi: ArrayField = {
//   name: 'servizi',
//   type: 'array',
//   fields: [nome, { ...testo, required: true }],
// }

// export const contenutoFields: Field[] = [
//   title('Immagini e media'),
//   media,
//   linkArray,
//   divider,
//   title('Contenuti testuali'),
//   { ...testo, required: true },
// ]

// export const tabContenuto: Tab = {
//   label: 'Contenuto',
//   fields: contenutoFields,
// }

export function titleAndText(name: string, label?: string): GroupField {
  return {
    name,
    type: 'group',
    label: label ?? capitalizeFirstLetter(name),
    fields: [
      {
        ...plainText(`title`),
        required: true,
        label: 'Titolo',
      },
      { ...richText('text'), label: 'Contenuto' },
    ],
  }
}

// export const socialNetworkLink: RowField = {
//   type: 'row',
//   fields: [nome, { ...link, required: true }],
// }

// export const socialNetworkLinks: ArrayField = {
//   name: 'Link Social',
//   type: 'array',
//   localized: true,
//   fields: [socialNetworkLink],
// }

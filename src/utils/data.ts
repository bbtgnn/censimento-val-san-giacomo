type Nullable<T> = T | null | undefined
type PayloadRelation<T> = Nullable<T> | string

export function relation<T>(rel: PayloadRelation<T>): Nullable<T> {
  if (typeof rel == 'string') throw new Error('Relation not expanded')
  else return rel
}

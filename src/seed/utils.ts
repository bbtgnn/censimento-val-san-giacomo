import * as csv from '@fast-csv/parse'
import { Array as A, Effect, pipe, Record, String as S } from 'effect'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BasePayload, CollectionSlug } from 'payload'

/* DB */

export async function clearDb(payload: BasePayload) {
  await pipe(
    ['edifici', 'sottosistemi', 'localita', 'comuni', 'media'] satisfies CollectionSlug[],
    A.map((slug) =>
      Effect.promise(() =>
        payload.delete({
          collection: slug,
          where: { id: { exists: true } },
        }),
      ),
    ),
    Effect.all,
    Effect.runPromise,
  )
}

/* CSV reading */

export function readCsv(
  csvPath: string,
  options: csv.ParserOptionsArgs = {},
): Promise<Array<Record<string, unknown>>> {
  const data: Record<string, unknown>[] = []
  return new Promise((resolve) => {
    csv
      .parseFile(csvPath, options)
      .on('data', (localita) => data.push(localita))
      .on('end', () => resolve(data))
  })
}

export function dataPath(name: string) {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)
  return path.resolve(dirname, '..', 'data', name)
}

export const csvOptions: csv.ParserOptionsArgs = {
  delimiter: ',',
  headers: true,
}

/* Data cleaning */

export function removeNotionUrl(string: string) {
  return string.split(' (').at(0)?.trim() ?? ''
}

export function parseString(record: Record<string, unknown>, key: string) {
  if (!(key in record)) throw new Error(`No key in record: ${key}`)
  return String(record[key]).trim()
}

export function parseStringArray(record: Record<string, unknown>, key: string, separator = ',') {
  return parseString(record, key).split(separator).map(S.trim)
}

export function find<A extends readonly string[]>(string: string, array: A): A[number] | undefined {
  return array.find((s) => s == string)
}

export function intersect<A extends readonly string[]>(strings: string[], array: A): A[number][] {
  return A.intersection(strings, array)
}

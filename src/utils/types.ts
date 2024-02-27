export type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T;

export function isDefined<T>(item: T | undefined): item is T {
  return item !== undefined;
}

export type ExtractRecordArrayValue<T> =
  T extends Record<string | number | symbol, infer V> ? (V extends Array<infer A> ? A : never) : never;

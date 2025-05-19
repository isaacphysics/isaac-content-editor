export type KeysWithValsOfType<T, V> =
    // {the subset of keys in T whose values extend V}[keyof T] - i.e. the keys of T whose values are of type V
    {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

export function isDefined<T>(item: T | undefined): item is T {
    return item !== undefined;
}

export type ExtractRecordArrayValue<T> = T extends Record<string | number | symbol, infer V> ? V extends Array<infer A> ? A : never : never;

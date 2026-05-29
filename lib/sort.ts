export type SortDir = 'asc' | 'desc';

/**
 * Resolve a (sort, dir) pair against a whitelist of allowed sort keys.
 * The whitelist guarantees the key maps to a known SQL expression, so callers
 * can safely interpolate the resolved column into an ORDER BY clause.
 */
export function resolveSort(
  sort: string | undefined,
  dir: string | undefined,
  columns: Record<string, string>,
  fallbackKey: string,
): { key: string; col: string; dir: SortDir; sql: string } {
  const key = sort && columns[sort] ? sort : fallbackKey;
  const sortDir: SortDir = dir === 'asc' ? 'asc' : 'desc';
  const col = columns[key] ?? columns[fallbackKey];
  return { key, col, dir: sortDir, sql: `${col} ${sortDir}` };
}

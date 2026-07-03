const MISSING_TABLE_CODES = new Set([
  '42P01',
  'ER_NO_SUCH_TABLE',
  'SQLITE_ERROR'
]);

function isMissingTableError(error, tableNames = []) {
  const code = error?.parent?.code || error?.original?.code || error?.code;
  const message = String(error?.message || '').toLowerCase();
  const hasMissingTableMessage = [
    'does not exist',
    'no such table',
    'unknown table',
    'undefined table'
  ].some(fragment => message.includes(fragment));

  if (!MISSING_TABLE_CODES.has(code) && !hasMissingTableMessage) return false;

  const expectedTables = (Array.isArray(tableNames) ? tableNames : [tableNames])
    .filter(Boolean)
    .map(tableName => String(tableName).toLowerCase());

  return expectedTables.length === 0 || expectedTables.some(tableName => message.includes(tableName));
}

module.exports = { isMissingTableError };

/**
 * U.S. Census ACS "special values" in machine-readable extracts (see
 * https://www.census.gov/data/developers/data-sets/acs-1year/notes-on-acs-estimate-and-annotation-values.html).
 */
const ACS_MISSING_NUMBERS = new Set([
  -666666666,
  -888888888,
  -999999999,
  -555555555,
  -333333333,
]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAcsMissingNumericValue(value) {
  return normalizeAcsNumeric(value) === null;
}

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export function normalizeAcsNumeric(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (ACS_MISSING_NUMBERS.has(n)) return null;
  return n;
}

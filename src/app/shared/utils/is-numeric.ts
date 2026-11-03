/**
 * Same check as the `isNumeric` helper rxjs 6 exposed from `rxjs/internal-compatibility`, a private path that
 * rxjs 7 removed. The dashboards decide from it whether a query result cell is a number, so it is kept as it was:
 * numbers and numeric strings (also `' 5 '`, `'1e3'`, `'0x10'`) are numeric; `''`, `null`, arrays and objects are not.
 */
export function isNumeric(value: any): boolean {
  return !Array.isArray(value) && (value - parseFloat(value) + 1) >= 0;
}

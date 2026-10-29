/**
 * `count` as a whole-number percentage of `total`, rounded half up. Returns 0 when there is nothing to divide by.
 * The report text ("52% of responding EU countries ...") and the pie chart labels both come from this, so they agree.
 */
export function roundedPercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total + Number.EPSILON) * 100) : 0;
}

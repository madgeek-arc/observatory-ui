import { OAvsTotalDataPerCountry, OAvsTotalPubsPerCountry } from './coutry-pages.queries';

/** The `result.year` each series of a stats-tool `raw` query filters on. */
const seriesYears = (query: string): string[] =>
  JSON.parse(query).series.map((s: any) =>
    s.query.filters
      .flatMap((f: any) => f.groupFilters)
      .find((g: any) => g.field === 'result.year').values[0]);

describe('Country pages OA vs total queries', () => {
  // The callers read series 0/1 as the previous year and 2/3 as the shown year.
  it('compares the previous year with the given year for datasets', () => {
    expect(seriesYears(OAvsTotalDataPerCountry('FR', '2025'))).toEqual(['2024', '2024', '2025', '2025']);
  });

  it('compares the previous year with the given year for publications', () => {
    expect(seriesYears(OAvsTotalPubsPerCountry('FR', '2025'))).toEqual(['2024', '2024', '2025', '2025']);
  });
});

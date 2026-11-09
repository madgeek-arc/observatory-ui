import * as queries from './explore-queries';

type QueryBuilder = (year: string) => string;

const builders = queries as unknown as Record<string, QueryBuilder>;

// Not a survey year: if a query hardcoded a year, it could not match these
const YEAR = '2031';
const PREVIOUS_YEAR = '2030';
const TREND_START_YEAR = '2015';

/** "From last year" cards: the current year and the year before, one series each for open, total, open before, total before, total */
const comparisonQueries: Record<string, string> = {
  OAPublicationVSClosed: 'publication',
  OpenDataVSClosed: 'dataset',
  OpenSoftwareVSClosed: 'software',
};
/** Charts of a single year */
const singleYearQueries = [
  'distributionOfOAPublications',
  'distributionOfOA',
  'distributionOfOAByScienceFields',
  'distributionByDocumentType',
  'OAAndTotalPublicationsPerCountry',
  'OAPubsPerCountry',
];
/** Charts from a fixed start year up to the given year */
const trendQueries = ['trendOfOAPublications', 'trendOfOpenData'];

interface Condition {
  type: string;
  value: string;
}

/** Every condition on `field` anywhere below `node` */
function conditionsOn(field: string, node: unknown, found: Condition[] = []): Condition[] {
  if (Array.isArray(node)) {
    node.forEach(child => conditionsOn(field, child, found));
  } else if (node && typeof node === 'object') {
    const object = node as Record<string, unknown>;
    if (object['field'] === field && Array.isArray(object['values'])) {
      found.push({type: String(object['type']), value: String(object['values'][0])});
    }
    Object.values(object).forEach(child => conditionsOn(field, child, found));
  }
  return found;
}

/** The series (raw queries) or charts (chart queries) of a query, each with its own conditions */
function entries(query: string): unknown[] {
  const parsed = JSON.parse(query);
  return parsed.series ?? parsed.chartsInfo;
}

function yearsPerEntry(name: string): Condition[][] {
  return entries(builders[name](YEAR)).map(entry => conditionsOn('result.year', entry));
}

describe('explore queries', () => {
  it('is covered: every exported query is checked below', () => {
    const covered = [...Object.keys(comparisonQueries), ...singleYearQueries, ...trendQueries];

    expect(Object.keys(builders).sort()).toEqual(covered.sort());
  });

  it('builds valid JSON that only filters on years derived from the year it is given', () => {
    Object.keys(builders).forEach(name => {
      const years = conditionsOn('result.year', JSON.parse(builders[name](YEAR)));
      const allowed = (condition: Condition) =>
        condition.value === YEAR
        || (condition.value === PREVIOUS_YEAR && name in comparisonQueries)
        || (condition.value === TREND_START_YEAR && condition.type === '>=' && trendQueries.includes(name));

      expect(years.length).withContext(name).toBeGreaterThan(0);
      expect(years.filter(condition => !allowed(condition))).withContext(name).toEqual([]);
    });
  });

  describe('comparison cards', () => {
    Object.entries(comparisonQueries).forEach(([name, resultType]) => {
      describe(name, () => {
        it('compares the year with the year before it, not with a fixed year', () => {
          const years = yearsPerEntry(name).map(conditions => conditions.map(condition => condition.value));

          // open and total of the year, open and total of the year before, total of the year
          expect(years).toEqual([[YEAR], [YEAR], [PREVIOUS_YEAR], [PREVIOUS_YEAR], [YEAR]]);
        });

        it('compares 2025 with 2024', () => {
          const years = entries(builders[name]('2025')).map(entry => conditionsOn('result.year', entry)[0].value);

          expect(years).toEqual(['2025', '2025', '2024', '2024', '2025']);
        });

        it('counts only its own kind of result, in Europe', () => {
          entries(builders[name](YEAR)).forEach(entry => {
            expect(conditionsOn('result.type', entry).map(condition => condition.value)).toEqual([resultType]);
            expect(conditionsOn('result.organization.country.continent', entry).map(condition => condition.value))
              .toEqual(['Europe']);
          });
        });
      });
    });
  });

  describe('charts of a single year', () => {
    singleYearQueries.forEach(name => {
      it(`${name} filters every series on exactly that year`, () => {
        yearsPerEntry(name).forEach(conditions => {
          expect(conditions).toEqual([{type: '=', value: YEAR}]);
        });
      });
    });
  });

  describe('trends', () => {
    trendQueries.forEach(name => {
      it(`${name} runs from ${TREND_START_YEAR} up to the given year in every chart`, () => {
        yearsPerEntry(name).forEach(conditions => {
          expect(conditions).toEqual([
            {type: '>=', value: TREND_START_YEAR},
            {type: '<=', value: YEAR},
          ]);
        });
      });
    });
  });
});

import {
  COMPARISON_SURVEY_YEARS,
  LATEST_SURVEY_YEAR,
  PREVIOUS_SURVEY_YEAR,
  SURVEY_YEARS,
  surveyModelId
} from './survey-years';

describe('survey years', () => {
  it('lists the years from oldest to latest', () => {
    const years = SURVEY_YEARS.map(Number);

    expect(years.every(year => Number.isInteger(year))).toBeTrue();
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(new Set(years).size).toBe(years.length);
  });

  it('exposes the latest and the previous year', () => {
    expect(LATEST_SURVEY_YEAR).toBe(SURVEY_YEARS[SURVEY_YEARS.length - 1]);
    expect(PREVIOUS_SURVEY_YEAR).toBe(SURVEY_YEARS[SURVEY_YEARS.length - 2]);
    expect(+LATEST_SURVEY_YEAR - 1).toBe(+PREVIOUS_SURVEY_YEAR);
  });

  it('compares exactly two years, the previous one first, because the by-area pages index them as [0] and [1]', () => {
    expect(COMPARISON_SURVEY_YEARS.length).toBe(2);
    expect(COMPARISON_SURVEY_YEARS[0]).toBe(PREVIOUS_SURVEY_YEAR);
    expect(COMPARISON_SURVEY_YEARS[1]).toBe(LATEST_SURVEY_YEAR);
  });

  it('builds the survey model id from the year', () => {
    expect(surveyModelId('2025')).toBe('m-eosc-sb-2025');
    expect(surveyModelId(LATEST_SURVEY_YEAR)).toBe(`m-eosc-sb-${LATEST_SURVEY_YEAR}`);
  });
});

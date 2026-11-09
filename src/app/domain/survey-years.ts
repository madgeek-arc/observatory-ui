/**
 * Survey years, oldest → latest.
 *
 * Each year, add the new year here: it is the only edit the Explore pages need.
 */
export const SURVEY_YEARS: readonly string[] = ['2022', '2023', '2024', '2025'];

export const LATEST_SURVEY_YEAR: string = SURVEY_YEARS[SURVEY_YEARS.length - 1];

export const PREVIOUS_SURVEY_YEAR: string = SURVEY_YEARS[SURVEY_YEARS.length - 2];

/**
 * Latest and previous year, for the pages that compare exactly two years.
 * The open-science-by-area templates rely on this: they read [0] (previous) and [1] (latest)
 * and only render their overview cards when the arrays have `length === 2`.
 */
export const COMPARISON_SURVEY_YEARS: readonly string[] = SURVEY_YEARS.slice(-2);

/** Id of the survey model published for the given year, e.g. `m-eosc-sb-2025`. */
export const surveyModelId = (year: string): string => `m-eosc-sb-${year}`;

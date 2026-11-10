import { isNumeric } from './is-numeric';

/** The expectations were taken from the rxjs 6.6.7 implementation this function replaces. */
describe('isNumeric', () => {
  it('accepts numbers and numeric strings', () => {
    for (const value of [5, 0, -5, 5.5, '5', '5.5', '-5', '0', '1e3', ' 5 ', '0x10']) {
      expect(isNumeric(value), JSON.stringify(value)).toBe(true);
    }
  });

  it('rejects empty and non-numeric strings', () => {
    for (const value of ['', ' ', 'abc', '12abc', 'Infinity', 'NaN']) {
      expect(isNumeric(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('rejects NaN, Infinity, null and undefined', () => {
    for (const value of [NaN, Infinity, null, undefined]) {
      expect(isNumeric(value), String(value)).toBe(false);
    }
  });

  it('rejects arrays, objects and booleans', () => {
    for (const value of [[], [5], ['5'], {}, true, false]) {
      expect(isNumeric(value), JSON.stringify(value)).toBe(false);
    }
  });
});

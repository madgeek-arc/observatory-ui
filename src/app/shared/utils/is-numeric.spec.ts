import { isNumeric } from './is-numeric';

/** The expectations were taken from the rxjs 6.6.7 implementation this function replaces. */
describe('isNumeric', () => {
  it('accepts numbers and numeric strings', () => {
    for (const value of [5, 0, -5, 5.5, '5', '5.5', '-5', '0', '1e3', ' 5 ', '0x10']) {
      expect(isNumeric(value)).withContext(JSON.stringify(value)).toBeTrue();
    }
  });

  it('rejects empty and non-numeric strings', () => {
    for (const value of ['', ' ', 'abc', '12abc', 'Infinity', 'NaN']) {
      expect(isNumeric(value)).withContext(JSON.stringify(value)).toBeFalse();
    }
  });

  it('rejects NaN, Infinity, null and undefined', () => {
    for (const value of [NaN, Infinity, null, undefined]) {
      expect(isNumeric(value)).withContext(String(value)).toBeFalse();
    }
  });

  it('rejects arrays, objects and booleans', () => {
    for (const value of [[], [5], ['5'], {}, true, false]) {
      expect(isNumeric(value)).withContext(JSON.stringify(value)).toBeFalse();
    }
  });
});

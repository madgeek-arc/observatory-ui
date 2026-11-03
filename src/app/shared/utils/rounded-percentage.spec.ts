import { roundedPercentage } from './rounded-percentage';

describe('roundedPercentage', () => {
  it('rounds to a whole number, half up', () => {
    expect(roundedPercentage(1, 2)).toBe(50);
    expect(roundedPercentage(1, 3)).toBe(33);
    expect(roundedPercentage(2, 3)).toBe(67);
    expect(roundedPercentage(21, 40)).toBe(53); // 52.5
    expect(roundedPercentage(19, 40)).toBe(48); // 47.5
  });

  it('returns 0 instead of NaN when there is no total', () => {
    expect(roundedPercentage(0, 0)).toBe(0);
  });

  it('covers 0 and 100', () => {
    expect(roundedPercentage(0, 5)).toBe(0);
    expect(roundedPercentage(5, 5)).toBe(100);
  });
});

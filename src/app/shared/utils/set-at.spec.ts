import { signal } from '@angular/core';
import { setAt } from './set-at';

describe('setAt', () => {
  it('sets the slot and gives the signal a new array', () => {
    const list = signal<number[]>([1, 2]);
    const before = list();

    setAt(list, 1, 5);

    expect(list()).toEqual([1, 5]);
    expect(list()).not.toBe(before);
    expect(before).toEqual([1, 2]);
  });

  it('keeps the length of a plain index assignment when a later slot arrives first', () => {
    const list = signal<number[]>([]);

    setAt(list, 1, 7);

    expect(list().length).toBe(2);
    expect(list()[0]).toBeUndefined();
    expect(list()[1]).toBe(7);

    setAt(list, 0, 3);
    expect(list()).toEqual([3, 7]);
  });

  it('works for arrays of objects', () => {
    const list = signal<{ a: number }[][]>([]);
    const first = [{ a: 1 }];

    setAt(list, 0, first);

    expect(list()[0]).toBe(first);
  });
});

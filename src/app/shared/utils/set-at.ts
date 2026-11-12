import { WritableSignal } from "@angular/core";

/**
 * Sets one slot of an array held in a signal and gives the signal a new array, so OnPush components and the chart
 * wrappers (which only redraw when the bound reference changes) see the change. The pages fill their per-year
 * arrays from separate queries, in whatever order the answers arrive, so a slot may be written before the ones
 * below it; the copy keeps the length that `list[index] = value` would give.
 */
export function setAt<T>(list: WritableSignal<T[]>, index: number, value: T): void {
  list.update(items => {
    const next = [...items];
    next[index] = value;
    return next;
  });
}

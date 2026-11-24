import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'premiumSort' })
export class PremiumSortPipe implements PipeTransform {
  transform(arr: any[], weights: string[]): any {
    const ret = (arr || []).sort((a, b): number => {
      let val = 0;
      const weightA = weights.indexOf(a.name);
      const weightB = weights.indexOf(b.name);
      if (weightA !== -1 && weightB !== -1) {
        val = weightA - weightB;
      } else if (weightA !== -1) {
        val = -1;
      } else if (weightB !== -1) {
        val = 1;
      } else {
        val = a.name.localeCompare(b.name);
      }
      return val;
    });
    return ret;
  }
}


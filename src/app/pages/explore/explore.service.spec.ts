import { TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { RawData } from '../../domain/raw-data';
import { EoscReadinessDataService } from '../services/eosc-readiness-data.service';
import { DataHandlerService } from '../services/data-handler.service';
import { ExploreService } from './explore.service';

const rawData = (...rows: [string, string | null][]) =>
  ({datasets: [{series: {result: rows.map(row => ({row}))}}]}) as unknown as RawData;

describe('ExploreService', () => {
  let service: ExploreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: EoscReadinessDataService, useValue: {getLastUpdateDate: () => NEVER}},
        {provide: DataHandlerService, useValue: {}},
      ]
    });
    service = TestBed.inject(ExploreService);
  });

  describe('isNumeric', () => {
    it('accepts amounts the way the survey wrote them, e.g. .2 and 1.50', () => {
      for (const value of ['.2', '1.50', '8.0', '28.1', '0', ' 5 ']) {
        expect(service.isNumeric(value), JSON.stringify(value)).toBe(true);
      }
    });

    it('rejects answers that are not numbers', () => {
      for (const value of ['', ' ', 'n/a', '1,5', null]) {
        expect(service.isNumeric(value), JSON.stringify(value)).toBe(false);
      }
    });
  });

  it('sums every stated amount, including Luxembourg\'s .2 in the 2023 Question68 answers', () => {
    const question68In2023 = rawData(
      ['GE', '0.6'], ['IE', '0.58'], ['PL', '0.33'], ['CY', '0.23'], ['LU', '.2'], ['ES', '0'], ['DE', ''], ['AT', null]
    );

    expect(service.calculateSum(question68In2023)).toBe('1.94');
  });
});

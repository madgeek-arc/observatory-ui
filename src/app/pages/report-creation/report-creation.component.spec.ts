import { TestBed } from '@angular/core/testing';
import { RawData } from '../../domain/raw-data';
import { EoscReadinessDataService } from '../services/eosc-readiness-data.service';
import { ReportCreationService } from '../services/report-creation.service';
import { ReportCreationComponent } from './report-creation.component';

/** The shape of a stats API answer: one row per country, `[countryCode, value]`. */
function rawData(...rows: (string | null)[][]): RawData {
  return {datasets: [{series: {result: rows.map(row => ({row}))}}]} as unknown as RawData;
}

describe('ReportCreationComponent', () => {
  let component: ReportCreationComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: EoscReadinessDataService, useValue: {}},
        {provide: ReportCreationService, useValue: {}}
      ]
    });
    // Not rendered, so nothing is loaded; the series builders are called directly
    component = TestBed.createComponent(ReportCreationComponent).componentInstance;
  });

  describe('rangeColumnsSeries', () => {
    const researchers = rawData(['AT', '10000'], ['BE', '20000'], ['FR', '60000']);

    it('stores the total invested, in millions of euros, as <query>_invested', () => {
      // 1.5 + 2.25 + 1200.5
      const investments = rawData(['AT', '1.5'], ['BE', '2.25'], ['FR', '1200.5']);

      component.rangeColumnsSeries([investments, researchers], 'Question56');

      expect(component.reportData['Question56_invested']).toBe('1,204.25');
    });

    it('counts countries without researcher figures and skips answers that are not numbers', () => {
      const investments = rawData(['AT', '1'], ['XX', '10'], ['BE', ''], ['FR', null], ['DE', 'n/a']);

      component.rangeColumnsSeries([investments, researchers], 'Question60');

      expect(component.reportData['Question60_invested']).toBe('11.00');
    });

    it('counts amounts the way the survey wrote them, e.g. 1.50 and .3', () => {
      // the survey-tool isNumeric only accepted values that round-trip through String(parseFloat(value))
      const investments = rawData(['HR', '1.50'], ['LU', '.3'], ['BG', '1.5']);

      component.rangeColumnsSeries([investments, researchers], 'Question56');

      expect(component.reportData['Question56_invested']).toBe('3.30');
    });

    it('shows 0.00 when nobody stated an amount', () => {
      component.rangeColumnsSeries([rawData(['AT', ''], ['BE', null]), researchers], 'Question64');

      expect(component.reportData['Question64_invested']).toBe('0.00');
    });
  });
});

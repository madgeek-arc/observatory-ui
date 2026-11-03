import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RawData } from '../../domain/raw-data';
import { EoscReadinessDataService } from '../services/eosc-readiness-data.service';
import { ReportCreationService } from '../services/report-creation.service';
import { ReportCreationComponent } from './report-creation.component';
import { buildsPies, Chart, chartsCfg, reportKeys } from './report-chart.configuration';

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

// report_template.docx is checked against reportKeys and buildsPies (npm run docx:tags:check), so what the charts
// really set has to be what those say
describe('report-chart.configuration contract', () => {
  const answers = rawData(['AT', 'Yes'], ['BE', 'No']);
  const amounts = rawData(['AT', '5'], ['BE', '7']);

  const cases: [string, string[], string[], RawData][] = [
    ['mapWithPoints', ['Question6', 'Question6.1'], ['Question6', 'Question6.1'], answers],
    ['stackedBars', ['Question6', 'Question6.1'], ['Question6'], answers],
    ['barChart', ['Question7'], ['Question7'], answers],
    ['rangeColumns', ['Question56', 'Question1'], ['Question56'], amounts],
    ['totalInvestments', ['Question56', 'Question1'], ['Question56_trend'], amounts],
    ['totalInvestmentsRangeColumns', ['Question5', 'Question1'], ['Question5_total'], amounts],
  ];

  let component: ReportCreationComponent;
  let getQuestionEU: jasmine.Spy;

  beforeEach(() => {
    getQuestionEU = jasmine.createSpy('getQuestionEU');
    TestBed.configureTestingModule({
      providers: [
        {provide: EoscReadinessDataService, useValue: {getQuestionEU}},
        {provide: ReportCreationService, useValue: {}}
      ]
    });
    component = TestBed.createComponent(ReportCreationComponent).componentInstance;
    // The trend charts need a previous survey and the first one to compare with
    component.years = ['2022', '2023', '2024'];
  });

  function load(type: string, namedQueries: string[], stats: string[], answer: RawData): Chart {
    getQuestionEU.and.returnValue(of(answer));
    const chart: Chart = {title: type, namedQueries, stats, type, data: [], chartSeries: [], pieSeries: []};
    component.loadChart(chart);
    return chart;
  }

  cases.forEach(([type, namedQueries, stats, answer]) => {
    it(`sets the text tags of a ${type} chart that reportKeys lists, no more and no fewer`, () => {
      const chart = load(type, namedQueries, stats, answer);

      expect(Object.keys(component.reportData).sort()).toEqual(reportKeys(chart).sort());
    });

    it(`builds the pie charts of a ${type} chart that buildsPies says`, () => {
      const chart = load(type, namedQueries, stats, answer);

      expect(chart.pieSeries!.length).toBe(buildsPies(chart) ? namedQueries.length : 0);
    });
  });

  it('is checked for every chart type of chartsCfg', () => {
    expect(new Set(chartsCfg.map(chart => chart.type))).toEqual(new Set(cases.map(([type]) => type)));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Highcharts from 'highcharts';
import { SeriesPieOptions } from 'highcharts';
import { ReportPieChartComponent } from './report-pie-chart.component';

describe('ReportPieChartComponent', () => {
  let fixture: ComponentFixture<ReportPieChartComponent>;

  /** Renders a Yes/No pie and returns the percentage labels, in slice order. */
  async function renderLabels(data: { y: number, custom?: { percentage: number } }[]): Promise<string[]> {
    fixture = TestBed.createComponent(ReportPieChartComponent);
    const ready = new Promise<Highcharts.Chart>(resolve => fixture.componentInstance.chartReady.subscribe(resolve));
    fixture.componentRef.setInput('series', [{type: 'pie', data}] as SeriesPieOptions[]);
    fixture.detectChanges();
    const chart = await ready;
    // Highcharts draws white labels twice, the second time as an outline copy
    const labels = chart.container.querySelectorAll('.highcharts-data-label text');
    return Array.from(labels, label => {
      const copy = label.cloneNode(true) as Element;
      copy.querySelectorAll('.highcharts-text-outline').forEach(outline => outline.remove());
      return copy.textContent?.replace(/​/g, '').trim() ?? '';
    });
  }

  afterEach(() => fixture?.destroy());

  it('shows the percentages the series supplies, so a 52.5 / 47.5 split totals 100', async () => {
    const labels = await renderLabels([
      {y: 19, custom: {percentage: 47}},
      {y: 21, custom: {percentage: 53}}
    ]);

    expect(labels).toEqual(['47%', '53%']);
  });

  it('falls back to rounding each slice when the series supplies no percentages', async () => {
    const labels = await renderLabels([{y: 1}, {y: 3}]);

    expect(labels).toEqual(['25%', '75%']);
  });
});

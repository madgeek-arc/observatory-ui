import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPieChartComponent } from './report-pie-chart.component';

describe('ReportPieChartComponent', () => {
  let component: ReportPieChartComponent;
  let fixture: ComponentFixture<ReportPieChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportPieChartComponent]
    });
    fixture = TestBed.createComponent(ReportPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

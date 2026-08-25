export type IndicatorKind = 'indicator' | 'trend' | 'map' | 'policy';
export type IndicatorFormat = 'percentage' | 'number' | 'currency' | 'category' | 'yes-no';
export type DashboardChartType = 'LINE' | 'BAR' | 'PIE' | 'MAP' | 'POLICY' | 'TABLE' | 'SCALAR';

export interface ExploreIndicatorConfig {
  id: string;
  label: string;
  group: string;
  kind: IndicatorKind;
  format: IndicatorFormat;
  source: string;
  chartType: DashboardChartType;
  hasAverage: boolean;
}

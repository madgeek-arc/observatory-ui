export type IndicatorKind = 'indicator' | 'trend' | 'map' | 'policy';
export type IndicatorFormat = 'percentage' | 'number' | 'currency' | 'category' | 'yes-no';

export interface ExploreIndicatorConfig {
  id: string;
  label: string;
  group: string;
  kind: IndicatorKind;
  format: IndicatorFormat;
  source: string;
  hasAverage: boolean;
}

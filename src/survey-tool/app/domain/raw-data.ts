export class RawData {
  datasets: Series[];
}

export class Series {
  series: SeriesItem;
}

export class SeriesItem {
  query: Query;
  result: Row[];
}

export class Query {
  name: string;
  parameters: string[];
  filters: string;
  select: string;
  entity: string;
  profile: string;
  limit: number;
  orderBy: string;
}

export class Row {
  row: string[];
}

export class Data {
  data: [][] = [];
}

export class ChartData {
  xAxis_categories: string[] = [];
  dataSeriesNames: string[] = [];
  dataSeriesTypes: string[] = [];
  drilldown: any = null;
  series: SeriesData[] = [];
}

class SeriesData {
  data: number[] = [];
}

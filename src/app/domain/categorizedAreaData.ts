import {DataLabelsOptions} from "highcharts";

export class CategorizedAreaData {
  series: Series[];

  constructor() {
    this.series = [];
  }
}

export class Series {
  allAreas: boolean;
  name: string;
  type: string;
  color: string;
  showInLegend: boolean;
  dataLabels: DataLabelsOptions = {};
  // marker: Marker;
  data: any[];

  constructor(name: string, allAreas: boolean, type?: string, marker?: Marker) {
    this.allAreas = allAreas;
    this.name = name;
    this.data = [];
    this.dataLabels.enabled = false;
    this.showInLegend = false;
    this.type = undefined;
    if (type) {
      this.type = type;
    }
    // this.marker = null;
    // if (marker) {
    //   this.marker = new Marker(marker.radius, marker.fillColor);
    // }
  }
}

export class Marker {
  radius: number;
  fillColor: string

  constructor(radius: number, fillColor: string) {
    this.radius = radius;
    this.fillColor = fillColor;
  }
}

import {DataLabelsOptions, PointMarkerOptionsObject} from "highcharts";

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
  marker: PointMarkerOptionsObject = {};
  data: any[];

  constructor(name: string, allAreas: boolean, type?: string) {
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


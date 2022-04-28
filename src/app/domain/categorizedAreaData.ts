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
  data: any[]

  constructor(name) {
    this.allAreas = false;
    this.name = name;
    this.type = undefined;
    this.data = [];
  }
}

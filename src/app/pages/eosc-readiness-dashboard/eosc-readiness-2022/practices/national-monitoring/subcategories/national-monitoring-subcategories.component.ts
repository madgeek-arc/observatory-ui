import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-national-monitoring-subcategories',
  templateUrl: 'national-monitoring-subcategories.component.html'
})

export class NationalMonitoringSubcategoriesComponent implements OnInit{

  dataType: string = null;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        console.log(params);
        this.dataType = params['dataType'];
      }
    )
  }
}

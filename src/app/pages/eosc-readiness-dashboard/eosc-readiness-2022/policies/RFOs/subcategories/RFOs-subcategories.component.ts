import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-RFOs-subcategories',
  templateUrl: 'RFOs-subcategories.component.html'
})

export class RFOsSubcategoriesComponent implements OnInit{

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

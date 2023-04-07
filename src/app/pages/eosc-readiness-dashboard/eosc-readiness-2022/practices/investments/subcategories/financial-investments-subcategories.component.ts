import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-financial-investments-subcategories',
  templateUrl: 'financial-investments-subcategories.component.html'
})

export class FinancialInvestmentsSubcategoriesComponent implements OnInit{

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

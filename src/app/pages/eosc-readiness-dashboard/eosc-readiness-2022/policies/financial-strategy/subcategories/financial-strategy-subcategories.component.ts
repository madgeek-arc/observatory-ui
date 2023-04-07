import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-financial-strategy-subcategories',
  templateUrl: 'financial-strategy-subcategories.component.html'
})

export class FinancialStrategySubcategoriesComponent implements OnInit{

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

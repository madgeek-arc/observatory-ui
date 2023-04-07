import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-use-case-subcategories',
  templateUrl: 'use-cases-subcategories.component.html'
})

export class UseCasesSubcategoriesComponent implements OnInit {

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

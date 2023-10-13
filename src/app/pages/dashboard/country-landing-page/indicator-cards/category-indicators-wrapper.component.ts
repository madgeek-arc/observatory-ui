import {Component, Input} from "@angular/core";

@Component({
  selector: 'category-indicators-wrapper',
  templateUrl: 'category-indicators-wrapper.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class CategoryIndicatorsWrapperComponent {

  @Input('hasSubcategories') hasSubcategories: boolean = false;

  @Input('cardTitle') cardTitle: string = null;
  @Input('cardIcon') cardIcon: string = null;
}

import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'category-indicators-wrapper',
    templateUrl: 'category-indicators-wrapper.component.html',
    styleUrls: ['../country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class CategoryIndicatorsWrapperComponent {

  @Input('hasSubcategories') hasSubcategories: boolean = false;

  @Input('cardTitle') cardTitle: string = null;
  @Input('cardIcon') cardIcon: string = null;
}

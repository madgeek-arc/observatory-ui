import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
    selector: 'category-indicators-wrapper',
    templateUrl: 'category-indicators-wrapper.component.html',
    styleUrls: ['../country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass]
})

export class CategoryIndicatorsWrapperComponent {

  @Input('hasSubcategories') hasSubcategories: boolean = false;

  @Input('cardTitle') cardTitle: string = null;
  @Input('cardIcon') cardIcon: string = null;
}

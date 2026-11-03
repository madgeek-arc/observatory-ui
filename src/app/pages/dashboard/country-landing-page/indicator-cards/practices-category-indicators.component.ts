import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'practices-category-indicators',
    templateUrl: 'practices-category-indicators.component.html',
    styleUrls: ['../country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class PracticesCategoryIndicatorsComponent {

  @Input('subtitle') subtitle: string = null;

  @Input('monitoring') monitoring: string = null;
  @Input('useCases') useCases: string = null;
  @Input('investments') investments: string = null;
  @Input('outputs') outputs: string = null;

  @Input('outputsTitle') outputsTitle: string = null;

}

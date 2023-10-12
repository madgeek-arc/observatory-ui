import {Component, Input} from "@angular/core";

@Component({
  selector: 'practices-category-indicators',
  templateUrl: 'practices-category-indicators.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class PracticesCategoryIndicatorsComponent {

  @Input('subtitle') subtitle: string = null;

  @Input('monitoring') monitoring: boolean = null;
  @Input('useCases') useCases: boolean = null;
  @Input('investments') investments: number = null;
  @Input('outputs') outputs: number = null;

  @Input('outputsTitle') outputsTitle: string = null;

}

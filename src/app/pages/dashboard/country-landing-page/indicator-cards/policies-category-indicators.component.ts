import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'policies-category-indicators',
    templateUrl: 'policies-category-indicators.component.html',
    styleUrls: ['../country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class PoliciesCategoryIndicatorsComponent {

  @Input('subtitle') subtitle: string = null;

  @Input('nationalPolicy') nationalPolicy: string = null;
  @Input('financialStrategy') financialStrategy: string = null;
  @Input('rpos') rpos: string = null;
  @Input('rfos') rfos: string = null;

}

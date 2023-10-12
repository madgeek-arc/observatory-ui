import {Component, Input} from "@angular/core";

@Component({
  selector: 'policies-category-indicators',
  templateUrl: 'policies-category-indicators.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class PoliciesCategoryIndicatorsComponent {

  @Input('subtitle') subtitle: string = null;

  @Input('nationalPolicy') nationalPolicy: boolean = null;
  @Input('financialStrategy') financialStrategy: boolean = null;
  @Input('rpos') rpos: number = null;
  @Input('rfos') rfos: number = null;

}

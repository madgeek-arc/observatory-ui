import {Component, Input} from "@angular/core";

@Component({
  selector: 'policies-category-indicators',
  templateUrl: 'policies-category-indicators.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class PoliciesCategoryIndicatorsComponent {

  @Input('subtitle') subtitle: string = null;

  @Input('nationalPolicy') nationalPolicy: string = null;
  @Input('financialStrategy') financialStrategy: string = null;
  @Input('rpos') rpos: string = null;
  @Input('rfos') rfos: string = null;

}

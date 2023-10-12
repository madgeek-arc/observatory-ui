import {Component, Input} from "@angular/core";

@Component({
  selector: 'policies-subcategories-indicators-card',
  templateUrl: 'policies-subcategories-indicators-card.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class PoliciesSubcategoriesIndicatorsCardComponent {

  @Input('cardTitle') cardTitle: string = null;
  @Input('cardIcon') cardIcon: string = null;

  @Input('nationalPolicy') nationalPolicy: boolean = null;
  @Input('financialStrategy') financialStrategy: boolean = null;
  @Input('rpos') rpos: number = null;
  @Input('rfos') rfos: number = null;

}

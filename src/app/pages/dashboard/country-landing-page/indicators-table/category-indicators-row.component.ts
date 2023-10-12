import {Component, Input} from "@angular/core";

@Component({
  selector: 'category-indicators-row',
  templateUrl: 'category-indicators-row.component.html',
  styleUrls: ['../country-landing-page.component.css'],
})

export class CategoryIndicatorsRowComponent {

  @Input('indicator1') indicator1: string = null;
  @Input('indicator2') indicator2: string = null;
  @Input('indicator3') indicator3: string = null;
  @Input('indicator4') indicator4: string = null;

}

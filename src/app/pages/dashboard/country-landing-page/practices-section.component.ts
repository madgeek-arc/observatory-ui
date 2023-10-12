import {Component, Input} from "@angular/core";

@Component({
  selector: 'country-landing-page-practices',
  templateUrl: 'practices-section.component.html',
  styleUrls: ['./country-landing-page.component.css'],
})

export class CountryLandingPagePracticesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;
}

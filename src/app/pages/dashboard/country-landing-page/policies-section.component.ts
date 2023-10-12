import {Component, Input} from "@angular/core";

@Component({
  selector: 'country-landing-page-policies',
  templateUrl: 'policies-section.component.html',
  styleUrls: ['./country-landing-page.component.css'],
})

export class CountryLandingPagePoliciesComponent {

  @Input('countryCode') countryCode: string = null;
  @Input('surveyAnswer') surveyAnswer: Object = null;
}

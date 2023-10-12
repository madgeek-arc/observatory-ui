import {Component, Input} from "@angular/core";

@Component({
  selector: 'country-landing-page-general',
  templateUrl: 'general-section.component.html',
  styleUrls: ['./country-landing-page.component.css'],
})

export class CountryLandingPageGeneralComponent {

  @Input('countryCode') countryCode: string = null;
  @Input('surveyAnswer') surveyAnswer: Object = null;
}

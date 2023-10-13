import {Component, Input} from "@angular/core";

@Component({
  selector: 'country-landing-page-use-cases',
  templateUrl: 'use-cases-section.component.html',
  styleUrls: ['./country-landing-page.component.css'],
})

export class CountryLandingPageUseCasesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;
}

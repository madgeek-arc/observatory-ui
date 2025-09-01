import {Component, Input} from "@angular/core";

@Component({
    selector: 'country-landing-page-use-cases',
    templateUrl: 'use-cases-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    standalone: false
})

export class CountryLandingPageUseCasesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;
}

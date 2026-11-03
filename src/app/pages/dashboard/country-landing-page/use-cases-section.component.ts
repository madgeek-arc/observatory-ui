import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'country-landing-page-use-cases',
    templateUrl: 'use-cases-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class CountryLandingPageUseCasesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;
}

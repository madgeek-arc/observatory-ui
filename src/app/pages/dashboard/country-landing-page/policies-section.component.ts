import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import { NgClass } from "@angular/common";
import { CategoryIndicatorsWrapperComponent } from "./indicator-cards/category-indicators-wrapper.component";
import { PoliciesCategoryIndicatorsComponent } from "./indicator-cards/policies-category-indicators.component";

@Component({
    selector: 'country-landing-page-policies',
    templateUrl: 'policies-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, CategoryIndicatorsWrapperComponent, PoliciesCategoryIndicatorsComponent]
})

export class CountryLandingPagePoliciesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;

  formatComments(comment: string) {
    console.log('Comment before: ',comment);
    comment = comment.replace(/\\n/g,'<br>');
    comment = comment.replace(/\\t/g,' ');
    console.log('Comment after: ',comment);
    return comment;
  }
}

import {Component, input, ChangeDetectionStrategy} from "@angular/core";
import { CommonModule, NgClass } from "@angular/common";
import { CategoryIndicatorsWrapperComponent } from "./indicator-cards/category-indicators-wrapper.component";
import { PracticesCategoryIndicatorsComponent } from "./indicator-cards/practices-category-indicators.component";

@Component({
    selector: 'country-landing-page-practices',
    templateUrl: 'practices-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, CategoryIndicatorsWrapperComponent, PracticesCategoryIndicatorsComponent]
})

export class CountryLandingPagePracticesComponent {

  readonly surveyAnswer = input<Object>(null);

  formatComments(comment: string) {
    console.log('Comment before: ',comment);
    comment = comment.replace(/\\n/g,'<br>');
    comment = comment.replace(/\\t/g,' ');
    console.log('Comment after: ',comment);
    return comment;
  }
}

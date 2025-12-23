import {Component, Input} from "@angular/core";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'country-landing-page-practices',
    templateUrl: 'practices-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    standalone: false
})

export class CountryLandingPagePracticesComponent {

  @Input('surveyAnswer') surveyAnswer: Object = null;

  formatComments(comment: string) {
    console.log('Comment before: ',comment);
    comment = comment.replace(/\\n/g,'<br>');
    comment = comment.replace(/\\t/g,' ');
    console.log('Comment after: ',comment);
    return comment;
  }
}

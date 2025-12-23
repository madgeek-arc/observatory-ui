import {Component, Input} from "@angular/core";

@Component({
    selector: 'country-landing-page-policies',
    templateUrl: 'policies-section.component.html',
    styleUrls: ['./country-landing-page.component.css'],
    standalone: false
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

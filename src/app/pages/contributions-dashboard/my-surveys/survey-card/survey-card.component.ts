import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {SurveyAnswer, Survey} from "../../../../domain/survey";
import {UserService} from "../../../../services/user.service";
import {MemberOf} from "../../../../domain/userInfo";
import {SurveyService} from "../../../../services/survey.service";

@Component({
  selector: 'app-survey-card',
  templateUrl: './survey-card.component.html',
  providers: [SurveyService]
})

export class SurveyCardComponent implements OnChanges {
  @Input() survey: Survey;

  currentGroup: MemberOf = null;
  answer: SurveyAnswer = null
  permissions: string[] = null;

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.survey);
    this.userService.currentStakeholderGroup.subscribe(
      next => {
        this.currentGroup = next;
        if (this.currentGroup !== null) {
          this.surveyService.getLatestAnswer(this.currentGroup.id, this.survey.id).subscribe(
            next => {
              this.answer = next;
              this.surveyService.getPermissions(this.answer.id).subscribe(
                next => {
                  this.permissions = next;
                });
            });
        }
      },
      error => {console.error(error)},
      () => {});
  }

}

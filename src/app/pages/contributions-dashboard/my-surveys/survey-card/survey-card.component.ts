import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {SurveyAnswer, Survey, ResourcePermission} from "../../../../domain/survey";
import {UserService} from "../../../../services/user.service";
import {Stakeholder} from "../../../../domain/userInfo";
import {SurveyService} from "../../../../services/survey.service";

@Component({
  selector: 'app-survey-card',
  templateUrl: './survey-card.component.html',
  providers: [SurveyService]
})

export class SurveyCardComponent implements OnChanges {
  @Input() survey: Survey;

  currentGroup: Stakeholder = null;
  surveyAnswer: SurveyAnswer = null
  permissions: ResourcePermission[] = null;
  chapterIds: string[] = [];

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.userService.currentStakeholder.subscribe(
      next => {
        this.currentGroup = next;
        if (this.currentGroup !== null) {
          this.surveyService.getLatestAnswer(this.currentGroup.id, this.survey.id).subscribe(
            next => {
              this.surveyAnswer = next;
              for (const chapter in this.surveyAnswer.chapterAnswers) {
                // console.log(`${chapter}: `);
                // console.log(this.answer.chapterAnswers[chapter].chapterId);
                this.chapterIds.push(chapter); // send chapter answer id array
              }
              this.surveyService.getPermissions(this.chapterIds).subscribe(
                next => {
                  this.permissions = next;
                });
            });
        }
      },
      error => {console.error(error)},
      () => {});
  }

  checkForPermission(right: string): boolean {
    for (const permission of this.permissions) {
      if (permission.permissions.includes(right))
        return true;
    }
    return false;
  }

  changeValidStatus(answerId: string, valid: boolean) {
    this.surveyService.changeAnswerValidStatus(answerId, !valid).subscribe(
      next => {
        this.surveyAnswer = next;
        this.surveyService.getPermissions(this.chapterIds).subscribe(
          next => {
            this.permissions = next;
          },
          error => {
            console.error(error)
          },
          () => {});
      },
      error => {
        console.error(error)
      },
      () => {});
  }

}

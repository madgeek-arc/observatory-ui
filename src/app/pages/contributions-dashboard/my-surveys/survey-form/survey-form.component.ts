import {Component, OnInit, ViewChild} from "@angular/core";
import {ChapterEditComponent} from "../../../../../catalogue-ui/pages/dynamic-form/chapter-edit.component";
import {SurveyService} from "../../../../services/survey.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {Stakeholder} from "../../../../domain/userInfo";
import {Survey, SurveyAnswer} from "../../../../domain/survey";
import {UserService} from "../../../../services/user.service";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html',
  providers: [SurveyService]
})

export class SurveyFormComponent implements OnInit {
  @ViewChild(ChapterEditComponent) child: ChapterEditComponent

  private sub: Subscription;
  currentGroup: Stakeholder = null;
  tabsHeader: string = null;
  survey: Survey = null;
  surveyAnswers: SurveyAnswer = null
  surveyId: string = null;

  constructor(private surveyService: SurveyService, private userService: UserService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.tabsHeader = 'Sections';

    this.sub = this.route.params.subscribe(params => {
      console.log(params);
      this.surveyId = params['surveyId'];
      this.userService.currentStakeholder.subscribe(
        next => {
          this.currentGroup = next;
          if (this.currentGroup !== null) {
            this.surveyService.getLatestAnswer(this.currentGroup.id, this.surveyId).subscribe(
              next => {
                this.surveyAnswers = next;
              });
          }
        },
        error => {console.error(error)},
        () => {});
      // this.surveyService.getAnswerValues(params['answerId']).subscribe(
      //   res => {
      //     // console.log(res)
      //     this.answerValue = res;
      //   });
      this.surveyService.getSurvey(this.surveyId).subscribe(
        res => {
          this.survey = res;
        }
      )
    });
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

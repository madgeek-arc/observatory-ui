import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ChapterEditComponent} from "../../../../../catalogue-ui/pages/dynamic-form/chapter-edit.component";
import {SurveyService} from "../../../../services/survey.service";
import {Subscriber} from "rxjs";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {Stakeholder} from "../../../../domain/userInfo";
import {SurveyAnswer} from "../../../../domain/survey";
import {UserService} from "../../../../services/user.service";
import {zip} from "rxjs/internal/observable/zip";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html',
  providers: [SurveyService]
})

export class SurveyFormComponent implements OnInit, OnDestroy {
  @ViewChild(ChapterEditComponent) child: ChapterEditComponent

  subscriptions = [];
  currentGroup: Stakeholder = null;
  tabsHeader: string = null;
  survey: Model = null;
  surveyAnswers: SurveyAnswer = null
  surveyId: string = null;
  stakeholderId: string = null;
  ready = false;
  printPDf = false;

  constructor(private surveyService: SurveyService, private userService: UserService, private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    this.ready = false;
    this.tabsHeader = 'Sections';
    if (this.router.url.includes('printPdf'))
      this.printPDf = true;

    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.surveyId = params['surveyId'];
        if (params['stakeholderId']) {
          this.stakeholderId = params['stakeholderId'];
        } else {
          this.stakeholderId = params['id'];
        }

        this.subscriptions.push(
          zip(
            this.surveyService.getLatestAnswer(this.stakeholderId, this.surveyId),
            this.surveyService.getSurvey(this.surveyId),
          ).subscribe( next => {
            this.surveyAnswers = next[0];
            this.survey = next[1];
          }, error => {console.log(error)},
          () => { this.ready = true; })
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

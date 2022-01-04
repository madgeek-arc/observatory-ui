import {Component, OnInit, ViewChild} from "@angular/core";
import {DynamicFormEditComponent} from "../../../../../catalogue-ui/pages/dynamic-form/dynamic-form-edit.component";
import {SurveyService} from "../../../../services/survey.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Route, Router} from "@angular/router";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html',
  providers: [SurveyService]
})

export class SurveyFormComponent implements OnInit {
  @ViewChild(DynamicFormEditComponent) child: DynamicFormEditComponent

  private sub: Subscription;
  tabsHeader: string = null;
  notice: string = null;
  name: string = null;
  answerValue: Object = null;
  readonly: boolean = null;
  surveyId: string = null;

  constructor(private surveyService: SurveyService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.tabsHeader = 'Sections';
    if (this.router.url.includes('/view')) {
      this.readonly = true;
    }
    this.sub = this.route.params.subscribe(params => {
      this.surveyId = params['surveyId'];
      this.surveyService.getAnswerValues(this.surveyId).subscribe(
        res => {
          // console.log(res)
          this.answerValue = res;
        });
      this.surveyService.getSurvey(this.surveyId).subscribe(
        res => {
          this.name = res.name;
          this.notice = res.notice;
        }
      )
    });
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

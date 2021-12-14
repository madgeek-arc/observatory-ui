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
      this.surveyService.getAnswerValues(params['answerId']).subscribe(
        res => {
          // console.log(res)
          this.answerValue = res;
        });
    });
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

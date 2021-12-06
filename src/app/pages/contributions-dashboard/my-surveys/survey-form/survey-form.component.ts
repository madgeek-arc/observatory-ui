import {Component, OnInit, ViewChild} from "@angular/core";
import {DynamicFormEditComponent} from "../../../../../catalogue-ui/pages/dynamic-form/dynamic-form-edit.component";
import {SurveyService} from "../../../../services/survey.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Route} from "@angular/router";

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

  constructor(private surveyService: SurveyService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.tabsHeader = 'Sections';
    this.sub = this.route.params.subscribe(params => {
      this.surveyService.getAnswerValues(params['id']).subscribe(
        res => {
          console.log(res)
          this.answerValue = res;
        });
    });
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

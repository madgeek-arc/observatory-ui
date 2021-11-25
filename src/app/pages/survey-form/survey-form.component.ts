import {Component, OnInit, ViewChild} from "@angular/core";
import {DynamicFormComponent} from "../../../catalogue-ui/pages/dynamic-form/dynamic-form.component";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html'
})

export class SurveyFormComponent implements OnInit {
  @ViewChild(DynamicFormComponent) child: DynamicFormComponent

  tabsHeader: string = null;
  ngOnInit() {
    this.tabsHeader = 'Header for tabs block';
  }

  callChildFnc() {
    this.child.onSubmit(false);
  }

}

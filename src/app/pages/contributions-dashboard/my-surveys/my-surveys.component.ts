import {Component, OnInit} from "@angular/core";
import {Stakeholder} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {Survey} from "../../../domain/survey";
import {SurveyService} from "../../../services/survey.service";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html',
  providers: [SurveyService]
})

export class MySurveysComponent implements OnInit{

  currentGroup: Stakeholder = null;
  surveys: Paging<Survey>;

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.userService.currentStakeholder.subscribe(
      next => {
        this.currentGroup = next;
        if (this.currentGroup !== null) {
          this.surveyService.getSurveys(this.currentGroup.id).subscribe(
            next => {
              this.surveys = next;
            });
        }
      },
      error => {console.error(error)},
      () => {}
    );
  }

}

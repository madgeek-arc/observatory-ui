import {Component, OnDestroy, OnInit} from "@angular/core";
import {Stakeholder} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {Survey} from "../../../domain/survey";
import {SurveyService} from "../../../services/survey.service";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html',
  providers: [SurveyService]
})

export class MySurveysComponent implements OnInit, OnDestroy{

  subscriptions = [];
  currentGroup: Stakeholder = null;
  surveys: Paging<Survey>;

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => {
          this.currentGroup = next;
          if (this.currentGroup !== null) {
            this.subscriptions.push(
              this.surveyService.getSurveys(this.currentGroup.id).subscribe(next => {
                this.surveys = next;
              })
            );
          }
        },
        error => {console.error(error)},
        () => {}
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

}

import {Component, OnInit} from "@angular/core";
import {MemberOf} from "../../../../catalogue-ui/domain/userInfo";
import {UserService} from "../../../../catalogue-ui/services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {Survey} from "../../../../catalogue-ui/domain/survey";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html'
})

export class MySurveysComponent implements OnInit{

  currentGroup: MemberOf = null;
  surveys: Paging<Survey>;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(
      next => {
        console.log(next);
        this.currentGroup = next;
        this.userService.getUserSurveys(this.currentGroup.type).subscribe(
          next => {
            this.surveys = next;
            console.log(this.surveys);
          });
      },
      error => {console.log(error)},
      () => {

      });
  }

}

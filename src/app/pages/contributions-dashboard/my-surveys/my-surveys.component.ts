import {Component, OnInit} from "@angular/core";
import {MemberOf} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {Survey} from "../../../domain/survey";
import {Subject} from "rxjs";

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
        this.currentGroup = next;
        if (this.currentGroup !== null) {
          this.userService.getUserSurveys(this.currentGroup.type).subscribe(
            next => {
              this.surveys = next;
            });
        }
        console.log(this.currentGroup);
      },
      error => {console.error(error)},
      () => {});
  }

}

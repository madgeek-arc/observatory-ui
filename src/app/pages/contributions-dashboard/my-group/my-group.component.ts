import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../services/user.service";
import {MemberOf, StakeholdersMembers} from "../../../domain/userInfo";

import UIkit from 'uikit';
import {SurveyService} from "../../../services/survey.service";

@Component({
  selector: 'app-contributions-my-group',
  templateUrl: './my-group.component.html',
  providers: [SurveyService]
})

export class MyGroupComponent implements OnInit {

  currentGroup: MemberOf = null;
  members: StakeholdersMembers = null
  contributorEmail: string = null;
  errorMessage: string = null;

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(next => {
      this.currentGroup = next;
      if (this.currentGroup !== null) {
        this.userService.getStakeholdersMembers(this.currentGroup.id).subscribe(
          next => {
            this.members = next;
          });
      }
    });
  }

  addContributor() {
    if (this.validateEmail(this.contributorEmail)) {
      this.surveyService.addContributor(this.currentGroup.id, this.contributorEmail).subscribe(
        next => {
            this.members = next;
        },
        error => {
          console.log(error)
          this.errorMessage = error.error;
        },
        () => {
          this.errorMessage = null;
          UIkit.modal('#add-contributor-modal').hide();
        },
      );
    } else {
      this.errorMessage = 'Please give a valid email address.'
    }
  }

  isManager(email: string): boolean {
    for (let i = 0; i < this.members.managers.length; i++) {
      if (this.members.managers[i].email === email) {
        return true;
      }
    }
    return false;
  }

  closeModal() {
    this.contributorEmail = null;
    this.errorMessage = null;
  }

  validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
}

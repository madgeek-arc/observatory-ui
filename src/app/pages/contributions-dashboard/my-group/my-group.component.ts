import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../services/user.service";
import {Stakeholder, StakeholdersMembers} from "../../../domain/userInfo";
import {SurveyService} from "../../../services/survey.service";
import {ActivatedRoute} from "@angular/router";

import UIkit from 'uikit';

@Component({
  selector: 'app-contributions-my-group',
  templateUrl: './my-group.component.html',
  providers: [SurveyService]
})

export class MyGroupComponent implements OnInit {

  currentGroup: Stakeholder = null;
  members: StakeholdersMembers = null
  contributorEmail: string = null;
  userEmail: string = null;
  invitationToken: string = null;
  isManager: boolean = null;
  errorMessage: string = null;
  title = 'copy to clipboard';

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.userService.currentStakeholder.subscribe(next => {
      this.currentGroup = next;
      if (this.currentGroup !== null) {
        this.userService.getStakeholdersMembers(this.currentGroup.id).subscribe(
          next => {
            this.members = next;
          },
          error => {
            console.log(error);
          },
          () => {
            this.userEmail = this.userService.userId;
            this.isManager = this.checkIfManager(this.userEmail);
          }
        );
      }
    });
  }

  addContributor(contributor: string = 'contributor') {
    if (this.validateEmail(this.contributorEmail)) {
      // this.surveyService.addContributor(this.currentGroup.id, this.contributorEmail).subscribe(
      this.surveyService.getInvitationToken(this.contributorEmail, contributor, this.currentGroup.id).subscribe(
        next => {
          this.invitationToken = location.origin + '/invitation/accept/' + next.toString();
          this.errorMessage = null;
          this.contributorEmail = null;
          // UIkit.modal('#add-contributor-modal').hide();
        },
        error => {
          console.log(error)
          this.errorMessage = error.error.error;
        },
        () => {
          this.errorMessage = null;
          this.contributorEmail = null;
          // UIkit.modal('#add-contributor-modal').hide();
        });
    } else {
      this.errorMessage = 'Please give a valid email address.'
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.invitationToken);
    this.title = 'copied to clipboard';
  }

  removeContributor() {
    this.surveyService.removeContributor(this.currentGroup.id, this.contributorEmail).subscribe(
      next => {
        this.members = next;
        this.errorMessage = null;
        this.contributorEmail = null;
        UIkit.modal('#remove-contributor-modal').hide();
      },
      error => {
        console.log(error)
        this.errorMessage = error.error.error;
      },
      () => {
        this.errorMessage = null;
        this.contributorEmail = null;
        UIkit.modal('#remove-contributor-modal').hide();
      });
  }

  showRemoveModal(email: string) {
    this.contributorEmail = email
    UIkit.modal('#remove-contributor-modal').show();
  }

  checkIfManager(email: string): boolean {
    for (let i = 0; i < this.members.managers.length; i++) {
      if (this.members.managers[i].email === email) {
        return true;
      }
    }
    return false;
  }

  closeModal() {
    this.contributorEmail = null;
    this.invitationToken = null;
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

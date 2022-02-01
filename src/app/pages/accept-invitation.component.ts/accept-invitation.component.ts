import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SurveyService} from "../../services/survey.service";


@Component({
  selector: 'app-accept-invitation',
  templateUrl: 'accept-invitation.component.html'
})

export class AcceptInvitationComponent implements OnInit {

  token: string = null;
  loading: boolean = false;
  message: string = 'You are being registered';
  error: string = null;

  constructor(private route: ActivatedRoute, private router: Router, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.loading = true
    this.route.params.subscribe( params => {
      this.token = params['invitationToken'];
      if (this.token) {
        this.surveyService.acceptInvitation(this.token).subscribe(
          res => {
            this.loading = false;
            this.router.navigate(['/']);
          },
          error => {
            this.message = 'Something went wrong, server replied: ';
            this.error = error;
            this.loading = false;
            console.error(error);
          });
      }
    });
  }

}

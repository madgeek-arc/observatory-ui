import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SurveyService} from "../../services/survey.service";


@Component({
  selector: 'app-accept-invitation',
  template: '<div class="whiteFilm">\n' +
    '  <i class="loader-big" aria-hidden="true"></i>\n' +
    '</div>'
})

export class AcceptInvitationComponent implements OnInit {

  token: string = null;

  constructor(private route: ActivatedRoute, private router: Router, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.token = params['invitationToken'];
      if (this.token) {
        this.surveyService.acceptInvitation(this.token).subscribe(
          res => {
            this.router.navigate(['/']);
          },
          error => {
            console.log(error);
          });
      }
    });
  }

}

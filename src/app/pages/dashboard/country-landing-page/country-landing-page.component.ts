import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../../survey-tool/app/services/survey.service";
import {SurveyAnswer} from "../../../../survey-tool/app/domain/survey";
import {Model} from "../../../../survey-tool/catalogue-ui/domain/dynamic-form-model";

@Component({
  selector: 'country-landing-page',
  templateUrl: 'country-landing-page.component.html',
  providers: [SurveyService]
})

export class CountryLandingPageComponent implements OnInit {

  countryCode: string = null;
  surveyAnswer: SurveyAnswer = null;
  surveyModel: Model;
  answer: object = null;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {}

  ngOnInit() {
    this.route.params.subscribe(
      value => {
        this.countryCode = value['code'];
        this.surveyService.getLatestAnswer(`sh-country-${this.countryCode}`, 'm-jlFggsCN').subscribe(
          res => {
            this.surveyAnswer = res;
            this.answer = this.surveyAnswer.answer
            console.log(this.surveyAnswer);
          }, error => {console.error(error);}
        );
        this.surveyService.getSurvey('m-jlFggsCN').subscribe(
          res=> {this.surveyModel = res;},
          error => {console.error(error);}
        );
      }
    );
  }

}

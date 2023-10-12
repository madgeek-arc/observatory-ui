import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../../survey-tool/app/services/survey.service";
import {SurveyAnswer} from "../../../../survey-tool/app/domain/survey";
import {Model} from "../../../../survey-tool/catalogue-ui/domain/dynamic-form-model";
import {countries} from "../../../../survey-tool/app/domain/countries";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'country-landing-page',
  templateUrl: 'country-landing-page.component.html',
  styleUrls: ['./country-landing-page.component.css'],
  providers: [SurveyService]
})

export class CountryLandingPageComponent implements OnInit {

  countryCode: string = null;
  surveyAnswer: SurveyAnswer = null;
  surveyModel: Model;
  answer: object = null;

  countryPageNarrativeURL: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.route.params.subscribe(
      value => {
        this.countryCode = value['code'];
        this.countryPageNarrativeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`https://oseurope.openaire.eu/embeddable/country/${this.countryCode}?showFull=false`);
        this.surveyService.getLatestAnswer(`sh-eosc-sb-${this.countryCode}`, 'm-jlFggsCN').subscribe(
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

  findCountryByCode(countryCode: string) {
    let country = countries.find(elem=> elem.id === countryCode);
    if (country && country.name)
      return country.name;
    else
      return countryCode;
  }

}

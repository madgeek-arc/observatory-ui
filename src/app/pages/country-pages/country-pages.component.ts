import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { countries } from "../../domain/countries";
import { DataShareService } from "./services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyPublicAnswer } from "./services/coutry-pages.service";

@Component({
  selector: 'app-country-pages',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
    LowerCasePipe,
    NgOptimizedImage
  ],
  templateUrl: './country-pages.component.html',
  styleUrls: ['../../../assets/css/explore-sidebar.less', '../../../assets/css/explore-dashboard.less']
})


export class CountryPagesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  modelsIds: string[] = [ 'm-jlFggsCN', 'm-eosc-sb-2023'];
  OSModelId = 'm-GPFhURKK';

  stakeholderId?: string;
  countryStakeholderId?: string;
  countryCode?: string;
  countryName?: string;

  constructor(private route: ActivatedRoute, private dataService: DataShareService,
              private surveyAnswer: SurveyPublicAnswer) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      // console.log(params['code']);
      this.countryCode = params['code'];
      this.dataService.countryCode.next(this.countryCode);
      this.stakeholderId = 'sh-eosc-sb-' + params['code'];
      this.countryStakeholderId = 'sh-country-' + params['code'];

      this.countryName = this.findCountryByCode(this.countryCode);
      this.dataService.countryName.next(this.countryName);

      this.modelsIds.forEach((modelId, index) => {
        this.surveyAnswer.getAnswer(this.stakeholderId, modelId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (answer) => {
            this.dataService.setItemAt(index, answer);
            // this.surveyAnswers[index] = answer;
          },
          error: (error) => {console.error(error);}
        });
      });

      this.surveyAnswer.getOSAnswer(this.countryStakeholderId, this.OSModelId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (answer) => {
          this.dataService.countrySurveyAnswer.next(answer);
        }
      });

    });
  }

  findCountryByCode(countryCode: string) {
    let country = countries.find(elem=> elem.id === countryCode);
    if (country && country.name)
      return country.name;
    else
      return countryCode;
  }

}

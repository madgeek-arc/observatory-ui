import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { countries } from "../../domain/countries";
import { DataShareService } from "./services/data-share.service";
import { SurveyService } from "../../../survey-tool/app/services/survey.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
  styleUrls: ['../../../assets/css/explore-sidebar.scss', '../../../assets/css/explore-dashboard.scss']
})

export class CountryPagesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  modelsIds: string[] = [ 'm-jlFggsCN', 'm-eosc-sb-2023'];

  stakeholderId?: string;
  countryCode?: string;
  countryName?: string;

  constructor(private route: ActivatedRoute, private dataService: DataShareService, private surveyService: SurveyService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      // console.log(params['code']);
      this.countryCode = params['code'];
      this.dataService.countryCode.next(this.countryCode);
      this.stakeholderId = 'sh-eosc-sb-' + params['code'];

      this.countryName = this.findCountryByCode(this.countryCode);
      this.dataService.countryName.next(this.countryName);

      this.modelsIds.forEach((modelId, index) => {
        this.surveyService.getLatestAnswer(this.stakeholderId, modelId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (answer) => {
            this.dataService.setItemAt(index, answer);
            // this.surveyAnswers[index] = answer;
          },
          error: (error) => {console.error(error);}
        })
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

import { Component, OnInit } from "@angular/core";
import { CategorizedAreaData, Series } from "../../../domain/categorizedAreaData";
import { Router } from "@angular/router";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { ColorPallet } from "../../eosc-readiness-dashboard/eosc-readiness-dynamic/eosc-readiness-map-subtitles";
import { countries } from "../../../domain/countries";
import { flagIcon, mapIcon } from "../../../../variables/icons";
import { DomSanitizer } from "@angular/platform-browser";
import { LowerCasePipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { ChartsModule } from "../../../shared/charts/charts.module";

@Component({
  selector: 'country-selector',
  templateUrl: 'country-selector.component.html',
  styleUrls: ['./country-selector.component.css'],
  imports: [
    LowerCasePipe,
    ChartsModule,
    NgIf,
    NgForOf,
    NgOptimizedImage
  ],
  standalone: true,
  providers: [StakeholdersService]
})

export class CountrySelectorComponent implements OnInit {

  countriesArray: string[] = [];
  questionsDataArray: CategorizedAreaData = new CategorizedAreaData();

  mapIconVar = this.sanitizer.bypassSecurityTrustHtml(mapIcon.replace(/&nbsp;/g, ''));
  flagIconVar = this.sanitizer.bypassSecurityTrustHtml(flagIcon.replace(/&nbsp;/g, ''));

  constructor(private router: Router, private stakeholdersService: StakeholdersService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {
        this.countriesArray = res;
        this.initSeries();
      },
      error => {console.log(error);}
    )
  }

  initSeries() {
    this.questionsDataArray.series[0] = new Series('Countries', false);
    this.questionsDataArray.series[0].color = ColorPallet[0];
    this.questionsDataArray.series[0].data = this.countriesArray.map(code => ({code}));
  }

  goToLanding(code) {
    // console.log(event);
    this.router.navigate([`/country/${code}`]);
  }

  findCountryByCode(countryCode: string) {
    let country = countries.find(elem => elem.id === countryCode);
    if (country && country.name)
      return country.name;
    else
      return countryCode;
  }
}

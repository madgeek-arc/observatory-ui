import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import { Router } from "@angular/router";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { ColorPallet } from "../../eosc-readiness-dashboard/eosc-readiness-dynamic/eosc-readiness-map-subtitles";
import { countries } from "src/app/domain/countries";
import { flagIcon, mapIcon } from "src/variables/icons";
import { DomSanitizer } from "@angular/platform-browser";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { HighchartsCategoryMapComponent } from "src/app/shared/charts/category-map/highcharts-category-map.component";

@Component({
  selector: 'country-selector',
  templateUrl: 'country-selector.component.html',
  styleUrls: ['./country-selector.component.css'],
  imports: [
    LowerCasePipe,
    HighchartsCategoryMapComponent,
    NgOptimizedImage
],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StakeholdersService]
})

export class CountrySelectorComponent implements OnInit {

  private router = inject(Router);
  private stakeholdersService = inject(StakeholdersService);
  private sanitizer = inject(DomSanitizer);

  countriesArray = signal<string[]>([]);
  questionsDataArray = signal<CategorizedAreaData>(new CategorizedAreaData());

  mapIconVar = this.sanitizer.bypassSecurityTrustHtml(mapIcon.replace(/&nbsp;/g, ''));
  flagIconVar = this.sanitizer.bypassSecurityTrustHtml(flagIcon.replace(/&nbsp;/g, ''));

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {
        this.countriesArray.set(res);
        this.initSeries();
      },
      error => {console.log(error);}
    )
  }

  initSeries() {
    const mapData = new CategorizedAreaData();
    mapData.series[0] = new Series('Countries', false);
    mapData.series[0].color = ColorPallet[0];
    mapData.series[0].data = this.countriesArray().map(code => ({code}));
    this.questionsDataArray.set(mapData);
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

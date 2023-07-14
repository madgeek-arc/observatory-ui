import {Component, OnInit} from "@angular/core";
import {CategorizedAreaData, Series} from "../../../../survey-tool/app/domain/categorizedAreaData";
import {ActivatedRoute, Router} from "@angular/router";
import {StakeholdersService} from "../../../../survey-tool/app/services/stakeholders.service";
import {ColorPallet} from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";

@Component({
  selector: 'country-selector',
  templateUrl: 'country-selector.component.html',
  providers: [StakeholdersService]
})

export class CountrySelectorComponent implements OnInit {

  countriesArray: string[] = [];
  questionsDataArray: CategorizedAreaData = new CategorizedAreaData();

  constructor(private router: Router, private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res=>{
        this.countriesArray = res;
        this.initSeries();
      },
      error => {console.log(error);}
    )

  }

  initSeries() {
    this.questionsDataArray.series[0] = new Series('Countries', false);
    this.questionsDataArray.series[0].color = ColorPallet[0];
    this.questionsDataArray.series[0].data = this.countriesArray.map(code => ({ code }));
  }

  goToLanding(event) {
    // console.log(event);
    this.router.navigate([`/landing/country/${event['code']}`]);
  }

}

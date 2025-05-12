import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { countries } from "../../domain/countries";
import { DataShareService } from "./services/data-share.service";

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

  countryCode?: string;
  countryName?: string;

  constructor(private route: ActivatedRoute, private dataService: DataShareService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params['code']);
      this.countryCode = params['code'];
      this.dataService.countryCode.next(this.countryCode);

      this.countryName = this.findCountryByCode(this.countryCode);
      this.dataService.countryName.next(this.countryName);
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

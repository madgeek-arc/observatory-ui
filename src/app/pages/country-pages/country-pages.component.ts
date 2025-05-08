import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DatePipe, LowerCasePipe, NgIf, NgOptimizedImage } from "@angular/common";
import { countries } from "../../domain/countries";

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params['code']);
      this.countryCode = params['code'];
      this.countryName = this.findCountryByCode(this.countryCode);
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

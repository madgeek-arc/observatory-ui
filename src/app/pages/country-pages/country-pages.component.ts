import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { countries } from "../../domain/countries";
import { DataShareService } from "./services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyPublicAnswer } from "./services/coutry-pages.service";
import {
  DashboardSideMenuComponent, MenuItem, MenuSection
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import {
  DashboardSideMenuService
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";

@Component({
  selector: 'app-country-pages',
  standalone: true,
  imports: [
    RouterOutlet,
    LowerCasePipe,
    NgOptimizedImage,
    DashboardSideMenuComponent
  ],
  templateUrl: './country-pages.component.html',
  styleUrls: ['../../../assets/css/explore-sidebar.less', '../../../assets/css/explore-dashboard.less']
  // styles: ['.backAction { background-color: #fff; border-radius: 50px; border: 1px solid #008691; padding: 4px 10px}']
})


export class CountryPagesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  modelsIds: string[] = [ 'm-jlFggsCN', 'm-eosc-sb-2023'];
  OSModelId = 'm-GPFhURKK';

  stakeholderId?: string;
  countryStakeholderId?: string;
  countryCode?: string;
  countryName?: string;

  hasSidebar = true;
  hasAdminMenu = false;
  menuSections: MenuSection[] = [];
  menuItems: MenuItem[] = [];
  back: MenuItem = new MenuItem('back', 'Back to country selection', null, '/country-pages', '', {}, null, 'uk-text-uppercase backAction' );

  constructor(private route: ActivatedRoute, private dataService: DataShareService,
              private surveyAnswer: SurveyPublicAnswer, private layoutService: DashboardSideMenuService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.countryCode = params['code'];
      this.dataService.countryCode.next(this.countryCode);
      this.stakeholderId = 'sh-eosc-sb-' + params['code'];
      this.countryStakeholderId = 'sh-country-' + params['code'];

      this.countryName = this.findCountryByCode(this.countryCode);
      this.dataService.countryName.next(this.countryName);

      this.initMenuItems();
      this.layoutService.setOpen(true);

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

  initMenuItems() {
    this.menuSections = [];
    this.menuItems = [];

    this.menuItems.push(new MenuItem('0', 'General R&D Overview', null, '/country/' + this.countryCode + '/general', null, {}));
    this.menuItems.push(new MenuItem('1', 'Policy overview', null, '/country/' + this.countryCode + '/policy', null, {}));
    this.menuItems.push(new MenuItem('2', 'Open Access Publications', null, '/country/' + this.countryCode + '/publications', null, {}));
    this.menuItems.push(new MenuItem('3', 'Open Data', null, '/country/' + this.countryCode + '/open-data', null, {}));
    this.menuItems.push(new MenuItem('4', 'FAIR Data', null, '/country/' + this.countryCode + '/fair-data', null, {}));
    this.menuItems.push(new MenuItem('5', 'Data Management', null, '/country/' + this.countryCode + '/data-management', null, {}));
    this.menuItems.push(new MenuItem('6', 'Citizen Science', null, '/country/' + this.countryCode + '/citizen-science', null, {}));
    this.menuItems.push(new MenuItem('7', 'Repositories', null, '/country/' + this.countryCode + '/repositories', null, {}));
    this.menuItems.push(new MenuItem('8', 'Open Science Training', null, '/country/' + this.countryCode + '/science-training', null, {}));

    this.menuSections.push({items: this.menuItems});
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }

}

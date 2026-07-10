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
import { Observable } from "rxjs";
import {
  CountryPageIndicatorsService, IndicatorsPayload, OverrideDoc
} from "./services/country-page-indicators.service";

@Component({
    selector: 'app-country-pages',
    imports: [
        RouterOutlet,
        LowerCasePipe,
        NgOptimizedImage,
        DashboardSideMenuComponent
    ],
    templateUrl: './country-pages.component.html',
    styleUrls: ['../../../assets/css/explore-sidebar.less', '../../../assets/css/explore-dashboard.less']
})


export class CountryPagesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  modelsIds: string[] = [ 'm-eosc-sb-2023', 'm-eosc-sb-2024'];
  OSModelId = 'm-GPFhURKK';

  stakeholderId?: string;
  countryStakeholderId?: string;
  countryCode?: string;
  countryName?: string;

  hasSidebar = true;
  hasAdminMenu = false;
  menuSections: MenuSection[] = [];
  menuItems: MenuItem[] = [];
  back: MenuItem = null;
  isConfigMode = false;

  constructor(private route: ActivatedRoute, private dataService: DataShareService,
              private surveyAnswer: SurveyPublicAnswer, private layoutService: DashboardSideMenuService,
              private indicatorsService: CountryPageIndicatorsService) {}

  ngOnInit() {
    this.isConfigMode = this.route.snapshot.pathFromRoot
      .some(r => r.routeConfig?.path === 'country/:code/configuration');

    this.back = this.isConfigMode ? null : new MenuItem('back', 'Back to country selection', null, '/country-pages', '', null, null, 'uk-text-uppercase back_button uk-margin');

    this.route.params.subscribe(params => {
      this.countryCode = params['code'];
      this.dataService.countryCode.next(this.countryCode);
      this.stakeholderId = 'sh-eosc-sb-' + params['code'];
      this.countryStakeholderId = 'sh-country-' + params['code'];

      this.countryName = this.findCountryByCode(this.countryCode);
      this.dataService.countryName.next(this.countryName);

      this.initMenuItems();
      this.layoutService.setOpen(true);

      // Load the card-visibility config for this country. In config mode the admin edits
      // the per-country override directly; publicly we read the effective/merged result.
      this.indicatorsService.mode.set(this.isConfigMode ? 'config' : 'public');
      const indicators$: Observable<OverrideDoc | IndicatorsPayload> = this.isConfigMode
        ? this.indicatorsService.getOverrides(this.stakeholderId)
        : this.indicatorsService.getEffective(this.stakeholderId);
      indicators$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => this.indicatorsService.setState(res?.indicators),
        error: () => this.indicatorsService.setState([]),
      });

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

      this.surveyAnswer.getOSAnswerMetadata(this.countryStakeholderId, this.OSModelId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (metadata) => {
          this.dataService.countrySurveyAnswerMetaData.next(metadata);
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

    const base = this.isConfigMode
      ? '/country/' + this.countryCode + '/configuration'
      : '/country/' + this.countryCode;

    this.menuItems.push(new MenuItem('0', 'General R&D Overview', null, base + '/general', null, {}));
    this.menuItems.push(new MenuItem('1', 'Policy overview', null, base + '/policy', null, {}));
    this.menuItems.push(new MenuItem('2', 'Open Access Publications', null, base + '/publications', null, {}));
    this.menuItems.push(new MenuItem('3', 'Open Data', null, base + '/open-data', null, {}));
    this.menuItems.push(new MenuItem('4', 'FAIR Data', null, base + '/fair-data', null, {}));
    this.menuItems.push(new MenuItem('5', 'Data Management', null, base + '/data-management', null, {}));
    this.menuItems.push(new MenuItem('6', 'Citizen Science', null, base + '/citizen-science', null, {}));
    this.menuItems.push(new MenuItem('7', 'Repositories', null, base + '/repositories', null, {}));
    this.menuItems.push(new MenuItem('8', 'Open Science Training', null, base + '/science-training', null, {}));
    this.menuItems.push(new MenuItem('9', 'Open Software', null, base + '/open-software', null, {}));

    this.menuSections.push({items: this.menuItems});
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }

}

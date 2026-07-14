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
import { forkJoin, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { IndicatorConfig } from "../../domain/country-page-indicators";
import {
  CountryPageIndicatorsService, DefaultsDoc, EditingScope,
  GLOBAL_DATA_COUNTRY, GLOBAL_SCOPE_CODE, GLOBAL_SCOPE_LABEL, OverrideDoc
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

    // Whether the shared section/card components render with the admin controls or publicly.
    this.indicatorsService.mode.set(this.isConfigMode ? 'config' : 'public');

    this.back = this.isConfigMode ? null : new MenuItem('back', 'Back to country selection', null, '/country-pages', '', null, null, 'uk-text-uppercase back_button uk-margin');

    // Card-visibility config. The editing scope is encoded in the :code itself
    // (GLOBAL_SCOPE_CODE === 'EU' vs a real country), so route.params alone re-emits on a switch.
    this.loadVisibilityConfig();

    this.route.params.subscribe(params => {
      this.countryCode = params['code'];

      // The Global default (EU) is not a real stakeholder — it borrows GLOBAL_DATA_COUNTRY's
      // survey data for its preview. countryCode stays the path segment so the section menu links
      // remain in /country/EU/..., but all data/stats are fetched under the backing country code.
      const isGlobal = this.countryCode === GLOBAL_SCOPE_CODE;
      const dataCode = isGlobal ? GLOBAL_DATA_COUNTRY : this.countryCode;

      this.dataService.countryCode.next(dataCode);
      this.stakeholderId = 'sh-eosc-sb-' + dataCode;
      this.countryStakeholderId = 'sh-country-' + dataCode;

      this.countryName = isGlobal ? GLOBAL_SCOPE_LABEL : this.findCountryByCode(this.countryCode);
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

      this.surveyAnswer.getOSAnswerMetadata(this.countryStakeholderId, this.OSModelId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (metadata) => {
          this.dataService.countrySurveyAnswerMetaData.next(metadata);
        }
      });

    });
  }

  /**
   * Loads the working card-visibility state, reacting to the :code — which encodes both the
   * country and the editing scope (GLOBAL_SCOPE_CODE === 'EU' is the Global default). A single
   * switchMap keeps only the latest result — a fast scope/country change cancels the in-flight
   * request, and there is no nested subscribe.
   *
   *  - public page:   effective/merged visibility (nothing locked)
   *  - config global: the type-wide defaults document (nothing locked)
   *  - config country: the country's own override + the Global default (the lock floor),
   *                    fetched in parallel so hidden-in-global indicators can be disabled.
   */
  private loadVisibilityConfig(): void {
    this.route.params.pipe(
      switchMap(params => {
        const stakeholderId = 'sh-eosc-sb-' + params['code'];

        if (!this.isConfigMode) {
          // Public page: apply the country's own override; fall back to the Global default for
          // countries without one, so type-wide hidden cards stay hidden. No lock floor here —
          // nothing is editable on the public page.
          return forkJoin({
            override: this.indicatorsService.getOverrides(stakeholderId).pipe(catchError(() => of(null as OverrideDoc | null))),
            defaults: this.indicatorsService.getDefaults('eosc-sb').pipe(catchError(() => of(null as DefaultsDoc | null))),
          }).pipe(
            map(({ override, defaults }) => ({
              indicators: override?.indicators ?? defaults?.indicators,
              docId: '',
              floor: null as IndicatorConfig[] | null,
            }))
          );
        }

        const scope: EditingScope = params['code'] === GLOBAL_SCOPE_CODE ? 'global' : 'country';
        this.indicatorsService.editingScope.set(scope);

        if (scope === 'global') {
          return this.indicatorsService.getDefaults('eosc-sb').pipe(
            map(doc => ({ indicators: doc?.indicators, docId: doc?.id ?? '', floor: null as IndicatorConfig[] | null })),
            catchError(() => of({ indicators: [] as IndicatorConfig[], docId: '', floor: null as IndicatorConfig[] | null }))
          );
        }

        return forkJoin({
          override: this.indicatorsService.getOverrides(stakeholderId).pipe(catchError(() => of(null as OverrideDoc | null))),
          defaults: this.indicatorsService.getDefaults('eosc-sb').pipe(catchError(() => of(null as DefaultsDoc | null))),
        }).pipe(
          map(({ override, defaults }) => ({
            indicators: override?.indicators,
            docId: override?.id ?? '',
            floor: defaults?.indicators ?? null,
          }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ indicators, docId, floor }) => {
      this.indicatorsService.setGlobalFloor(floor);
      this.indicatorsService.setState(indicators, docId);
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

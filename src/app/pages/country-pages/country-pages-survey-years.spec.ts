import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { COMPARISON_SURVEY_YEARS, LATEST_SURVEY_YEAR, surveyModelId } from '../../domain/survey-years';
import { ExploreService } from '../explore/explore.service';
import { CountryPagesComponent } from './country-pages.component';
import { SurveyPublicAnswer } from './services/coutry-pages.service';
import { CountryPageIndicatorsService } from './services/country-page-indicators.service';
import { DataShareService } from './services/data-share.service';
import {
  DashboardSideMenuService
} from 'src/survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service';

describe('Country pages and the survey years', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ExploreService, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},
        {provide: SurveyPublicAnswer, useValue: {}},
        {provide: DashboardSideMenuService, useValue: {}},
        {provide: CountryPageIndicatorsService, useValue: {visibility: signal({}), mode: signal('public')}},
      ]
    });
  });

  it('defaults the shown year to the latest survey year', async () => {
    const dataShare = TestBed.inject(DataShareService);

    expect(await firstValueFrom(dataShare.year$)).toBe(LATEST_SURVEY_YEAR);
  });

  it('loads the previous and the latest survey, in that order, because the sections read them as [0] and [1]', () => {
    TestBed.overrideComponent(CountryPagesComponent, {set: {template: '', imports: [], styles: [], styleUrls: []}});
    const page = TestBed.createComponent(CountryPagesComponent).componentInstance;

    expect(page.modelsIds).toEqual(COMPARISON_SURVEY_YEARS.map(surveyModelId));
    expect(page.modelsIds.length).toBe(2);
    expect(page.modelsIds[1]).toBe(surveyModelId(LATEST_SURVEY_YEAR));
  });
});

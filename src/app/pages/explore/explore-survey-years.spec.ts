import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import {
  COMPARISON_SURVEY_YEARS,
  LATEST_SURVEY_YEAR,
  PREVIOUS_SURVEY_YEAR,
  SURVEY_YEARS,
  surveyModelId
} from '../../domain/survey-years';
import { RawData } from '../../domain/raw-data';
import { EoscReadinessDataService } from '../services/eosc-readiness-data.service';
import { DataHandlerService } from '../services/data-handler.service';
import { PdfExportService } from '../services/pdf-export.service';
import { SurveyService } from 'src/survey-tool/app/services/survey.service';
import { StakeholdersService } from 'src/survey-tool/app/services/stakeholders.service';
import { ExploreService } from './explore.service';
import { InvestmentsInEoscComponent } from './investments-in-eosc/investments-in-eosc.component';
import { NationalMonitoringComponent } from './national-monitoring/national-monitoring.component';
import { OpenSciencePoliciesComponent } from './open-science-policies/open-science-policies.component';
import { OpenScienceTrendsComponent } from './open-science-trends/open-science-trends.component';
import {
  OpenScienceByAreaCitizenScienceComponent
} from './open-science-by-area/areas/open-science-by-area-citizen-science.component';
import {
  OpenScienceByAreaDataManagementComponent
} from './open-science-by-area/areas/open-science-by-area-data-management.component';
import {
  OpenScienceByAreaFairDataComponent
} from './open-science-by-area/areas/open-science-by-area-fair-data.component';
import {
  OpenScienceByAreaOpenDataComponent
} from './open-science-by-area/areas/open-science-by-area-open-data.component';
import {
  OpenScienceByAreaPublicationsComponent
} from './open-science-by-area/areas/open-science-by-area-publications.component';
import {
  OpenScienceByAreaRepositoriesComponent
} from './open-science-by-area/areas/open-science-by-area-repositories.component';
import {
  OpenScienceByAreaSoftwareComponent
} from './open-science-by-area/areas/open-science-by-area-software.component';
import {
  OpenScienceByAreaTrainingComponent
} from './open-science-by-area/areas/open-science-by-area-training.component';

/** What every page has in common: the years it shows and the one it defaults to */
interface ExplorePage {
  years: string[];
  year: string;
  ngOnInit(): void;
}

/** Pages that show every survey year side by side */
const multiYearPages: Record<string, Type<ExplorePage>> = {
  'Open Science Policies': OpenSciencePoliciesComponent,
  'Open Science Trends': OpenScienceTrendsComponent,
  'Investments in EOSC': InvestmentsInEoscComponent,
  'National Monitoring': NationalMonitoringComponent,
};

/** Pages that compare the latest year with the one before it */
const byAreaPages: Record<string, Type<ExplorePage>> = {
  'Publications': OpenScienceByAreaPublicationsComponent,
  'Open Data': OpenScienceByAreaOpenDataComponent,
  'FAIR Data': OpenScienceByAreaFairDataComponent,
  'Data Management': OpenScienceByAreaDataManagementComponent,
  'Citizen Science': OpenScienceByAreaCitizenScienceComponent,
  'Repositories': OpenScienceByAreaRepositoriesComponent,
  'Training': OpenScienceByAreaTrainingComponent,
  'Software': OpenScienceByAreaSoftwareComponent,
};

/**
 * Creates a page whose services never answer, so that `ngOnInit` only issues its requests:
 * the spies then tell which years the page asked for. The template is not rendered.
 */
function createPage<T>(page: Type<T>) {
  const data = jasmine.createSpyObj<EoscReadinessDataService>('EoscReadinessDataService', [
    'getQuestion', 'getQuestions', 'getQuestionComment', 'getQuestionEU', 'getOSOStats', 'getOSOStatsChartData'
  ]);
  Object.values(data).forEach(method => (method as jasmine.Spy).and.returnValue(NEVER));
  const survey = jasmine.createSpyObj<SurveyService>('SurveyService', ['getSurveyValidatedCountries']);
  survey.getSurveyValidatedCountries.and.returnValue(NEVER);
  const stakeholders = jasmine.createSpyObj<StakeholdersService>('StakeholdersService', ['getEOSCSBCountries']);
  stakeholders.getEOSCSBCountries.and.returnValue(NEVER);

  TestBed.configureTestingModule({
    providers: [
      {provide: EoscReadinessDataService, useValue: data},
      {provide: SurveyService, useValue: survey},
      {provide: StakeholdersService, useValue: stakeholders},
      {provide: DataHandlerService, useValue: {}},
      {provide: PdfExportService, useValue: {}},
      {provide: ExploreService, useValue: {isMobileOrSmallScreen: false, _lastUpdateDate: new BehaviorSubject<string | null>(null)}},
    ]
  });
  TestBed.overrideComponent(page, {set: {template: '', imports: [], styles: [], styleUrls: []}});

  return {page: TestBed.createComponent(page).componentInstance, data, survey};
}

/** The survey years a page asked the stats API for, sorted */
function surveyYearsRequested(data: jasmine.SpyObj<EoscReadinessDataService>): string[] {
  const requests = [data.getQuestion, data.getQuestions, data.getQuestionComment, data.getQuestionEU]
    .flatMap(spy => spy.calls.allArgs().map(args => args[0] as string));

  return [...new Set(requests)].sort();
}

/** The OpenAIRE queries a page sent */
function openAireQueries(data: jasmine.SpyObj<EoscReadinessDataService>): string[] {
  return [data.getOSOStats, data.getOSOStatsChartData].flatMap(spy => spy.calls.allArgs().map(args => args[0] as string));
}

const yearFilter = (year: string) => `"result.year","type":"=","values":["${year}"]`;

describe('Explore pages and the survey years', () => {
  describe('pages that show every survey year', () => {
    Object.entries(multiYearPages).forEach(([name, component]) => {
      it(`${name} shows all survey years and defaults to the latest`, () => {
        const {page} = createPage(component);

        expect(page.years).toEqual([...SURVEY_YEARS]);
        expect(page.year).toBe(LATEST_SURVEY_YEAR);
      });

      it(`${name} asks for every one of those years, and for no other`, () => {
        const {page, data} = createPage(component);

        page.ngOnInit();

        expect(surveyYearsRequested(data)).toEqual([...SURVEY_YEARS]);
      });
    });
  });

  describe('pages that compare two years', () => {
    Object.entries(byAreaPages).forEach(([name, component]) => {
      it(`${name} compares the previous year with the latest one`, () => {
        const {page} = createPage(component);

        // The templates read years [0] and [1] and only render the cards when there are exactly two
        expect(page.years).toEqual([...COMPARISON_SURVEY_YEARS]);
        expect(page.years.length).toBe(2);
        expect(page.year).toBe(LATEST_SURVEY_YEAR);
      });

      it(`${name} asks for those two years, and for no other`, () => {
        const {page, data} = createPage(component);

        page.ngOnInit();

        expect(surveyYearsRequested(data)).toEqual([...COMPARISON_SURVEY_YEARS]);
      });
    });
  });

  describe('OpenAIRE data', () => {
    const pagesUsingTheLatestYear: Record<string, Type<ExplorePage>> = {
      'Open Science Trends': OpenScienceTrendsComponent,
      'Publications': OpenScienceByAreaPublicationsComponent,
      'Open Data': OpenScienceByAreaOpenDataComponent,
      'Software': OpenScienceByAreaSoftwareComponent,
    };

    Object.entries(pagesUsingTheLatestYear).forEach(([name, component]) => {
      it(`${name} asks for the latest year`, () => {
        const {page, data} = createPage(component);

        page.ngOnInit();

        const queries = openAireQueries(data);
        expect(queries.length).toBeGreaterThan(0);
        queries.forEach(query => expect(query).toContain(`"values":["${LATEST_SURVEY_YEAR}"]`));
      });
    });

    // The investments in a survey describe the year before it, so the publications must be of that year too
    const pagesUsingThePreviousYear: Record<string, Type<ExplorePage>> = {
      'Open Science Policies': OpenSciencePoliciesComponent,
      'Investments in EOSC': InvestmentsInEoscComponent,
    };

    Object.entries(pagesUsingThePreviousYear).forEach(([name, component]) => {
      it(`${name} matches the financial answers with the publications of the previous year`, () => {
        const {page, data} = createPage(component);

        page.ngOnInit();

        const queries = openAireQueries(data);
        expect(queries.length).toBe(1);
        expect(queries[0]).toContain(yearFilter(PREVIOUS_SURVEY_YEAR));
        expect(queries[0]).not.toContain(yearFilter(LATEST_SURVEY_YEAR));
      });
    });

    it('Open Science Policies uses the researchers of the previous year as well', () => {
      const {page, data} = createPage(OpenSciencePoliciesComponent);

      page.ngOnInit();

      expect(data.getQuestion).toHaveBeenCalledWith(PREVIOUS_SURVEY_YEAR, 'Question1');
    });
  });

  describe('validated countries of the survey table', () => {
    const tables: [string, Type<ExplorePage>, string][] = [
      ['Open Science Policies', OpenSciencePoliciesComponent, 'policiesRawData'],
      ['National Monitoring', NationalMonitoringComponent, 'monitoringRawData'],
    ];

    tables.forEach(([name, component, rawDataField]) => {
      type Table = ExplorePage & Record<string, RawData> & { getTableData(): void };

      it(`${name} asks for the latest survey, once its answers are loaded`, () => {
        const {page, survey} = createPage(component);
        const table = page as Table;
        table[rawDataField] = {datasets: [{}]} as RawData;

        table.getTableData();

        expect(survey.getSurveyValidatedCountries).toHaveBeenCalledOnceWith(surveyModelId(LATEST_SURVEY_YEAR));
      });

      it(`${name} asks for the latest survey, after loading its answers`, () => {
        const {page, data, survey} = createPage(component);
        data.getQuestions.and.returnValue(of(new RawData()));

        (page as Table).getTableData();

        expect(survey.getSurveyValidatedCountries).toHaveBeenCalledOnceWith(surveyModelId(LATEST_SURVEY_YEAR));
      });
    });
  });
});

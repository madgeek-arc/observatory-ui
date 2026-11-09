import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Dataset, RawData } from '../../domain/raw-data';
import { EoscReadinessDataService } from './eosc-readiness-data.service';

const RAW_URL = environment.STATS_API_ENDPOINT + 'raw?json=';

function queryOf(request: TestRequest): { series: { query: { name: string, namedParameters: object, profile: string } }[], verbose: boolean } {
  return JSON.parse(decodeURIComponent(request.request.url.substring(RAW_URL.length)));
}

function responseFor(name: string): RawData {
  const dataset = new Dataset();
  dataset.series.query.name = name;
  const response = new RawData();
  response.datasets = [dataset];
  return response;
}

describe('EoscReadinessDataService.getQuestions', () => {
  const names = ['Question6', 'Question14', 'Question10'];
  let service: EoscReadinessDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(EoscReadinessDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends one request per question, each carrying a single query', () => {
    service.getQuestions('2022', names).subscribe();

    const requests = http.match(request => request.url.startsWith(RAW_URL));

    expect(requests.length).toBe(names.length);
    requests.forEach(request => expect(queryOf(request).series.length).toBe(1));
    expect(requests.map(request => queryOf(request).series[0].query.name))
      .toEqual(['eosc.sb.Question6', 'eosc.sb.Question14', 'eosc.sb.Question10']);
    expect(queryOf(requests[0])).toEqual({
      series: [{query: {name: 'eosc.sb.Question6', namedParameters: {year: 2022}, profile: environment.profileName}}],
      verbose: true
    });
  });

  it('merges the answers in question order, whatever order they arrive in', () => {
    let result: RawData | undefined;
    service.getQuestions('2022', names).subscribe(value => result = value);

    const requests = http.match(request => request.url.startsWith(RAW_URL));
    [...requests].reverse().forEach(request => request.flush(responseFor(queryOf(request).series[0].query.name)));

    expect(result?.datasets.map(dataset => dataset.series.query.name))
      .toEqual(['eosc.sb.Question6', 'eosc.sb.Question14', 'eosc.sb.Question10']);
  });
});

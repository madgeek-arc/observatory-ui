import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Dataset, RawData } from '../../domain/raw-data';
import { DataService } from './data.service';

const RAW_URL = environment.STATS_API_ENDPOINT + 'raw?json=';

describe('DataService funding queries', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [DataService, provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends one single-query request per question and merges the answers in question order', () => {
    let result: RawData | undefined;
    service.getFundingForEOSCBubbleSeries().subscribe(value => result = value);

    const requests = http.match(request => request.url.startsWith(RAW_URL));
    const queries = requests.map(request => JSON.parse(decodeURIComponent(request.request.url.substring(RAW_URL.length))));

    expect(queries.map(query => query.series.length)).toEqual([1, 1, 1]);
    expect(queries.map(query => query.series[0].query.name))
      .toEqual(['eosc.sb.2021.Question11', 'eosc.sb.2021.Question12', 'eosc.sb.2021.Question13']);

    // answer in reverse order
    requests.map((request, index) => ({request, query: queries[index]})).reverse().forEach(({request, query}) => {
      const dataset = new Dataset();
      dataset.series.query.name = query.series[0].query.name;
      request.flush({datasets: [dataset]});
    });

    expect(result?.datasets.map(dataset => dataset.series.query.name))
      .toEqual(['eosc.sb.2021.Question11', 'eosc.sb.2021.Question12', 'eosc.sb.2021.Question13']);
  });
});

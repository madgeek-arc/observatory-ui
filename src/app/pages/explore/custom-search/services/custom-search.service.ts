import { Injectable, Signal, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import { ExploreIndicatorConfig} from "../../../../domain/explore-indicators";
import {catchError, map, switchMap} from "rxjs/operators";

interface PreDefinedIndicatorsResponse {
  indicatorPresets: ExploreIndicatorConfig[];
}

export interface DashboardItem {
  id: string;
  title: string;
}


export interface IndicatorPresetQueryRequest {
  countries: string[];
  yearFrom: number;
  yearTo: number;
  seriesAggregations: string[];
}

export interface IndicatorQueryResponse {
  dimensions: string[];
  data: { dimensions: Record<string, string>; value: number | string }[];
  summary: { dimensions: { aggregation: string }; value: number }[];
}

interface UserDashboardResponse {
  id: string;
  items: DashboardItem[];
}

@Injectable({providedIn: 'root'})
export class CustomSearchService {
  private readonly base = environment.API_ENDPOINT;

  readonly showEuAverage = signal(false);
  readonly showMedianValues = signal(false);

  readonly startYear = signal(2018);
  readonly endYear = signal(2024);
  readonly geographyScope = signal<'all' | 'select'>('all');
  readonly selectedCountryIds = signal<Set<string>>(new Set());

  constructor(private httpClient: HttpClient) {}

  getPreDefinedIndicators(): Observable<ExploreIndicatorConfig[]> {
    return this.httpClient
      .get<PreDefinedIndicatorsResponse>(this.base + '/indicators/presets')
      .pipe(map(response => response.indicatorPresets));
  }

  getDashboard(): Observable<DashboardItem[]> {
    return this.httpClient
      .get<UserDashboardResponse>(this.base + '/dashboard')
      .pipe(map(res => res.items));
  }

  saveDashboard(items: DashboardItem[]): Observable<UserDashboardResponse> {
    return this.httpClient.put<UserDashboardResponse>(this.base + '/dashboard', items);
  }

  queryIndicator(id: string, request: IndicatorPresetQueryRequest): Observable<IndicatorQueryResponse> {
    return this.httpClient.post<IndicatorQueryResponse>(this.base + `/indicators/presets/${id}/query`, request);
  }

  /** Re-fires queryIndicator whenever `params` changes, cancelling any in-flight request
   *  for stale params (switchMap). A failed request resolves to undefined instead of
   *  erroring the pipe — otherwise one HTTP error would permanently stop future updates. */
  queryIndicatorSignal(
    params: Signal<{ id: string; request: IndicatorPresetQueryRequest }>
  ): Signal<IndicatorQueryResponse | undefined> {
    return toSignal(
      toObservable(params).pipe(
        switchMap(({ id, request }) =>
          this.queryIndicator(id, request).pipe(catchError(() => of(undefined)))
        )
      )
    );
  }
}

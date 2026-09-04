import { Injectable, signal } from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { ExploreIndicatorConfig} from "../../../../domain/explore-indicators";
import {map} from "rxjs/operators";

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
  data: { dimensions: Record<string, string>; value: number }[];
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

}

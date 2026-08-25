import { Injectable } from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DashboardChartType, ExploreIndicatorConfig} from "../../../../domain/explore-indicators";
import {map} from "rxjs/operators";

interface PreDefinedIndicatorsResponse {
  indicators: ExploreIndicatorConfig[];
}

export interface DashboardItem {
  id: string;
  title: string;
  chartType: DashboardChartType;
}

interface UserDashboardResponse {
  id: string;
  items: DashboardItem[];
}

@Injectable({providedIn: 'root'})
export class CustomSearchService {
  private readonly base = environment.API_ENDPOINT;

  constructor(private httpClient: HttpClient) {}

  getPreDefinedIndicators(): Observable<ExploreIndicatorConfig[]> {
    return this.httpClient
      .get<PreDefinedIndicatorsResponse>(this.base + '/indicators/pre-defined')
      .pipe(map(response => response.indicators));
  }

  getDashboard(): Observable<DashboardItem[]> {
    return this.httpClient
      .get<UserDashboardResponse>(this.base + '/dashboard')
      .pipe(map(res => res.items));
  }

  saveDashboard(items: DashboardItem[]): Observable<UserDashboardResponse> {
    return this.httpClient.put<UserDashboardResponse>(this.base + '/dashboard', items);
  }

}
